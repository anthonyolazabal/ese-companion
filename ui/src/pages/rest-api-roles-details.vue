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

type Rest_Api_Role = {
  id?: number;
  name: string;
  description?: string;
  rest_api_role_permissions: Array<any>;
  created_at: Date;
  updated_at: Date;
};

type Rest_Api_Permission = {
  id: number;
  permission_string: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

export default {
  name: "DetailsRestApiRoles",
  data() {
    return {
      item: {} as Rest_Api_Role,
      permissions: [],
      addPermission: false,
      deletePermission: false,
      selectedPermission: { permission_string: "" } as Rest_Api_Permission,
      selectedPermissionToDelete: {} as Rest_Api_Permission
    }
  },
  methods: {
    formatDate(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
      }
    },

    cancel() {
      router.push('/rest-api-roles');
    },

    edit() {
      router.push('/rest-api-roles-edit?id=' + this.$route.query.id + "&return=details");
    },

    deleteRole() {
      router.push('/rest-api-roles-delete?id=' + this.$route.query.id);
    },

    async loadPermissions() {
      this.addPermission = true;
      await this.$axios
        .get('/api/rest_api_permissions')
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
          .post('/api/rest_api_role_permission', requestData)
          .then((response) => {
            createToast("Rest Api permission assigned successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            this.addPermission = false
          })
          .then(async () => {
            this.selectedPermission = { permission_string: "" } as Rest_Api_Permission
            await this.$axios
              .get('/api/rest_api_role/' + this.$route.query.id + '?extend=true')
              .then((response) => {
                this.item = response.data[0];
              })
              .catch((error) => {
                createToast("Error assigning permission, contact your admin ! Details : " + error.message, {
                  type: 'warning',
                  position: 'bottom-center',
                })
              });
          })
          .catch(() => {
            createToast("Error updating rest api role, contact your admin ! ", {
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
        .delete('/api/rest_api_role_permission/' + this.$route.query.id + "/" + this.selectedPermissionToDelete.id)
        .then((response) => {
          createToast("Rest Api permission unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deletePermission = false
        })
        .then(async () => {
          this.selectedPermissionToDelete = { permission_string: "" } as Rest_Api_Permission
          await this.$axios
            .get('/api/rest_api_role/' + this.$route.query.id + '?extend=true')
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
        .catch(() => {
          createToast("Error unassigning permission to rest api role, contact your admin ! ", {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_role/' + this.$route.query.id + '?extend=true')
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
          <RouterLink to="/rest-api-roles">
            Rest Api Roles
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/rest-api-roles-details?id' + $route.query.id">
            Role Details
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="12">
      <VCard title="Rest Api role details">
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
        <VRow v-for="permission in item.rest_api_role_permissions">
          <VCol cols="12" md="12">
            <VCardItem>
              <v-toolbar>
                <VCardSubtitle style="margin-left: 10px;">
                  <b>{{ permission.rest_api_permissions.permission_string.toUpperCase() }} </b>
                </VCardSubtitle>
                <VDivider />
                <v-btn icon color="#F05635">
                  <v-icon @click="deleteWarning(permission.rest_api_permissions)">mdi-delete</v-icon>
                </v-btn>
              </v-toolbar>
              <v-dialog v-model="deletePermission" width="auto">
                <v-card>
                  <v-card-text>
                    Are you sure that you want to remove the permission : {{ selectedPermissionToDelete.permission_string
                    }} ?
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="alert" @click="deleteAssignment()">Remove role</v-btn>
                    <v-btn color="secondary"
                      @click="deletePermission = false; selectedPermissionToDelete = {} as Rest_Api_Permission">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </VCardItem>
            <VCardText>
              <VRow>
                <VCol cols="12" md="12">
                  <i>{{ permission.rest_api_permissions.description }} </i>
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
                    <v-select v-model="selectedPermission" :items="permissions" item-title="permission_string"
                      item-value="id" v-bind:return-object="true" variant="outlined" placeholder="selectedRole"
                      :hint="`Description : ${selectedPermission.description}`" />
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