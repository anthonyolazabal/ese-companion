<script lang="ts">
import router from '@/router';
import type { AxiosInstance } from 'axios'
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

type User = {
  id?: number;
  username?: string;
  password?: string;
  algorithm?: string;
  password_iterations: number;
};

export default {
  name: "AddMQTTAccounts",
  data() {
    return {
      algo: 'SHA512',
      algos: ['SHA512', 'PKCS5S2', 'MD5'],
      iterations: [10, 100],
      item: {
        password_iterations: 100
      } as User,
      loading: false
    }
  },
  methods: {
    async submit() {
      this.loading = true
      if (this.item.username && this.item.password && this.item.algorithm) {
        await this.$axios
          .post('/api/user', this.item)
          .then((response) => {
            createToast("Accounts created successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            router.push('mqtt-accounts-details?id=' + response.data.id)
          })
          .catch((error) => {
            createToast(error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
            this.loading = false
          });
      } else {
        createToast("Please fill all fields ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
      this.loading = false
    },

    cancel() {
      router.push('/mqtt-accounts');
    },
  }
};
</script>

<template>
  <VRow>
    <VCol cols="12" md="12">
      <v-breadcrumbs>
        <v-breadcrumbs-item>
          <RouterLink to="/">Home</RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink to="/mqtt-accounts">
            MQTT Accounts
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/mqtt-accounts-add'">
            Add Account
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Create a new account">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">
              <!-- 👉 Username -->
              <VCol cols="12" md="6" class="d-flex gap-4">

                <VTextField v-model="item.username" label="Username" placeholder="username" />
              </VCol>

              <!-- 👉 Password -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.password" label="Password" type="password" placeholder="password" />
              </VCol>

              <!-- 👉 Algorithm -->
              <VCol cols="12" md="6">
                <VSelect v-model="item.algorithm as String" :items="algos" variant="outlined" placeholder="algorithm" />
              </VCol>

              <!-- 👉 Password iterations -->
              <VCol cols="12" md="6">
                <div class="text-caption">
                  Password iterations
                </div>
                <v-slider v-model="item.password_iterations" label="Iterations" step="10" thumb-label="always"
                  style="margin-right: 25px;" />
              </VCol>

              <VCol cols="12" class="d-flex gap-4">
                <VBtn color="primary" @click="submit" :loading="loading">
                  Create
                </VBtn>

                <VBtn color="secondary" variant="tonal" @click="cancel">
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>
