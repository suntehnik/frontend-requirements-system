<script setup lang="ts">
// Home view for the Requirements Management System
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="text-h4 text-center">
            <v-icon left size="large">mdi-clipboard-list</v-icon>
            Requirements Management System
          </v-card-title>
          <v-card-subtitle class="text-center">
            Vue 3 + TypeScript + Vuetify 3 + Tailwind CSS + Pinia + Vue Router 4
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card color="primary" dark>
          <v-card-title>
            <v-icon left>mdi-vue</v-icon>
            Vue 3
          </v-card-title>
          <v-card-text>
            Modern Vue.js framework with Composition API and TypeScript support
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="secondary" dark>
          <v-card-title>
            <v-icon left>mdi-material-design</v-icon>
            Vuetify 3
          </v-card-title>
          <v-card-text> Material Design 3 components for beautiful and consistent UI </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-title>
            <v-icon left>mdi-tailwind</v-icon>
            Tailwind CSS
          </v-card-title>
          <v-card-text> Utility-first CSS framework for rapid UI development </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-check-circle</v-icon>
            Project Setup Complete
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Vue 3 + TypeScript with Vite</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Vuetify 3 Material Design Components</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Tailwind CSS Utility Classes</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Pinia State Management</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Vue Router 4 Navigation</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>ESLint + Prettier Configuration</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tailwind CSS Test -->
    <v-row class="mt-4">
      <v-col cols="12">
        <div class="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <p class="text-blue-700 font-semibold">Tailwind CSS Test</p>
          <p class="text-blue-600">
            This styled box demonstrates that Tailwind CSS is working correctly alongside Vuetify.
          </p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
