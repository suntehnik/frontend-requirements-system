<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app id="app">
    <RouterView />
  </v-app>
</template>

<style scoped>
/* Ensure full height for the app */
#app {
  height: 100vh;
}
</style>
