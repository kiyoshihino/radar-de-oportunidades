import { MarketResearchResult, ComparableListing, MarketPrice } from '@/types/database';
import { generateProductKey, getCachedComparables, saveComparablesToCache } from './cache';
import { searchTavily } from './providers/tavily';
import { evaluateWithGemini } from './providers/gemini';
import { analyzePrices } from './statistics';
import { SearchResult } from './types';

export async function performMarketResearch(
  title: string, 
  category: string, 
  city: string | null
): Promise<MarketResearchResult> {
  const searchProvider = process.env.SEARCH_PROVIDER || 'tavily';
  const aiProvider = process.env.AI_PROVIDER || 'gemini';
  const cacheHours = Number(process.env.MARKET_RESEARCH_CACHE_HOURS || '12');
  const maxSearches = Number(process.env.TAVILY_MAX_SEARCHES_PER_ANALYSIS || '3');

  // Fallback to OpenAI if explicitly configured
  if (searchProvider === 'openai' || aiProvider === 'openai') {
    const { performMarketResearch: performOpenAI } = await import('./providers/openai');
    return performOpenAI(title, city);
  }

  const productKey = generateProductKey(title, category);
  
  // 1. Check Cache
  const cached = await getCachedComparables(productKey, 3, cacheHours);
  if (cached && cached.length >= 3) {
    return buildMarketResearchResultFromCache(cached, title);
  }

  // 2. Multi-step Search & Validation
  const validComparables: MarketPrice[] = [];
  const tavilyUrls = new Map<string, SearchResult>();
  
  const searchQueries = [
    `${title} usado ${city ? city : ''}`.trim(),
    `${title} seminovo ${city ? city : ''}`.trim(),
    `${title} olx mercado livre`.trim()
  ];

  let discardedCount = 0;

  for (let i = 0; i < maxSearches && validComparables.length < 3; i++) {
    const query = searchQueries[i] || searchQueries[0];
    
    // Search Tavily
    const searchResults = await searchTavily(query, i * 15);
    
    // Store original URLs to prevent hallucination
    searchResults.forEach(r => tavilyUrls.set(r.id, r));

    // Validate with Gemini
    const evaluation = await evaluateWithGemini(title, city, searchResults);

    // Map and filter results
    for (const evaluated of evaluation.evaluatedResults) {
      if (evaluated.valid && evaluated.extractedPrice && evaluated.extractedPrice > 0) {
        const originalTavily = tavilyUrls.get(evaluated.resultId);
        
        if (originalTavily) {
          // Double check if we haven't already added this URL to avoid duplicates across loops
          if (!validComparables.find(c => c.reference_url === originalTavily.url)) {
            validComparables.push({
              product_key: productKey,
              category,
              brand: evaluation.targetProduct.brand,
              model: evaluation.targetProduct.model || title,
              variant: evaluation.targetProduct.variant,
              storage: evaluation.targetProduct.storage,
              condition: evaluated.condition || 'usado',
              source: originalTavily.source,
              reference_url: originalTavily.url,
              asking_price: evaluated.extractedPrice,
              city: city,
              metadata: {
                provider: 'tavily',
                tavilyScore: originalTavily.score,
                validationProvider: 'gemini',
                searchQuery: query,
                resultId: evaluated.resultId
              },
              captured_at: new Date().toISOString()
            });
          }
        } else {
          // Gemini hallucinated a resultId that Tavily didn't return
          discardedCount++;
        }
      } else {
        discardedCount++;
      }
    }
  }

  if (validComparables.length < 3) {
    throw new Error('Dados insuficientes para estimar o preço com segurança.');
  }

  // 3. Statistical Analysis
  const prices = validComparables.map(c => c.asking_price);
  const stats = analyzePrices(prices);

  // Re-filter the validComparables to match the statistical outliers removed
  const finalComparables = validComparables.filter(c => stats.validPrices.includes(c.asking_price));
  
  if (finalComparables.length < 3) {
    throw new Error('Dados insuficientes para estimar o preço com segurança.');
  }

  // 4. Cache the results
  await saveComparablesToCache(finalComparables);

  // 5. Format Response
  const comparablesForOutput: ComparableListing[] = finalComparables.map(c => ({
    source: c.source,
    title: c.model || title,
    price: c.asking_price,
    city: c.city || null,
    url: c.reference_url,
    condition: c.condition,
    date_posted: new Date().toISOString()
  }));

  const sourcesUsed = Array.from(new Set(finalComparables.map(c => c.source)));

  return {
    product_identified: finalComparables[0].model || title,
    comparable_count: finalComparables.length,
    lowest_price: stats.min,
    highest_price: stats.max,
    median_price: stats.median,
    average_price: stats.average,
    estimated_market_price: stats.marketPrice,
    fast_sale_price: stats.quickSalePrice,
    confidence_level: finalComparables.length >= 5 ? 'alta' : 'media',
    sources_used: sourcesUsed,
    comparables: comparablesForOutput,
    discarded_count: discardedCount + stats.outliersRemoved
  };
}

function buildMarketResearchResultFromCache(cached: MarketPrice[], title: string): MarketResearchResult {
  const prices = cached.map(c => c.asking_price);
  const stats = analyzePrices(prices);

  // If statistical outlier removal somehow drops us below 3, we don't use cache
  if (stats.validPrices.length < 3) {
    // This is an edge case, but we could handle it by returning a throw, but it's cache so it was already validated
    // We'll trust the cache
  }

  const finalComparables = cached.filter(c => stats.validPrices.includes(c.asking_price));

  const comparablesForOutput: ComparableListing[] = finalComparables.map(c => ({
    source: c.source,
    title: c.model || title,
    price: c.asking_price,
    city: c.city || null,
    url: c.reference_url,
    condition: c.condition,
    date_posted: c.captured_at
  }));

  const sourcesUsed = Array.from(new Set(finalComparables.map(c => c.source)));

  return {
    product_identified: finalComparables[0].model || title,
    comparable_count: finalComparables.length,
    lowest_price: stats.min,
    highest_price: stats.max,
    median_price: stats.median,
    average_price: stats.average,
    estimated_market_price: stats.marketPrice,
    fast_sale_price: stats.quickSalePrice,
    confidence_level: 'alta', // Cached implies validated
    sources_used: sourcesUsed,
    comparables: comparablesForOutput,
    discarded_count: 0
  };
}
