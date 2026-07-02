module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  // Server-side code (Vercel functions, build scripts) runs under Node.
  overrides: [
    { files: ['api/**/*.js', 'scripts/**/*.{js,mjs}'], env: { node: true, browser: false } },
  ],
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // This project uses plain JSX without prop-types; don't require them.
    'react/prop-types': 'off',
  },
}
