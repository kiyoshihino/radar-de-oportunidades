import { Filter, Search, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Listing, Analysis } from "@/types/database";

type HistoryItem = Analysis & {
  listings: Listing;
};

export default async function HistoricoPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analyses')
    .select(`
      *,
      listings (*)
    `)
    .order('created_at', { ascending: false });

  const historico = (data as unknown as HistoryItem[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Histórico de Análises</h1>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Filtros Avançados
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por produto ou fonte..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white min-w-[150px]">
          <option value="">Todas Categorias</option>
          <option value="iphone">iPhone</option>
          <option value="macbook">MacBook</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white min-w-[150px]">
          <option value="">Todas Decisões</option>
          <option value="comprar">Comprar</option>
          <option value="investigar">Investigar</option>
          <option value="negociar">Negociar</option>
          <option value="ignorar">Ignorar</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            Erro ao carregar histórico.
          </div>
        )}

        {!error && historico.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>Nenhuma análise realizada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Fonte</th>
                  <th className="px-6 py-4 font-medium">Preço / Mercado</th>
                  <th className="px-6 py-4 font-medium">Lucro Potencial</th>
                  <th className="px-6 py-4 font-medium text-center">Score</th>
                  <th className="px-6 py-4 font-medium">Decisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {historico.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.listings?.title}</td>
                    <td className="px-6 py-4 text-slate-500">{item.listings?.source}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.listings?.price || 0)}
                      </div>
                      <div className="text-slate-400 text-xs line-through">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.market_price || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${item.potential_profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.potential_profit > 0 ? '+' : ''}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.potential_profit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-xs ${
                        item.score >= 85 ? 'bg-purple-600' : 
                        item.score >= 70 ? 'bg-blue-600' : 
                        item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.classification === 'Oportunidade excepcional' || item.classification === 'Grande oportunidade' ? 'bg-purple-100 text-purple-700' : 
                        item.classification === 'Boa oportunidade' ? 'bg-blue-100 text-blue-700' : 
                        item.classification === 'Investigar' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
