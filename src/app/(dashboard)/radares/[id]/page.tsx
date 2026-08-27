import { createClient } from "@/lib/supabase/server";
import { Radar, RadarItem } from "@/types/database";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditRadarModal } from "@/components/radares/EditRadarModal";
import { ItemModal } from "@/components/radares/ItemModal";
import { ItemActions } from "@/components/radares/ItemActions";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function RadarDetailsPage(props: { params: Params, searchParams: SearchParams }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const showArchived = searchParams.showArchived === 'true';

  const supabase = await createClient();

  const { data: radar, error: radarError } = await supabase
    .from('radars')
    .select('*')
    .eq('id', params.id)
    .single();

  if (radarError || !radar) {
    notFound();
  }

  let itemsQuery = supabase
    .from('radar_items')
    .select('*')
    .eq('radar_id', params.id)
    .order('priority', { ascending: false, nullsFirst: false });

  if (!showArchived) {
    itemsQuery = itemsQuery.neq('status', 'arquivado');
  }

  const { data: items, error: itemsError } = await itemsQuery;
  const radarItems = (items as RadarItem[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/radares" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{radar.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              radar.status === 'ATIVO' ? 'bg-blue-100 text-blue-700' : 
              radar.status === 'PAUSADO' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-500'
            }`}>
              {radar.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <EditRadarModal radar={radar as Radar} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-x-8 gap-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Score mínimo</p>
          <p className="text-lg font-bold text-slate-800">{radar.min_score || 'Nenhum'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Lucro mínimo</p>
          <p className="text-lg font-bold text-slate-800">{radar.min_profit ? `R$ ${radar.min_profit}` : 'Nenhum'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Margem mínima</p>
          <p className="text-lg font-bold text-slate-800">{radar.min_margin_pct ? `${radar.min_margin_pct}%` : 'Nenhum'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Localização</p>
          <p className="text-lg font-bold text-slate-800">
            {[radar.city, radar.region].filter(Boolean).join(' - ') || 'Todas'}
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">ITENS MONITORADOS</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <Link href={showArchived ? `/radares/${radar.id}` : `/radares/${radar.id}?showArchived=true`}>
                <input type="checkbox" checked={showArchived} readOnly className="rounded text-blue-600 focus:ring-blue-500" />
              </Link>
              Mostrar arquivados
            </label>
            <ItemModal radarId={radar.id} />
          </div>
        </div>

        {itemsError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            Erro ao carregar itens do radar.
          </div>
        )}

        {!itemsError && radarItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
            <p>Nenhum item monitorado neste radar.</p>
            <p className="text-sm mt-2">Clique em Adicionar Item para começar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Produto</th>
                    <th className="px-6 py-4 font-medium">Consulta</th>
                    <th className="px-6 py-4 font-medium text-center">Prioridade</th>
                    <th className="px-6 py-4 font-medium">Min. Lucro/Margem</th>
                    <th className="px-6 py-4 font-medium">Preço Máximo</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {radarItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-slate-50 ${item.status === 'arquivado' ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <code>{item.search_query}</code>
                        {item.excluded_keywords && item.excluded_keywords.length > 0 && (
                          <div className="text-xs text-red-500 mt-1">Excluir: {item.excluded_keywords.join(', ')}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{item.priority || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.min_profit ? `R$ ${item.min_profit}` : 'Herda'} / {item.min_margin_pct ? `${item.min_margin_pct}%` : 'Herda'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {item.max_asking_price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.max_asking_price) : 'Sem limite'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                          item.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ItemActions item={item} radarId={radar.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
