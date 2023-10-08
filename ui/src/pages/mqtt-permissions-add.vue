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

type Permission = {
  id?: number;
  topic: string;
  publish_allowed: boolean;
  subscribe_allowed: boolean;
  qos_0_allowed: boolean;
  qos_1_allowed: boolean;
  qos_2_allowed: boolean;
  retained_msgs_allowed: boolean;
  shared_sub_allowed: boolean;
  shared_group: string;
  created_at: Date;
  updated_at: Date;
};

export default {
  name: "AddMQTTPermissions",
  data() {
    return {
      item: {
        publish_allowed: false,
        subscribe_allowed: false,
        qos_0_allowed: false,
        qos_1_allowed: false,
        qos_2_allowed: false,
        retained_msgs_allowed: false,
        shared_sub_allowed: false,
      } as Permission,
      loading: false
    }
  },
  methods: {
    async submit() {
      this.loading = true
      if (this.item.topic) {
        await this.$axios
          .post('/api/permission', this.item)
          .then((response) => {
            createToast("Permission created successfully", {
              type: 'success',
              position: 'bottom-center',
            })
          }).then(() => router.push('/mqtt-permissions'))
          .catch((error) => {
            createToast("Error submitting request, contact your admin ! Details : " + error.message, {
              type: 'warning',
              position: 'bottom-center',
            })
            this.loading = false
          });
      } else {
        createToast("Please fill all fields ! ", {
          type: 'warning',
          position: 'bottom-center',
        })
        this.loading = false
      }
    },

    cancel() {
      router.push('/mqtt-permissions');
    },
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
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/mqtt-permissions-add'">
            Add Permission
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Create a new permission">
        <VCardItem>
          <VForm>
            <VRow style="margin-top: 2px;">
              <!-- 👉 Topic -->
              <VCol cols="12" md="12" class="d-flex gap-4">

                <VTextField v-model="item.topic" label="topic" placeholder="topic" />
              </VCol>
            </VRow>

            <VRow style="margin-top: 2px;">

              <!-- 👉 Publish -->
              <VCol cols="12" md="4" style="margin-left: 5px;">
                <v-switch label="Publish allowed" v-model="item.publish_allowed">
                </v-switch>
              </VCol>

              <VCol cols="12" md="4" style="margin-left: 5px;">
                <!-- 👉 Subscribe -->

                <v-switch label="Subscribe allowed" v-model="item.subscribe_allowed">
                </v-switch>
              </VCol>
              <VCol cols="12" md="3" style="margin-left: 5px;">
                <!-- 👉 Retain -->

                <v-switch label="Retain allowed" v-model="item.retained_msgs_allowed">
                </v-switch>
              </VCol>
            </VRow>
            <VRow style="margin-top: 2px;">
              <VCol cols="12" class="d-flex gap-4"></VCol>
              <VDivider />
              <!-- 👉 QOS 0 -->
              <VCol cols="12" md="4" style="margin-left: 5px;">
                <v-switch label="QOS 0 allowed" v-model="item.qos_0_allowed">
                </v-switch>
              </VCol>
              <VCol cols="12" md="4" style="margin-left: 5px;">
                <!-- 👉 QOS1 -->

                <v-switch label="QOS 1 allowed" v-model="item.qos_1_allowed">
                </v-switch>
              </VCol>
              <VCol cols="12" md="3" style="margin-left: 5px;">
                <!-- 👉 QOS 2 -->

                <v-switch label="QOS 2 allowed" v-model="item.qos_2_allowed">
                </v-switch>
              </VCol>

              <VDivider />

            </VRow>

            <VRow style="margin-top: 2px;">
              <VCol cols="12" class="d-flex gap-4"></VCol>
              <VCol cols="12" md="4" style="margin-left: 5px;">
                <!-- 👉 Shared Sub Allow -->

                <v-switch label="Shared Sub Allowed" v-model="item.shared_sub_allowed">
                </v-switch>
              </VCol>

              <!-- 👉 Shared group -->
              <VCol cols="12" md="7" class="d-flex gap-4">

                <VTextField v-model="item.shared_group" label="Shared Group" placeholder="sharedgroup" />
              </VCol>
              <VCol cols="12" class="d-flex gap-4">
                <VBtn color="primary" @click="submit" :loading="loading">
                  Create
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
