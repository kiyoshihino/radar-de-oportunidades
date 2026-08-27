import Link from 'next/link';
import { LayoutDashboard, Search, List, History, Radar, Settings } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Radar de <span className="text-blue-500">Oportunidades</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/analisar" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Search size={20} /> Analisar
        </Link>
        <Link href="/oportunidades" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <List size={20} /> Oportunidades
        </Link>
        <Link href="/historico" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <History size={20} /> Histórico
        </Link>
        <Link href="/radares" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Radar size={20} /> Radares
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Settings size={20} /> Configurações
        </Link>
        <LogoutButton />
      </div>
    </div>
  )
}
