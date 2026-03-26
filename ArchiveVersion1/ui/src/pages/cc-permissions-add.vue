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

type CC_Permission = {
  id?: number;
  permission_string: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
};

export default {
  name: "AddCCPermissions",
  data() {
    return {
      item: {
        permission_string: '',
        description: ''
      } as CC_Permission,
      loading: false
    }
  },
  methods: {
    async submit() {
      this.loading = true
      if (this.item.permission_string) {
        await this.$axios
          .post('/api/cc_permission', this.item)
          .then((response) => {
            createToast("Control center permission created successfully", {
              type: 'success',
              position: 'bottom-center',
            })
          }).then(() => router.push('/cc-permissions'))
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
        this.loading = false
      }
    },

    cancel() {
      router.push('/cc-permissions');
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
          <RouterLink to="/cc-permissions">
            Control Center Permissions
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/cc-permissions-add'">
            Add Permission
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Create a new control center permission">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">
              <!-- 👉 Permission string -->
              <VCol cols="12" md="12" class="d-flex gap-4">
                <VTextField v-model="item.permission_string" label="Permission" placeholder="permission_string" />
              </VCol>
              <!-- 👉 Permission string -->
              <VCol cols="12" md="12" class="d-flex gap-4">
                <VTextField v-model="item.description" label="Description" placeholder="description" />
              </VCol>
            </VRow>
            <VRow style="margin-top: 2px;">
              <VCol cols="12" class="d-flex gap-4"></VCol>
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
