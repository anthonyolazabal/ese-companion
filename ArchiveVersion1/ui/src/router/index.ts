import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import {userStore} from '../plugins/auth/userStore'

interface AxiosOptions {
    baseUrl?: string
    token?: string
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const store = userStore()
  if (authRequired != store.isAuthentifcated()) {
    return '/login';
}
})

export default router
