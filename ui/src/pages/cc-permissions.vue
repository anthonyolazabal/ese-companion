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
  name: "CCPermissions",
  data() {
    return {
      headers: [
        { text: "Permission", value: "permission_string", sortable: true },
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
      router.push('/cc-permissions-delete?id=' + val.id)
    },

    editItem: function (val: any) {
      router.push('/cc-permissions-edit?id=' + val.id)
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/cc_permissions')
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
          <RouterLink to="/cc-permissions">
            Control Center Permissions
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Control Center Permissions">
        <VCardItem>
          <VRow>
            <VCol cols="12" md="6">
              List of all control center permissions declared in the ESE database.
            </VCol>
            <VCol cols="12" md="6" class="text-right">
              <v-btn variant="outlined" size="small" to="/cc-permissions-add">
                New control center permission
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
              <div class="operation-wrapper" v-if="item.permission_string.startsWith('HIVEMQ_') != true">
                <VIcon size="20" icon="mdi-playlist-edit" @click="editItem(item)" color="secondary" />
                <VIcon size="20" icon="mdi-delete-outline" @click="deleteItem(item)" color="error" />
              </div>
              <div class="operation-wrapper" v-if="item.permission_string.startsWith('HIVEMQ_') == true">
                Not editable
              </div>
            </template>
          </EasyDataTable>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>
