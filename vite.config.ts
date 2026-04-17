import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react({
        // Optimize React Fast Refresh for development
        fastRefresh: true,
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Minification is on by default, but we can ensure it's using the best option
      minify: 'terser',
      reportCompressedSize: false,
      sourcemap: false,
      cssCodeSplit: true, // Split CSS into separate files for parallel loading
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          passes: 2, // Run compression passes twice for better optimization
        },
        mangle: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Group animation libraries
            'animations': ['gsap', 'framer-motion', '@gsap/react'],
            // Group core react & vendor
            'vendor': ['react', 'react-dom'],
            // Group heavy dependencies
            'scrolling': ['lenis'],
            // Supabase can be lazy loaded
            'supabase': ['@supabase/supabase-js'],
            // UI components
            'ui-libs': ['html2canvas'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'gsap', 'lenis', '@gsap/react', 'framer-motion'],
      exclude: ['html2canvas'],
    }
  };
});
