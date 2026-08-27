'use client'

import { Pause, Play, Archive } from 'lucide-react'
import { updateRadarItemStatus } from '@/app/(dashboard)/radares/actions'
import { RadarItem } from '@/types/database'
import { ItemModal } from './ItemModal'

export function ItemActions({ item, radarId }: { item: RadarItem, radarId: string }) {
  const handleStatusChange = async (status: 'ativo' | 'pausado' | 'arquivado') => {
    if (status === 'arquivado' && !confirm('Tem certeza que deseja excluir este item do Radar? (Ele será arquivado)')) {
      return
    }
    await updateRadarItemStatus(item.id, radarId, status)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <ItemModal radarId={radarId} existingItem={item} />
      
      {item.status === 'ativo' ? (
        <button 
          onClick={() => handleStatusChange('pausado')}
          title="Pausar"
          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
        >
          <Pause size={18} />
        </button>
      ) : (
        <button 
          onClick={() => handleStatusChange('ativo')}
          title="Reativar"
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Play size={18} />
        </button>
      )}

      {item.status !== 'arquivado' && (
        <button 
          onClick={() => handleStatusChange('arquivado')}
          title="Excluir/Arquivar"
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Archive size={18} />
        </button>
      )}
    </div>
  )
}
