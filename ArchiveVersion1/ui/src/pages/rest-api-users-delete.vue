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

type Rest_Api_User = {
  id?: number;
  username?: string;
  password?: string;
};

export default {
  name: "DeleteRestApiUsers",
  data() {
    return {
      item: {} as Rest_Api_User
    }
  },
  methods: {
    async remove() {
      if (this.item != null) {
        await this.$axios
          .delete('/api/rest_api_user/' + this.$route.query.id)
          .then(() => {
            createToast("Rest Api user successfully deleted", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => router.push('/rest-api-users'))
          .catch((error) => {
            createToast(error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Error deleting control panel user, contact your admin ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      router.push('/rest-api-users');
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_user/' + this.$route.query.id)
      .then((response) => {
        this.item = response.data;
      }).catch((error) => {
        console.log(error)
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
          <RouterLink to="/rest-api-users">
            Rest Api Users
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/rest-api-users-delete?id' + $route.query.id">
            Delete User
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Delete a rest api user">
        <VCardItem>
          <VRow>
            <VForm>
              <VCardText>
                You are about to delete a rest api user with the username : {{ item.username }} in the ESE database.
                Are you sure ?
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
