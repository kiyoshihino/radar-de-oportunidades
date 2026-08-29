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
        marketResearch = await performMarketResearch(title, category, city);
        if (marketResearch.confidence_level === 'baixa' || marketResearch.estimated_market_price <= 0) {
          return { 
            error: 'Dados insuficientes para estimar o preço com segurança. Informe o preço manualmente.',
            needsManualPrice: true,
            marketResearch
          }
        }
        marketPrice = marketResearch.estimated_market_price;
      } catch (e: unknown) {
        console.error('Falha na pesquisa de mercado:', e);
        const isInsufficient = e instanceof Error && e.message === 'Dados insuficientes para estimar o preço com segurança.';
        return { 
          error: isInsufficient ? e.message : 'Não foi possível pesquisar o mercado neste momento.',
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
        asking_price: price,
        city,
        neighborhood,
        posted_text: posted_time,
        observations
      })
      .select('id')
      .single()

    if (listingError || !listing) {
      console.error(`Listing insert error: [${listingError?.code}] ${listingError?.message}`, listingError)
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
        market_price_estimate: marketPrice,
        quick_sale_price: calculatedResult.fastSalePrice,
        recommended_max_buy_price: calculatedResult.maxBuyPrice,
        potential_profit: calculatedResult.potentialProfit,
        potential_margin_pct: calculatedResult.profitMargin,
        score: calculatedResult.score,
        classification: calculatedResult.classification,
        decision: calculatedResult.decision,
        liquidity: analysisData.liquidity,
        seller_motivation: analysisData.motivation,
        price_score: calculatedResult.priceScore,
        liquidity_score: calculatedResult.liquidityScore,
        motivation_score: calculatedResult.motivationScore,
        recency_score: calculatedResult.recencyScore,
        location_score: calculatedResult.locationScore
      })
      .select('id')
      .single()

    if (analysisError || !analysis) {
      console.error(`Analysis insert error: [${analysisError?.code}] ${analysisError?.message}`, analysisError)
      return { error: 'Falha ao salvar a análise (analysis).' }
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
        console.error(`Opportunity insert error: [${opportunityError?.code}] ${opportunityError?.message}`, opportunityError)
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
