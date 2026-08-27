import { tavily } from '@tavily/core';
import { SearchResult } from '../types';

export async function searchTavily(query: string, startIndex: number = 0): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY não está configurada no servidor.');
  }

  const client = tavily({ apiKey });

  try {
    // Explicitly setting searchDepth to basic to save credits
    // Disabling advanced configs that could consume extra credits
    const response = await client.search(query, {
      searchDepth: 'basic',
      includeAnswer: false,
      includeImages: false,
      includeRawContent: false,
      maxResults: 15,
    });

    const mappedResults: SearchResult[] = response.results.map((r, index) => {
      // Determine the domain source
      let source = 'web';
      try {
        source = new URL(r.url).hostname.replace('www.', '');
      } catch {
        // invalid URL
      }

      return {
        id: `result_${startIndex + index + 1}`,
        title: r.title,
        url: r.url,
        source: source,
        content: r.content,
        score: r.score,
      };
    });

    return mappedResults;
  } catch (error) {
    console.error('Falha na busca Tavily:', error);
    throw new Error('Falha na comunicação com Tavily.');
  }
}
