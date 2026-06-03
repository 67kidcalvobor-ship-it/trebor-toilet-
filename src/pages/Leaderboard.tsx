import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Gamepad2 } from 'lucide-react'
import { getTopScores, type Score } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScores = async () => {
    setLoading(true)
    try {
      const data = await getTopScores()
      setLeaderboard(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchScores() }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050714] via-[#0d0b2e] to-[#130a2e] text-white">
      <Navbar />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-5xl font-black mb-3">
            Ranking{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Global</span>
          </h1>
          <p className="text-white/40 text-lg">Los mejores jugadores de Trebor Toilet</p>
        </div>

        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-3xl">🥈</span>
              <div className="w-full bg-gradient-to-b from-gray-500/30 to-gray-700/10 border border-gray-400/30 rounded-t-2xl py-6 flex flex-col items-center gap-1" style={{ minHeight: 100 }}>
                <span className="font-bold text-white truncate px-2 text-center w-full text-sm">{leaderboard[1]?.player_name}</span>
                <span className="text-xl font-black text-gray-300">{leaderboard[1]?.score}</span>
                <span className="text-white/30 text-xs">pts</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-4xl animate-bounce" style={{ animationDuration: '1.5s' }}>🥇</span>
              <div className="w-full bg-gradient-to-b from-yellow-500/30 to-yellow-700/10 border border-yellow-400/40 rounded-t-2xl py-8 flex flex-col items-center gap-1 shadow-lg shadow-yellow-900/30" style={{ minHeight: 130 }}>
                <span className="font-bold text-white truncate px-2 text-center w-full">{leaderboard[0]?.player_name}</span>
                <span className="text-2xl font-black text-yellow-400">{leaderboard[0]?.score}</span>
                <span className="text-white/30 text-xs">pts</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-3xl">🥉</span>
              <div className="w-full bg-gradient-to-b from-orange-700/30 to-orange-900/10 border border-orange-500/30 rounded-t-2xl py-5 flex flex-col items-center gap-1" style={{ minHeight: 85 }}>
                <span className="font-bold text-white truncate px-2 text-center w-full text-sm">{leaderboard[2]?.player_name}</span>
                <span className="text-lg font-black text-orange-300">{leaderboard[2]?.score}</span>
                <span className="text-white/30 text-xs">pts</span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-white/5 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-widest">
            <span className="col-span-1">#</span>
            <span className="col-span-7">Jugador</span>
            <span className="col-span-4 text-right">Puntos</span>
          </div>

          {loading && (
            <div className="py-16 flex flex-col items-center gap-3 text-white/30">
              <RotateCcw className="w-6 h-6 animate-spin" />
              <span>Cargando ranking...</span>
            </div>
          )}

          {!loading && leaderboard.length === 0 && (
            <div className="py-16 text-center text-white/30">
              <p className="text-5xl mb-4">🚽</p>
              <p className="text-lg font-semibold">Aún no hay puntuaciones</p>
              <p className="text-sm mt-1">¡Sé el primero en aparecer aquí!</p>
            </div>
          )}

          {!loading && leaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`grid grid-cols-12 gap-2 items-center px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                i === 0 ? 'bg-yellow-500/10' : i === 1 ? 'bg-gray-500/5' : i === 2 ? 'bg-orange-700/10' : ''
              }`}
            >
              <span className="col-span-1 text-xl text-center">
                {i < 3 ? medals[i] : <span className="text-white/30 font-bold text-sm">{i + 1}</span>}
              </span>
              <span className={`col-span-7 font-bold truncate ${i === 0 ? 'text-yellow-300' : 'text-white'}`}>
                {entry.player_name}
              </span>
              <div className="col-span-4 flex items-center justify-end gap-1">
                <span className={`font-black text-lg ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/80'}`}>
                  {entry.score}
                </span>
                <span className="text-white/30 text-sm">pts</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button onClick={fetchScores} className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors">
            <RotateCcw className="w-3 h-3" />
            Actualizar ranking
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40 mb-5">¿Puedes llegar al top?</p>
          <button
            onClick={() => navigate('/play')}
            className="flex items-center gap-3 mx-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-purple-900/60 transition-all active:scale-95 hover:scale-105"
          >
            <Gamepad2 className="w-6 h-6" />
            ¡Jugar ahora!
          </button>
        </div>
      </div>
    </div>
  )
}
