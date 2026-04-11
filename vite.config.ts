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
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Minification is on by default, but we can ensure it's using the best option
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Group animation libraries
            'animations': ['gsap', 'framer-motion', '@gsap/react'],
            // Group core react & vendor
            'vendor': ['react', 'react-dom', 'lenis', '@supabase/supabase-js'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    }
  };
});
