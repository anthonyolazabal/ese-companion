<script lang="ts">
import router from '@/router';
import type { AxiosInstance } from 'axios'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

export default {
  name: "MQTTPermissions",
  data() {
    return {
      headers: [
        { text: "Topic", value: "topic", sortable: true },
        { text: "Publish", value: "publish_allowed" },
        { text: "Subscribe", value: "subscribe_allowed", sortable: true },
        { text: "QOS 0", value: "qos_0_allowed", sortable: true },
        { text: "QOS 1", value: "qos_1_allowed", sortable: true },
        { text: "QOS 2", value: "qos_2_allowed", sortable: true },
        { text: "Retain", value: "retained_msgs_allowed", sortable: true },
        { text: "Shared", value: "shared_sub_allowed", sortable: true },
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
    deleteItem(val: any) {
      router.push('/mqtt-permissions-delete?id=' + val.id)
    },

    editItem: function (val: any) {
      router.push('/mqtt-permissions-edit?id=' + val.id)
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/permissions')
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
          <RouterLink to="/mqtt-permissions">
            MQTT Permissions
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Permissions">
        <VCardItem>
          <VRow>
            <VCol cols="12" md="6">
              List of all MQTT Permissions declared in the ESE database.
            </VCol>
            <VCol cols="12" md="6" class="text-right">
              <v-btn variant="outlined" size="small" to="/mqtt-permissions-add">
                New Permission
              </v-btn>
            </VCol>
          </VRow>
        </VCardItem>
        <VCardItem>
          <EasyDataTable theme-color="#ffc000" buttons-pagination :headers="headers" :items="items" :loading="loading"
            table-class-name="customize-table" sort-by="id">
            <template #loading>
              <img src="@/assets/images/database-table.gif" style="width: 6.25rem; height: 6.25rem" alt="loader" />
            </template>
            <template #item-publish_allowed="{ publish_allowed }">
              <div v-if="publish_allowed == true">
                <VChip color="success" size="small">
                  Allowed
                </VChip>
              </div>
              <div v-if="publish_allowed == false">
                <VChip color="error" size="small">
                  Denied
                </VChip>
              </div>
            </template>
            <template #item-subscribe_allowed="{ subscribe_allowed }">
              <div v-if="subscribe_allowed == true">
                <VChip color="success" size="small">
                  Allowed
                </VChip>
              </div>
              <div v-if="subscribe_allowed == false">
                <VChip color="error" size="small">
                  Denied
                </VChip>
              </div>
            </template>
            <template #item-qos_0_allowed="{ qos_0_allowed }">
              <div v-if="qos_0_allowed == true">
                <VChip color="success" size="small">
                  OK
                </VChip>
              </div>
              <div v-if="qos_0_allowed == false">
                <VChip color="error" size="small">
                  KO
                </VChip>
              </div>
            </template>
            <template #item-qos_1_allowed="{ qos_1_allowed }">
              <div v-if="qos_1_allowed == true">
                <VChip color="success" size="small">
                  OK
                </VChip>
              </div>
              <div v-if="qos_1_allowed == false">
                <VChip color="error" size="small">
                  KO
                </VChip>
              </div>
            </template>
            <template #item-qos_2_allowed="{ qos_2_allowed }">
              <div v-if="qos_2_allowed == true">
                <VChip color="success" size="small">
                  OK
                </VChip>
              </div>
              <div v-if="qos_2_allowed == false">
                <VChip color="error" size="small">
                  KO
                </VChip>
              </div>
            </template>
            <template #item-retained_msgs_allowed="{ retained_msgs_allowed }">
              <div v-if="retained_msgs_allowed == true">
                <VChip color="success" size="small">
                  Allowed
                </VChip>
              </div>
              <div v-if="retained_msgs_allowed == false">
                <VChip color="error" size="small">
                  Denied
                </VChip>
              </div>
            </template>
            <template #item-shared_sub_allowed="{ shared_sub_allowed }">
              <div v-if="shared_sub_allowed == true">
                <VChip color="success" size="small">
                  Allowed
                </VChip>
              </div>
              <div v-if="shared_sub_allowed == false">
                <VChip color="error" size="small">
                  Denied
                </VChip>
              </div>
            </template>
            <template #item-operation="item">
              <div class="operation-wrapper">
                <VIcon size="20" icon="mdi-playlist-edit" @click="editItem(item)" color="secondary" />
                <VIcon size="20" icon="mdi-delete-outline" @click="deleteItem(item)" color="error" />
              </div>
            </template>
          </EasyDataTable>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>
