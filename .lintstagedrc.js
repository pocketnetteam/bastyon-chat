module.exports = {
  'src/**/*.{js, vue}': [
    "prettier --write",
    "eslint --fix src/ !src/matrix-js-sdk/",
    "yarn run lint:js",
    "git add"
  ],
};