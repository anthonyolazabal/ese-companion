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

type Rest_Api_User = {
  id?: number;
  username?: string;
  password?: string;
  algorithm?: string;
  password_iterations?: number;
  password_salt?: string;
  created_at: Date;
  updated_at: Date;
  cc_user_roles: Array<any>;
};

type Rest_Api_Role = {
  id?: number;
  name: string;
  description?: string;
  role_permissions: Array<any>;
  created_at: Date;
  updated_at: Date;
};

type Rest_Api_Permission = {
  id: number;
  permission_string: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
};

export default {
  name: "DetailsRestApiUsers",
  data() {
    return {
      currentTab: ref('Roles'),
      item: {} as Rest_Api_User,
      roles: [],
      addRole: false,
      deleteRole: false,
      selectedRole: { name: "" } as Rest_Api_Role,
      selectedRoleToDelete: {} as Rest_Api_Role,
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

    async update() {
      if (this.item.username && this.item.password) {
        await this.$axios
          .put('/api/rest_api_user/' + this.$route.query.id, this.item)
          .then(() => {
            createToast("Rest Api user successfully updated", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => {
            this.item = {} as Rest_Api_User
            router.push('/rest-api-users')
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
      router.push('/rest-api-users');
    },

    edit() {
      router.push('/rest-api-users-edit?id=' + this.$route.query.id + "&return=details");
    },

    deleteUser() {
      router.push('/rest-api-users-delete?id=' + this.$route.query.id);
    },

    async loadRoles() {
      this.addRole = true;
      await this.$axios
        .get('/api/rest_api_roles')
        .then((response) => {
          this.roles = response.data;
        })
        .catch((error) => {
          createToast("Error loading roles, contact your admin ! Details : " + error.message, {
            type: 'warning',
            position: 'bottom-center',
          })
        });
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

    async assignRole() {
      if (this.selectedRole.id != null) {
        let requestData = {
          user_id: this.$route.query.id,
          role_id: this.selectedRole.id
        }
        await this.$axios
          .post('/api/rest_api_user_role', requestData)
          .then((response) => {
            createToast("Rest Api role assigned successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            this.addRole = false
          })
          .then(async () => {
            this.selectedRole = { name: "" } as Rest_Api_Role
            await this.$axios
              .get('/api/rest_api_user/' + this.$route.query.id + '?extend=true')
              .then((response) => {
                this.item = response.data[0];
              })
              .catch((error) => {
                createToast("Error on assignment, contact your admin ! Details : " + error.message, {
                  type: 'warning',
                  position: 'bottom-center',
                })
              });
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

    async assignPermission() {
      if (this.selectedPermission.id != null) {
        let requestData = {
          user_id: this.$route.query.id,
          permission: this.selectedPermission.id
        }
        await this.$axios
          .post('/api/rest_api_user_permission', requestData)
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
              .get('/api/rest_api_user/' + this.$route.query.id + '?extend=true')
              .then((response) => {
                this.item = response.data[0];
              })
              .catch((error) => {
                createToast("Error on assignment, contact your admin ! Details : " + error.message, {
                  type: 'warning',
                  position: 'bottom-center',
                })
              });
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

    deleteRoleWarning(role) {
      this.deleteRole = true
      this.selectedRoleToDelete = role;
    },

    deletePermissionWarning(permission) {
      this.deletePermission = true
      this.selectedPermissionToDelete = permission;
    },

    async deleteRoleAssignment() {
      await this.$axios
        .delete('/api/rest_api_user_role/' + this.$route.query.id + "/" + this.selectedRoleToDelete.id)
        .then(() => {
          createToast("Rest Api role unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deleteRole = false
        })
        .then(async () => {
          this.selectedRoleToDelete = { name: "" } as Rest_Api_Role
          await this.$axios
            .get('/api/rest_api_user/' + this.$route.query.id + '?extend=true')
            .then((response) => {
              this.item = response.data[0];
            })
            .catch((error) => {
              createToast("Error on delete, contact your admin ! Details : " + error.message, {
                type: 'warning',
                position: 'bottom-center',
              })
            });
        })
        .catch(() => {
          createToast("Error unassigning rest api role to user, contact your admin ! ", {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    },
    async deletePermissionAssignment() {
      await this.$axios
        .delete('/api/rest_api_user_permission/' + this.$route.query.id + "/" + this.selectedPermissionToDelete.id)
        .then(() => {
          createToast("Rest Api permission unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deletePermission = false
        })
        .then(async () => {
          this.selectedPermissionToDelete = { permission_string: "" } as Rest_Api_Permission
          await this.$axios
            .get('/api/rest_api_user/' + this.$route.query.id + '?extend=true')
            .then((response) => {
              this.item = response.data[0];
            })
            .catch((error) => {
              createToast("Error on delete, contact your admin ! Details : " + error.message, {
                type: 'warning',
                position: 'bottom-center',
              })
            });
        })
        .catch(() => {
          createToast("Error unassigning rest api permission to user, contact your admin ! ", {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/rest_api_user/' + this.$route.query.id + '?extend=true')
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
          <RouterLink to="/rest-api-users">
            Rest Api Users
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/rest-api-users-details?id' + $route.query.id">
            User Details
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="4">
      <VCard title="Rest Api user details">
        <VCardTitle class="text-center">
          <VAvatar color="primary" icon="mdi-account" size="x-large" />
        </VCardTitle>
        <VCardItem>
          <!-- 👉 Username -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Username </b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              {{ item.username }}
            </VCol>
          </VRow>

          <!-- 👉 Password -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Password </b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              ******************
            </VCol>
          </VRow>

          <!-- 👉 Algorithm -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Algorithm </b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              {{ item.algorithm }}
            </VCol>
          </VRow>

          <!-- 👉 Password iterations -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Iterations </b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              {{ item.password_iterations }}
            </VCol>
          </VRow>

          <!-- 👉 Created -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Created </b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              {{ formatDate(item.created_at) }}
            </VCol>
          </VRow>

          <!-- 👉 Updated -->
          <VRow>
            <VCol cols="12" md="4">
              <b>Updated</b>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              {{ formatDate(item.updated_at) }}
            </VCol>
          </VRow>
        </VCardItem>
        <VCardItem>
          <VRow>
            <VCol cols="12" md="12">
              <VBtn color="secondary" variant="tonal" @click="cancel" block>
                Back to role list
              </VBtn>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="12">
              <VBtn color="primary" variant="tonal" @click="edit" block>
                Edit user properties
              </VBtn>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="12">
              <VBtn color="error" variant="tonal" @click="deleteUser" block>
                Delete user
              </VBtn>
            </VCol>
          </VRow>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="8">
      <VTabs align-tabs="center" v-model="currentTab" grow>
        <VTab value="Roles">
          <VIcon icon="mdi-key-link" />
          Assigned Roles
        </VTab>
        <VTab value="Permissions">
          <VIcon icon="mdi-key" />
          Direct permissions
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab" class="mt-5">
        <VWindowItem value="Roles">
          <VCard>
            <VRow v-for="role in item['rest_api_user_roles']">
              <VCol cols="12" md="12">
                <VCardItem>
                  <v-toolbar>
                    <VCardSubtitle style="margin-left: 10px;">
                      <b>{{ role.rest_api_roles.name.toUpperCase() }}</b> ({{ role.rest_api_roles.description }})
                    </VCardSubtitle>
                    <VDivider />
                    <v-btn icon color="#F05635">
                      <v-icon @click="deleteRoleWarning(role.rest_api_roles)">mdi-delete</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-dialog v-model="deleteRole" width="auto">
                    <v-card>
                      <v-card-text>
                        Are you sure that you want to remove the assignment of {{ selectedRoleToDelete.name }} ?
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="alert" @click="deleteRoleAssignment()">Remove role</v-btn>
                        <v-btn color="secondary"
                          @click="deleteRole = false; selectedRoleToDelete = {} as Rest_Api_Role">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCardItem>
                <VCardText>
                  <VRow>
                    <VCol cols="12" md="4">
                      <b>Permission</b>
                    </VCol>

                    <VCol cols="12" md="8">
                      <b>Description</b>
                    </VCol>
                  </VRow>
                </VCardText>

                <VCardText v-for="permission in role.rest_api_roles.rest_api_role_permissions">
                  <VRow>
                    <VDivider />
                    <VCol cols="12" md="4">
                      {{ permission.rest_api_permissions.permission_string }}
                    </VCol>

                    <VCol cols="12" md="8">
                      {{ permission.rest_api_permissions.description }}
                    </VCol>
                  </VRow>
                </VCardText>
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VCardItem>
                  <v-btn variant="outlined" size="small" @click="loadRoles()">
                    Assign new rest api role
                  </v-btn>
                  <v-dialog v-model="addRole" width="auto">
                    <v-card>
                      <v-card-text>
                        Pick the role to assign to user
                      </v-card-text>
                      <v-card-text>
                        <v-select v-model="selectedRole" :items="roles" item-title="name" item-value="id"
                          v-bind:return-object="true" variant="outlined" placeholder="selectedRole"
                          :hint="`${selectedRole.description}`" />
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="primary" @click="assignRole">Assign role</v-btn>
                        <v-btn color="secondary" @click="addRole = false">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCardItem>
              </VCol>
            </VRow>
          </VCard>
        </VWindowItem>


        <VWindowItem value="Permissions">
          <VCard>
            <VRow v-for="permission in item['rest_api_user_permissions']">
              <VCol cols="12" md="12">
                <VCardItem>
                  <v-toolbar>
                    <VCardSubtitle style="margin-left: 10px;">
                      {{ permission.rest_api_permissions.permission_string.toUpperCase() }}
                    </VCardSubtitle>

                    <VDivider />
                    <v-btn icon color="#F05635">
                      <v-icon @click="deletePermissionWarning(permission.rest_api_permissions)">mdi-delete</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <VCardText>
                    {{ permission.rest_api_permissions.description }}
                  </VCardText>
                  <v-dialog v-model="deletePermission" width="auto">
                    <v-card>
                      <v-card-text>
                        Are you sure that you want to remove the assignment of {{
                          selectedPermissionToDelete.permission_string
                        }} ?
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="alert" @click="deletePermissionAssignment()">Remove role</v-btn>
                        <v-btn color="secondary"
                          @click="deletePermission = false; selectedPermissionToDelete = {} as Rest_Api_Permission">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCardItem>
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VCardItem>
                  <v-btn variant="outlined" size="small" @click="loadPermissions()">
                    Assign new rest api permission
                  </v-btn>
                  <v-dialog v-model="addPermission" width="auto">
                    <v-card>
                      <v-card-text>
                        Pick the permission to assign to user
                      </v-card-text>
                      <v-card-text>
                        <v-select v-model="selectedPermission" :items="permissions" item-title="permission_string"
                          item-value="id" v-bind:return-object="true" variant="outlined" placeholder="selectedRole"
                          :hint="`${selectedPermission.description}`" />
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
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>