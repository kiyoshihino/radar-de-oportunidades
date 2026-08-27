import OpenAI from 'openai';
import { MarketResearchResult, ComparableListing } from '@/types/database';

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
4. Você deve preencher a lista de 'comparables' apenas com resultados da sua busca na web. A URL fornecida deve constar nas fontes pesquisadas.
5. Se a busca na web não retornar no mínimo 3 comparáveis válidos e verificáveis, retorne a lista 'comparables' vazia ou devolva confidence_level='baixa'.
6. A moeda é BRL (reais), retorne apenas o número para preços.
`;

  try {
    const response = await openai.responses.create({
      model: model,
      input: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Faça a pesquisa de mercado em tempo real usando a web para: ${title}` }
      ],
      tools: [
        { type: "web_search" }
      ],
      include: [
        "web_search_call.action.sources"
      ],
      text: {
        format: {
          type: "json_schema",
          strict: true,
          name: "market_research_result",
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
                      city: { type: ['string', 'null'] },
                      url: { type: ['string', 'null'] },
                      condition: { type: ['string', 'null'] },
                      date_posted: { type: ['string', 'null'] }
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
      }
    });

    const content = response.output_text;
    if (!content) {
      throw new Error('Nenhum dado retornado pela OpenAI.');
    }

    const parsed: MarketResearchResult = JSON.parse(content);

    // 1. Extrair fontes reais da chamada web_search
    const realUrls = new Set<string>();
    
    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === 'web_search_call' && item.action && 'sources' in item.action && Array.isArray(item.action.sources)) {
          for (const source of item.action.sources) {
            if (source.url) {
              realUrls.add(source.url);
            }
          }
        }
      }
    }

    // 2. Validar comparáveis contra as fontes reais
    const validComparables: ComparableListing[] = [];
    let comparablesRejected = 0;

    for (const comp of parsed.comparables) {
      if (comp.url && realUrls.has(comp.url)) {
        validComparables.push(comp as ComparableListing);
      } else {
        comparablesRejected++;
      }
    }

    parsed.comparables = validComparables;
    parsed.comparable_count = validComparables.length;
    parsed.discarded_count = (parsed.discarded_count || 0) + comparablesRejected;

    if (validComparables.length < 3) {
      throw new Error('Dados insuficientes para estimar o preço com segurança.');
    }

    // 3. Recalcular média, mediana e eliminar outliers
    const prices = validComparables.map(c => c.price).sort((a, b) => a - b);
    parsed.lowest_price = prices[0];
    parsed.highest_price = prices[prices.length - 1];
    
    const mid = Math.floor(prices.length / 2);
    parsed.median_price = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
    
    const sum = prices.reduce((acc, p) => acc + p, 0);
    parsed.average_price = sum / prices.length;
    
    const nonOutlierPrices = prices.filter(p => p >= parsed.median_price * 0.5 && p <= parsed.median_price * 1.5);
    if (nonOutlierPrices.length >= 3) {
      const newSum = nonOutlierPrices.reduce((acc, p) => acc + p, 0);
      parsed.estimated_market_price = newSum / nonOutlierPrices.length;
    } else {
      parsed.estimated_market_price = parsed.average_price;
    }

    parsed.fast_sale_price = parsed.estimated_market_price * 0.85;

    return parsed;
  } catch (error) {
    console.error('Market research error:', error);
    throw error;
  }
}
