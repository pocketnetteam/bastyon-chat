var themes = [
  'white', 'black', 'classic'
]

var prependcssvars = `@import "@/styles/variables/common.sass"; @import "@/styles/variables/theme_template_notrewrite.sass"; @import "@/styles/mixins/common.sass"; @import "@/styles/mixins/theme_template_notrewrite.sass"; `+ themes.map((v, i) => {
  return `@import "@/styles/variables/theme_`+v+`.sass"; @import "@/styles/mixins/theme_`+v+`.sass";`
}).join(" ")


module.exports = {

  publicPath: '/',
  lintOnSave: false,

  css: {
    loaderOptions: {
      sass: {
        prependData: prependcssvars
      },
    }
  },
 
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.ts']
    },
    module: {
      rules:[
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
