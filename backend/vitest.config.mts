import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * The backend's path aliases are declared in tsconfig.app.json, which vitest
 * does not read on its own. Without this file any test that imports a module
 * using an alias (or anything it pulls in transitively) fails to collect with
 * "Cannot find package '@utils/appError'".
 *
 * Kept in sync with the `paths` block in tsconfig.app.json / tsconfig.node.json.
 */
export default defineConfig({
   resolve: {
      alias: {
         '@middlewares': fileURLToPath(new URL('./src/middlewares', import.meta.url)),
         '@controllers': fileURLToPath(new URL('./src/controllers', import.meta.url)),
         '@models': fileURLToPath(new URL('./src/models', import.meta.url)),
         '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
         '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
         '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
         '@custom-types': fileURLToPath(new URL('./src/types', import.meta.url)),
      },
   },
   test: {
      environment: 'node',
   },
})
