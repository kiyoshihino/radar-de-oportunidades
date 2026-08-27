import { Save, Bell, User, Database, Link as LinkIcon, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Save size={18} />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-semibold flex items-center gap-3">
            <User size={18} /> Perfil
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-3">
            <Bell size={18} /> Notificações
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-3">
            <LinkIcon size={18} /> Integrações
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-3">
            <Database size={18} /> Banco de Dados
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-3">
            <Shield size={18} /> Segurança
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Informações Pessoais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <input 
                  type="text" 
                  defaultValue="Kiyoshi Hino"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || "admin@radardeoportunidades.com"}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Região de Atuação Primária</label>
              <input 
                type="text" 
                defaultValue="Londrina e Região"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Arquitetura Futura (V2)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h3 className="font-semibold text-slate-800">Supabase (PostgreSQL)</h3>
                  <p className="text-sm text-slate-500">Banco de dados e autenticação</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-200 rounded-lg cursor-not-allowed">Não Conectado</button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h3 className="font-semibold text-slate-800">OpenAI API</h3>
                  <p className="text-sm text-slate-500">Análise de descrição e visão computacional</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-200 rounded-lg cursor-not-allowed">Não Conectado</button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h3 className="font-semibold text-slate-800">Alertas WhatsApp/Telegram</h3>
                  <p className="text-sm text-slate-500">Receba notificações de oportunidades Score 85+</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-200 rounded-lg cursor-not-allowed">Não Conectado</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
