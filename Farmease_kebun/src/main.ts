import { createApp } from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

createApp(App).use(router).mount('#app')
