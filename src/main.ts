import { createApp } from 'vue'
import MeetupWall from './components/MeetupWall.vue'
import { pageMeetup } from './i18n'
import './styles.css'

/**
 * Ce depot ne sert plus que le mur Mendoza. Toute autre URL y ramene.
 */
const ici = location.pathname.replace(/\/$/, '') || '/'
if (ici !== '/mendoza') {
  history.replaceState(null, '', '/mendoza' + location.search)
}

pageMeetup.value = true
createApp(MeetupWall).mount('#app')
