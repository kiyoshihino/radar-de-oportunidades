'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createRadar } from '@/app/(dashboard)/radares/actions'

export function NewRadarModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createRadar(formData)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        NOVO RADAR
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Criar Novo Radar</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome da Categoria</label>
                <input required name="name" type="text" placeholder="Ex: Câmeras DSLR" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cidade (Opcional)</label>
                  <input name="city" type="text" placeholder="Ex: Londrina" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Região (Opcional)</label>
                  <input name="region" type="text" placeholder="Ex: Paraná" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Score Mín.</label>
                  <input name="min_score" type="number" placeholder="Ex: 70" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Lucro Mín. (R$)</label>
                  <input name="min_profit" type="number" placeholder="Ex: 500" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Margem Mín. (%)</label>
                  <input name="min_margin_pct" type="number" placeholder="Ex: 15" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select name="status" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="ATIVO">Ativo</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="EM_BREVE">Em breve</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-colors">
                  {loading ? 'Salvando...' : 'Salvar Radar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
