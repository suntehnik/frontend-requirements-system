<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="mb-6 text-center">
      <h1 class="text-h3 font-weight-bold mb-2">Demo Pages</h1>
      <p class="text-h6 text-medium-emphasis">
        Interactive demonstrations and testing environments for development
      </p>
    </div>

    <!-- Demo Cards Grid -->
    <v-row>
      <!-- Status Components Playground -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" hover>
          <v-card-title class="text-h5 primary--text">
            <v-icon class="mr-2" color="primary">mdi-palette</v-icon>
            Status Components
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              Interactive testing environment for all status chip components including workflow, lifecycle, binary, and review status chips.
            </p>
            <v-chip-group>
              <v-chip size="small" color="primary" variant="outlined">WorkflowStatusChip</v-chip>
              <v-chip size="small" color="secondary" variant="outlined">LifecycleStatusChip</v-chip>
              <v-chip size="small" color="info" variant="outlined">BinaryStatusChip</v-chip>
              <v-chip size="small" color="success" variant="outlined">ReviewStatusChip</v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="elevated"
              :to="{ name: 'status-components-playground' }"
              block
            >
              Open Status Components Playground
              <v-icon class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Priority Component Playground -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" hover>
          <v-card-title class="text-h5 orange--text">
            <v-icon class="mr-2" color="orange">mdi-flag</v-icon>
            Priority Component
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              Dedicated testing environment for the Priority Chip component with all priority levels, sizes, and states.
            </p>
            <v-chip-group>
              <v-chip size="small" color="red" variant="outlined">Критический</v-chip>
              <v-chip size="small" color="orange" variant="outlined">Высокий</v-chip>
              <v-chip size="small" color="blue" variant="outlined">Средний</v-chip>
              <v-chip size="small" color="grey" variant="outlined">Низкий</v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="orange"
              variant="elevated"
              :to="{ name: 'priority-component-playground' }"
              block
            >
              Open Priority Component Playground
              <v-icon class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Form Components Demo -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" hover>
          <v-card-title class="text-h5 green--text">
            <v-icon class="mr-2" color="green">mdi-form-select</v-icon>
            Form Components
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              Demonstration of various form components including inputs, selects, checkboxes, and validation examples.
            </p>
            <v-chip-group>
              <v-chip size="small" color="green" variant="outlined">Text Inputs</v-chip>
              <v-chip size="small" color="teal" variant="outlined">Selects</v-chip>
              <v-chip size="small" color="cyan" variant="outlined">Validation</v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="green"
              variant="elevated"
              :to="{ name: 'forms-demo' }"
              block
            >
              Open Form Components Demo
              <v-icon class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Markdown Viewer Demo -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" hover>
          <v-card-title class="text-h5 purple--text">
            <v-icon class="mr-2" color="purple">mdi-markdown</v-icon>
            Markdown Viewer
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              Interactive markdown viewer and editor with syntax highlighting, live preview, and various markdown features.
            </p>
            <v-chip-group>
              <v-chip size="small" color="purple" variant="outlined">Live Preview</v-chip>
              <v-chip size="small" color="indigo" variant="outlined">Syntax Highlighting</v-chip>
              <v-chip size="small" color="deep-purple" variant="outlined">Editor</v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="purple"
              variant="elevated"
              :to="{ name: 'markdown-viewer-demo' }"
              block
            >
              Open Markdown Viewer Demo
              <v-icon class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Development Info Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" color="grey-lighten-5">
          <v-card-title class="text-h5 grey--text text--darken-2">
            <v-icon class="mr-2" color="grey-darken-2">mdi-information</v-icon>
            Development Info
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              These demo pages are designed for development and testing purposes. They provide interactive environments to test components and features.
            </p>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="mr-2">mdi-check</v-icon>
                  Interactive Testing
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="mr-2">mdi-check</v-icon>
                  Component Isolation
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="mr-2">mdi-check</v-icon>
                  Event Logging
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="mr-2">mdi-check</v-icon>
                  Performance Metrics
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Access Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="3" class="h-100" color="blue-lighten-5">
          <v-card-title class="text-h5 blue--text text--darken-2">
            <v-icon class="mr-2" color="blue-darken-2">mdi-rocket-launch</v-icon>
            Quick Access
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-3">
              Quick links to commonly used development tools and pages.
            </p>
            <v-btn-group variant="outlined" class="mb-2" block>
              <v-btn :to="{ name: 'dashboard' }" size="small">
                <v-icon class="mr-1">mdi-view-dashboard</v-icon>
                Dashboard
              </v-btn>
              <v-btn :to="{ name: 'epics' }" size="small">
                <v-icon class="mr-1">mdi-book-open</v-icon>
                Epics
              </v-btn>
            </v-btn-group>
            <v-btn-group variant="outlined" block>
              <v-btn :to="{ name: 'user-stories' }" size="small">
                <v-icon class="mr-1">mdi-account-group</v-icon>
                Stories
              </v-btn>
              <v-btn :to="{ name: 'requirements' }" size="small">
                <v-icon class="mr-1">mdi-clipboard-list</v-icon>
                Requirements
              </v-btn>
            </v-btn-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer -->
    <v-divider class="my-6"></v-divider>
    <div class="text-center">
      <p class="text-body-2 text-medium-emphasis">
        <v-icon size="small" class="mr-1">mdi-code-tags</v-icon>
        Development Demo Environment
        <v-icon size="small" class="ml-1">mdi-code-tags</v-icon>
      </p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
// No additional logic needed for this static demo index page
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>