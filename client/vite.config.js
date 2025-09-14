import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "firebase/app",
      "firebase/auth", 
      "firebase/firestore"
    ]
  },
  server: {
    host: '0.0.0.0', // Allow access from any IP on the network
    port: 5174,
    strictPort: false
  },
  build: {
    // Production build optimizations
    minify: 'esbuild', // Use esbuild (faster and no extra dependency)
    minifyOptions: {
      drop: ['debugger'], // Remove debugger statements
      // Keep console.warn for Firebase error handling
    },
    rollupOptions: {
      output: {
        manualChunks: undefined // Let Vite handle chunking automatically
      },
      external: (id) => {
        // Don't bundle analytics in SSR/build context
        if (id.includes('firebase/analytics') && typeof window === 'undefined') {
          return true;
        }
        return false;
      }
    },
    chunkSizeWarningLimit: 1600, // Increase chunk size limit for Firebase
    sourcemap: false, // Disable source maps in production for security
    target: 'es2015' // Better browser support
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
