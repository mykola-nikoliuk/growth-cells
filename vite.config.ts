import { defineConfig, type Plugin } from 'vite';
import elm from 'vite-plugin-elm';

/**
 * vite-plugin-elm 3.0.1 asks hot reload to accept a dependency named "" when an Elm module
 * imports no other local module, and Vite 8 fails to resolve it. Drops that empty name from
 * the code the plugin loads.
 */
function elmWithoutEmptyDependency(): Plugin {
  const plugin = elm();
  const load = plugin.load;
  if (typeof load !== 'function') return plugin;
  return {
    ...plugin,
    async load(...args) {
      const result = await load.apply(this, args);
      if (!result || typeof result !== 'object') return result;
      return {
        ...result,
        code: result.code.replace(/(import\.meta\.hot\.accept\(\[)\s*""\s*(\])/, '$1$2'),
      };
    },
  };
}

// Relative asset paths, so the build works from a GitHub Pages project site.
export default defineConfig({
  base: './',
  plugins: [elmWithoutEmptyDependency()],
});
