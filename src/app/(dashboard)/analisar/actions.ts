'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateScore, AnalysisData, ScoreResult } from '@/lib/score'
import { revalidatePath } from 'next/cache'

export async function submitAnalysis(formData: FormData): Promise<{ result?: ScoreResult; error?: string }> {
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
    
    const marketPrice = Number(formData.get('marketPrice'))

    if (!title || !price || !marketPrice) {
      return { error: 'Preencha todos os campos obrigatórios.' }
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

    // 3. Calculate score
    const analysisData: AnalysisData = {
      price,
      marketPrice,
      liquidity: 'alta', // TODO: Make dynamic based on category later
      motivation: description.toLowerCase().includes('urgente') || description.toLowerCase().includes('motivo de') ? 'alta' : 'media',
      recency: posted_time.toLowerCase().includes('hoje') ? 'hoje' : 'semana',
      location: 'centro' // Simplification
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
        // We don't abort, just log it, or we could return error
      }
    }

    // Revalidate relevant pages
    revalidatePath('/')
    revalidatePath('/historico')
    revalidatePath('/oportunidades')

    return { result: calculatedResult }
  } catch (err: unknown) {
    console.error('Server action error:', err)
    return { error: 'Erro inesperado no servidor. Tente novamente mais tarde.' }
  }
}
