import { GoogleGenAI, Type } from '@google/genai';
import { SearchResult, AIEvaluation } from '../types';

export async function evaluateWithGemini(
  targetProductTitle: string,
  city: string | null,
  tavilyResults: SearchResult[]
): Promise<AIEvaluation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um especialista em validação de anúncios de mercado de produtos usados no Brasil.
O produto alvo a ser analisado é: "${targetProductTitle}" ${city ? `na região de ${city}` : ''}.

Abaixo estão os resultados extraídos da pesquisa (providos por um sistema de busca na web).
Sua ÚNICA tarefa é ler cada resultado retornado, identificar se é o mesmo produto (levando em conta modelo, armazenamento/especificações e se é usado/novo), extrair o preço pedido (em BRL, apenas números), e identificar a condição (usado, novo, etc).

Regras de Validação para cada item:
- resultId: OBRIGATÓRIO retornar o resultId exato fornecido. Nunca invente IDs.
- valid: true se for o mesmo produto do título, e for um produto USADO/SEMINOVO.
- valid: false se for novo (de loja), peças (sucata), capa/película/acessório, ou se o preço não for determinável.
- extractedPrice: o valor encontrado no anúncio em BRL. Apenas números (ex: 4100).
- condition: 'usado', 'seminovo', 'novo', etc.
- rejectionReason: se valid = false, explique de forma curta por que foi rejeitado (ex: "Produto novo", "Capa apenas", "Preço ausente").

NÃO FAÇA BUSCAS. NÃO CRIE URLs. Use estritamente as informações fornecidas abaixo.

RESULTADOS DA PESQUISA:
${tavilyResults.map(r => `
ID: ${r.id}
TÍTULO: ${r.title}
CONTEÚDO: ${r.content}
`).join('\n---')}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetProduct: {
              type: Type.OBJECT,
              properties: {
                brand: { type: Type.STRING, nullable: true },
                model: { type: Type.STRING, nullable: true },
                variant: { type: Type.STRING, nullable: true },
                storage: { type: Type.STRING, nullable: true },
                condition: { type: Type.STRING, nullable: true },
              }
            },
            evaluatedResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  resultId: { type: Type.STRING },
                  valid: { type: Type.BOOLEAN },
                  extractedPrice: { type: Type.NUMBER, nullable: true },
                  condition: { type: Type.STRING, nullable: true },
                  rejectionReason: { type: Type.STRING, nullable: true }
                },
                required: ["resultId", "valid"]
              }
            }
          },
          required: ["targetProduct", "evaluatedResults"]
        }
      }
    });

    if (!response.text) {
      throw new Error('Nenhum texto retornado pelo Gemini.');
    }

    const evaluation: AIEvaluation = JSON.parse(response.text);
    return evaluation;
  } catch (error) {
    console.error('Falha na validação do Gemini:', error);
    throw new Error('Falha na comunicação ou parse com o Gemini.');
  }
}
