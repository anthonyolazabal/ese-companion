<script setup lang="ts">
import logo from '@/assets/logo.png';
import { VerticalNavLink, VerticalNavSectionTitle } from '@layouts';
import { useTheme } from 'vuetify';

const vuetifyTheme = useTheme()

</script>

<template>
  <!-- 👉 Nav header -->
  <div class="nav-header">
    <RouterLink to="/" class="app-logo d-flex align-center gap-x-3 app-title-wrapper">
      <VImg :src="logo" style="height: 4rem;" />

      <Transition name="vertical-nav-app-title">
        <h1 class="font-weight-semibold leading-normal text-xl text-uppercase">
          ESE Companion
        </h1>
      </Transition>
    </RouterLink>
  </div>

  <!-- 👉 Nav items -->
  <ul>
    <VerticalNavLink :item="{
      title: 'Home',
      to: 'index',
      icon: { icon: 'mdi-home-outline' }
    }" />
    <!-- 👉 MQTT -->
    <VerticalNavSectionTitle :item="{ heading: 'MQTT' }" />
    <VerticalNavLink :item="{
      title: 'Accounts',
      to: 'mqtt-accounts',
      icon: { icon: 'mdi-account-outline' }
    }" />
    <VerticalNavLink :item="{
      title: 'Roles',
      to: 'mqtt-roles',
      icon: { icon: 'mdi-key-link' }
    }" />
    <VerticalNavLink :item="{
      title: 'Permissions',
      to: 'mqtt-permissions',
      icon: { icon: 'mdi-key' }
    }" />

    <!-- 👉 CC -->
    <VerticalNavSectionTitle :item="{ heading: 'Control Panel' }" />
    <VerticalNavLink :item="{
      title: 'CC Users',
      to: 'cc-users',
      icon: { icon: 'mdi-account-outline' }
    }" />
    <VerticalNavLink :item="{
      title: 'CC Roles',
      to: 'cc-roles',
      icon: { icon: 'mdi-key-link' }
    }" />
    <VerticalNavLink :item="{
      title: 'CC Permissions',
      to: 'cc-permissions',
      icon: { icon: 'mdi-key' }
    }" />

    <!-- 👉 Rest API -->
    <VerticalNavSectionTitle :item="{ heading: 'Rest Api' }" />
    <VerticalNavLink :item="{
      title: 'Rest Api Users',
      to: 'rest-api-users',
      icon: { icon: 'mdi-account-outline' }
    }" />
    <VerticalNavLink :item="{
      title: 'Rest Api Roles',
      to: 'rest-api-roles',
      icon: { icon: 'mdi-key-link' }
    }" />
    <VerticalNavLink :item="{
      title: 'Rest Api Permissions',
      to: 'rest-api-permissions',
      icon: { icon: 'mdi-key' }
    }" />

  </ul>
</template>

<style lang="scss">
.upgrade-banner {
  margin-top: auto;
}
</style>
