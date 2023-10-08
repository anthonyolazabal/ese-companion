<script lang="ts">
import router from '@/router';
import type { AxiosInstance } from 'axios'
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'
import moment from 'moment';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

type Role = {
  id?: number;
  name: string;
  description?: string;
  role_permissions: Array<any>;
  created_at: Date;
  updated_at: Date;
};

type Permission = {
  id: number;
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
  name: "DetailsMQTTRoles",
  data() {
    return {
      item: {} as Role,
      permissions: [],
      addPermission: false,
      deletePermission: false,
      selectedPermission: { topic: "" } as Permission,
      selectedPermissionToDelete: {} as Permission
    }
  },
  methods: {
    formatDate(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
      }
    },

    cancel() {
      router.push('/mqtt-roles');
    },

    edit() {
      router.push('/mqtt-roles-edit?id=' + this.$route.query.id + "&return=details");
    },

    deleteRole() {
      router.push('/mqtt-roles-delete?id=' + this.$route.query.id);
    },

    async loadPermissions() {
      this.addPermission = true;
      await this.$axios
        .get('/api/permissions')
        .then((response) => {
          this.permissions = response.data;
        })
        .catch((error) => {
          createToast("Error loading permissions, contact your admin ! Details : " + error.message, {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    },

    async assignPermission() {
      if (this.selectedPermission.id != null) {
        let requestData = {
          role: this.$route.query.id,
          permission: this.selectedPermission.id
        }
        await this.$axios
          .post('/api/role_permission', requestData)
          .then((response) => {
            createToast("Permission assigned successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            this.addPermission = false
          })
          .then(async () => {
            this.selectedPermission = { topic: "" } as Permission
            await this.$axios
              .get('/api/role/' + this.$route.query.id + '?extend=true')
              .then((response) => {
                this.item = response.data[0];
              })
              .catch((error) => {
                createToast("Error refreshing the page, contact your admin ! Details : " + error.message, {
                  type: 'warning',
                  position: 'bottom-center',
                })
              });
          })
          .catch((error) => {
            createToast("Error loading the page, contact your admin ! Details : " + error.message, {
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

    deleteWarning(permission) {
      this.deletePermission = true
      this.selectedPermissionToDelete = permission;
    },

    async deleteAssignment() {
      await this.$axios
        .delete('/api/role_permission/' + this.$route.query.id + "/" + this.selectedPermissionToDelete.id)
        .then((response) => {
          createToast("Permission unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deletePermission = false
        })
        .then(async () => {
          this.selectedPermissionToDelete = { topic: "" } as Permission
          await this.$axios
            .get('/api/role/' + this.$route.query.id + '?extend=true')
            .then((response) => {
              this.item = response.data[0];
            })
            .catch((error) => {
              createToast("Error deleting assignment, contact your admin ! Details : " + error.message, {
                type: 'warning',
                position: 'bottom-center',
              })
            });
        })
        .catch((error) => {
          createToast("Error loading the page, contact your admin ! Details : " + error.message, {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/role/' + this.$route.query.id + '?extend=true')
      .then((response) => {
        this.item = response.data[0];
      })
      .catch((error) => {
        createToast("Error loading the page, contact your admin ! Details : " + error.message, {
          type: 'warning',
          position: 'bottom-center',
        })
      });
  }
}

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
          <RouterLink :to="'/mqtt-roles-details?id' + $route.query.id">
            Role Details
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="MQTT role details">
        <VCardItem>
          <VRow style="margin-top: 2px;">
            <!-- 👉 Name -->
            <VCol cols="12" md="6">
              <VRow>
                <VCol cols="12" md="6">
                  <b>Name </b>
                </VCol>
                <VCol cols="12" md="6">
                  {{ item.name }}
                </VCol>
              </VRow>

              <VRow>
                <VCol cols="12" md="6">
                  <b>Description </b>
                </VCol>
                <VCol cols="12" md="6">
                  {{ item.description }}
                </VCol>
              </VRow>

            </VCol>

            <!-- 👉 Created -->
            <VCol cols="12" md="6">
              <VRow>
                <VCol cols="12" md="6">
                  <b>Created </b>
                </VCol>
                <VCol cols="12" md="6" class="text-right">
                  {{ formatDate(item.created_at) }}
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="6">
                  <b>Last updated </b>
                </VCol>
                <VCol cols="12" md="6" class="text-right">
                  {{ formatDate(item.updated_at) }}
                </VCol>
              </VRow>

            </VCol>


          </VRow>
        </VCardItem>
        <v-card-actions>
          <VBtn color="secondary" variant="tonal" @click="cancel">
            Back to role list
          </VBtn>
          <VDivider class="border-opacity-0" />
          <VBtn color="primary" variant="tonal" @click="edit">
            Edit role properties
          </VBtn>
          <VDivider class="border-opacity-0" />
          <VBtn color="error" variant="tonal" @click="deleteRole">
            Delete role
          </VBtn>
        </v-card-actions>
      </VCard>

      <VCard title="Assigned permissions" style="margin-top: 10px;">
        <VRow v-for="permission in item.role_permissions">
          <VCol cols="12" md="12">
            <VCardItem>
              <v-toolbar>
                <VCardSubtitle style="margin-left: 10px;">
                  <b>{{ permission.permissions.topic.toUpperCase() }} </b>
                </VCardSubtitle>
                <VDivider />
                <v-btn icon color="#F05635">
                  <v-icon @click="deleteWarning(permission.permissions)">mdi-delete</v-icon>
                </v-btn>
              </v-toolbar>
              <v-dialog v-model="deletePermission" width="auto">
                <v-card>
                  <v-card-text>
                    Are you sure that you want to remove the permission : {{ selectedPermissionToDelete.topic }} ?
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="alert" @click="deleteAssignment()">Remove role</v-btn>
                    <v-btn color="secondary"
                      @click="deletePermission = false; selectedPermissionToDelete = {} as Permission">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </VCardItem>
            <VCardText>
              <VRow>
                <VCol cols="12" md="12">
                  <v-chip variant="outlined" pill v-if="permission.permissions.publish_allowed == true" color="success">
                    Publish </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.publish_allowed == false" color="error">
                    Publish </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.subscribe_allowed == true" color="success"
                    style="margin-left: 10px;"> Subscribe </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.subscribe_allowed == false" color="error"
                    style="margin-left: 10px;"> Subscribe </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.retained_msgs_allowed == true"
                    color="success" style="margin-left: 10px;"> Retain </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.retained_msgs_allowed == false"
                    color="error" style="margin-left: 10px;"> Retain </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_0_allowed == true" color="success"
                    style="margin-left: 10px;"> QOS 0 </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_0_allowed == false" color="error"
                    style="margin-left: 10px;"> QOS 0 </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_1_allowed == true" color="success"
                    style="margin-left: 10px;"> QOS 1 </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_1_allowed == false" color="error"
                    style="margin-left: 10px;"> QOS 1 </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_2_allowed == true" color="success"
                    style="margin-left: 10px;"> QOS 2 </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.qos_2_allowed == false" color="error"
                    style="margin-left: 10px;"> QOS 2 </v-chip>

                  <v-chip variant="outlined" pill v-if="permission.permissions.shared_sub_allowed == true" color="success"
                    style="margin-left: 10px;"> Shared </v-chip>
                  <v-chip variant="outlined" pill v-if="permission.permissions.shared_sub_allowed == false" color="error"
                    style="margin-left: 10px;"> Shared </v-chip>
                </VCol>
              </VRow>
            </VCardText>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <VCardItem>
              <v-btn variant="outlined" size="small" @click="loadPermissions()">
                Assign new permission
              </v-btn>
              <v-dialog v-model="addPermission" width="auto">
                <v-card>
                  <v-card-text>
                    Pick the permission to assign to role
                  </v-card-text>
                  <v-card-text>
                    <v-select v-model="selectedPermission" :items="permissions" item-title="topic" item-value="id"
                      v-bind:return-object="true" variant="outlined" placeholder="selectedRole"
                      :hint="`Publish : ${selectedPermission.publish_allowed} - Subscribe : ${selectedPermission.subscribe_allowed}`" />
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="assignPermission">Assign permission</v-btn>
                    <v-btn color="secondary" @click="addPermission = false">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </VCardItem>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>