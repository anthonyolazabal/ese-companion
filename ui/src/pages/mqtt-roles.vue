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
  name: "MQTTRoles",
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
      router.push('/mqtt-roles-delete?id=' + val.id)
    },

    viewItem: function (val: any) {
      router.push('/mqtt-roles-details?id=' + val.id)
    },

    editItem: function (val: any) {
      router.push('/mqtt-roles-edit?id=' + val.id)
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/roles')
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
          <RouterLink to="/mqtt-roles">
            MQTT Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Roles">
        <VCardItem>
          <VRow>
            <VCol cols="12" md="6">
              List of all MQTT Roles declared in the ESE database.
            </VCol>
            <VCol cols="12" md="6" class="text-right">
              <v-btn variant="outlined" size="small" to="/mqtt-roles-add">
                New Role
              </v-btn>
            </VCol>
          </VRow>
        </VCardItem>
        <VCardItem>
          <EasyDataTable theme-color="#ffc000" buttons-pagination :headers="headers" :items="items" :loading="loading"
            table-class-name="customize-table" sort-by="id">
            <template #loading>
              <img src="@/assets/images/loading-bee.webp" style="width: 6.25rem; height: 6.25rem" alt="Bee" />
            </template>
            <template #item-algorithm="{ algorithm }">
              <div>
                <v-btn variant="text" size="small">
                  {{ algorithm }}
                </v-btn>
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
