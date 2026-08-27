import OpenAI from 'openai';
import { MarketResearchResult } from '@/types/database';

export async function performMarketResearch(title: string, city: string | null): Promise<MarketResearchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada no servidor.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const openai = new OpenAI({ apiKey });

  const prompt = `
Você é um especialista em pesquisa de mercado de produtos usados no Brasil.
Seu objetivo é pesquisar na web em tempo real e encontrar anúncios REAIS e ATUAIS para o produto: "${title}" ${city ? `na região de ${city}` : ''}.

REGRAS CRÍTICAS (SIGA RIGOROSAMENTE):
1. OBRIGATÓRIO: Utilize a ferramenta de Web Search para buscar os preços atuais. NÃO utilize seu conhecimento interno ou invente preços/anúncios.
2. Identifique anúncios de usados semelhantes (mínimo 3, ideal 5-8). Extraia título, preço, fonte, url (o link real para o anúncio), cidade/região, condição e data/recência.
3. EXCLUA: preços absurdamente baixos/altos, acessórios, peças ou novos de lojas oficiais. Buscamos preço de mercado de USADOS de pessoas físicas/revendedores.
4. Você deve preencher a lista de 'comparables' apenas com resultados da sua busca na web que possuam URL e Fonte válidas.
5. Se a busca na web não retornar no mínimo 3 comparáveis válidos e verificáveis, você DEVE retornar a lista 'comparables' VAZIA.
6. A moeda é BRL (reais), retorne apenas o número para preços.

Cálculos financeiros se encontrar anúncios reais:
- estimated_market_price: Preço médio praticado (removendo os outliers)
- fast_sale_price: 15-20% abaixo do mercado
`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Faça a pesquisa de mercado em tempo real usando a web para: ${title}` }
      ],
      // Explicitly enable web search tool (assuming standard format for OpenAI Responses API / Chat Completions that supports it)
      tools: [
        {
          type: "web_search"
        } as unknown as OpenAI.Chat.Completions.ChatCompletionTool 
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
                    url: { type: 'string', nullable: true },
                    condition: { type: 'string', nullable: true },
                    date_posted: { type: 'string', nullable: true }
                  },
                  required: ['source', 'title', 'price', 'city', 'url', 'condition', 'date_posted'],
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
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Nenhum dado retornado pela OpenAI.');
    }

    const parsed: MarketResearchResult = JSON.parse(content);

    if (parsed.comparables.length < 3) {
      throw new Error('Dados insuficientes para estimar o preço com segurança.');
    }

    return parsed;
  } catch (error) {
    console.error('Market research error:', error);
    throw error;
  }
}
