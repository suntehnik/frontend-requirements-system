<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Requirements Management System</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn to="/" text>
        <v-icon left>mdi-home</v-icon>
        Home
      </v-btn>

      <v-btn to="/about" text>
        <v-icon left>mdi-information</v-icon>
        About
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Custom styles can be added here */
</style>
