import Vue from 'vue'

import App from '@/App.vue'

require('babel-polyfill')

new Vue({
    render: h => h(App),
}).$mount('#matrix-root')
