"use client";

import { useState } from "react";
import { Upload, AlertTriangle, CheckCircle, CheckSquare, Info, Calculator, AlertCircle } from "lucide-react";
import { ScoreResult } from "@/lib/score";
import { submitAnalysis } from "./actions";

export default function AnalisarPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg(null);
    
    const formData = new FormData(e.currentTarget);
    
    const response = await submitAnalysis(formData);
    
    if (response.error) {
      setErrorMsg(response.error);
    } else if (response.result) {
      setResult(response.result);
    }
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setResult(null);
    setErrorMsg(null);
  };

  if (result) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Resultado da Análise</h1>
          <button 
            onClick={resetAnalysis}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Nova Análise
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Opportunity Score</p>
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black text-white ${
                result.score >= 85 ? 'bg-purple-600' : 
                result.score >= 70 ? 'bg-blue-600' : 
                result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {result.score}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-800">{result.classification}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Decisão Recomendada</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
                  COMPRAR RÁPIDO
                </button>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                  INVESTIGAR
                </button>
                <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors">
                  NEGOCIAR
                </button>
                <button className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors">
                  IGNORAR
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-blue-500" />
                Análise Financeira
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Venda Rápida Est.</p>
                  <p className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.fastSalePrice)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Máximo Recomendado</p>
                  <p className="text-xl font-bold text-purple-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.maxBuyPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-sm text-slate-500">Lucro Bruto Potencial</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.potentialProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Margem Potencial</p>
                  <p className="text-3xl font-black text-emerald-600">{result.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={20} className="text-purple-500" />
                  Por que é oportunidade?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    Preço abaixo da média de mercado
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    Produto de alta liquidez
                  </li>
                  {result.score >= 70 && (
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      Score favorável para negociação rápida
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  Riscos e Verificações (iPhone)
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir IMEI
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir iCloud
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir Face ID
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Saúde da bateria
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir procedência
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Analisar Oportunidade</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {errorMsg && (
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Fonte do Anúncio</label>
              <select name="source" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option value="Facebook Marketplace">Facebook Marketplace</option>
                <option value="OLX">OLX</option>
                <option value="Mercado Livre">Mercado Livre</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Link do Anúncio (Opcional)</label>
              <input 
                type="url" 
                name="url"
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Título do Anúncio</label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="Ex: iPhone 15 128GB - Novo na caixa"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Categoria</label>
              <select name="category" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option value="iPhone">iPhone</option>
                <option value="MacBook">MacBook</option>
                <option value="iPad">iPad</option>
                <option value="Apple Watch">Apple Watch</option>
                <option value="Outros">Outros Smartphones</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Preço Pedido (R$)</label>
              <input 
                type="number" 
                name="price"
                required
                placeholder="Ex: 2700"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Preço de Mercado Estimado (R$)
              </label>
              <input 
                type="number" 
                name="marketPrice"
                required
                placeholder="Ex: 3500"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-blue-800 bg-blue-50" 
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                Temporário: será calculado automaticamente pelo Radar na V2.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição do Vendedor</label>
            <textarea 
              rows={4}
              name="description"
              placeholder="Cole aqui a descrição exata feita pelo vendedor..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cidade</label>
              <input 
                type="text" 
                name="city"
                defaultValue="Londrina"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bairro (Opcional)</label>
              <input 
                type="text" 
                name="neighborhood"
                placeholder="Ex: Centro"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Postado há</label>
              <select name="posted_time" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option value="Hoje">Hoje</option>
                <option value="Ontem">Ontem</option>
                <option value="Esta semana">Esta semana</option>
                <option value="Mais antigo">Mais antigo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Observações (Opcionais)</label>
            <input 
              type="text" 
              name="observations"
              placeholder="Ex: Não tem caixa, carregador paralelo..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fotos do Anúncio (Preparo V2)</label>
            <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
              <Upload className="mb-2 text-slate-400" />
              <span className="text-sm font-medium">Arraste fotos ou clique para upload</span>
              <span className="text-xs text-slate-400 mt-1">Imagens serão usadas pela IA na versão futura</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isAnalyzing}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analisando e Salvando...
                </>
              ) : (
                "ANALISAR OPORTUNIDADE"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
