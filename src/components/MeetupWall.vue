<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BloubBot from '@/components/BloubBot.vue'
import { EXPRESSIONS, type ExpressionId } from '@/bot/expressions'
import { COLORS, SHAPES, type ColorId, type ShapeId } from '@/bot/skins'
import { t } from '@/i18n'
import type { StateId } from '@/bot/states'

/**
 * Mur du meetup Mendoza : le cadrage du banner (texte a gauche, boule trop
 * grande a droite) et le meme gachette que grokbot-wall — un check-in (Luma
 * via `/wall/state`, ou Espace en demo) ouvre une bulle de chat.
 */

type Invite = { key: string; name: string; at: number }

const DEMO = [
  'Lucía Fernández',
  'Tomás Ruiz',
  'Camila Soto',
  'Mateo Álvarez',
  'Valentina Paz',
  'Joaquín Díaz',
  'Sofía Herrera',
  'Benjamín Cruz'
]

const PAPER = '#f6f6f6'
const CLAIM_URL = 'https://cursor.com/redeem/event/grok-bot-meetup-mendoza'
/**
 * Idle long : le lecteur ne reboucle pas sur swirl. La fete de check-in pose
 * `swirl` a la main (anneaux colorees, meme corps).
 */
const cycle = [{ state: 'idle' as StateId, duration: 60 }]
const FORMES = SHAPES.map((s) => s.id)
const TEINTES = COLORS.filter((c) => c.id !== 'creme').map((c) => c.id)
const VISAGES = EXPRESSIONS.map((e) => e.id)

const feed = ref<Invite[]>([])
const vus = new Set<string>()
let pret = false
const bulle = ref<{ nom: string; phase: 'points' | 'texte' } | null>(null)
const state = ref<StateId>('idle')
const block = ref(0)
const playing = ref(true)
const shape = ref<ShapeId>('cercle')
const color = ref<ColorId>('encre')
const expression = ref<ExpressionId>('neutre')
const claim = ref(false)
const btnRetour = ref<HTMLButtonElement | null>(null)
const btnClaim = ref<HTMLButtonElement | null>(null)
const demoRestants = [...DEMO]

let syncTimer = 0
let morphTimer = 0
let bulleTimer = 0
let feteTimer = 0
let enFete = false

function prenom(nom: string) {
  const bout = nom.trim().split(/\s+/)[0] || nom
  return bout
}

function autre<T>(liste: readonly T[], actuel: T): T {
  const choix = liste.filter((x) => x !== actuel)
  return (choix[Math.floor(Math.random() * choix.length)] ?? liste[0])!
}

/** Figure, couleur et yeux independants — pas une sequence. Idle, pas de swirl. */
function tirerBot() {
  shape.value = autre(FORMES, shape.value)
  color.value = autre(TEINTES, color.value)
  expression.value = autre(VISAGES, expression.value)
}

function relancerMorph() {
  clearInterval(morphTimer)
  morphTimer = window.setInterval(() => {
    if (!enFete) tirerBot()
  }, claim.value ? 5_000 : 10_000)
}

function mouvementReduit() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function lancerFete() {
  if (mouvementReduit()) return
  clearTimeout(feteTimer)
  enFete = true
  state.value = 'swirl'
  feteTimer = window.setTimeout(() => {
    state.value = 'idle'
    enFete = false
  }, 1300)
}

function accueillir(invite: Invite) {
  if (vus.has(invite.key)) return
  vus.add(invite.key)
  feed.value = [invite, ...feed.value].slice(0, 6)
  clearTimeout(bulleTimer)
  lancerFete()
  bulle.value = { nom: prenom(invite.name), phase: 'points' }
  bulleTimer = window.setTimeout(() => {
    if (bulle.value) bulle.value = { ...bulle.value, phase: 'texte' }
  }, 720)
}

function demoCheckIn() {
  const nom = demoRestants.shift()
  if (!nom) return
  demoRestants.push(nom)
  // Cle unique a chaque frappe : sinon le 2e tour des memes noms est ignore.
  accueillir({ key: `demo:${nom}:${Date.now()}`, name: nom, at: Date.now() })
}

async function syncMur() {
  const key = new URLSearchParams(location.search).get('key')
  const u = new URL('/wall/state', location.origin)
  if (key) u.searchParams.set('key', key)
  try {
    const r = await fetch(u, { cache: 'no-store' })
    if (!r.ok) throw new Error(String(r.status))
    const s = (await r.json()) as {
      allocations?: Array<{ key: string; name?: string; checkedInAt?: string; at?: string }>
    }
    const recus = (s.allocations || [])
      .map((a) => ({
        key: a.key,
        name: a.name || a.key,
        at: new Date(a.checkedInAt || a.at || Date.now()).getTime()
      }))
      .sort((a, b) => b.at - a.at)
    if (!pret) {
      for (const invite of recus) vus.add(invite.key)
      feed.value = recus.slice(0, 6)
      pret = true
      return
    }
    for (const invite of recus.slice().reverse()) accueillir(invite)
  } catch {
    /* demo locale si le mur n'est pas joignable */
  }
}

