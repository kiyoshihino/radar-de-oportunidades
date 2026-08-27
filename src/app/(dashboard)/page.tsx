import { ArrowUpRight, DollarSign, Target, Activity, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Listing, Analysis, Opportunity } from "@/types/database";

// Define a composite type for the recent opportunities join
type RecentOpportunity = Opportunity & {
  analyses: Analysis;
  listings: Listing;
};

export default async function Dashboard() {
  const supabase = await createClient();

  // Fetch metrics
  const { count: listingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  const { count: opportunitiesCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true });

  const { count: bigOpportunitiesCount } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .gte('score', 85);

  const { data: analysesData } = await supabase
    .from('analyses')
    .select('potential_profit');

  const totalPotentialProfit = analysesData 
    ? analysesData.reduce((acc, curr) => acc + Number(curr.potential_profit), 0)
    : 0;

  // Fetch recent opportunities (joining analyses and listings)
  const { data: recentOps, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      analyses (*),
      listings (*)
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  const recentOpportunities = (recentOps as unknown as RecentOpportunity[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Anúncios analisados</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{listingsCount || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Oportunidades encontradas</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{opportunitiesCount || 0}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Target size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Grandes oportunidades</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{bigOpportunitiesCount || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Lucro potencial identificado</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPotentialProfit)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Oportunidades recentes</h2>
        </div>
        
        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            Erro ao carregar oportunidades recentes.
          </div>
        )}

        {!error && recentOpportunities.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>Nenhuma oportunidade encontrada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preço pedido</th>
                  <th className="px-6 py-4 font-medium">Venda rápida</th>
                  <th className="px-6 py-4 font-medium">Lucro potencial</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {recentOpportunities.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{op.listings?.title}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.listings?.price || 0)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.analyses?.fast_sale_price || 0)}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.analyses?.potential_profit || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs">
                        {op.analyses?.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        op.analyses?.score >= 85 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {op.analyses?.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(op.created_at).toLocaleDateString('pt-BR')}
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
