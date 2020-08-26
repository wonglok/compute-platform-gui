import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { router } from './router.js'
import { store } from './store.js'
import './assets/inter/InterWeb/inter.css'
import './assets/css/tailwind.postcss'
import './assets/@fortawesome/fontawesome-free/css/all.css'

Vue.use(VueRouter)

Vue.config.productionTip = false

Vue.prototype.$store = store

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
