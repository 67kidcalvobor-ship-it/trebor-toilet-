import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Medal, RotateCcw } from 'lucide-react'
import { getTopScores, saveScore, type Score } from '../lib/supabase'
import Navbar from '../components/Navbar'

const GROUND_Y = 75
const JUMP_DURATION = 560
const JUMP_HEIGHT = 170
const TOMATO_X = 50
const TOMATO_W = 40
const TOMATO_H = 40
const OBSTACLE_W = 30
const OBSTACLE_H = 50
const GAME_W = 600
const GAME_H = 250
const BLENDER_GAP = 150
const MAX_BLENDERS = 3

type ObstacleSlot = { x: number; active: boolean }

function computeJumpBottom(elapsed: number): number {
  const t = elapsed / JUMP_DURATION
  if (t >= 1) return GROUND_Y
  return GROUND_Y + Math.sin(Math.PI * t) * JUMP_HEIGHT
}

function computeJumpRotation(elapsed: number): number {
  const t = elapsed / JUMP_DURATION
  if (t >= 1) return 0
  return 360 * t
}

function makeInitialSlots(): ObstacleSlot[] {
  return [
    { x: GAME_W + 40, active: true },
    { x: GAME_W + 500, active: false },
    { x: GAME_W + 500, active: false },
  ]
}

function spawnWave(gs: { obstacles: ObstacleSlot[] }, count: number): void {
  for (let i = 0; i < MAX_BLENDERS; i++) {
    const slot = gs.obstacles[i]
    if (!slot) continue
    if (i < count) {
      slot.x = GAME_W + 40 + i * (OBSTACLE_W + BLENDER_GAP)
      slot.active = true
    } else {
      slot.active = false
      slot.x = GAME_W + 500
    }
  }
}

type Screen = 'name' | 'playing' | 'gameover'

