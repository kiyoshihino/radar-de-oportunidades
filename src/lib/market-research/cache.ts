import { createClient } from '@/lib/supabase/server';
import { MarketPrice } from '@/types/database';

/**
 * Generates a deterministic product key for cache matching.
 * E.g. "iPhone 15 Pro Max 256GB" -> "iphone_15_pro_max_256gb"
 */
export function generateProductKey(title: string, category: string): string {
  const normalized = (category + ' ' + title)
    .toLowerCase()
    .normalize('NFD') // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_'); // Spaces to underscores
    
  return normalized;
}

/**
 * Checks if there are enough valid comparables in the cache for the given product key.
 */
export async function getCachedComparables(
  productKey: string,
  minComparables: number = 3,
  cacheHours: number = 12
): Promise<MarketPrice[] | null> {
  const supabase = await createClient();
  
  // Calculate the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - cacheHours);
  const cutoffIso = cutoffDate.toISOString();

  // Query market_prices for recent entries matching the product_key
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .eq('product_key', productKey)
    .gte('captured_at', cutoffIso)
    .gt('asking_price', 0)
    .not('reference_url', 'is', null);

  if (error) {
    console.error('Error fetching cache from market_prices:', error);
    return null;
  }

  if (data && data.length >= minComparables) {
    return data as MarketPrice[];
  }

  return null;
}

/**
 * Saves validated comparables to the cache (market_prices table).
 */
export async function saveComparablesToCache(comparables: MarketPrice[]): Promise<void> {
  if (comparables.length === 0) return;
  
  const supabase = await createClient();
  const { error } = await supabase.from('market_prices').insert(comparables);
  
  if (error) {
    console.error('Error saving comparables to cache:', error);
  }
}
