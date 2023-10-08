<script lang="ts">
import { useTheme } from 'vuetify'
import type { VForm } from 'vuetify/components/VForm'
import bee2 from '@/assets/images/pages/bee-2.png'
import bee1 from '@/assets/images/pages/bee-1.png'
import type { AxiosInstance } from 'axios'
import router from '@/router'
import { userStore } from '../plugins/auth/userStore'
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'

const store = userStore()

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

export default {
  name: "Login",
  data() {
    return {
      username: ref(''),
      password: ref(''),
    }
  },
  methods: {
    async login() {
      // Login to API and get token
      let user = {
        username: this.username,
        password: this.password
      }
      await this.$axios.post('/api/login', user)
        .then((result: { data: any }) => {
          store.updateToken(result.data.token);
          store.updateUsername(result.data.username);
          store.updatePassword(this.password);
          store.updateIsAuthenticated(true);
          router.push('/');
        })
        .catch(function (error) {
          if (error.response) {
            createToast("Error authenticating user, contact your admin ! Details : " + error.response.data, {
              type: 'warning',
              position: 'bottom-center',
            })
          } else if (error.request) {
            createToast("Error in request, contact your admin ! Details : " + error, {
              type: 'warning',
              position: 'bottom-center',
            })
          } else {
            createToast("Error, contact your admin ! Details : " + error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          }
        })
    }
  },
}
</script>
<script setup lang="ts">
const vuetifyTheme = useTheme()

const isPasswordVisible = ref(false)

</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
          ESE Editor
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <p class="mb-0">
          Please sign-in with an account allowed on the ESE Api
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => { }">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField v-model="username" label="Username" type="text" />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField v-model="password" label="Password" :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible" />

              <br />
              <!-- login button -->
              <VBtn block type="submit" @click="login">
                Login
              </VBtn>

              <br />

              <VBtn block color="secondary" variant="tonal" type="reset">
                Reset
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <VImg class="auth-footer-start-tree d-none d-md-block" :src="bee1" :width="250" />

    <VImg :src="bee2" class="auth-footer-end-tree d-none d-md-block" :width="350" />
  </div>
</template>

<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
</route>
