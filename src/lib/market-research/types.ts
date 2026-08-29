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
  matchConfidence: 'high' | 'medium' | 'low';
  sellerType: string;
  capacity: string | null;
  rejectionReason: string | null;
};

export type AIEvaluation = {
  targetProduct: {
    brand: string | null;
    model: string | null;
    variant: string | null;
    storage: string | null;
    condition: string | null;
    batteryHealth: number | null;
    screenCondition: string | null;
    backCondition: string | null;
    cameraCondition: string | null;
    faceIdWorking: boolean | null;
    originalParts: boolean | null;
    hasBox: boolean | null;
    hasCharger: boolean | null;
    knownDamage: string | null;
  };
  evaluatedResults: AIValidationResult[];
};
