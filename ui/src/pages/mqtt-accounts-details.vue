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

type User = {
  id?: number;
  username?: string;
  password?: string;
  algorithm?: string;
  password_iterations?: number;
  password_salt?: string;
  created_at: Date;
  updated_at: Date;
  user_roles: Array<any>;
  user_permissions: Array<any>;
};

type Role = {
  id?: number;
  name: string;
  description?: string;
  role_permissions: Array<Permission>;
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
  name: "DetailsMQTTAccounts",
  data() {
    return {
      currentTab: ref('Roles'),
      item: {} as User,
      roles: [],
      addRole: false,
      deleteRole: false,
      selectedRole: { name: "" } as Role,
      selectedRoleToDelete: {} as Role,
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

    async update() {
      if (this.item.username && this.item.password) {
        await this.$axios
          .put('/api/user/' + this.$route.query.id, this.item)
          .then(() => {
            createToast("Accounts successfully updated", {
              type: 'success',
              position: 'bottom-center',
            })
          })
          .then(() => {
            this.item = {} as User
            router.push('/mqtt-users')
          })
          .catch(() => {
            createToast("Error updating accounts, contact your admin ! ", {
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
      router.push('/mqtt-accounts');
    },

    edit() {
      router.push('/mqtt-accounts-edit?id=' + this.$route.query.id + "&return=details");
    },

    deleteUser() {
      router.push('/mqtt-accounts-delete?id=' + this.$route.query.id);
    },

    async loadRoles() {
      this.addRole = true;
      await this.$axios
        .get('/api/roles')
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

    async assignRole() {
      if (this.selectedRole.id != null) {
        let requestData = {
          user_id: this.$route.query.id,
          role_id: this.selectedRole.id
        }
        await this.$axios
          .post('/api/user_role', requestData)
          .then((response) => {
            createToast("Role assigned successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            this.addRole = false
          })
          .then(async () => {
            this.selectedRole = { name: "" } as Role
            await this.$axios
              .get('/api/user/' + this.$route.query.id + '?extend=true')
              .then((response) => {
                this.item = response.data[0];
              })
              .catch((error) => {
                createToast("Error assigning role, contact your admin ! Details : " + error.message, {
                  type: 'warning',
                  position: 'bottom-center',
                })
              });
          })
          .catch(() => {
            createToast("Error updating accounts, contact your admin ! ", {
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

    async deleteRoleAssignment() {
      await this.$axios
        .delete('/api/user_role/' + this.$route.query.id + "/" + this.selectedRoleToDelete.id)
        .then(() => {
          createToast("Role unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deleteRole = false
        })
        .then(async () => {
          this.selectedRoleToDelete = { name: "" } as Role
          await this.$axios
            .get('/api/user/' + this.$route.query.id + '?extend=true')
            .then((response) => {
              this.item = response.data[0];
            })
            .catch((error) => {
              createToast("Error deleting role assignment, contact your admin ! Details : " + error.message, {
                type: 'warning',
                position: 'bottom-center',
              })
            });
        })
        .catch(() => {
          createToast("Error unassigning role to accounts, contact your admin ! ", {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    },

    async deletePermissionAssignment() {
      await this.$axios
        .delete('/api/user_permission/' + this.$route.query.id + "/" + this.selectedPermissionToDelete.id)
        .then(() => {
          createToast("Accounts permission unassigned successfully", {
            type: 'success',
            position: 'bottom-center',
          })
          this.deletePermission = false
        })
        .then(async () => {
          this.selectedPermissionToDelete = { topic: "" } as Permission
          await this.$axios
            .get('/api/user/' + this.$route.query.id + '?extend=true')
            .then((response) => {
              this.item = response.data[0];
            })
            .catch((error) => {
              createToast("Error deleting permission, contact your admin ! Details : " + error.message, {
                type: 'warning',
                position: 'bottom-center',
              })
            });
        })
        .catch(() => {
          createToast("Error unassigning accounts permission to user, contact your admin ! ", {
            type: 'warning',
            position: 'bottom-center',
          })
        });
    },

    async assignPermission() {
      if (this.selectedPermission.id != null) {
        let requestData = {
          user_id: this.$route.query.id,
          permission: this.selectedPermission.id
        }
        await this.$axios
          .post('/api/user_permission', requestData)
          .then((response) => {
            createToast("Accounts permission assigned successfully", {
              type: 'success',
              position: 'bottom-center',
            })
            this.addPermission = false
          })
          .then(async () => {
            this.selectedPermission = { topic: "" } as Permission
            await this.$axios
              .get('/api/user/' + this.$route.query.id + '?extend=true')
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
            createToast("Error updating accounts user, contact your admin ! ", {
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

    deletePermissionWarning(permission) {
      this.deletePermission = true
      this.selectedPermissionToDelete = permission;
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
  },
  async mounted() {
    await this.$axios
      .get('/api/user/' + this.$route.query.id + '?extend=true')
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
          <RouterLink to="/mqtt-accounts">
            MQTT Accounts
          </RouterLink>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider>
          /
        </v-breadcrumbs-divider>
        <v-breadcrumbs-item>
          <RouterLink :to="'/mqtt-accounts-details?id' + $route.query.id">
            User Details
          </RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
    <VCol cols="4">
      <VCard title="MQTT Account details">
        <VCardTitle class="text-center">
          <VAvatar color="primary" icon="mdi-devices" size="x-large" />
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
              <b>Last updated </b>
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
            <VRow v-for="role in item.user_roles">
              <VCol cols="12" md="12">
                <VCardItem>
                  <v-toolbar>
                    <VCardSubtitle style="margin-left: 10px;">
                      <b>{{ role.roles.name.toUpperCase() }}</b> ({{ role.roles.description }})
                    </VCardSubtitle>
                    <VDivider />
                    <v-btn icon color="#F05635">
                      <v-icon @click="deleteRoleWarning(role.roles)">mdi-delete</v-icon>
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
                          @click="deleteRole = false; selectedRoleToDelete = {} as Role">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCardItem>
                <VCardText>
                  <VRow>
                    <VCol cols="12" md="4">
                      <b>Topic</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>Pub</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>Sub</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>QOS 0</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>QOS 1</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>QOS 2</b>
                    </VCol>

                    <VCol cols="12" md="1">
                      <b>Retain</b>
                    </VCol>

                    <VCol cols="12" md="2">
                      <b>Shared</b>
                    </VCol>
                  </VRow>
                </VCardText>

                <VCardText v-for="permission in role.roles.role_permissions">
                  <VRow>
                    <VDivider />
                    <VCol cols="12" md="4">
                      {{ permission.permissions.topic }}
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.publish_allowed == true">
                        <VChip color="success" size="small">
                          Pub
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.publish_allowed == false">
                        <VChip color="error" size="small">
                          Pub
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.subscribe_allowed == true">
                        <VChip color="success" size="small">
                          Sub
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.subscribe_allowed == false">
                        <VChip color="error" size="small">
                          Sub
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.qos_0_allowed == true">
                        <VChip color="success" size="small">
                          Yes
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.qos_0_allowed == false">
                        <VChip color="error" size="small">
                          No
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.qos_1_allowed == true">
                        <VChip color="success" size="small">
                          Yes
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.qos_1_allowed == false">
                        <VChip color="error" size="small">
                          No
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.qos_2_allowed == true">
                        <VChip color="success" size="small">
                          Yes
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.qos_2_allowed == false">
                        <VChip color="error" size="small">
                          No
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="1">
                      <div v-if="permission.permissions.retained_msgs_allowed == true">
                        <VChip color="success" size="small">
                          Yes
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.retained_msgs_allowed == false">
                        <VChip color="error" size="small">
                          No
                        </VChip>
                      </div>
                    </VCol>

                    <VCol cols="12" md="2">
                      <div v-if="permission.permissions.shared_sub_allowed == true">
                        <VChip color="success" size="small">
                          Yes
                        </VChip>
                      </div>
                      <div v-if="permission.permissions.shared_sub_allowed == false">
                        <VChip color="error" size="small">
                          No
                        </VChip>
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VCardItem>
                  <v-btn variant="outlined" size="small" @click="loadRoles()">
                    Assign new role
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
          <VCard style="margin-top: 10px;">
            <VRow v-for="permission in item.user_permissions">
              <VCol cols="12" md="12">
                <VCardItem>
                  <v-toolbar>
                    <VCardSubtitle style="margin-left: 10px;">
                      <b>{{ permission.permissions.topic.toUpperCase() }} </b>
                    </VCardSubtitle>
                    <VDivider />
                    <v-btn icon color="#F05635">
                      <v-icon @click="deletePermissionWarning(permission.permissions)">mdi-delete</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-dialog v-model="deletePermission" width="auto">
                    <v-card>
                      <v-card-text>
                        Are you sure that you want to remove the permission : {{ selectedPermissionToDelete.topic }} ?
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="alert" @click="deletePermissionAssignment()">Remove role</v-btn>
                        <v-btn color="secondary"
                          @click="deletePermission = false; selectedPermissionToDelete = {} as Permission">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCardItem>
                <VCardText>
                  <VRow>
                    <VCol cols="12" md="12">
                      <v-chip variant="outlined" pill v-if="permission.permissions.publish_allowed == true"
                        color="success">
                        Publish </v-chip>
                      <v-chip variant="outlined" pill v-if="permission.permissions.publish_allowed == false"
                        color="error">
                        Publish </v-chip>

                      <v-chip variant="outlined" pill v-if="permission.permissions.subscribe_allowed == true"
                        color="success" style="margin-left: 10px;"> Subscribe </v-chip>
                      <v-chip variant="outlined" pill v-if="permission.permissions.subscribe_allowed == false"
                        color="error" style="margin-left: 10px;"> Subscribe </v-chip>

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

                      <v-chip variant="outlined" pill v-if="permission.permissions.shared_sub_allowed == true"
                        color="success" style="margin-left: 10px;"> Shared </v-chip>
                      <v-chip variant="outlined" pill v-if="permission.permissions.shared_sub_allowed == false"
                        color="error" style="margin-left: 10px;"> Shared </v-chip>
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
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>