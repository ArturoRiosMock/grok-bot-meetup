import { createApp } from 'vue'
import MeetupWall from './components/MeetupWall.vue'
import RafflePage from './components/RafflePage.vue'
import './styles.css'

/**
 * The wall lives at `/`. A leftover `/mendoza` bookmark is rewritten once so
 * old links keep working; nothing else is city-specific.
 * `/rifa` and `/raffle` open the raffle page for picking random winners.
 */
const path = location.pathname.replace(/\/$/, '') || '/'
if (path === '/mendoza') {
  history.replaceState(null, '', '/' + location.search + location.hash)
}

const isRaffle = path === '/rifa' || path === '/raffle'
createApp(isRaffle ? RafflePage : MeetupWall).mount('#app')
