import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 重要：確保相對路徑正確
  build: {
    chunkSizeWarningLimit: 1500, // 提高警告門檻至 1500kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 將 node_modules 中的程式碼獨立打包
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})