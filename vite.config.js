import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    // Output directory - builds directly to backend's public folder
    outDir: '../back/public',
    
    // Empty the output directory before building
    emptyOutDir: true,
    
    // Generate source maps for debugging
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Optimize build
    minify: 'esbuild',
    
    // Assets handling
    assetsDir: 'assets'
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@scss': path.resolve(__dirname, './src/assets/scss')
    }
  },
  
  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/scss/base/_vars.scss";
          @import "@/assets/scss/base/_mixins.scss";
        `
      }
    }
  }
})
