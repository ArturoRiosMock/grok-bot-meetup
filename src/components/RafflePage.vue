<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BloubBot from '@/components/BloubBot.vue'
import type { StateId } from '@/bot/states'
import { langue } from '@/i18n'

type Candidate = { name: string; avatar: string | null }
type RaffleResponse = {
  candidates: Candidate[]
  event: { id: string; name: string } | null
  isDemo: boolean
  total: number
}

const candidates = ref<Candidate[]>([])
const eventName = ref<string | null>(null)
const isDemo = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)

const winners = ref<Candidate[]>([])
const excluded = ref<Set<string>>(new Set())
const winnerCount = ref(4)
const animating = ref(false)
const animationPhase = ref<'idle' | 'shuffle' | 'reveal'>('idle')
const revealIndex = ref(-1)
const shuffleNames = ref<string[]>([])

const state = ref<StateId>('idle')
const block = ref(0)
const playing = ref(true)

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let confettiParticles: Array<{
  x: number; y: number; vx: number; vy: number
  color: string; size: number; rotation: number; rotationSpeed: number
}> = []
let confettiAnimationId = 0

const pool = computed(() =>
  candidates.value.filter((c) => !excluded.value.has(c.name))
)

function secureRandom(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0]! % max
}

function pickWinners(count: number): Candidate[] {
  const available = pool.value.slice()
  const picked: Candidate[] = []
  const n = Math.min(count, available.length)
  for (let i = 0; i < n; i++) {
    const idx = secureRandom(available.length)
    picked.push(available[idx]!)
    available.splice(idx, 1)
  }
  return picked
}

async function fetchCandidates() {
  loading.value = true
  error.value = null
  try {
    const r = await fetch('/wall/raffle', { cache: 'no-store' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = (await r.json()) as RaffleResponse
    candidates.value = data.candidates
    eventName.value = data.event?.name ?? null
    isDemo.value = data.isDemo
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff85a2', '#00d2d3']

function launchConfetti(intensity: 'small' | 'big' = 'small') {
  const canvas = confettiCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const count = intensity === 'big' ? 150 : 50
  const centerX = canvas.width / 2
  const startY = canvas.height * 0.3

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * Math.PI
    const speed = 8 + Math.random() * 12
    confettiParticles.push({
      x: centerX + (Math.random() - 0.5) * 200,
      y: startY + (Math.random() - 0.5) * 100,
      vx: Math.cos(angle) * speed * (intensity === 'big' ? 1.5 : 1),
      vy: -Math.abs(Math.sin(angle) * speed) - 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3
    })
  }

  if (!confettiAnimationId) {
    animateConfetti()
  }
}

function animateConfetti() {
  const canvas = confettiCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  confettiParticles = confettiParticles.filter((p) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.25
    p.vx *= 0.99
    p.rotation += p.rotationSpeed

    if (p.y > canvas.height + 50) return false

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
    ctx.restore()

    return true
  })

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti)
  } else {
    confettiAnimationId = 0
  }
}

async function runDraw() {
  if (animating.value || pool.value.length === 0) return
  animating.value = true
  animationPhase.value = 'shuffle'
  winners.value = []
  revealIndex.value = -1

  state.value = 'swirl'

  const picked = pickWinners(winnerCount.value)

  for (let i = 0; i < 18; i++) {
    shuffleNames.value = Array.from({ length: Math.min(winnerCount.value, pool.value.length) }, () => {
      const idx = secureRandom(pool.value.length)
      return pool.value[idx]!.name
    })
    await sleep(80 + i * 12)
  }

  animationPhase.value = 'reveal'
  state.value = 'idle'

  for (let i = 0; i < picked.length; i++) {
    revealIndex.value = i
    winners.value = picked.slice(0, i + 1)
    launchConfetti('small')
    await sleep(700)
  }

  launchConfetti('big')
  animating.value = false
}


