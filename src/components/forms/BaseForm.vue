<template>
  <v-form
    ref="formRef"
    v-model="isFormValid"
    :disabled="disabled"
    @submit.prevent="handleSubmit"
  >
    <slot
      :is-valid="isFormValid"
      :loading="loading"
      :disabled="disabled"
      :validate="validate"
      :reset="reset"
    />
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  loading?: boolean
  disabled?: boolean
  validateOnMount?: boolean
}

interface Emits {
  (e: 'submit'): void
  (e: 'valid', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  validateOnMount: false,
})

const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)

// Computed
const canSubmit = computed(() => isFormValid.value && !props.loading && !props.disabled)

// Methods
const validate = async (): Promise<{ valid: boolean }> => {
  if (!formRef.value) return { valid: false }
  return await formRef.value.validate()
}

const reset = (): void => {
  if (formRef.value) {
    formRef.value.reset()
  }
}

const resetValidation = (): void => {
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const handleSubmit = async (): Promise<void> => {
  const { valid } = await validate()
  if (valid) {
    emit('submit')
  }
}

// Watch form validity and emit changes
watch(
  () => isFormValid.value,
  (newValue) => {
    emit('valid', newValue)
  },
  { immediate: true }
)

// Validate on mount if requested
if (props.validateOnMount) {
  validate()
}

// Expose methods for parent components
defineExpose({
  validate,
  reset,
  resetValidation,
  handleSubmit,
  isValid: computed(() => isFormValid.value),
  canSubmit,
})
</script>