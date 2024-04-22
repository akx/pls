/* eslint-env node */
import { ConfigEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    plugins: [react()],
    server: {
      port: 4000,
    },
    base: 'https://akx.github.io/pls/',
  });
};
