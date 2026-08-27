import { Filter, Search } from "lucide-react";

export default function HistoricoPage() {
  const historico = [
    {
      id: 1,
      date: "24/10/2023",
      product: "iPhone 15 128GB",
      source: "Facebook Marketplace",
      price: 2700,
      marketPrice: 3800,
      profit: 720, // 3800 * 0.9 - 2700 = 3420 - 2700 = 720
      score: 92,
      decision: "Comprar",
    },
    {
      id: 2,
      date: "24/10/2023",
      product: "MacBook Air M1",
      source: "OLX",
      price: 3500,
      marketPrice: 4700,
      profit: 730,
      score: 85,
      decision: "Investigar",
    },
    {
      id: 3,
      date: "23/10/2023",
      product: "iPhone 13 128GB",
      source: "Facebook Marketplace",
      price: 1800,
      marketPrice: 2400,
      profit: 360,
      score: 75,
      decision: "Negociar",
    },
    {
      id: 4,
      date: "23/10/2023",
      product: "iPhone 11 64GB",
      source: "WhatsApp",
      price: 1500,
      marketPrice: 1600,
      profit: -60,
      score: 30,
      decision: "Ignorar",
    },
    {
      id: 5,
      date: "22/10/2023",
      product: "iPad Air 5",
      source: "Facebook Marketplace",
      price: 3000,
      marketPrice: 3800,
      profit: 420,
      score: 65,
      decision: "Investigar",
    }
  ];

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
                  <td className="px-6 py-4 text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{item.product}</td>
                  <td className="px-6 py-4 text-slate-500">{item.source}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-medium">R$ {item.price.toLocaleString('pt-BR')}</div>
                    <div className="text-slate-400 text-xs line-through">R$ {item.marketPrice.toLocaleString('pt-BR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${item.profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.profit > 0 ? '+' : ''}R$ {item.profit.toLocaleString('pt-BR')}
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
                      item.decision === 'Comprar' ? 'bg-emerald-100 text-emerald-700' : 
                      item.decision === 'Investigar' ? 'bg-blue-100 text-blue-700' : 
                      item.decision === 'Negociar' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
