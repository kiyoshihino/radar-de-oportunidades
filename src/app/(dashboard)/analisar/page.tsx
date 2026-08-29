"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, CheckSquare, Info, Calculator, AlertCircle, Search, ExternalLink } from "lucide-react";
import { ScoreResult } from "@/lib/score";
import { submitAnalysis, AnalysisResponse } from "./actions";
import { MarketResearchResult } from "@/types/database";
import { ConditionAdjustmentResult } from "@/lib/valuation/iphone-condition";


const getClassificationLabel = (val: string) => {
  switch (val) {
    case 'excepcional': return 'Oportunidade excepcional';
    case 'grande_oportunidade': return 'Grande oportunidade';
    case 'boa_oportunidade': return 'Boa oportunidade';
    case 'investigar': return 'Investigar';
    case 'ignorar': return 'Ignorar';
    default: return val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
  }
};

export default function AnalisarPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [marketResearch, setMarketResearch] = useState<MarketResearchResult | null>(null);
  const [conditionAdjustment, setConditionAdjustment] = useState<ConditionAdjustmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualPrice, setManualPrice] = useState(false);
  const [askingPrice, setAskingPrice] = useState<number>(0);
  const [baseMarketPrice, setBaseMarketPrice] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg(null);
    
    const formData = new FormData(e.currentTarget);
    setAskingPrice(Number(formData.get('price')));
    
    const response: AnalysisResponse = await submitAnalysis(formData);
    
    if (response.error) {
      setErrorMsg(response.error);
    }
    
    if (response.needsManualPrice) {
      setManualPrice(true);
    }

    if (response.marketResearch) {
      setMarketResearch(response.marketResearch);
    }

    if (response.marketPrice) {
      setBaseMarketPrice(response.marketPrice);
    }

    if (response.conditionAdjustment) {
      setConditionAdjustment(response.conditionAdjustment);
    }

    if (response.result) {
      setResult(response.result);
    }
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setResult(null);
    setErrorMsg(null);
    setMarketResearch(null);
    setConditionAdjustment(null);
    setBaseMarketPrice(0);
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
              <p className="mt-4 text-lg font-bold text-slate-800">{getClassificationLabel(result.classification)}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Decisão Recomendada</h3>
              <div className="space-y-3">
                <button className={`w-full py-3 font-bold rounded-lg transition-colors ${result.decision === 'comprar' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  COMPRAR
                </button>
                <button className={`w-full py-3 font-bold rounded-lg transition-colors ${result.decision === 'negociar' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  NEGOCIAR
                </button>
                <button className={`w-full py-3 font-bold rounded-lg transition-colors ${result.decision === 'investigar' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  INVESTIGAR
                </button>
                <button className={`w-full py-3 font-bold rounded-lg transition-colors ${result.decision === 'ignorar' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  IGNORAR
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Calculator size={20} className="text-blue-500" />
                  Análise Financeira
                </h3>
                {marketResearch && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    marketResearch.confidence_level === 'alta' ? 'bg-emerald-100 text-emerald-700' :
                    marketResearch.confidence_level === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Confiança: {marketResearch.confidence_level.toUpperCase()}
                  </span>
                )}
              </div>

              {conditionAdjustment && conditionAdjustment.adjustments.length > 0 && (
                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium text-slate-600 mb-2">Descontos por Condição (Aparelho Alvo)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Mercado Padrão (Seminovo)</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marketResearch?.estimated_market_price || 0)}</span>
                    </div>
                    {conditionAdjustment.adjustments.map((adj, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-red-500">
                        <span>- {adj.label}</span>
                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(adj.amount || 0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
                      <span>Mercado Ajustado</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conditionAdjustment.conditionAdjustedMarketPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
              
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

            {marketResearch && marketResearch.comparables.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Search size={20} className="text-emerald-500" />
                  COMO CHEGAMOS NESTE PREÇO
                </h3>
                
                <p className="text-sm text-slate-600 mb-4">
                  {marketResearch.comparable_count} anúncios comparáveis encontrados. Foram descartados {marketResearch.discarded_count} outliers.
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Mediana</p>
                    <p className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marketResearch.median_price)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Média</p>
                    <p className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marketResearch.average_price)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Faixa</p>
                    <p className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marketResearch.lowest_price)} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marketResearch.highest_price)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {marketResearch.comparables.map((comp, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">{comp.source} {comp.city ? `- ${comp.city}` : ''} • {comp.sellerType || 'unknown'}</p>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{comp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {comp.capacity && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{comp.capacity}</span>}
                            {comp.condition && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{comp.condition}</span>}
                            {comp.matchConfidence && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                comp.matchConfidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                                comp.matchConfidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                Match: {comp.matchConfidence}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-bold text-blue-600 text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comp.price)}</p>
                          {comp.url && (
                            <a href={comp.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1">
                              Ver <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {(() => {
                  // Calculate dynamic opportunity reasons
                  const targetMarket = conditionAdjustment ? conditionAdjustment.conditionAdjustedMarketPrice : baseMarketPrice;
                  const discountVsAdjustedMarketPct = targetMarket > 0 ? ((targetMarket - askingPrice) / targetMarket) * 100 : 0;
                  
                  const isOpportunity = result.potentialProfit > 0 && discountVsAdjustedMarketPct > 0;
                  
                  return (
                    <>
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        {isOpportunity ? (
                          <><Info size={20} className="text-purple-500" /> Por que é oportunidade?</>
                        ) : (
                          <><AlertTriangle size={20} className="text-red-500" /> Por que não recomendamos esta compra?</>
                        )}
                      </h3>
                      <ul className="space-y-3">
                        {isOpportunity ? (
                          <>
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                              Preço {discountVsAdjustedMarketPct.toFixed(1)}% abaixo do mercado ajustado
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                              Margem de lucro potencial positiva ({result.profitMargin.toFixed(1)}%)
                            </li>
                            {result.score >= 70 && (
                              <li className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                Score favorável para negociação rápida
                              </li>
                            )}
                          </>
                        ) : (
                          <>
                            {askingPrice >= result.fastSalePrice && (
                              <li className="flex items-start gap-2 text-sm text-slate-600">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                Preço de compra não deixa margem segura para revenda rápida.
                              </li>
                            )}
                            {result.potentialProfit <= 0 && (
                              <li className="flex items-start gap-2 text-sm text-slate-600">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                Margem potencial negativa ou nula.
                              </li>
                            )}
                            {discountVsAdjustedMarketPct <= 0 && (
                              <li className="flex items-start gap-2 text-sm text-slate-600">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                Preço pedido acima da média de mercado avaliada.
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  Riscos e Verificações
                </h3>
                
                {conditionAdjustment?.knownIssues && conditionAdjustment.knownIssues.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-red-500 uppercase mb-2">Problemas Identificados</p>
                    <ul className="space-y-2">
                      {conditionAdjustment.knownIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <AlertCircle size={16} className="text-red-500 shrink-0" /> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Requer Verificação</p>
                  <ul className="space-y-2">
                    {conditionAdjustment?.unverifiedRisks ? (
                      conditionAdjustment.unverifiedRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckSquare size={16} className="text-slate-400 shrink-0" /> {risk}
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckSquare size={16} className="text-slate-400" /> Conferir IMEI
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckSquare size={16} className="text-slate-400" /> Conferir iCloud
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckSquare size={16} className="text-slate-400" /> Conferir procedência
                        </li>
                      </>
                    )}
                  </ul>
                </div>
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
            <div className="bg-red-50 p-4 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
              </div>
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

            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 pb-2">
                <input 
                  type="checkbox" 
                  checked={manualPrice} 
                  onChange={(e) => setManualPrice(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Informar preço manualmente
              </label>
              {manualPrice && (
                <input 
                  type="number" 
                  name="marketPrice"
                  placeholder="Preço de Mercado (Ex: 3500)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-blue-800 bg-blue-50" 
                />
              )}
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

          <div className="pt-4 border-t border-slate-100 flex gap-4">
            <button 
              type="submit" 
              disabled={isAnalyzing}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analisando mercado e salvando...
                </>
              ) : (
                "ANALISAR OPORTUNIDADE"
              )}
            </button>
            {errorMsg && (
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); }}
                disabled={isAnalyzing}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center"
              >
                TENTAR PESQUISA NOVAMENTE
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
