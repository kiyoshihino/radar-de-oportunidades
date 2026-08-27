export type Radar = {
  id: string
  name: string
  slug?: string
  status: 'ATIVO' | 'EM_BREVE' | 'INATIVO' | 'PAUSADO'
  min_score: number | null
  min_profit: number | null
  min_margin_pct: number | null
  city: string | null
  region: string | null
  created_at: string
}

export type RadarItem = {
  id: string
  radar_id: string
  name: string
  search_query: string
  aliases: string[] | null
  excluded_keywords: string[] | null
  status: 'ativo' | 'pausado' | 'arquivado'
  priority: number | null
  min_score: number | null
  min_profit: number | null
  min_margin_pct: number | null
  max_asking_price: number | null
  city: string | null
  region: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Listing = {
  id: string
  title: string
  description: string | null
  source: string
  url: string | null
  category: string
  price: number
  city: string | null
  neighborhood: string | null
  posted_time: string | null
  observations: string | null
  created_at: string
}

export type MarketPrice = {
  id: string
  category: string
  model: string
  avg_price: number
  created_at: string
}

export type Analysis = {
  id: string
  listing_id: string
  score: number
  classification: string
  market_price: number
  fast_sale_price: number
  max_buy_price: number
  potential_profit: number
  profit_margin: number
  liquidity: string
  motivation: string
  recency: string
  location_score: string
  created_at: string
}

export type Opportunity = {
  id: string
  analysis_id: string
  listing_id: string
  status: 'nova' | 'em_negociacao' | 'comprada' | 'descartada'
  created_at: string
}

export type RiskFlag = {
  id: string
  analysis_id: string
  flag_type: string
  description: string
  created_at: string
}

export type UserFeedback = {
  id: string
  opportunity_id: string
  rating: number
  comments: string | null
  created_at: string
}

export type ComparableListing = {
  source: string
  title: string
  price: number
  city: string | null
  url: string | null
}

export type MarketResearchResult = {
  product_identified: string
  comparable_count: number
  lowest_price: number
  highest_price: number
  median_price: number
  average_price: number
  estimated_market_price: number
  fast_sale_price: number
  confidence_level: 'alta' | 'media' | 'baixa'
  sources_used: string[]
  comparables: ComparableListing[]
  discarded_count: number
}
