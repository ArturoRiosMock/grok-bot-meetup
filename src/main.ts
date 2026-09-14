import { createApp } from 'vue'
import MeetupWall from './components/MeetupWall.vue'
import './styles.css'

/**
 * The wall lives at `/`. A leftover `/mendoza` bookmark is rewritten once so
 * old links keep working; nothing else is city-specific.
 */
const path = location.pathname.replace(/\/$/, '') || '/'
if (path === '/mendoza') {
  history.replaceState(null, '', '/' + location.search + location.hash)
}

createApp(MeetupWall).mount('#app')
