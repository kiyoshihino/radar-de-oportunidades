import { createClient } from '@/lib/supabase/server'
import { Radar, RadarItem } from '@/types/database'

export type ActiveRadarContext = {
  radar: Radar
  items: RadarItem[]
}

export async function getActiveRadarsWithItems(): Promise<ActiveRadarContext[]> {
  const supabase = await createClient()

  const { data: radars, error: radarError } = await supabase
    .from('radars')
    .select('*')
    .eq('status', 'ATIVO')

  if (radarError || !radars) {
    console.error('Error fetching active radars:', radarError)
    return []
  }

  const { data: items, error: itemsError } = await supabase
    .from('radar_items')
    .select('*')
    .eq('status', 'ativo')

  if (itemsError || !items) {
    console.error('Error fetching active radar items:', itemsError)
    return []
  }

  const activeContexts: ActiveRadarContext[] = radars.map(radar => {
    return {
      radar,
      items: items.filter(item => item.radar_id === radar.id)
    }
  })

  return activeContexts
}
