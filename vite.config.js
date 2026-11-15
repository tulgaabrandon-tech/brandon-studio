import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { jobsApi } from './server/jobsApi.js'

export default defineConfig({
  plugins: [react(), jobsApi()],
})