function redrawSingle(index: number) {
  if (animating.value) return
  const winner = winners.value[index]
  if (!winner) return
  excluded.value = new Set([...excluded.value, winner.name])
  const replacement = pickWinners(1)
  if (replacement.length > 0) {
    const newWinners = [...winners.value]
    newWinners[index] = replacement[0]!
    winners.value = newWinners
    launchConfetti('small')
  }
}

function reset() {
  winners.value = []
  excluded.value = new Set()
  animationPhase.value = 'idle'
  revealIndex.value = -1
  shuffleNames.value = []
}

onMounted(() => {
  langue.value = 'pt'
  void fetchCandidates()
})

onUnmounted(() => {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId)
  }
})

const labels = computed(() => {
  const lang = langue.value
  if (lang === 'pt') {
    return {
      title: 'Sorteio',
      subtitle: 'Escolha os ganhadores',
      eligible: 'participantes elegíveis',
      draw: 'Sortear',
      drawAgain: 'Sortear novamente',
      redraw: 'Re-sortear',
      reset: 'Reiniciar',
      winners: 'Ganhadores',
      loading: 'Carregando...',
      error: 'Erro ao carregar',
      demo: '(modo demo)',
      noParticipants: 'Nenhum participante registrado',
      howMany: 'Ganhadores:'
    }
  }
  if (lang === 'es') {
    return {
      title: 'Sorteo',
      subtitle: 'Elige a los ganadores',
      eligible: 'participantes elegibles',
      draw: 'Sortear',
      drawAgain: 'Sortear de nuevo',
      redraw: 'Re-sortear',
      reset: 'Reiniciar',
      winners: 'Ganadores',
      loading: 'Cargando...',
      error: 'Error al cargar',
      demo: '(modo demo)',
      noParticipants: 'Sin participantes registrados',
      howMany: 'Ganadores:'
    }
  }
  return {
    title: 'Raffle',
    subtitle: 'Pick the winners',
    eligible: 'eligible participants',
    draw: 'Draw',
    drawAgain: 'Draw again',
    redraw: 'Redraw',
    reset: 'Reset',
    winners: 'Winners',
    loading: 'Loading...',
    error: 'Error loading',
    demo: '(demo mode)',
    noParticipants: 'No participants checked in',
    howMany: 'Winners:'
  }
})
</script>

