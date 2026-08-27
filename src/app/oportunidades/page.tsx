import { Star, ShieldAlert, CheckCircle } from "lucide-react";

export default function OportunidadesPage() {
  const oportunidades = [
    {
      id: 1,
      product: "iPhone 15 128GB - Lacrado",
      source: "Facebook Marketplace",
      price: 2700,
      fastSale: 3300,
      profit: 600,
      score: 96,
      classification: "excepcional",
      time: "Há 10 min",
    },
    {
      id: 2,
      product: "MacBook Air M1 8GB 256GB",
      source: "OLX",
      price: 3500,
      fastSale: 4200,
      profit: 700,
      score: 88,
      classification: "grande",
      time: "Há 45 min",
    },
    {
      id: 3,
      product: "iPhone 13 128GB Bateria 95%",
      source: "Facebook Marketplace",
      price: 1800,
      fastSale: 2100,
      profit: 300,
      score: 75,
      classification: "boa",
      time: "Há 2 horas",
    },
    {
      id: 4,
      product: "iPad Pro 11 M1",
      source: "WhatsApp Group",
      price: 4000,
      fastSale: 4800,
      profit: 800,
      score: 72,
      classification: "boa",
      time: "Hoje, 09:00",
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quadro de Oportunidades</h1>
        <div className="text-sm text-slate-500 font-medium">
          Apenas anúncios com score &ge; 70
        </div>
      </div>

      {/* EXCEPCIONAL */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Star className="text-yellow-500" fill="currentColor" />
          Excepcionais (Score 95+)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oportunidades.filter(o => o.classification === 'excepcional').map(op => (
            <div key={op.id} className="bg-white rounded-xl border-2 border-yellow-400 shadow-md p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Score {op.score}
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.product}</h3>
              <p className="text-sm text-slate-500 mb-4">{op.source} &bull; {op.time}</p>
              
              <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Preço Pedido</span>
                  <span className="font-bold text-slate-800">R$ {op.price.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-sm font-medium">Lucro Estimado</span>
                  <span className="font-black">+ R$ {op.profit.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              
              <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                Analisar Ficha
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* GRANDE OPORTUNIDADE */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-purple-500" />
          Grandes Oportunidades (Score 85-94)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oportunidades.filter(o => o.classification === 'grande').map(op => (
            <div key={op.id} className="bg-white rounded-xl border border-purple-200 shadow-sm p-6 relative">
              <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Score {op.score}
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.product}</h3>
              <p className="text-sm text-slate-500 mb-4">{op.source} &bull; {op.time}</p>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Preço Pedido</span>
                  <span className="font-bold text-slate-800">R$ {op.price.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-sm font-medium">Lucro Estimado</span>
                  <span className="font-black">+ R$ {op.profit.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              
              <button className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors">
                Analisar Ficha
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BOA OPORTUNIDADE */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle className="text-blue-500" />
          Boas Oportunidades (Score 70-84)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oportunidades.filter(o => o.classification === 'boa').map(op => (
            <div key={op.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
              <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Score {op.score}
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16">{op.product}</h3>
              <p className="text-sm text-slate-500 mb-4">{op.source} &bull; {op.time}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-slate-500">Pedido</p>
                  <p className="font-bold text-slate-800">R$ {op.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Lucro Est.</p>
                  <p className="font-bold text-emerald-600">R$ {op.profit.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                Analisar Ficha
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
