var prependcssvars = `@import "@/styles/variables/common.sass"; @import "@/styles/mixins/common.sass";`


module.exports = {

  publicPath: '/',
  lintOnSave: false,

  css: {
    loaderOptions: {
      sass: {
        prependData: prependcssvars,
      },
    }
  },

  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.ts']
    },
    output: {
      pathinfo: false,
    },

    module: {

      

      rules: [
        {
          loader: 'babel-loader',
          test: '/\.(js)$/',
          exclude: /node_modules/
        },
        {
          test: /\.(ts|tsx)?$/,
          use: 'ts-loader'
        },
        {
          test: /\.wasm$/,
          loaders: ['wasm-loader']
        }
      ]
    }
  }
};
