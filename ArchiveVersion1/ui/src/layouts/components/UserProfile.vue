<script setup lang="ts">
import router from '@/router'
import avatar from '@/assets/user.png';
import { userStore } from '../../plugins/auth/userStore'
import type { Anchor } from 'vuetify/lib/components'


const avatarBadgeProps = {
  dot: true,
  location: 'bottom right' as Anchor,
  offsetX: 3,
  offsetY: 3,
  color: 'success',
  bordered: true,
}

function logout(){
  router.push('/');
}

const store = userStore()

</script>

<template>
  <VBadge v-bind="avatarBadgeProps">
    <VAvatar style="cursor: pointer;" color="primary" variant="tonal">
      <VImg :src="avatar" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge v-bind="avatarBadgeProps">
                  <VAvatar color="primary" size="36" variant="tonal">
                    <VImg :src="avatar" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ store.getUsername() }}
            </VListItemTitle>
            <VListItemSubtitle class="text-disabled">
              Admin
            </VListItemSubtitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
