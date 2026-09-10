import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Le port est ici et pas seulement dans `.claude/launch.json` : c'est celui que
  // le README annonce, il doit donc valoir pour un `pnpm dev` nu.
  server: {
    port: 5190,
    // grokbot-wall : check-ins Luma / allocations. Le mur `/mendoza` lit `/wall/state`.
    proxy: {
      '/wall': {
        target: 'http://127.0.0.1:8787',
        rewrite: (path) => path.replace(/^\/wall/, '')
      }
    }
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
