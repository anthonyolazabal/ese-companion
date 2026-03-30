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
  name: "EditMQTTRoles",
  data() {
    return {
      item: {} as Role
    }
  },
  methods: {
    async update() {
      if (this.item.name && this.item.description) {
        await this.$axios
          .put('/api/role/' + this.$route.query.id, this.item)
          .then((response) => {
            createToast("Role successfully updated", {
              type: 'success',
              position: 'bottom-center',
            })
            this.item = {} as Role
            if (this.$route.query.return == "details") {
              router.push('/mqtt-roles-details?id=' + this.$route.query.id);
            } else {
              router.push('/mqtt-roles');
            }
          })
          .catch(() => {
            createToast("Error updating role, contact your admin ! ", {
              type: 'warning',
              position: 'bottom-center',
            })
          });
      } else {
        createToast("Please fill all fields !", {
          type: 'warning',
          position: 'bottom-center',
        })
      }
    },

    cancel() {
      if (this.$route.query.return == "details") {
        router.push('/mqtt-roles-details?id=' + this.$route.query.id);
      } else {
        router.push('/mqtt-roles');
      }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/role/' + this.$route.query.id)
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
          <RouterLink to="/mqtt-roles">
            MQTT Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/mqtt-roles-edit?id' + $route.query.id">
            Edit Role
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Edit a MQTT role">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">

              <!-- 👉 Name -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.name" label="Name" placeholder="name" />
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.description" label="Description" placeholder="description" />
              </VCol>

              <VCol cols="12" class="d-flex gap-4">
                <VBtn color="primary" @click="update">
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