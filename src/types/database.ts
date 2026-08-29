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
  asking_price: number
  city: string | null
  neighborhood: string | null
  posted_text: string | null
  observations: string | null
  created_at: string
}

export type MarketPrice = {
  id?: string
  product_key: string
  category?: string
  brand?: string | null
  model?: string | null
  variant?: string | null
  storage?: string | null
  condition?: string | null
  source: string
  reference_url: string
  asking_price: number
  city?: string | null
  state?: string | null
  metadata?: Record<string, unknown>
  captured_at?: string
  created_at?: string
}

export type Analysis = {
  id: string
  listing_id: string
  market_price_estimate: number
  quick_sale_price: number
  recommended_max_buy_price: number
  potential_profit: number
  potential_margin_pct: number
  score: number
  classification: string
  decision: string
  liquidity: string
  seller_motivation: string
  risk_level?: string | null
  price_score?: number | null
  liquidity_score?: number | null
  motivation_score?: number | null
  recency_score?: number | null
  location_score?: number | null
  opportunity_reasons?: string[] | null
  verification_items?: string[] | null
  ai_summary?: string | null
  analysis_version?: string | null
  ai_model?: string | null
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
  condition?: string | null
  date_posted?: string | null
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
