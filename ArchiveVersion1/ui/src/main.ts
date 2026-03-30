/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import '@/styles/styles.scss'
import '@core/scss/index.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import axios from './plugins/axios/axios'

loadFonts()

const app = createApp(App)
const pinia = createPinia()
app.component('EasyDataTable', Vue3EasyDataTable);
app.use(vuetify)
app.use(pinia)
app.use(router)

app.use(axios, {})

app.mount('#app')
