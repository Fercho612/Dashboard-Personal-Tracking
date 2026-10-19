import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El plugin de React habilita JSX y el "fast refresh" en desarrollo.
export default defineConfig({
  plugins: [react()],
})
