import { Star, ShieldAlert, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Listing, Analysis, Opportunity } from "@/types/database";

type OpportunityItem = Opportunity & {
  analyses: Analysis;
  listings: Listing;
};

export default async function OportunidadesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      analyses (*),
      listings (*)
    `)
    .gte('analyses.score', 70)
    .order('created_at', { ascending: false });

  // supabase filters on joined tables might return null for joined records if they don't match, 
  // but since we want opportunities with score >= 70, the inner join filter works via inner() if specified,
  // or we can just filter in memory for safety with simple Supabase setup:
  
  const opportunitiesData = (data as unknown as OpportunityItem[]) || [];
  
  // Filter out any where analyses might not match the gte condition due to left join default
  const oportunidades = opportunitiesData.filter(op => op.analyses && op.analyses.score >= 70);

  const excepcionais = oportunidades.filter(o => o.analyses.score >= 95);
  const grandes = oportunidades.filter(o => o.analyses.score >= 85 && o.analyses.score < 95);
  const boas = oportunidades.filter(o => o.analyses.score >= 70 && o.analyses.score < 85);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quadro de Oportunidades</h1>
        <div className="text-sm text-slate-500 font-medium">
          Apenas anúncios com score &ge; 70
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          Erro ao carregar oportunidades.
        </div>
      )}

      {!error && oportunidades.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p>Nenhuma oportunidade encontrada ainda com score &ge; 70.</p>
        </div>
      )}

      {/* EXCEPCIONAL */}
      {excepcionais.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Star className="text-yellow-500" fill="currentColor" />
            Excepcionais (Score 95+)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {excepcionais.map(op => (
              <div key={op.id} className="bg-white rounded-xl border-2 border-yellow-400 shadow-md p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Score {op.analyses.score}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.listings.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{op.listings.source}</p>
                
                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Preço Pedido</span>
                    <span className="font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.listings.asking_price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-medium">Lucro Estimado</span>
                    <span className="font-black">
                      + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.analyses.potential_profit)}
                    </span>
                  </div>
                </div>
                
                <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GRANDE OPORTUNIDADE */}
      {grandes.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-purple-500" />
            Grandes Oportunidades (Score 85-94)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grandes.map(op => (
              <div key={op.id} className="bg-white rounded-xl border border-purple-200 shadow-sm p-6 relative">
                <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Score {op.analyses.score}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.listings.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{op.listings.source}</p>
                
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Preço Pedido</span>
                    <span className="font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.listings.asking_price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-medium">Lucro Estimado</span>
                    <span className="font-black">
                      + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.analyses.potential_profit)}
                    </span>
                  </div>
                </div>
                
                <button className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BOA OPORTUNIDADE */}
      {boas.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="text-blue-500" />
            Boas Oportunidades (Score 70-84)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boas.map(op => (
              <div key={op.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
                <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Score {op.analyses.score}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.listings.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{op.listings.source}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Pedido</p>
                    <p className="font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.listings.asking_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Lucro Est.</p>
                    <p className="font-bold text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.analyses.potential_profit)}
                    </p>
                  </div>
                </div>
                
                <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
