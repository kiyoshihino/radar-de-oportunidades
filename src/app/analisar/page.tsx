"use client";

import { useState } from "react";
import { Upload, AlertTriangle, CheckCircle, CheckSquare, Info, Calculator } from "lucide-react";
import { calculateScore, AnalysisData, ScoreResult } from "@/lib/score";

export default function AnalisarPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Simulate API/AI delay
    setTimeout(() => {
      // Mocked data that would come from the form + AI in the future
      const data: AnalysisData = {
        price: 2700,
        marketPrice: 3800, // Preço de mercado de um iPhone 15 128GB usado
        liquidity: 'alta',
        motivation: 'alta',
        recency: 'hoje',
        location: 'centro'
      };
      
      const calculatedResult = calculateScore(data);
      setResult(calculatedResult);
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetAnalysis = () => {
    setResult(null);
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
                  <p className="text-sm text-slate-500">Preço Pedido</p>
                  <p className="text-xl font-bold text-slate-800">R$ 2.700,00</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Preço de Mercado Est.</p>
                  <p className="text-xl font-bold text-slate-800">R$ 3.800,00</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Venda Rápida Est.</p>
                  <p className="text-xl font-bold text-blue-600">R$ {result.fastSalePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Máximo Recomendado</p>
                  <p className="text-xl font-bold text-purple-600">R$ {result.maxBuyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-sm text-slate-500">Lucro Bruto Potencial</p>
                  <p className="text-3xl font-black text-emerald-600">R$ {result.potentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
                    Preço 28% abaixo da média de mercado
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    Produto de altíssima liquidez (iPhone 15)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    Vendedor demonstra urgência (&quot;motivo de viagem&quot;)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    Anúncio postado há menos de 2 horas
                  </li>
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
                    <CheckSquare size={16} className="text-slate-400" /> Conferir iCloud (buscar iPhone)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir Face ID
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Saúde da bateria
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir câmeras e microfone
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Conferir True Tone
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare size={16} className="text-slate-400" /> Histórico de peças substituídas
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Fonte do Anúncio</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option>Facebook Marketplace</option>
                <option>OLX</option>
                <option>Mercado Livre</option>
                <option>WhatsApp</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Link do Anúncio (Opcional)</label>
              <input 
                type="url" 
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Título do Anúncio</label>
            <input 
              type="text" 
              required
              defaultValue="iPhone 15 128GB - Novo na caixa"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Categoria</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option>iPhone</option>
                <option>MacBook</option>
                <option>iPad</option>
                <option>Apple Watch</option>
                <option>Outros Smartphones</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Preço Pedido (R$)</label>
              <input 
                type="number" 
                required
                defaultValue="2700"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição do Vendedor</label>
            <textarea 
              rows={4}
              defaultValue="Vendo iPhone 15 128gb lacrado. Motivo: ganhei da empresa e já tenho um. Preciso vender rápido para pagar contas. Apenas venda, não aceito troca."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cidade</label>
              <input 
                type="text" 
                defaultValue="Londrina"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bairro (Opcional)</label>
              <input 
                type="text" 
                defaultValue="Centro"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Postado há</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option>Hoje</option>
                <option>Ontem</option>
                <option>Esta semana</option>
                <option>Mais antigo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Observações (Opcionais)</label>
            <input 
              type="text" 
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
                  Analisando com IA...
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
