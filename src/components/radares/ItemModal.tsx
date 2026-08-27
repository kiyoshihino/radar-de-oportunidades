'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createRadarItem, updateRadarItem } from '@/app/(dashboard)/radares/actions'
import { RadarItem } from '@/types/database'

type Props = {
  radarId: string
  existingItem?: RadarItem
}

export function ItemModal({ radarId, existingItem }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEdit = !!existingItem

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    if (isEdit) {
      await updateRadarItem(existingItem.id, radarId, formData)
    } else {
      await createRadarItem(radarId, formData)
    }
    
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={isEdit 
          ? "text-blue-600 hover:text-blue-800 font-medium text-sm"
          : "px-4 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
        }
      >
        {!isEdit && <Plus size={20} />}
        {isEdit ? 'Editar' : 'ADICIONAR ITEM'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? 'Editar Item do Radar' : 'Novo Item do Radar'}
              </h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nome do Produto</label>
                  <input required name="name" defaultValue={existingItem?.name} type="text" placeholder="Ex: iPhone 15 Pro Max 256 GB" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Consulta Principal (Busca)</label>
                  <input required name="search_query" defaultValue={existingItem?.search_query} type="text" placeholder="Ex: iPhone 15 Pro Max 256GB" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Termos alternativos (separados por vírgula)</label>
                <input name="aliases" defaultValue={existingItem?.aliases?.join(', ')} type="text" placeholder="Ex: iphone 15 pro max 256, 15 pro max 256" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Palavras a excluir (separadas por vírgula)</label>
                <input name="excluded_keywords" defaultValue={existingItem?.excluded_keywords?.join(', ')} type="text" placeholder="Ex: capinha, película, display, sucata" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select name="status" defaultValue={existingItem?.status || 'ativo'} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Prioridade (1-10)</label>
                  <input name="priority" defaultValue={existingItem?.priority || ''} type="number" min="1" max="10" placeholder="Ex: 5" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Preço Máximo de Compra</label>
                  <input name="max_asking_price" defaultValue={existingItem?.max_asking_price || ''} type="number" placeholder="Ex: 5000" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Score Mín.</label>
                  <input name="min_score" defaultValue={existingItem?.min_score || ''} type="number" placeholder="Herda do Radar" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Lucro Mín. (R$)</label>
                  <input name="min_profit" defaultValue={existingItem?.min_profit || ''} type="number" placeholder="Herda do Radar" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Margem Mín. (%)</label>
                  <input name="min_margin_pct" defaultValue={existingItem?.min_margin_pct || ''} type="number" placeholder="Herda do Radar" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-colors">
                  {loading ? 'Salvando...' : 'Salvar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
