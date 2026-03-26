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

type Role = {
  id?: number;
  name?: string;
  description?: string;
};

export default {
  name: "DeleteMQTTRoles",
  // props: ['id'],
  data() {
    return {
      item: {} as Role
    }
  },
  methods: {
    async remove() {
      if (this.item != null) {
        await this.$axios
          .delete('/api/role/' + this.$route.query.id)
          .then((response) => {
            createToast("Role successfully deleted", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => router.push('/mqtt-roles'))
          .catch((error) => {
            createToast("Error deleting the role, contact your admin ! Details : " + error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Error deleting role, contact your admin ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      router.push('/mqtt-roles');
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/role/' + this.$route.query.id)
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
          <RouterLink to="/mqtt-roles">
            MQTT Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/mqtt-roles-delete?id' + $route.query.id">
            Delete Role
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Delete a MQTT role">
        <VCardItem>
          <VRow>
            <VForm>
              <VCardText>
                You are about to delete the following role : {{ item.name }} in the ESE database. Are you sure ?
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
