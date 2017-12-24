import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import { store } from './store/store';

Vue.use(VueSocketIO, '/');


new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
