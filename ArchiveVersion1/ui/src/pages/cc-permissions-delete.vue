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
  name: "DeleteCCPermissions",
  data() {
    return {
      item: {} as CC_Permission
    }
  },
  methods: {
    async remove() {
      if (this.item != null) {
        await this.$axios
          .delete('/api/cc_permission/' + this.$route.query.id)
          .then((response) => {
            createToast("Control center permission successfully deleted", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => router.push('/cc-permissions'))
          .catch((error) => {
            createToast(error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Error deleting control center permission, contact your admin ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      router.push('/cc-permissions');
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/cc_permission/' + this.$route.query.id)
      .then((response) => {
        this.item = response.data;
      }).catch((error) => {
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
          <RouterLink :to="'/cc-permissions-delete?id' + $route.query.id">
            Delete Permission
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Delete a control center permission">
        <VCardItem>
          <VRow>
            <VForm>
              <VCardText>
                You are about to delete the permission : {{ item.permission_string }} in the ESE database. Are you sure ?
              </VCardText>

              <VCol cols="12" class="d-flex gap-4">
                <VBtn color="primary" variant="tonal" @click="remove">
                  Delete
                </VBtn>

                <VBtn color="secondary" variant="tonal" @click="cancel">
                  Cancel
                </VBtn>
              </VCol>
            </VForm>
          </VRow>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>