export default function Game() {
  const navigate = useNavigate()
  const animRef = useRef<number | null>(null)

  const gameStateRef = useRef({
    score: 0,
    isJumping: false,
    isGameOver: false,
    obstacleSpeed: 2.5,
    jumpStartTime: 0,
    tomatoBottom: GROUND_Y,
    tomatoX: TOMATO_X,
    tomatoRotation: 0,
    obstacles: makeInitialSlots(),
  })

  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [screen, setScreen] = useState<Screen>('name')
  const [playerName, setPlayerName] = useState('')
  const [finalScore, setFinalScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Score[]>([])

  const highScoreRef = useRef(0)
  const playerNameRef = useRef('')

  const tomatoRef = useRef<HTMLDivElement>(null)
  const obstacleRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const lastTimeRef = useRef<number | null>(null)

  const fetchLeaderboard = useCallback(() => {
    getTopScores().then(setLeaderboard).catch(console.error)
  }, [])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  const jump = useCallback(() => {
    const gs = gameStateRef.current
    if (gs.isJumping || gs.isGameOver) return
    gs.isJumping = true
    gs.jumpStartTime = performance.now()
  }, [])

  const handleGameOver = useCallback(async (score: number) => {
    setFinalScore(score)
    setScreen('gameover')
    setSaving(true)
    try {
      await saveScore(playerNameRef.current, score)
      fetchLeaderboard()
    } finally {
      setSaving(false)
    }
  }, [fetchLeaderboard])

  const handleGameOverRef = useRef(handleGameOver)
  useEffect(() => { handleGameOverRef.current = handleGameOver }, [handleGameOver])

  const resetGame = useCallback(() => {
    const gs = gameStateRef.current
    gs.score = 0
    gs.isJumping = false
    gs.isGameOver = false
    gs.obstacleSpeed = 2.5
    gs.obstacles = makeInitialSlots()
    gs.jumpStartTime = 0
    gs.tomatoBottom = GROUND_Y
    gs.tomatoX = TOMATO_X
    gs.tomatoRotation = 0
    lastTimeRef.current = null
    setDisplayScore(0)
  }, [])

  useEffect(() => {
    if (screen !== 'playing') return
    resetGame()
    const gs = gameStateRef.current
    gs.isGameOver = false

    const loop = (now: number) => {
      if (gs.isGameOver) return
      const delta = lastTimeRef.current === null ? 16 : now - lastTimeRef.current
      lastTimeRef.current = now

      if (gs.isJumping) {
        const elapsed = now - gs.jumpStartTime
        gs.tomatoBottom = computeJumpBottom(elapsed)
        gs.tomatoRotation = computeJumpRotation(elapsed)
        if (elapsed >= JUMP_DURATION) {
          gs.tomatoBottom = GROUND_Y
          gs.tomatoRotation = 0
          gs.isJumping = false
        }
      }

      const speed = (gs.obstacleSpeed / 16) * delta
      let exitCount = 0

      for (const obs of gs.obstacles) {
        if (!obs.active) continue
        obs.x -= speed
        if (obs.x + OBSTACLE_W < 0) { obs.active = false; exitCount++ }
      }

      if (exitCount > 0) {
        gs.score += exitCount
        setDisplayScore(gs.score)
        if (gs.score > highScoreRef.current) {
          highScoreRef.current = gs.score
          setHighScore(gs.score)
        }
        gs.obstacleSpeed = Math.min(6, gs.obstacleSpeed + 0.12 * exitCount)
        if (gs.obstacles.filter(o => o.active).length === 0) {
          spawnWave(gs, gs.score < 5 ? 2 : 3)
        }
      }

      const tL = gs.tomatoX, tR = gs.tomatoX + TOMATO_W
      const tT = gs.tomatoBottom + TOMATO_H, tB = gs.tomatoBottom

      for (const obs of gs.obstacles) {
        if (!obs.active) continue
        if (tR - 4 > obs.x && tL + 4 < obs.x + OBSTACLE_W && tT - 4 > GROUND_Y && tB + 4 < GROUND_Y + OBSTACLE_H) {
          gs.isGameOver = true
          void handleGameOverRef.current(gs.score)
          return
        }
      }

      if (tomatoRef.current) {
        tomatoRef.current.style.bottom = `${gs.tomatoBottom}px`
        tomatoRef.current.style.transform = `rotate(${gs.tomatoRotation}deg)`
      }
      gs.obstacles.forEach((obs, i) => {
        const ref = obstacleRefs.current[i]
        if (!ref) return
        ref.style.left = `${obs.x}px`
        ref.style.display = obs.active ? 'flex' : 'none'
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current) }
  }, [screen, resetGame])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); if (screen === 'playing') jump() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump, screen])

  const handleStartWithName = () => {
    playerNameRef.current = playerName.trim() || 'Anónimo'
    setScreen('playing')
  }

  if (screen === 'name') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050714] via-[#0d0b2e] to-[#130a2e] flex flex-col items-center justify-center gap-6 p-4">
        <Navbar />
        <h1 className="text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">🚽 Trebor Toilet</h1>
        <p className="text-purple-300 text-lg">¡Esquiva los obstáculos y llega lo más lejos posible!</p>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 flex flex-col gap-4 w-full max-w-sm shadow-2xl">
          <label className="text-white font-semibold text-lg text-center">¿Cuál es tu nombre?</label>
          <input
            className="bg-white/20 border border-white/30 text-white placeholder-white/50 text-center text-lg h-12 rounded-xl px-4 outline-none focus:border-purple-400 transition-colors"
            placeholder="Tu nombre..."
            maxLength={20}
            value={playerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleStartWithName() }}
            autoFocus
          />
          <button className="h-12 text-lg font-bold bg-green-500 hover:bg-green-400 text-white rounded-xl transition-all active:scale-95" onClick={handleStartWithName}>
            ¡Jugar!
          </button>
        </div>
        <button className="text-purple-300 hover:text-white underline text-sm transition-colors" onClick={() => navigate('/leaderboard')}>
          Ver ranking 🏆
        </button>
      </div>
    )
  }

  if (screen === 'gameover') {
    const rank = leaderboard.findIndex(e => e.player_name === playerNameRef.current && e.score === finalScore) + 1
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050714] via-[#0d0b2e] to-[#130a2e] flex flex-col items-center justify-center gap-6 p-4">
        <Navbar />
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">💥 Game Over</h1>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-4 w-full max-w-sm shadow-2xl">
          <p className="text-purple-200 text-lg">Buen intento, <span className="text-white font-bold">{playerNameRef.current}</span>!</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-purple-300 text-sm">Tu puntuación</span>
            <span className="text-6xl font-extrabold text-yellow-400">{finalScore}</span>
            <span className="text-purple-300 text-sm flex items-center gap-1"><Trophy className="w-4 h-4" /> Récord personal: {highScore}</span>
          </div>
          {rank > 0 && rank <= 10 && (
            <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-2 text-yellow-300 font-semibold flex items-center gap-2">
              <Medal className="w-5 h-5" />
              ¡Posición #{rank} en el ranking!
            </div>
          )}
          {saving && <p className="text-purple-300 text-sm animate-pulse">Guardando puntuación...</p>}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl text-lg transition-all active:scale-95" onClick={() => setScreen('playing')}>
            <RotateCcw className="w-5 h-5" /> Reintentar
          </button>
          <button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-xl text-lg transition-all active:scale-95" onClick={() => navigate('/leaderboard')}>
            <Trophy className="w-5 h-5" /> Ranking
          </button>
        </div>
        <button className="text-purple-300 hover:text-white underline text-sm" onClick={() => setScreen('name')}>
          Cambiar nombre
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050714] via-[#0d0b2e] to-[#130a2e] flex flex-col items-center justify-center select-none gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-extrabold text-white drop-shadow">🚽 Trebor Toilet</h1>
        <span className="text-purple-300 text-sm">Jugando como <span className="text-white font-semibold">{playerNameRef.current}</span></span>
      </div>
      <p className="text-purple-300 text-sm">
        Presiona <kbd className="bg-white/20 text-white px-2 py-0.5 rounded font-mono text-xs">Espacio</kbd>{' '}
        o <strong className="text-white">haz clic</strong> para saltar
      </p>
      <div
        className="relative overflow-hidden rounded-xl border-4 border-purple-400/50 shadow-2xl cursor-pointer"
        style={{ width: GAME_W, height: GAME_H, background: 'linear-gradient(to bottom, #0f172a 60%, #1e3a5f 60%)' }}
        onClick={jump}
      >
        <div className="absolute top-2 left-16 text-2xl opacity-60 pointer-events-none">⭐</div>
        <div className="absolute top-6 left-72 text-xl opacity-40 pointer-events-none">✨</div>
        <div className="absolute top-3 right-24 text-2xl opacity-60 pointer-events-none">✨</div>
        <div className="absolute top-3 left-4 text-purple-300 font-bold text-sm pointer-events-none flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {highScore}
        </div>
        <div className="absolute top-3 right-4 text-yellow-300 font-bold text-lg pointer-events-none">🚽 {displayScore}</div>
        <div className="absolute w-full pointer-events-none" style={{ bottom: GROUND_Y - 2, height: 3, background: 'rgba(139,92,246,0.4)' }} />
        <div ref={tomatoRef} className="absolute" style={{ width: TOMATO_W, height: TOMATO_H, left: TOMATO_X, bottom: GROUND_Y }}>
          <img
            src="https://cdn.phototourl.com/free/2026-06-03-ec5e44a4-4cde-4f83-9ed0-13b77f2fb4d9.jpg"
            alt="Trebor"
            style={{ width: TOMATO_W, height: TOMATO_H, objectFit: 'cover', borderRadius: '50%', display: 'block' }}
            draggable={false}
          />
        </div>
        {Array.from({ length: MAX_BLENDERS }).map((_unused, i) => (
          <div
            key={i}
            ref={el => { obstacleRefs.current[i] = el }}
            className="absolute flex-col items-center"
            style={{ display: i === 0 ? 'flex' : 'none', width: OBSTACLE_W, height: OBSTACLE_H, bottom: GROUND_Y, left: GAME_W + 40 }}
          >
            <img
              src={i % 2 === 0
                ? 'https://cdn.phototourl.com/free/2026-06-03-5dc04a6c-b658-412c-ba36-0e0c7d708e0a.jpg'
                : 'https://cdn.phototourl.com/free/2026-06-03-ac425fee-fcbb-4666-bc49-eb76bb85e3e0.jpg'}
              alt="obstacle"
              style={{ width: OBSTACLE_W, height: OBSTACLE_H, objectFit: 'cover', borderRadius: 6, display: 'block' }}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-3 shadow">
        <span className="text-2xl">🚽</span>
        <span className="text-purple-300 font-medium">Puntos:</span>
        <span className="text-3xl font-extrabold text-yellow-400">{displayScore}</span>
      </div>
      <button
        className="text-purple-400 hover:text-white underline text-xs transition-colors"
        onClick={() => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); navigate('/leaderboard') }}
      >
        Ver ranking 🏆
      </button>
    </div>
  )
}
