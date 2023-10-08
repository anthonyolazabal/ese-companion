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
  name: "EditCCPermissions",
  data() {
    return {
      item: {} as CC_Permission
    }
  },
  methods: {
    async submit() {
      if (this.item.permission_string) {
        await this.$axios
          .put('/api/cc_permission/' + this.$route.query.id, this.item)
          .then((response) => {
            createToast("Control center permission updated successfully", {
              type: 'success',
              position: 'bottom-center',
            })
          }).then(() => router.push('/cc-permissions')).catch((error) => {
            createToast(error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Please fill all fields ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      router.push('/cc-permissions');
    },
  },
  async mounted() {
    await this.$axios
      .get('/api/cc_permission/' + this.$route.query.id)
      .then((response) => {
        this.item = response.data;
      })
      .catch((error) => {
        createToast("Error loading the page, contact your admin ! Details : " + error.message, {
          type: 'warning',
          position: 'bottom-center',
        })
      });
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
          <RouterLink :to="'/cc-permissions-edit?id' + $route.query.id">
            Edit Permission
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Update a control center permission">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">
              <!-- 👉 Permission -->
              <VCol cols="12" md="12" class="d-flex gap-4">
                <VTextField v-model="item.permission_string" label="Permission" placeholder="permission_string" />
              </VCol>
              <!-- 👉 Description -->
              <VCol cols="12" md="12" class="d-flex gap-4">
                <VTextField v-model="item.description" label="Description" placeholder="description" />
              </VCol>
            </VRow>

            <VRow style="margin-top: 2px;">
              <VCol cols="12" class="d-flex gap-4" />
              <VCol cols="12" class="d-flex gap-4">
                <VBtn color="primary" @click="submit">
                  Update
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