function ouvrirClaim() {
  if (claim.value) return
  claim.value = true
  lancerFete()
  relancerMorph()
  void nextTick(() => btnRetour.value?.focus())
}

function fermerClaim() {
  if (!claim.value) return
  claim.value = false
  relancerMorph()
  if (!enFete) state.value = 'idle'
  void nextTick(() => btnClaim.value?.focus())
}

function auClavier(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    fermerClaim()
    return
  }
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return
  if (e.key === ' ' && !e.repeat) {
    e.preventDefault()
    demoCheckIn()
  }
}

onMounted(() => {
  tirerBot()
  void syncMur()
  syncTimer = window.setInterval(() => void syncMur(), 2000)
  relancerMorph()
  window.addEventListener('keydown', auClavier)
})

onBeforeUnmount(() => {
  clearInterval(syncTimer)
  clearInterval(morphTimer)
  clearTimeout(bulleTimer)
  clearTimeout(feteTimer)
  window.removeEventListener('keydown', auClavier)
})

</script>

<template>
  <div class="mur" :class="claim && 'mur--claim'">
    <h1 class="sr-only">{{ t('meetup.title') }}</h1>

    <!-- Monte en permanence : une transition ne joue pas au premier style, et
         demonter le bouton a la fermeture lui interdirait de s'effacer. -->
    <button
      ref="btnRetour"
      type="button"
      class="retour"
      :inert="!claim || undefined"
      @click="fermerClaim"
    >
      {{ t('meetup.back') }}
    </button>

    <div class="haut">
      <div class="duo">
        <div class="ancre">
          <section class="copie">
            <p class="marque">
              <img src="/brand/grok-bot-wordmark.png" :alt="t('meetup.title')" />
            </p>
            <p class="lieu">{{ t('meetup.city') }} {{ t('meetup.qrTitle') }}</p>
            <button
              ref="btnClaim"
              type="button"
              class="claim"
              :aria-expanded="claim"
              :inert="claim || undefined"
              @click="ouvrirClaim"
            >
              {{ t('meetup.claim') }}
            </button>
          </section>
        </div>

        <aside class="qr" :inert="!claim || undefined">
          <img class="qr-img" src="/brand/claim-qr.svg?v=round" :alt="CLAIM_URL" />
        </aside>

      <div class="scene">
        <div
          v-if="bulle && !claim"
          class="bulle"
          :class="bulle.phase === 'points' && 'bulle--points'"
        >
          <span v-if="bulle.phase === 'points'" class="points" aria-hidden="true">
            <i /><i /><i />
          </span>
          <p v-else class="bulle-texte">{{ t('meetup.welcome', { name: bulle.nom }) }}</p>
        </div>

        <div class="avatar" :class="claim && 'avatar--geant'">
          <BloubBot
            v-model:state="state"
            v-model:block="block"
            v-model:playing="playing"
            :cycle="cycle"
            :size="720"
            :shape="shape"
            :color="color"
            :expression="expression"
            :paper="PAPER"
            follow
          />
        </div>
      </div>
      </div>
    </div>

    <footer class="presente">
      <p class="presente-label">{{ t('meetup.presented') }}</p>
      <img class="spacex" src="/brand/spacex-wordmark.png" alt="SpaceX" />
    </footer>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'Universal Sans Display';
  src: url('/brand/UniversalSans-Display-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

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

@font-face {
  font-family: 'Universal Sans Text';
  src: url('/brand/UniversalSans-Text-550.woff2') format('woff2');
  font-weight: 550;
  font-style: normal;
  font-display: swap;
}

.mur {
  --mur-paper: #f6f6f6;
  --mur-ink: #111111;
  --bascule: 1s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--mur-paper);
  color: var(--mur-ink);
  overflow: hidden;
  font-family: 'Universal Sans Text', ui-sans-serif, system-ui, sans-serif;
}

.retour {
  position: absolute;
  top: 1.6rem;
  left: 1.75rem;
  z-index: 3;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font-family: 'Universal Sans Text', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #8a8a8a;
  text-decoration: underline;
  text-underline-offset: 0.22em;
  text-decoration-thickness: 1px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}

.mur--claim .retour {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.35s ease-out 0.25s;
}

.retour:hover {
  color: var(--mur-ink);
}

.haut {
  --copie-w: 20rem;
  --qr-w: min(58vh, 34vw);
  --duo-gap: clamp(1.5rem, 4vw, 4rem);
  --avatar-w: min(68vh, 46rem, 48vw);
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 5vw 0.5rem;
}

.duo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--duo-gap);
  min-width: 0;
}

