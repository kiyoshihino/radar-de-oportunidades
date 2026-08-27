'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateScore, AnalysisData, ScoreResult } from '@/lib/score'
import { performMarketResearch } from '@/lib/market-research'
import { MarketResearchResult } from '@/types/database'
import { revalidatePath } from 'next/cache'

export type AnalysisResponse = {
  result?: ScoreResult;
  marketResearch?: MarketResearchResult;
  error?: string;
  needsManualPrice?: boolean;
}

export async function submitAnalysis(formData: FormData): Promise<AnalysisResponse> {
  try {
    const supabase = await createClient()

    // 1. Prepare data
    const source = formData.get('source') as string
    const url = formData.get('url') as string
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const price = Number(formData.get('price'))
    const description = formData.get('description') as string
    const city = formData.get('city') as string
    const neighborhood = formData.get('neighborhood') as string
    const posted_time = formData.get('posted_time') as string
    const observations = formData.get('observations') as string
    
    const manualMarketPriceStr = formData.get('marketPrice')
    let marketPrice = manualMarketPriceStr ? Number(manualMarketPriceStr) : null
    let marketResearch: MarketResearchResult | undefined;

    if (!title || !price) {
      return { error: 'Preencha o título e o preço pedido.' }
    }

    if (!marketPrice) {
      try {
        marketResearch = await performMarketResearch(title, city);
        if (marketResearch.confidence_level === 'baixa' || marketResearch.estimated_market_price <= 0) {
          return { 
            error: 'Dados insuficientes para estimar o preço com segurança. Informe o preço manualmente.',
            needsManualPrice: true,
            marketResearch
          }
        }
        marketPrice = marketResearch.estimated_market_price;
      } catch (e) {
        console.error('Falha na pesquisa de mercado:', e);
        return { 
          error: 'Não foi possível pesquisar o mercado neste momento.',
          needsManualPrice: true
        }
      }
    }

    // 2. Insert into listings
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        source,
        url: url || null,
        category,
        price,
        city,
        neighborhood,
        posted_time,
        observations
      })
      .select('id')
      .single()

    if (listingError || !listing) {
      console.error('Listing insert error:', listingError)
      return { error: 'Falha ao salvar o anúncio (listing).' }
    }

    // Determine Motivation based on text or AI research
    // If AI found it's a fast sale, motivation could be high, but let's stick to text for now
    const textContext = (title + " " + description).toLowerCase();
    const isMotivated = ['preciso vender', 'vendo hoje', 'urgente', 'mudança', 'aceito proposta', 'preciso do dinheiro', 'motivo de'].some(kw => textContext.includes(kw));

    // 3. Calculate score
    const analysisData: AnalysisData = {
      price,
      marketPrice,
      liquidity: 'alta', // simplification
      motivation: isMotivated ? 'alta' : 'media',
      recency: posted_time.toLowerCase().includes('hoje') ? 'hoje' : 'semana',
      location: 'centro' // simplification
    }

    const calculatedResult = calculateScore(analysisData)

    // 4. Insert into analyses
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        listing_id: listing.id,
        score: calculatedResult.score,
        classification: calculatedResult.classification,
        market_price: marketPrice,
        fast_sale_price: calculatedResult.fastSalePrice,
        max_buy_price: calculatedResult.maxBuyPrice,
        potential_profit: calculatedResult.potentialProfit,
        profit_margin: calculatedResult.profitMargin,
        liquidity: analysisData.liquidity,
        motivation: analysisData.motivation,
        recency: analysisData.recency,
        location_score: analysisData.location
      })
      .select('id')
      .single()

    if (analysisError || !analysis) {
      console.error('Analysis insert error:', analysisError)
      return { error: 'Falha ao salvar a análise (analysis).' }
    }

    // Also save comparables to market_prices if we did research
    if (marketResearch && marketResearch.comparables.length > 0) {
      const comparablesToInsert = marketResearch.comparables.map(c => ({
        category,
        model: marketResearch?.product_identified || title,
        avg_price: c.price,
        // we can store raw data if we add a jsonb field, but for now map it to avg_price (which might be confusing)
      }));
      // Note: The requested schema 'market_prices' has: id, category, model, avg_price, created_at
      // The user asked "Também salvar cada comparável válido em: public.market_prices"
      // Wait, market_prices might be better to just save the overall average/median.
      // But user said "salvar cada comparável". Since it has only 'avg_price', I'll use it to store the comparable's price.
      const { error: mpError } = await supabase.from('market_prices').insert(comparablesToInsert);
      if (mpError) {
         console.error('Market prices insert error:', mpError);
      }
    }

    // 5. If score >= 70, insert into opportunities
    if (calculatedResult.score >= 70) {
      const { error: opportunityError } = await supabase
        .from('opportunities')
        .insert({
          analysis_id: analysis.id,
          listing_id: listing.id,
          status: 'nova'
        })

      if (opportunityError) {
        console.error('Opportunity insert error:', opportunityError)
      }
    }

    // Revalidate relevant pages
    revalidatePath('/')
    revalidatePath('/historico')
    revalidatePath('/oportunidades')

    return { result: calculatedResult, marketResearch }
  } catch (err: unknown) {
    console.error('Server action error:', err)
    return { error: 'Erro inesperado no servidor. Tente novamente mais tarde.' }
  }
}
