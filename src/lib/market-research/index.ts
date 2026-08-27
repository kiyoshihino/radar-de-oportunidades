import OpenAI from 'openai';
import { MarketResearchResult } from '@/types/database';

export async function performMarketResearch(title: string, city: string | null): Promise<MarketResearchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada no servidor.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o'; // Use gpt-4o as default as it supports latest features
  const openai = new OpenAI({ apiKey });

  const prompt = `
Você é um especialista em pesquisa de mercado de produtos usados no Brasil.
Seu objetivo é analisar o mercado para o produto: "${title}" ${city ? `na região de ${city}` : ''}.

REGRAS CRÍTICAS:
1. Retorne EXATAMENTE os dados solicitados no formato JSON.
2. Identifique anúncios de usados semelhantes (mínimo 3, ideal 5-8).
3. EXCLUA: preços absurdamente baixos/altos, acessórios (capinhas, películas, carregadores isolados), produtos quebrados, sucata, peças, ou produtos que não correspondam exatamente ao modelo e capacidade.
4. EXCLUA: preços de produtos novos de lojas oficiais (buscamos preço de mercado de USADOS).
5. Se não houver dados ou referências reais suficientes para estipular o preço, preencha confidence_level como 'baixa' e defina estimated_market_price como 0. NÃO INVENTE VALORES.
6. A moeda é BRL (reais), retorne apenas o número (ex: 3500).

Para o cálculo:
- estimated_market_price: Preço médio praticado no mercado secundário (usados).
- fast_sale_price: Preço agressivo para venda rápida (geralmente 15-20% abaixo do mercado).
- lowest_price, highest_price, median_price e average_price: Estatísticas com base nos comparáveis válidos.

Gere os comparáveis (ComparableListing) no formato:
{ source: "nome da plataforma", title: "título do anuncio", price: 1234, city: "nome da cidade ou null", url: "url fictícia se não tiver" }
`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Faça a pesquisa de mercado para: ${title}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'market_research_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              product_identified: { type: 'string' },
              comparable_count: { type: 'number' },
              lowest_price: { type: 'number' },
              highest_price: { type: 'number' },
              median_price: { type: 'number' },
              average_price: { type: 'number' },
              estimated_market_price: { type: 'number' },
              fast_sale_price: { type: 'number' },
              confidence_level: { type: 'string', enum: ['alta', 'media', 'baixa'] },
              sources_used: { type: 'array', items: { type: 'string' } },
              comparables: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    source: { type: 'string' },
                    title: { type: 'string' },
                    price: { type: 'number' },
                    city: { type: 'string', nullable: true },
                    url: { type: 'string', nullable: true }
                  },
                  required: ['source', 'title', 'price', 'city', 'url'],
                  additionalProperties: false
                }
              },
              discarded_count: { type: 'number' }
            },
            required: [
              'product_identified',
              'comparable_count',
              'lowest_price',
              'highest_price',
              'median_price',
              'average_price',
              'estimated_market_price',
              'fast_sale_price',
              'confidence_level',
              'sources_used',
              'comparables',
              'discarded_count'
            ],
            additionalProperties: false
          }
        }
      },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Nenhum dado retornado pela OpenAI.');
    }

    const parsed: MarketResearchResult = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('Market research error:', error);
    throw error;
  }
}
