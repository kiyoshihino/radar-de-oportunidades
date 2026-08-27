import { Smartphone, Laptop, Wrench, ThermometerSnowflake, MonitorPlay, Timer, Briefcase } from "lucide-react";

export default function RadaresPage() {
  const radares = [
    {
      id: "iphone",
      name: "iPhone",
      icon: <Smartphone className="text-white" size={24} />,
      status: "ATIVO",
      bgColor: "bg-blue-600",
      description: "Análise avançada para iPhones com verificação de procedência e liquidez."
    },
    {
      id: "macbook",
      name: "Notebook / MacBook",
      icon: <Laptop className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Modelos para desenvolvedores, designers e uso geral."
    },
    {
      id: "equipamentos",
      name: "Equipamentos Comerciais",
      icon: <Briefcase className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Fatiadores, balanças, freezers e itens para comércio."
    },
    {
      id: "ar-condicionado",
      name: "Ar-condicionado",
      icon: <ThermometerSnowflake className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Equipamentos de climatização com alta demanda no verão."
    },
    {
      id: "ferramentas",
      name: "Ferramentas Profissionais",
      icon: <Wrench className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Furadeiras, serras, betoneiras e ferramentas caras."
    },
    {
      id: "games",
      name: "Games (PS5, Xbox)",
      icon: <MonitorPlay className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Consoles e jogos com boa margem de revenda."
    },
    {
      id: "urgencia",
      name: "Liquidação / Urgência",
      icon: <Timer className="text-white" size={24} />,
      status: "EM BREVE",
      bgColor: "bg-slate-400",
      description: "Qualquer produto sendo vendido por necessidade urgente."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Radares Configurados</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {radares.map((radar) => (
          <div key={radar.id} className={`bg-white p-6 rounded-xl border ${radar.status === 'ATIVO' ? 'border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'border-slate-200 shadow-sm'} flex flex-col h-full`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${radar.bgColor}`}>
                {radar.icon}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                radar.status === 'ATIVO' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {radar.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">{radar.name}</h3>
            <p className="text-sm text-slate-500 flex-1">{radar.description}</p>
            
            {radar.status === 'ATIVO' ? (
              <button className="mt-6 w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                Configurar Radar
              </button>
            ) : (
              <button disabled className="mt-6 w-full py-2 bg-slate-50 text-slate-400 font-medium rounded-lg cursor-not-allowed">
                Indisponível na V1
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