.ancre {
  flex: 0 0 auto;
  width: var(--copie-w);
  align-self: center;
  overflow: visible;
}

.copie {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: var(--copie-w);
  transform: translate(0, 0);
  transition:
    transform var(--bascule),
    width var(--bascule);
}

.mur--claim .copie {
  align-items: center;
  width: var(--qr-w);
  transform: translate(0, calc(3rem - 37vh));
}

.qr {
  position: absolute;
  left: 0;
  top: 50%;
  z-index: 1;
  width: var(--qr-w);
  opacity: 0;
  transform: translate(22vw, -30%) scale(0.4);
  transform-origin: center center;
  pointer-events: none;
  transition:
    transform var(--bascule),
    opacity 0.35s ease-out;
}

.mur--claim .qr {
  opacity: 1;
  transform: translate(0, calc(3rem - 37vh + 7.2rem)) scale(1);
  pointer-events: auto;
}

.qr-img {
  display: block;
  width: 100%;
  height: auto;
}

.marque {
  margin: 0;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.mur--claim .marque {
  justify-content: center;
}

.marque img {
  display: block;
  width: min(100%, 20rem);
  height: auto;
}

.lieu {
  margin: 0.7rem 0 0;
  font-family: 'Universal Sans Display', 'Universal Sans Text', sans-serif;
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-align: left;
}

.mur--claim .lieu {
  text-align: center;
}

.claim {
  display: inline-block;
  margin: 0.85rem 0 0;
  padding: 0;
  border: 0;
  background: none;
  font-family: 'Universal Sans Text', sans-serif;
  font-size: 0.92rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #8a8a8a;
  text-decoration: underline;
  text-underline-offset: 0.22em;
  text-decoration-thickness: 1px;
  cursor: pointer;
  transition: opacity 0.35s ease-out;
}

.claim:hover {
  color: var(--mur-ink);
}

.mur--claim .claim {
  opacity: 0;
  pointer-events: none;
  margin-top: 0;
  height: 0;
  overflow: hidden;
}

.presente {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.4rem 1.5rem 2.2rem;
}

.presente-label {
  margin: 0;
  font-family: 'Universal Sans Text', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #6b6b6b;
}

.spacex {
  display: block;
  width: clamp(9.5rem, 14vw, 12.5rem);
  height: auto;
}

.scene {
  position: relative;
  flex: 0 0 auto;
}

.avatar {
  width: var(--avatar-w);
  transform: translate(0, 0) scale(1);
  transition: transform var(--bascule);
}

.avatar--geant {
  transform: translate(30vw, 14vh) scale(2.5);
}

.avatar :deep(svg) {
  width: 100%;
  height: auto;
}

.bulle {
  position: absolute;
  z-index: 2;
  left: -8%;
  top: 6%;
  max-width: min(22rem, 70%);
  padding: 1.15rem 1.45rem 1.2rem;
  border-radius: 1.5rem 1.5rem 0.4rem 1.5rem;
  background: #fff;
  color: var(--mur-ink);
  border: 1px solid #ececec;
}

.bulle::after {
  content: '';
  position: absolute;
  right: -7px;
  bottom: 14px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-right: 1px solid #ececec;
  border-bottom: 1px solid #ececec;
  transform: rotate(-45deg);
}

.bulle-texte {
  margin: 0;
  font-family: 'Universal Sans Display', 'Universal Sans Text', sans-serif;
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.points {
  display: flex;
  gap: 0.35rem;
  padding: 0.15rem 0.2rem;
}

.points i {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: #bbb;
  animation: point 1s ease-in-out infinite;
}

.points i:nth-child(2) {
  animation-delay: 0.15s;
}

.points i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes point {
  0%,
  80%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (width < 64rem) {
  .haut {
    --avatar-w: min(72vw, 22rem);
    flex-direction: column;
    justify-content: flex-start;
    padding: 3.4rem 1.4rem 0.4rem;
  }

  .copie,
  .mur--claim .copie {
    transform: none;
    width: min(100%, 18rem);
    margin-inline: auto;
  }

  .ancre {
    width: auto;
  }

  .qr,
  .mur--claim .qr {
    position: relative;
    left: auto;
    top: auto;
    width: min(100%, 18rem);
    margin-inline: auto;
    transform: none;
  }

  .qr {
    height: 0;
    opacity: 0;
  }

  .mur--claim .qr {
    height: auto;
    opacity: 1;
  }

  .duo {
    flex-direction: column;
    gap: 1.2rem;
  }

  .avatar--geant {
    transform: translate(8vw, 6vh) scale(1.45);
  }

  .bulle {
    left: 4%;
    top: -4%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr,
  .mur--claim .qr,
  .copie,
  .mur--claim .copie,
  .avatar,
  .retour,
  .mur--claim .retour {
    transition: none;
  }
}
</style>
