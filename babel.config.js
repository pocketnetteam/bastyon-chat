module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    'es2020'
  ],
  plugins: [
    '@babel/plugin-transform-typescript',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-syntax-async-generators'
  ]
}
