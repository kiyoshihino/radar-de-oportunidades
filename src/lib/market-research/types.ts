export type SearchResult = {
  id: string; // Internal ID for AI referencing, e.g. "result_1"
  title: string;
  url: string;
  source: string;
  content: string;
  score: number;
};

export type AIValidationResult = {
  resultId: string;
  valid: boolean;
  extractedPrice: number | null;
  condition: string | null;
  rejectionReason: string | null;
};

export type AIEvaluation = {
  targetProduct: {
    brand: string | null;
    model: string | null;
    variant: string | null;
    storage: string | null;
    condition: string | null;
  };
  evaluatedResults: AIValidationResult[];
};
