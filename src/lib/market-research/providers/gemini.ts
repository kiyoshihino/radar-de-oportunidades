import { GoogleGenAI, Type } from '@google/genai';
import { SearchResult, AIEvaluation } from '../types';

export async function evaluateWithGemini(
  targetProductTitle: string,
  targetProductDescription: string,
  city: string | null,
  tavilyResults: SearchResult[]
): Promise<AIEvaluation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um especialista em validação de anúncios de mercado de produtos usados no Brasil.
O produto alvo a ser analisado é: "${targetProductTitle}" ${city ? `na região de ${city}` : ''}.
Descrição do produto alvo: "${targetProductDescription}".

Abaixo estão os resultados extraídos da pesquisa.
Sua tarefa tem duas partes:

PARTE 1: Extrair a condição exata do PRODUTO ALVO com base na descrição.
Não invente estado. Se a informação não estiver na descrição, use null.
Para campos booleanos (Face ID, peças originais, caixa, carregador): true se explicitamente confirmar que tem/funciona, false se explicitamente disser que não tem/não funciona, null se não falar nada.
Bateria: extraia apenas o número inteiro da saúde (ex: 85).

PARTE 2: Ler cada resultado retornado pela pesquisa e validá-lo.
Regras OBRIGATÓRIAS para os resultados:
- resultId: OBRIGATÓRIO retornar o resultId exato fornecido. Nunca invente IDs.
- sellerType: classifique o vendedor daquele link como 'private' (particular), 'store' (loja seminovos), 'retailer_new' (varejo vendendo novo, ex: Amazon, Magalu, Zoom), ou 'unknown'.
- valid: true APENAS se for o MESMO produto, USADO/SEMINOVO, e NÃO for retailer_new. Falsos para peças, acessórios, ou aparelhos diferentes.
- extractedPrice: valor pedido em BRL, apenas números. NUNCA invente se não estiver no texto do anúncio. Se ausente, valid = false.
- capacity: extraia a capacidade de armazenamento se houver no anúncio (ex: "256GB").
- matchConfidence:
  - 'high': modelo, versão (Pro/Max) e armazenamento correspondem exatamente ao alvo.
  - 'medium': modelo corresponde, mas falta confirmar armazenamento ou versão.
  - 'low': parece o modelo, mas há muitas incertezas ou divergências.

RESULTADOS DA PESQUISA:
${tavilyResults.map(r => `
ID: ${r.id}
FONTE: ${r.source}
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
                batteryHealth: { type: Type.NUMBER, nullable: true },
                screenCondition: { type: Type.STRING, nullable: true },
                backCondition: { type: Type.STRING, nullable: true },
                cameraCondition: { type: Type.STRING, nullable: true },
                faceIdWorking: { type: Type.BOOLEAN, nullable: true },
                originalParts: { type: Type.BOOLEAN, nullable: true },
                hasBox: { type: Type.BOOLEAN, nullable: true },
                hasCharger: { type: Type.BOOLEAN, nullable: true },
                knownDamage: { type: Type.STRING, nullable: true }
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
                  matchConfidence: { type: Type.STRING },
                  sellerType: { type: Type.STRING },
                  capacity: { type: Type.STRING, nullable: true },
                  rejectionReason: { type: Type.STRING, nullable: true }
                },
                required: ["resultId", "valid", "matchConfidence", "sellerType"]
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('no longer available')) {
      console.error('Modelo Gemini indisponível:', errorMessage);
      throw new Error('Modelo de inteligência artificial indisponível no momento.');
    }
    console.error('Falha na validação do Gemini:', error);
    throw new Error('Falha na comunicação ou parse com o Gemini.');
  }
}
