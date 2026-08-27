'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRadar(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const city = formData.get('city') as string || null
  const region = formData.get('region') as string || null
  const status = formData.get('status') as string || 'ATIVO'
  
  const min_scoreStr = formData.get('min_score') as string
  const min_profitStr = formData.get('min_profit') as string
  const min_margin_pctStr = formData.get('min_margin_pct') as string

  const { data, error } = await supabase.from('radars').insert({
    name,
    slug,
    city,
    region,
    status,
    min_score: min_scoreStr ? Number(min_scoreStr) : null,
    min_profit: min_profitStr ? Number(min_profitStr) : null,
    min_margin_pct: min_margin_pctStr ? Number(min_margin_pctStr) : null,
  }).select().single()

  if (error) {
    console.error('Error creating radar:', error)
    return { error: error.message }
  }

  revalidatePath('/radares')
  return { success: true, radar: data }
}

export async function updateRadar(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const city = formData.get('city') as string || null
  const region = formData.get('region') as string || null
  const status = formData.get('status') as string
  
  const min_scoreStr = formData.get('min_score') as string
  const min_profitStr = formData.get('min_profit') as string
  const min_margin_pctStr = formData.get('min_margin_pct') as string

  const { error } = await supabase.from('radars').update({
    name,
    city,
    region,
    status,
    min_score: min_scoreStr ? Number(min_scoreStr) : null,
    min_profit: min_profitStr ? Number(min_profitStr) : null,
    min_margin_pct: min_margin_pctStr ? Number(min_margin_pctStr) : null,
  }).eq('id', id)

  if (error) {
    console.error('Error updating radar:', error)
    return { error: error.message }
  }

  revalidatePath('/radares')
  revalidatePath(`/radares/${id}`)
  return { success: true }
}

export async function createRadarItem(radar_id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const search_query = formData.get('search_query') as string
  
  const aliasesStr = formData.get('aliases') as string
  const aliases = aliasesStr ? aliasesStr.split(',').map(s => s.trim()).filter(Boolean) : null
  
  const excludedStr = formData.get('excluded_keywords') as string
  const excluded_keywords = excludedStr ? excludedStr.split(',').map(s => s.trim()).filter(Boolean) : null
  
  const status = formData.get('status') as string || 'ativo'
  const priorityStr = formData.get('priority') as string
  const min_scoreStr = formData.get('min_score') as string
  const min_profitStr = formData.get('min_profit') as string
  const min_margin_pctStr = formData.get('min_margin_pct') as string
  const max_asking_priceStr = formData.get('max_asking_price') as string
  
  const city = formData.get('city') as string || null
  const region = formData.get('region') as string || null
  const notes = formData.get('notes') as string || null

  const { error } = await supabase.from('radar_items').insert({
    radar_id,
    name,
    search_query,
    aliases,
    excluded_keywords,
    status,
    priority: priorityStr ? Number(priorityStr) : null,
    min_score: min_scoreStr ? Number(min_scoreStr) : null,
    min_profit: min_profitStr ? Number(min_profitStr) : null,
    min_margin_pct: min_margin_pctStr ? Number(min_margin_pctStr) : null,
    max_asking_price: max_asking_priceStr ? Number(max_asking_priceStr) : null,
    city,
    region,
    notes
  })

  if (error) {
    console.error('Error creating radar item:', error)
    return { error: error.message }
  }

  revalidatePath(`/radares/${radar_id}`)
  return { success: true }
}

export async function updateRadarItem(id: string, radar_id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const search_query = formData.get('search_query') as string
  
  const aliasesStr = formData.get('aliases') as string
  const aliases = aliasesStr ? aliasesStr.split(',').map(s => s.trim()).filter(Boolean) : null
  
  const excludedStr = formData.get('excluded_keywords') as string
  const excluded_keywords = excludedStr ? excludedStr.split(',').map(s => s.trim()).filter(Boolean) : null
  
  const status = formData.get('status') as string
  const priorityStr = formData.get('priority') as string
  const min_scoreStr = formData.get('min_score') as string
  const min_profitStr = formData.get('min_profit') as string
  const min_margin_pctStr = formData.get('min_margin_pct') as string
  const max_asking_priceStr = formData.get('max_asking_price') as string
  
  const city = formData.get('city') as string || null
  const region = formData.get('region') as string || null
  const notes = formData.get('notes') as string || null

  const { error } = await supabase.from('radar_items').update({
    name,
    search_query,
    aliases,
    excluded_keywords,
    status,
    priority: priorityStr ? Number(priorityStr) : null,
    min_score: min_scoreStr ? Number(min_scoreStr) : null,
    min_profit: min_profitStr ? Number(min_profitStr) : null,
    min_margin_pct: min_margin_pctStr ? Number(min_margin_pctStr) : null,
    max_asking_price: max_asking_priceStr ? Number(max_asking_priceStr) : null,
    city,
    region,
    notes,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (error) {
    console.error('Error updating radar item:', error)
    return { error: error.message }
  }

  revalidatePath(`/radares/${radar_id}`)
  return { success: true }
}

export async function updateRadarItemStatus(id: string, radar_id: string, status: 'ativo' | 'pausado' | 'arquivado') {
  const supabase = await createClient()
  
  const { error } = await supabase.from('radar_items').update({ 
    status, 
    updated_at: new Date().toISOString() 
  }).eq('id', id)

  if (error) {
    console.error('Error updating item status:', error)
    return { error: error.message }
  }

  revalidatePath(`/radares/${radar_id}`)
  return { success: true }
}
