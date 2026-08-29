export function extractTargetFacts(text: string) {
  const normalizedText = text.toLowerCase();
  
  let batteryHealth: number | null = null;
  let storage: string | null = null;

  // Extract battery health
  // Matches: bateria 89%, bateria: 89%, saude 89%, saúde da bateria 89%, battery health 89%, bateria 89 por cento
  const batteryRegex = /(?:bateria|sa[uú]de(?: da bateria)?|battery(?: health)?)\s*:?\s*(\d{1,3})\s*(?:%|por cento)/i;
  const batteryMatch = normalizedText.match(batteryRegex);
  if (batteryMatch && batteryMatch[1]) {
    const val = parseInt(batteryMatch[1], 10);
    if (val >= 0 && val <= 100) {
      batteryHealth = val;
    }
  }

  // Extract storage capacity
  // Matches: 128GB, 256 GB, 512g, 1 tb
  const storageRegex = /\b(64|128|256|512)\s*(?:gb|g)\b|\b(1|2)\s*(?:tb|t)\b/i;
  const storageMatch = normalizedText.match(storageRegex);
  
  if (storageMatch) {
    if (storageMatch[1]) {
      storage = `${storageMatch[1]}GB`;
    } else if (storageMatch[2]) {
      storage = `${storageMatch[2]}TB`;
    }
  }

  return {
    batteryHealth,
    storage
  };
}
