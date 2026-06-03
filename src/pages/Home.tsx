import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, Shield, Star } from 'lucide-react'
import { getTopScores, type Score } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState<Score[]>([])

  useEffect(() => {
    getTopScores().then(setLeaderboard).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050714] via-[#0d0b2e] to-[#130a2e] text-white overflow-x-hidden">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-3xl pointer-events-none" />
        <div className="text-[120px] animate-bounce mb-4 select-none" style={{ animationDuration: '2s' }}>🚽</div>
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">TREBOR</span>
          <br />
          <span className="text-white">TOILET</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/60 max-w-xl mb-10 leading-relaxed">
          Esquiva los obstáculos, supera tu récord y llega a lo alto del ranking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => navigate('/play')}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-purple-900/60 transition-all active:scale-95 hover:scale-105"
          >
            ¡JUGAR AHORA!
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 px-8 py-5 border border-white/20 hover:border-purple-400/60 text-white/70 hover:text-white font-bold text-lg rounded-2xl transition-all hover:bg-white/5"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            Ver Ranking
          </button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-4">
            ¿Cómo se{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">juega?</span>
          </h2>
          <p className="text-center text-white/40 mb-14 text-lg">Es simple. Es adictivo. Es Trebor Toilet.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '⌨️', title: 'Pulsa Espacio o clic', desc: 'Usa la barra espaciadora o haz clic en la pantalla para hacer saltar a Trebor.', color: 'from-purple-600/30 to-purple-800/10', border: 'border-purple-500/30' },
              { emoji: '🚧', title: 'Esquiva obstáculos', desc: 'Los obstáculos vienen cada vez más rápido y en mayor cantidad. ¡No te choquen!', color: 'from-pink-600/30 to-pink-800/10', border: 'border-pink-500/30' },
              { emoji: '🏆', title: 'Supera el ranking', desc: 'Cada obstáculo esquivado suma puntos. ¡Pon tu nombre en el top 10!', color: 'from-blue-600/30 to-blue-800/10', border: 'border-blue-500/30' },
            ].map(({ emoji, title, desc, color, border }) => (
              <div key={title} className={`rounded-2xl bg-gradient-to-b ${color} border ${border} p-8 flex flex-col items-center text-center gap-4 hover:scale-105 transition-transform`}>
                <span className="text-6xl">{emoji}</span>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Zap className="w-6 h-6 text-yellow-400" />, label: 'Velocidad creciente' },
            { icon: <Shield className="w-6 h-6 text-blue-400" />, label: 'Oleadas de obstáculos' },
            { icon: <Trophy className="w-6 h-6 text-yellow-400" />, label: 'Ranking global' },
            { icon: <Star className="w-6 h-6 text-pink-400" />, label: 'Récord personal' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10">
              {icon}
              <span className="text-white/70 font-semibold text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-black text-center mb-4">
            Top{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Jugadores</span>
          </h2>
          <p className="text-center text-white/40 mb-10">¿Tienes lo que hace falta para entrar aquí?</p>
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-white">Ranking Global</span>
            </div>
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-white/30">
                <p className="text-4xl mb-3">🚽</p>
                <p>Nadie ha jugado aún. ¡Sé el primero!</p>
              </div>
            ) : (
              <div>
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 ${i === 0 ? 'bg-yellow-500/10' : ''}`}>
                    <span className="text-xl w-8 text-center shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <span className="flex-1 font-semibold text-white truncate">{entry.player_name}</span>
                    <span className="font-black text-yellow-400 text-lg">{entry.score}</span>
                    <span className="text-white/30 text-sm">pts</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/leaderboard')} className="w-full py-4 text-purple-400 hover:text-white text-sm font-semibold transition-colors hover:bg-white/5">
              Ver ranking completo →
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-purple-700/20 blur-3xl pointer-events-none" />
        <h2 className="text-5xl font-black mb-6 relative">
          ¿Listo para el{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">desafío</span>?
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">Un solo clic te separa de la gloria. O del inodoro.</p>
        <button
          onClick={() => navigate('/play')}
          className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-purple-900/60 transition-all active:scale-95 hover:scale-105 relative"
        >
          ¡JUGAR AHORA! 🚽
        </button>
      </section>

      <footer className="py-8 px-4 border-t border-white/5 text-center text-white/20 text-sm">
        🚽 Trebor Toilet — El juego más épico del inodoro
      </footer>
    </div>
  )
}
