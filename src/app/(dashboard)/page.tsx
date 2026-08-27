import { ArrowUpRight, DollarSign, Target, Activity } from "lucide-react";

const recentOpportunities = [
  {
    id: 1,
    product: "iPhone 15 128GB",
    price: 2700,
    fastSale: 3300,
    profit: 600,
    score: 92,
    status: "Grande oportunidade",
    date: "Hoje, 10:30",
  },
  {
    id: 2,
    product: "MacBook Air M1",
    price: 3500,
    fastSale: 4200,
    profit: 700,
    score: 85,
    status: "Grande oportunidade",
    date: "Hoje, 09:15",
  },
  {
    id: 3,
    product: "iPhone 13 128GB",
    price: 1800,
    fastSale: 2100,
    profit: 300,
    score: 75,
    status: "Boa oportunidade",
    date: "Ontem",
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Anúncios analisados</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">142</h3>
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
              <h3 className="text-3xl font-bold text-slate-800 mt-2">24</h3>
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
              <h3 className="text-3xl font-bold text-slate-800 mt-2">5</h3>
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
              <h3 className="text-3xl font-bold text-slate-800 mt-2">R$ 4.250</h3>
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
                  <td className="px-6 py-4 font-medium text-slate-800">{op.product}</td>
                  <td className="px-6 py-4 text-slate-600">R$ {op.price.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-slate-600">R$ {op.fastSale.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">R$ {op.profit.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs">
                      {op.score}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      op.status.includes('Grande') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{op.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
