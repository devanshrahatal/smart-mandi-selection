/**
 * PostCSS configuration — required by Tailwind CSS v3.
 *
 * NOTE: This file was NOT in the Phase 0 structure. It is required for
 * Tailwind v3 to process CSS via Vite's build pipeline. Without it,
 * @tailwind directives in index.css would not be compiled.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
