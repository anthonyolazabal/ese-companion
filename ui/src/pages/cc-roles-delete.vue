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
  name: "DeleteCCRoles",
  data() {
    return {
      item: {} as CC_Role
    }
  },
  methods: {
    async remove() {
      if (this.item != null) {
        await this.$axios
          .delete('/api/cc_role/' + this.$route.query.id)
          .then((response) => {
            createToast("Control center role successfully deleted", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => router.push('/cc-roles'))
          .catch((error) => {
            createToast("Error loading the page, contact your admin ! Details : " + error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Error deleting control center role, contact your admin ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      router.push('/cc-roles');
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/cc_role/' + this.$route.query.id)
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
          <RouterLink to="/cc-roles">
            Control Center Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/cc-roles-delete?id' + $route.query.id">
            Delete Role
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Delete a control center role">
        <VCardItem>
          <VRow>
            <VForm>
              <VCardText>
                You are about to delete the following role : {{ item.name }} in the ESE database. Are you
                sure ?
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
