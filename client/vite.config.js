import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from any IP on the network
    port: 5174,
    strictPort: false
  },
  build: {
    // Production build optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size limit
    sourcemap: false, // Disable source maps in production for security
  },
  // Environment variable handling
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // CSS optimization
  css: {
    modules: {
      generateScopedName: '[hash:base64:8]' // Shorter class names in production
    }
  }
})
