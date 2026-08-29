export type TargetConditionValue<T> = {
  value: T | null;
  evidence: string | null;
  confidence: 'explicit' | 'inferred' | 'unknown';
};

export type TargetCondition = {
  batteryHealth: TargetConditionValue<number>;
  screenCondition: TargetConditionValue<string>;
  backCondition: TargetConditionValue<string>;
  cameraCondition: TargetConditionValue<string>;
  faceIdWorking: TargetConditionValue<boolean>;
  originalParts: TargetConditionValue<boolean>;
  hasBox: TargetConditionValue<boolean>;
  hasCharger: TargetConditionValue<boolean>;
  knownDamage: TargetConditionValue<string>;
};

export type ConditionAdjustment = {
  type: string;
  label: string;
  amount?: number;
  percentage?: number;
  reason: string;
};

export type ConditionAdjustmentResult = {
  adjustments: ConditionAdjustment[];
  totalAdjustmentAmount: number;
  conditionAdjustedMarketPrice: number;
  unverifiedRisks: string[]; // e.g. "Conferir IMEI", "Conferir iCloud"
  knownIssues: string[]; // e.g. "Tela quebrada", "Bateria degradada"
  blockComprar: boolean;
};

const IPHONE_CONDITION_RULES = {
  battery: {
    good: { min: 85, penaltyPct: 0, penaltyAmount: 0 },
    fair: { min: 80, max: 84, penaltyPct: 0, penaltyAmount: 150, reason: "Bateria em degradação inicial (80-84%)" },
    poor: { min: 75, max: 79, penaltyPct: 0.05, penaltyAmount: 300, reason: "Bateria degradada (75-79%), requer troca em breve" },
    critical: { max: 74, penaltyPct: 0.10, penaltyAmount: 500, reason: "Bateria muito degradada (<75%), troca imediata" }
  },
  screen: {
    broken: { penaltyPct: 0.15, penaltyAmount: 800, reason: "Tela quebrada ou trincada" },
    scratched: { penaltyPct: 0.05, penaltyAmount: 200, reason: "Riscos severos na tela" }
  },
  back: {
    broken: { penaltyPct: 0.10, penaltyAmount: 400, reason: "Traseira quebrada" }
  },
  faceId: {
    broken: { penaltyPct: 0.20, penaltyAmount: 1000, reason: "Face ID não funcional" }
  },
  parts: {
    nonOriginal: { penaltyPct: 0.15, penaltyAmount: 700, reason: "Peças não originais identificadas" }
  },
  accessories: {
    noBox: { penaltyPct: 0, penaltyAmount: 50, reason: "Sem caixa original" },
    noCharger: { penaltyPct: 0, penaltyAmount: 80, reason: "Sem carregador" }
  }
};

export function calculateConditionAdjustments(
  marketPrice: number,
  condition: TargetCondition
): ConditionAdjustmentResult {
  const adjustments: ConditionAdjustment[] = [];
  let totalDeduction = 0;
  const unverifiedRisks: string[] = ["Conferir IMEI", "Conferir iCloud"];
  const knownIssues: string[] = [];
  let blockComprar = false;

  const addPenalty = (
    type: string,
    label: string,
    rule: { penaltyPct?: number; penaltyAmount?: number; reason: string },
    isCriticalRisk: boolean = false
  ) => {
    // Avoid double counting same types, just simple additive for now
    let deduction = 0;
    if (rule.penaltyPct && rule.penaltyPct > 0) {
      const pctDeduction = marketPrice * rule.penaltyPct;
      deduction = Math.max(pctDeduction, rule.penaltyAmount || 0); // take the max of pct or flat
    } else if (rule.penaltyAmount) {
      deduction = rule.penaltyAmount;
    }

    if (deduction > 0) {
      adjustments.push({
        type,
        label,
        amount: deduction,
        percentage: rule.penaltyPct,
        reason: rule.reason
      });
      totalDeduction += deduction;
    }
    
    knownIssues.push(rule.reason);
    if (isCriticalRisk) {
      blockComprar = true;
    }
  };

  // Battery
  const batteryHealth = condition.batteryHealth?.value;
  if (batteryHealth !== null && batteryHealth !== undefined) {
    if (batteryHealth < 75) {
      addPenalty('battery', 'Bateria Crítica', IPHONE_CONDITION_RULES.battery.critical, false); // Low battery alone doesn't block buy, just adjusts price
    } else if (batteryHealth >= 75 && batteryHealth <= 79) {
      addPenalty('battery', 'Bateria Degradada', IPHONE_CONDITION_RULES.battery.poor);
    } else if (batteryHealth >= 80 && batteryHealth <= 84) {
      addPenalty('battery', 'Bateria Justa', IPHONE_CONDITION_RULES.battery.fair);
    }
  } else {
    unverifiedRisks.push("Saúde da bateria não informada");
  }

  // Screen
  const screenDesc = condition.screenCondition?.value?.toLowerCase() || '';
  if (screenDesc.includes('quebrad') || screenDesc.includes('trincad')) {
    addPenalty('screen', 'Tela Quebrada', IPHONE_CONDITION_RULES.screen.broken, true);
  }

  // Back
  const backDesc = condition.backCondition?.value?.toLowerCase() || '';
  if (backDesc.includes('quebrad') || backDesc.includes('trincad')) {
    addPenalty('back', 'Traseira Quebrada', IPHONE_CONDITION_RULES.back.broken, true);
  }

  // Face ID
  if (condition.faceIdWorking?.value === false) {
    addPenalty('faceId', 'Face ID Defeituoso', IPHONE_CONDITION_RULES.faceId.broken, true);
  } else if (condition.faceIdWorking?.value === null) {
    unverifiedRisks.push("Face ID não confirmado");
  }

  // Original Parts
  if (condition.originalParts?.value === false) {
    addPenalty('parts', 'Peças Trocadas', IPHONE_CONDITION_RULES.parts.nonOriginal, true);
  }

  // Accessories
  if (condition.hasBox?.value === false) {
    addPenalty('box', 'Sem Caixa', IPHONE_CONDITION_RULES.accessories.noBox);
  }
  if (condition.hasCharger?.value === false) {
    addPenalty('charger', 'Sem Carregador', IPHONE_CONDITION_RULES.accessories.noCharger);
  }

  // Prevent negative price
  const adjustedPrice = Math.max(marketPrice - totalDeduction, marketPrice * 0.2); // floor at 20% of market

  return {
    adjustments,
    totalAdjustmentAmount: totalDeduction,
    conditionAdjustedMarketPrice: adjustedPrice,
    unverifiedRisks,
    knownIssues,
    blockComprar
  };
}
