<template>
  <v-card v-if="description" flat outlined class="mb-4">
    <v-card-title class="text-h6 pb-2 d-flex align-center">
      <span>Описание</span>
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-2"
        @click="$emit('edit-description')"
        title="Редактировать описание"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-spacer />
    </v-card-title>
    <v-card-text>
      <MarkdownViewer :content="description || ''" />
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-pencil" @click="$emit('edit')">
        Редактировать эпик
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { MarkdownViewer } from '@/components/data-display'

interface Props {
  description?: string
}

defineProps<Props>()

defineEmits<{
  edit: []
  'edit-description': []
}>()
</script>

