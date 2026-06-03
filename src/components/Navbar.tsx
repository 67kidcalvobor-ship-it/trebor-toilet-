import { Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, Trophy } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { to: '/play', label: 'Jugar', icon: <Gamepad2 className="w-4 h-4" /> },
    { to: '/leaderboard', label: 'Ranking', icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-md border-b border-white/10">
      <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight hover:text-purple-300 transition-colors">
        <span className="text-2xl">🚽</span>
        <span>Trebor Toilet</span>
      </Link>
      <div className="flex items-center gap-1">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              pathname === to
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
