// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  // TODO: set to the real production domain — used for canonical URLs, OG tags, sitemap.
  site: 'https://mainstreetlander.com',

  vite: {
    plugins: [
      tailwindcss(),

      // `motion`/`framer-motion` import a bare `react`, which this Preact project
      // doesn't install. They must be bundled so the react->preact/compat alias
      // below applies, instead of being left external for Node to (fail to)
      // resolve at runtime.
      //
      // Astro 6 runs on Vite's Environment API and renders pages in different
      // environments: `prerender` for static builds, `ssr` for `output: 'server'`,
      // and `astro` for the dev server. The legacy top-level `ssr.noExternal`
      // only reaches the `ssr` environment, and a top-level `environments` key
      // gets clobbered by Astro's own build config — but a `configEnvironment`
      // hook is merged additively onto each environment's noExternal list, so
      // use that and cover every server-side environment.
      {
        name: 'bundle-motion-for-preact',
        configEnvironment(name) {
          if (name === 'ssr' || name === 'prerender' || name === 'astro') {
            return { resolve: { noExternal: ['motion', 'framer-motion'] } };
          }
        }
      }
    ],

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime'
      }
    }
  },

  // `compat: true` aliases react/react-dom -> preact/compat so the `motion`
  // package (framer-motion's successor, imported as `motion/react`) runs
  // inside our Preact islands.
  integrations: [preact({ compat: true })]
});