<template>
  <div class="rifa">
    <canvas ref="confettiCanvas" class="confetti-canvas" />
    <header class="encabezado">
      <h1 class="titulo">{{ labels.title }}</h1>
      <p v-if="eventName" class="evento">{{ eventName }}</p>
      <p v-if="isDemo" class="demo">{{ labels.demo }}</p>
    </header>

    <div class="contenido">
      <div class="escena">
        <BloubBot
          v-model:state="state"
          v-model:block="block"
          v-model:playing="playing"
          :cycle="[{ state: 'idle', duration: 60 }]"
          :size="320"
          shape="cercle"
          color="encre"
          expression="neutre"
          paper="#f6f6f6"
        />
      </div>

      <div class="panel">
        <div v-if="loading" class="estado">{{ labels.loading }}</div>
        <div v-else-if="error" class="estado error">{{ labels.error }}: {{ error }}</div>
        <template v-else>
          <p class="elegibles">
            <strong>{{ pool.length }}</strong> {{ labels.eligible }}
          </p>

          <div class="controles">
            <label class="contador">
              {{ labels.howMany }}
              <input
                v-model.number="winnerCount"
                type="number"
                min="1"
                max="20"
                :disabled="animating"
              />
            </label>
          </div>

          <div class="botones">
            <button
              type="button"
              class="btn btn--primario"
              :disabled="animating || pool.length === 0"
              @click="runDraw"
            >
              {{ winners.length > 0 ? labels.drawAgain : labels.draw }}
            </button>
            <button
              v-if="winners.length > 0"
              type="button"
              class="btn"
              :disabled="animating"
              @click="reset"
            >
              {{ labels.reset }}
            </button>
          </div>

          <div v-if="animationPhase === 'shuffle'" class="shuffle">
            <div v-for="(name, i) in shuffleNames" :key="i" class="shuffle-item">
              {{ name }}
            </div>
          </div>

          <div v-if="winners.length > 0" class="ganadores">
            <h2>{{ labels.winners }}</h2>
            <ul class="lista">
              <li
                v-for="(w, i) in winners"
                :key="w.name + i"
                class="ganador"
                :class="{ revelado: i <= revealIndex || animationPhase === 'idle' }"
              >
                <span class="numero">{{ i + 1 }}</span>
                <span class="nombre">{{ w.name }}</span>
                <button
                  type="button"
                  class="btn-redraw"
                  :disabled="animating"
                  :title="labels.redraw"
                  @click="redrawSingle(i)"
                >
                  ↻
                </button>
              </li>
            </ul>
          </div>

          <p v-if="pool.length === 0 && !loading" class="estado">
            {{ labels.noParticipants }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'Universal Sans Display';
  src: url('/brand/UniversalSans-Display-550.woff2') format('woff2');
  font-weight: 550;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Universal Sans Text';
  src: url('/brand/UniversalSans-Text-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.rifa {
  min-height: 100dvh;
  background: #f6f6f6;
  color: #111;
  font-family: 'Universal Sans Text', ui-sans-serif, system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.encabezado {
  text-align: center;
  margin-bottom: 1.5rem;
}

.titulo {
  font-family: 'Universal Sans Display', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 550;
  letter-spacing: -0.03em;
  margin: 0;
}

.evento {
  font-size: 1.1rem;
  color: #666;
  margin: 0.5rem 0 0;
}

.demo {
  font-size: 0.9rem;
  color: #999;
  margin: 0.25rem 0 0;
}

.contenido {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
  max-width: 900px;
  width: 100%;
}

.escena {
  flex: 0 0 auto;
}

.panel {
  flex: 1 1 320px;
  min-width: 280px;
  max-width: 420px;
}

.estado {
  font-size: 1.1rem;
  color: #666;
  padding: 1rem 0;
}

.estado.error {
  color: #c00;
}

.elegibles {
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.elegibles strong {
  font-size: 1.8rem;
  font-weight: 550;
}

.controles {
  margin-bottom: 1rem;
}

.contador {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.contador input {
  width: 3.5rem;
  padding: 0.4rem 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
  text-align: center;
}

.botones {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn:hover:not(:disabled) {
  background: #eee;
  border-color: #999;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primario {
  background: #111;
  color: #fff;
  border-color: #111;
}

.btn--primario:hover:not(:disabled) {
  background: #333;
}

.shuffle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  min-height: 3rem;
}

.shuffle-item {
  background: #ddd;
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  font-size: 1.1rem;
  animation: shuffle-pulse 0.2s ease-in-out infinite alternate;
}

@keyframes shuffle-pulse {
  from { transform: scale(0.97); opacity: 0.7; }
  to { transform: scale(1.03); opacity: 1; }
}

.ganadores h2 {
  font-family: 'Universal Sans Display', sans-serif;
  font-size: 1.5rem;
  font-weight: 550;
  margin: 0 0 1rem;
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ganador {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s, transform 0.4s;
}

.ganador.revelado {
  opacity: 1;
  transform: translateY(0);
}

.numero {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  color: #fff;
  border-radius: 50%;
  font-weight: 550;
  font-size: 1rem;
}

.nombre {
  flex: 1;
  font-size: 1.35rem;
  font-weight: 550;
}

.btn-redraw {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 50%;
  background: #f6f6f6;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-redraw:hover:not(:disabled) {
  background: #ddd;
}

.btn-redraw:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .contenido {
    flex-direction: column;
    align-items: center;
  }

  .escena {
    transform: scale(0.8);
  }
}
</style>
