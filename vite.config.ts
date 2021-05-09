/* eslint-env node */
import {ConfigEnv, defineConfig} from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default ({mode}: ConfigEnv) => {
  return defineConfig({
    plugins: [reactRefresh()],
    server: {
      port: 4000,
    },
    base: "https://akx.github.io/pls/",
  });
}
