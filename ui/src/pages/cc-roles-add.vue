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

type CC_Role = {
  id?: number;
  name?: string;
  description?: string;
};

export default {
  name: "AddCCRoles",
  data() {
    return {
      item: {} as CC_Role,
      loading: false
    }
  },
  methods: {
    async submit() {
      this.loading = true
      if (this.item.name) {
        await this.$axios
          .post('/api/cc_role', this.item)
          .then((response) => {
            createToast("Control panel role created successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            router.push('/cc-roles-details?id=' + response.data.id)
          })
          .catch((error) => {
            createToast("Error loading the page, contact your admin ! Details : " + error.message, {
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
        this.loading = false
      }
    },

    cancel() {
      router.push('/cc-roles');
    }
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
          <RouterLink to="/cc-roles">
            Control Center Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/cc-roles-add'">
            Add Role
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Create a new control center role">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">
              <!-- 👉 Name -->
              <VCol cols="12" md="6" class="d-flex gap-4">
                <VTextField v-model="item.name" label="Name" placeholder="name" />
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.description" label="Description" placeholder="description" />
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
