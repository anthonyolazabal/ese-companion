import axios from 'axios'
import type {App} from 'vue'
import {userStore} from '../auth/userStore'

interface AxiosOptions {
    baseUrl?: string
    token?: string
}

export default {
    install: (app: App, options: AxiosOptions) => {
        app.config.globalProperties.$axios = axios.create({
            baseURL: options.baseUrl,
        })
        const store = userStore()
        app.config.globalProperties.$axios.interceptors.request.use((request) => {
            if(request.url == "/login") {
                return request
            } 
            else {
                request.headers = {
                    "x-access-token": store.getToken() ? `${store.getToken()}` : '',
                }
                return request
            }
        })
        app.config.globalProperties.$axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (401 === error.response.status || 403 === error.response.status) {
                    window.location.href = '/login';
                    return Promise.reject(error)
                }
        })
    }
}