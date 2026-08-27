export interface AnalysisData {
  price: number;
  marketPrice: number;
  liquidity: 'baixa' | 'media' | 'alta';
  motivation: 'baixa' | 'media' | 'alta';
  recency: 'hoje' | 'ontem' | 'semana' | 'antigo';
  location: 'centro' | 'bairro' | 'regiao' | 'longe';
}

export interface ScoreResult {
  score: number;
  classification: string;
  maxBuyPrice: number;
  potentialProfit: number;
  profitMargin: number;
  fastSalePrice: number;
}

export function calculateScore(data: AnalysisData): ScoreResult {
  let score = 0;

  // Preço abaixo do mercado: até 40 pontos
  const discount = data.marketPrice - data.price;
  const discountPercentage = discount / data.marketPrice;
  
  if (discountPercentage >= 0.3) score += 40;
  else if (discountPercentage >= 0.2) score += 30;
  else if (discountPercentage >= 0.1) score += 20;
  else if (discountPercentage > 0) score += 10;
  
  // Liquidez: até 20 pontos
  if (data.liquidity === 'alta') score += 20;
  else if (data.liquidity === 'media') score += 10;
  else score += 5;

  // Motivação do vendedor: até 15 pontos
  if (data.motivation === 'alta') score += 15;
  else if (data.motivation === 'media') score += 8;
  else score += 0;

  // Recência: até 15 pontos
  if (data.recency === 'hoje') score += 15;
  else if (data.recency === 'ontem') score += 10;
  else if (data.recency === 'semana') score += 5;
  else score += 0;

  // Localização: até 10 pontos
  if (data.location === 'centro' || data.location === 'bairro') score += 10;
  else if (data.location === 'regiao') score += 5;
  else score += 0;

  // Limits
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // Classificação
  let classification = 'Ignorar';
  if (score >= 95) classification = 'Oportunidade excepcional';
  else if (score >= 85) classification = 'Grande oportunidade';
  else if (score >= 70) classification = 'Boa oportunidade';
  else if (score >= 50) classification = 'Investigar';

  // Cálculos financeiros
  const fastSalePrice = data.marketPrice * 0.9; // Venda rápida 10% abaixo do mercado
  // Compra recomendada para ter margem segura: 70% do preço de mercado ou o que ele pediu se for menor ainda (mas max 80% do fast sale)
  const maxBuyPrice = Math.min(data.marketPrice * 0.7, fastSalePrice - 300);
  const potentialProfit = fastSalePrice - data.price;
  const profitMargin = (potentialProfit / data.price) * 100;

  return {
    score,
    classification,
    maxBuyPrice,
    potentialProfit,
    profitMargin,
    fastSalePrice
  };
}
