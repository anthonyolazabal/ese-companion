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
  algorithm?: string;
  password_iterations: number;
};

export default {
  name: "EditRestApiUsers",
  data() {
    return {
      algo: 'SHA512',
      algos: ['SHA512', 'PKCS5S2', 'MD5'],
      iterations: [10, 100],
      item: {} as Rest_Api_User
    }
  },
  methods: {
    async update() {
      if (this.item.username && this.item.password) {
        await this.$axios
          .put('/api/rest_api_user/' + this.$route.query.id, this.item)
          .then((response) => {
            createToast("Rest Api user successfully updated", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => {
            this.item = {} as Rest_Api_User
            if (this.$route.query.return == "details") {
              router.push('/rest-api-users-details?id=' + this.$route.query.id);
            } else {
              router.push('/rest-api-users');
            }
          })
          .catch(() => {
            createToast("Error updating rest api user, contact your admin ! ", {
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
        router.push('/rest-api-users-details?id=' + this.$route.query.id);
      } else {
        router.push('/rest-api-users');
      }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_user/' + this.$route.query.id)
      .then((response) => {
        this.item = response.data;
        this.algo = this.item.algorithm ? this.item.algorithm : "";
      })
      .then(() => {
        this.item.password = '';
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
          <RouterLink to="/rest-api-users">
            Rest Api Users
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/rest-api-users-edit?id' + $route.query.id">
            Edit User
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Edit a rest api user">
        <VCardText>
          <v-banner lines="two" icon="$warning" color="warning" class="my-4 elevation-20">
            <v-banner-text>
              Be aware that password hash is not reversible, so by editing the user you need to input again the password
              for the user (device).
            </v-banner-text>
          </v-banner>
        </VCardText>
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">

              <!-- 👉 Username -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.username" label="Username" placeholder="username" />
              </VCol>

              <!-- 👉 Password -->
              <VCol cols="12" md="6">
                <VTextField v-model="item.password" label="Password" type="password" onmouseleave=""
                  placeholder="password" />
              </VCol>

              <!-- 👉 Algorithm -->
              <VCol cols="12" md="6">
                <VSelect v-model="item.algorithm as String" :items="algos" variant="outlined" placeholder="algorithm">
                </VSelect>
              </VCol>

              <!-- 👉 Password iterations -->
              <VCol cols="12" md="6">
                <div class="text-caption">
                  Password iterations
                </div>
                <v-slider v-model="item.password_iterations" label="Iterations" step="10" thumb-label="always"
                  style="margin-right: 25px;"></v-slider>
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