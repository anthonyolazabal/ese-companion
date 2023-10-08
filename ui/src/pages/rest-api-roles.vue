<script lang="ts">
import router from '@/router';
import type { AxiosInstance } from 'axios'
import moment from 'moment';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

export default {
  name: "RestApiRoles",
  data() {
    return {
      headers: [
        { text: "Name", value: "name", sortable: true },
        { text: "Description", value: "description" },
        { text: "Created", value: "created_at", sortable: true },
        { text: "Last Updated", value: "updated_at", sortable: true },
        { text: "Operations", value: "operation" },
      ],
      itemsSelected: [],
      items: [],
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
      router.push('/rest-api-roles-delete?id=' + val.id)
    },

    viewItem: function (val: any) {
      router.push('/rest-api-roles-details?id=' + val.id)
    },
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_roles')
      .then((response) => {
        this.items = response.data;
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
          <RouterLink to="/rest-api-roles">
            Rest Api Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Rest Api Roles">
        <VCardItem>
          <VRow>
            <VCol cols="12" md="6">
              List of all rest api roles declared in the ESE database.
            </VCol>
            <VCol cols="12" md="6" class="text-right">
              <v-btn variant="outlined" size="small" to="/rest-api-roles-add">
                New rest api role
              </v-btn>
            </VCol>
          </VRow>
        </VCardItem>
        <VCardItem>
          <EasyDataTable theme-color="#ffc000" table-class-name="customize-table" buttons-pagination :headers="headers"
            :items="items" :loading="loading" sort-by="id">
            <template #loading>
              <img src="@/assets/images/database-table.gif" style="width: 6.25rem; height: 6.25rem" alt="loader" />
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
