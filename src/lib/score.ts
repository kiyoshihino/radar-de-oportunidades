export interface AnalysisData {
  price: number;
  marketPrice: number;
  liquidity: 'baixa' | 'media' | 'alta';
  motivation: 'baixa' | 'media' | 'alta';
  recency: 'hoje' | 'ontem' | 'semana' | 'antigo';
  location: 'centro' | 'bairro' | 'regiao' | 'longe';
  blockComprar?: boolean;
  confidenceLevel?: 'alta' | 'media' | 'baixa';
  evaluationStrategy?: 'standard_resale' | 'other';
}

export interface ScoreResult {
  score: number;
  classification: string;
  decision: string;
  maxBuyPrice: number;
  potentialProfit: number;
  profitMargin: number;
  fastSalePrice: number;
  priceScore: number;
  liquidityScore: number;
  motivationScore: number;
  recencyScore: number;
  locationScore: number;
}

export function calculateScore(data: AnalysisData): ScoreResult {
  let priceScore = 0;
  let liquidityScore = 0;
  let motivationScore = 0;
  let recencyScore = 0;
  let locationScore = 0;

  // Preço abaixo do mercado: até 40 pontos
  const discount = data.marketPrice - data.price;
  const discountPercentage = discount / data.marketPrice;
  
  if (discountPercentage >= 0.3) priceScore = 40;
  else if (discountPercentage >= 0.2) priceScore = 30;
  else if (discountPercentage >= 0.1) priceScore = 20;
  else if (discountPercentage > 0) priceScore = 10;
  
  // Liquidez: até 20 pontos
  if (data.liquidity === 'alta') liquidityScore = 20;
  else if (data.liquidity === 'media') liquidityScore = 10;
  else liquidityScore = 5;

  // Motivação do vendedor: até 15 pontos
  if (data.motivation === 'alta') motivationScore = 15;
  else if (data.motivation === 'media') motivationScore = 8;
  else motivationScore = 0;

  // Recência: até 15 pontos
  if (data.recency === 'hoje') recencyScore = 15;
  else if (data.recency === 'ontem') recencyScore = 10;
  else if (data.recency === 'semana') recencyScore = 5;
  else recencyScore = 0;

  // Localização: até 10 pontos
  if (data.location === 'centro' || data.location === 'bairro') locationScore = 10;
  else if (data.location === 'regiao') locationScore = 5;
  else locationScore = 0;

  let score = priceScore + liquidityScore + motivationScore + recencyScore + locationScore;

  // Limits
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // Classificação
  let classification = 'ignorar';
  if (score >= 95) classification = 'excepcional';
  else if (score >= 85) classification = 'grande_oportunidade';
  else if (score >= 70) classification = 'boa_oportunidade';
  else if (score >= 50) classification = 'investigar';

  // Decisão
  let decision = 'ignorar';
  if (score >= 85) decision = 'comprar';
  else if (score >= 70) decision = 'negociar';
  else if (score >= 50) decision = 'investigar';

  // Cap decision based on unverified risks or low confidence
  if (decision === 'comprar' || decision === 'negociar') {
    if (data.blockComprar || data.confidenceLevel === 'baixa') {
      decision = 'investigar';
    }
  }

  // Cálculos financeiros
  const fastSalePrice = data.marketPrice * 0.9; // Venda rápida 10% abaixo do mercado
  // Compra recomendada para ter margem segura: 70% do preço de mercado ou o que ele pediu se for menor ainda (mas max 80% do fast sale)
  const maxBuyPrice = Math.min(data.marketPrice * 0.7, fastSalePrice - 300);
  const potentialProfit = fastSalePrice - data.price;
  const profitMargin = (potentialProfit / data.price) * 100;

  // Lógica de oportunidade: Standard Resale
  const strategy = data.evaluationStrategy || 'standard_resale';
  
  if (strategy === 'standard_resale') {
    if (potentialProfit <= 0) {
      decision = 'ignorar';
      score = Math.min(score, 49);
      classification = 'ignorar';
    }
  }

  return {
    score,
    classification,
    decision,
    maxBuyPrice,
    potentialProfit,
    profitMargin,
    fastSalePrice,
    priceScore,
    liquidityScore,
    motivationScore,
    recencyScore,
    locationScore
  };
}
