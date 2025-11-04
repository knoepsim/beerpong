module.exports = {
  // Use the new PostCSS adapter package for Tailwind instead of loading
  // `tailwindcss` directly. This prevents the runtime error shown by
  // Turbopack/Next when PostCSS expects the adapter package.
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
