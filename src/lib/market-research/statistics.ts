export type StatisticsResult = {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  marketPrice: number;
  quickSalePrice: number;
  outliersRemoved: number;
  validPrices: number[];
};

/**
 * Calculates the median of an array of numbers.
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Filters out statistical outliers using the Interquartile Range (IQR) method.
 * A value is an outlier if it's below Q1 - 1.5*IQR or above Q3 + 1.5*IQR.
 * If data size is too small (< 4), it uses a simpler fallback (e.g., 50% to 150% of median).
 */
export function removeOutliers(prices: number[]): number[] {
  if (prices.length < 3) return prices;

  const sorted = [...prices].sort((a, b) => a - b);
  const median = calculateMedian(sorted);

  if (prices.length < 4) {
    // Simple fallback for very small datasets
    return sorted.filter(p => p >= median * 0.5 && p <= median * 1.5);
  }

  // IQR method
  const mid = Math.floor(sorted.length / 2);
  const lowerHalf = sorted.slice(0, mid);
  // if odd, exclude median from upper half calculation
  const upperHalf = sorted.slice(sorted.length % 2 === 0 ? mid : mid + 1);

  const q1 = calculateMedian(lowerHalf);
  const q3 = calculateMedian(upperHalf);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return sorted.filter(p => p >= lowerBound && p <= upperBound);
}

/**
 * Calculates all required statistics for a set of raw prices.
 */
export function analyzePrices(rawPrices: number[]): StatisticsResult {
  if (rawPrices.length === 0) {
    return {
      count: 0, min: 0, max: 0, average: 0, median: 0,
      marketPrice: 0, quickSalePrice: 0, outliersRemoved: 0, validPrices: []
    };
  }

  const validPrices = removeOutliers(rawPrices);
  const outliersRemoved = rawPrices.length - validPrices.length;
  
  // If outlier removal left us with nothing (shouldn't happen with IQR, but just in case)
  const pricesToUse = validPrices.length > 0 ? validPrices : rawPrices;

  const min = Math.min(...pricesToUse);
  const max = Math.max(...pricesToUse);
  const sum = pricesToUse.reduce((acc, val) => acc + val, 0);
  const average = sum / pricesToUse.length;
  const median = calculateMedian(pricesToUse);

  // Market price is preferentially the median to avoid skew from remaining high/low ends
  const marketPrice = median;
  
  // Quick sale is typically 10-15% below market price. 
  // User asked for marketPrice * 0.90 in prompt example.
  const quickSalePrice = marketPrice * 0.90;

  return {
    count: pricesToUse.length,
    min,
    max,
    average,
    median,
    marketPrice,
    quickSalePrice,
    outliersRemoved,
    validPrices: pricesToUse
  };
}

/**
 * Calculates profit and margin mathematically.
 */
export function calculateProfit(askingPrice: number, quickSalePrice: number) {
  const potentialProfit = quickSalePrice - askingPrice;
  const potentialMargin = askingPrice > 0 ? (potentialProfit / askingPrice) * 100 : 0;
  return { potentialProfit, potentialMargin };
}
