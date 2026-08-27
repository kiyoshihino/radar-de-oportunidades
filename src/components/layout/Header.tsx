export function Header({ userEmail }: { userEmail?: string }) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Radar de Oportunidades</h2>
        <p className="text-xs text-slate-500">Londrina e Região</p>
      </div>
      <div className="flex items-center gap-4">
        {userEmail && <span className="text-sm font-medium text-slate-600">{userEmail}</span>}
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'RO'}
        </div>
      </div>
    </header>
  )
}
