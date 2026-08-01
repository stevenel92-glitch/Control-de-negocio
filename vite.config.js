import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Control del Negocio',
        short_name: 'Negocio',
        description: 'Pedidos y ruta, pagos y alertas, vales de empleados',
        theme_color: '#134e4a',
        background_color: '#f5f5f4',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
});
