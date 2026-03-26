<script lang="ts">
import router from '@/router';
import type { AxiosInstance } from 'axios'
import 'mosha-vue-toastify/dist/style.css'
import moment from 'moment';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

export default {
  name: "RestApiUsers",
  data() {
    return {
      headers: [
        { text: "Username", value: "username", sortable: true },
        { text: "Iterations", value: "password_iterations" },
        { text: "Algorithm", value: "algorithm", sortable: true },
        { text: "Created", value: "created_at", sortable: true },
        { text: "Last Updated", value: "updated_at", sortable: true },
        { text: "Operations", value: "operation" },
      ],
      itemsSelected: [],
      items: [],
      users: [],
      loading: true,
      isEditing: false,
      editingItem: null,
    }
  },
  methods: {
    formatDate(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
      }
    },
    deleteItem(val: any) {
      router.push('/rest-api-users-delete?id=' + val.id)
    },

    viewItem: function (val: any) {
      router.push('/rest-api-users-details?id=' + val.id)
    },

    editItem: function (val: any) {
      router.push('/rest-api-users-edit?id=' + val.id)
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_users')
      .then((response) => {
        this.users = response.data;
        this.loading = false;
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
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Rest Api Users">
        <VCardItem>
          <VRow>
            <VCol cols="12" md="6">
              List of all rest api users declared in the ESE database.
            </VCol>
            <VCol cols="12" md="6" class="text-right">
              <v-btn variant="outlined" size="small" to="/rest-api-users-add">
                New Rest Api user
              </v-btn>
            </VCol>
          </VRow>
        </VCardItem>
        <VCardItem>
          <EasyDataTable theme-color="#ffc000" buttons-pagination :headers="headers" :items="users" :loading="loading"
            table-class-name="customize-table" sort-by="id">
            <template #loading>
              <img src="@/assets/images/database-table.gif" style="width: 6.25rem; height: 6.25rem" alt="loader" />
            </template>
            <template #item-algorithm="{ algorithm }">
              <div>
                <VChip color="success" size="small">
                  {{ algorithm }}
                </VChip>
              </div>
            </template>
            <template #item-created_at="{ created_at }">
              <div>
                {{ formatDate(created_at) }}
              </div>
            </template>
            <template #item-updated_at="{ updated_at }">
              <div>
                {{ formatDate(updated_at) }}
              </div>
            </template>
            <template #item-operation="item">
              <div class="operation-wrapper">
                <VIcon size="20" icon="mdi-eye" @click="viewItem(item)" color="success" />
                <VDivider vertical class="ms-2" inset>
                </VDivider>
                <VIcon size="20" icon="mdi-delete-outline" @click="deleteItem(item)" color="error" />
              </div>
            </template>
          </EasyDataTable>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>
