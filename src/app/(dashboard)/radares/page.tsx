import { Smartphone, Laptop, Wrench, ThermometerSnowflake, MonitorPlay, Timer, Briefcase, Radar as RadarIcon, AlertCircle, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Radar } from "@/types/database";
import { NewRadarModal } from "@/components/radares/NewRadarModal";
import Link from "next/link";

// Map category to icon
const iconMap: Record<string, React.ReactNode> = {
  'iPhone': <Smartphone className="text-white" size={24} />,
  'Notebook / MacBook': <Laptop className="text-white" size={24} />,
  'Equipamentos Comerciais': <Briefcase className="text-white" size={24} />,
  'Ar-condicionado': <ThermometerSnowflake className="text-white" size={24} />,
  'Ferramentas Profissionais': <Wrench className="text-white" size={24} />,
  'Games': <MonitorPlay className="text-white" size={24} />,
  'Liquidação / Urgência': <Timer className="text-white" size={24} />,
};

export default async function RadaresPage() {
  const supabase = await createClient();

  const { data: radars, error } = await supabase
    .from('radars')
    .select('*')
    .order('name');

  const radarList = (radars as Radar[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Radares Configurados</h1>
        <NewRadarModal />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          Erro ao carregar radares.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {radarList.map((radar) => (
          <Link href={`/radares/${radar.id}`} key={radar.id} className={`bg-white p-6 rounded-xl border ${radar.status === 'ATIVO' ? 'border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'border-slate-200 shadow-sm'} flex flex-col h-full hover:shadow-lg transition-shadow group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${radar.status === 'ATIVO' ? 'bg-blue-600' : radar.status === 'PAUSADO' ? 'bg-yellow-500' : 'bg-slate-400'}`}>
                {iconMap[radar.name] || <RadarIcon className="text-white" size={24} />}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                radar.status === 'ATIVO' ? 'bg-blue-100 text-blue-700' : 
                radar.status === 'PAUSADO' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {radar.status.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              {radar.name}
              <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
            </h3>
            
            <div className="text-sm text-slate-500 flex-1 space-y-1 mt-2">
              <p>Score mínimo: <span className="font-semibold text-slate-700">{radar.min_score || 'Padrão'}</span></p>
              <p>Lucro mínimo: <span className="font-semibold text-slate-700">{radar.min_profit ? `R$ ${radar.min_profit}` : 'Padrão'}</span></p>
              <p>Margem mínima: <span className="font-semibold text-slate-700">{radar.min_margin_pct ? `${radar.min_margin_pct}%` : 'Padrão'}</span></p>
              {radar.region && <p>Região: <span className="font-semibold text-slate-700">{radar.region}</span></p>}
            </div>
          </Link>
        ))}

        {!error && radarList.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Nenhum radar configurado no banco de dados.
          </div>
        )}
      </div>
    </div>
  );
}
