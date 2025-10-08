<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Priority Component Playground</h1>
      <p class="text-body-1 text-medium-emphasis">
        Interactive testing environment for Priority Chip component
      </p>
    </div>

    <!-- Configuration Panel -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="text-h6">Configuration Controls</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="2">
            <v-select
              v-model="currentPriority"
              :items="
                priorityOptions.map((p) => ({ title: `${p.value}: ${p.text}`, value: p.value }))
              "
              label="Current Priority"
              variant="outlined"
              density="compact"
              @update:model-value="handlePriorityControlChange"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedSize"
              :items="sizeOptions"
              label="Size"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedVariant"
              :items="variantOptions"
              label="Variant"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
        <v-row class="mt-2">
          <v-col cols="12" md="2">
            <v-switch v-model="isReadonly" label="Readonly" color="primary" density="compact" />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch v-model="isLoading" label="Loading" color="primary" density="compact" />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch v-model="isDisabled" label="Disabled" color="primary" density="compact" />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch
              v-model="simulateError"
              label="Simulate Error"
              color="error"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch
              v-model="enableConsoleLogging"
              label="Console Logging"
              color="info"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn @click="clearEventLog" color="error" variant="outlined" size="small">
              Clear Log
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Examples Grid -->
    <v-row>
      <!-- Component Examples Column -->
      <v-col cols="12" lg="8">
        <v-card elevation="2">
          <v-card-title class="text-h6">Priority Component Examples</v-card-title>
          <v-card-text>
            <!-- Interactive Demo -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Interactive Priority Demo</h3>
              <div class="d-flex align-center gap-4 mb-4">
                <PriorityChip
                  :priority="currentPriority"
                  :size="selectedSize"
                  :variant="selectedVariant"
                  :readonly="isReadonly"
                  :loading="isLoading"
                  :disabled="isDisabled"
                  @priority-change="
                    simulateError ? handlePriorityChangeWithError : handlePriorityChange
                  "
                  @error="handleError"
                />
                <div class="text-body-2">
                  Current Priority: {{ getPriorityLabel(currentPriority) }} ({{ currentPriority }})
                </div>
              </div>
            </div>

            <!-- All Priority Values with Detailed Labels -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">All Priority Values (1-4) with Proper Labeling</h3>
              <div class="d-flex flex-wrap gap-4">
                <div v-for="priority in priorityOptions" :key="priority.value" class="text-center">
                  <div class="mb-2">
                    <div class="text-body-2 font-weight-medium">
                      Priority {{ priority.value }}: {{ priority.text }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ getPriorityDescription(priority.value) }}
                    </div>
                  </div>
                  <PriorityChip :priority="priority.value" :size="selectedSize" readonly />
                </div>
              </div>
            </div>

            <!-- Size Variations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Size Variations</h3>
              <div class="d-flex align-center gap-4">
                <div class="text-center">
                  <div class="mb-2">Small</div>
                  <PriorityChip :priority="currentPriority" size="small" readonly />
                </div>
                <div class="text-center">
                  <div class="mb-2">Medium</div>
                  <PriorityChip :priority="currentPriority" size="medium" readonly />
                </div>
                <div class="text-center">
                  <div class="mb-2">Large</div>
                  <PriorityChip :priority="currentPriority" size="large" readonly />
                </div>
              </div>
            </div>

            <!-- Loading State Demonstrations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Loading State Demonstrations</h3>
              <div class="d-flex flex-wrap gap-4">
                <div class="text-center">
                  <div class="mb-2">Normal Loading</div>
                  <PriorityChip :priority="currentPriority" :size="selectedSize" loading />
                </div>
                <div class="text-center">
                  <div class="mb-2">Loading + Disabled</div>
                  <PriorityChip :priority="currentPriority" :size="selectedSize" loading disabled />
                </div>
                <div class="text-center">
                  <div class="mb-2">Simulated Update</div>
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    :loading="simulateUpdateLoading"
                    @priority-change="handleSimulatedUpdate"
                  />
                </div>
              </div>
              <div class="mt-2">
                <v-btn
                  @click="triggerLoadingDemo"
                  color="primary"
                  variant="outlined"
                  size="small"
                  :disabled="simulateUpdateLoading"
                >
                  {{ simulateUpdateLoading ? 'Updating...' : 'Trigger Loading Demo' }}
                </v-btn>
              </div>
            </div>

            <!-- Error State Simulations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Error State Simulations</h3>
              <div class="d-flex flex-wrap gap-4">
                <div class="text-center">
                  <div class="mb-2">Network Error</div>
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    @priority-change="handleNetworkError"
                    @error="handleError"
                  />
                </div>
                <div class="text-center">
                  <div class="mb-2">Validation Error</div>
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    @priority-change="handleValidationError"
                    @error="handleError"
                  />
                </div>
                <div class="text-center">
                  <div class="mb-2">Permission Error</div>
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    @priority-change="handlePermissionError"
                    @error="handleError"
                  />
                </div>
              </div>
              <div class="mt-2">
                <v-btn @click="triggerRandomError" color="error" variant="outlined" size="small">
                  Trigger Random Error
                </v-btn>
              </div>
            </div>

            <!-- State Variations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">State Variations</h3>
              <div class="d-flex flex-wrap gap-4">
                <div class="text-center">
                  <div class="mb-2">Normal (Editable)</div>
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    @priority-change="handlePriorityChange"
                  />
                </div>
                <div class="text-center">
                  <div class="mb-2">Readonly</div>
                  <PriorityChip :priority="currentPriority" :size="selectedSize" readonly />
                </div>
                <div class="text-center">
                  <div class="mb-2">Disabled</div>
                  <PriorityChip :priority="currentPriority" :size="selectedSize" disabled />
                </div>
                <div class="text-center">
                  <div class="mb-2">Loading</div>
                  <PriorityChip :priority="currentPriority" :size="selectedSize" loading />
                </div>
              </div>
            </div>

            <!-- Dynamic Prop Testing -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Dynamic Prop Controls for Real-time Testing</h3>
              <v-card variant="outlined" class="pa-4">
                <div class="d-flex align-center gap-4 mb-4">
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    :variant="selectedVariant"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @priority-change="handlePriorityChange"
                    @error="handleError"
                  />
                  <div class="text-body-2">
                    <div>
                      <strong>Live Component:</strong> All props are controlled by the configuration
                      panel above
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Change any setting in the configuration panel to see real-time updates
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="text-body-2">
                  <strong>Current Configuration:</strong>
                  <ul class="mt-2">
                    <li>
                      Priority: {{ currentPriority }} ({{ getPriorityLabel(currentPriority) }})
                    </li>
                    <li>Size: {{ selectedSize }}</li>
                    <li>Variant: {{ selectedVariant }}</li>
                    <li>Readonly: {{ isReadonly ? 'Yes' : 'No' }}</li>
                    <li>Loading: {{ isLoading ? 'Yes' : 'No' }}</li>
                    <li>Disabled: {{ isDisabled ? 'Yes' : 'No' }}</li>
                    <li>Error Simulation: {{ simulateError ? 'Enabled' : 'Disabled' }}</li>
                    <li>Console Logging: {{ enableConsoleLogging ? 'Enabled' : 'Disabled' }}</li>
                  </ul>
                </div>
              </v-card>
            </div>

            <!-- Performance Metrics -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Performance Metrics & Statistics</h3>
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ eventLog.length }}</div>
                      <div class="text-caption">Total Events</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ priorityChangeCount }}</div>
                      <div class="text-caption">Priority Changes</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ errorCount }}</div>
                      <div class="text-caption">Errors Simulated</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">
                        {{ eventLog.filter((e) => e.type === 'loading-demo').length }}
                      </div>
                      <div class="text-caption">Loading Demos</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Event Log Column -->
      <v-col cols="12" lg="4">
        <v-card elevation="2" class="h-100">
          <v-card-title class="text-h6">Event Log</v-card-title>
          <v-card-text>
            <div class="event-log">
              <div
                v-for="(event, index) in eventLog"
                :key="index"
                class="event-entry mb-2 pa-2 rounded"
                :class="getEventClass(event.type)"
              >
                <div class="text-caption text-medium-emphasis">
                  {{ formatTime(event.timestamp) }}
                </div>
                <div class="font-weight-medium">{{ event.type }}</div>
                <div class="text-body-2">{{ event.message }}</div>
                <div v-if="event.data" class="text-caption mt-1">
                  <code>{{ JSON.stringify(event.data, null, 2) }}</code>
                </div>
              </div>
              <div v-if="eventLog.length === 0" class="text-center text-medium-emphasis py-4">
                No events logged yet. Interact with priority components to see events.
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PriorityChip from '@/components/data-display/PriorityChip.vue'
import type { Priority } from '@/types'
import type { StatusChipSize } from '@/types/status'
import {
  getAllPriorityOptions,
  getPriorityLabel,
  getPriorityDescription,
} from '@/utils/priority-utils'

// Component state
const selectedSize = ref<StatusChipSize>('medium')
const selectedVariant = ref<'flat' | 'outlined' | 'elevated'>('flat')
const isReadonly = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isDisabled = ref<boolean>(false)
const simulateError = ref<boolean>(false)
const enableConsoleLogging = ref<boolean>(true)

// Current priority for interactive demo
const currentPriority = ref<Priority>(3)

// Event logging
interface EventLogEntry {
  timestamp: Date
  type: string
  message: string
  data?: Record<string, unknown>
}

const eventLog = ref<EventLogEntry[]>([])

// Performance metrics
const priorityChangeCount = ref<number>(0)
const errorCount = ref<number>(0)

// Loading simulation state
const simulateUpdateLoading = ref<boolean>(false)

// Configuration options
const sizeOptions = [
  { title: 'Small', value: 'small' },
  { title: 'Medium', value: 'medium' },
  { title: 'Large', value: 'large' },
]

const variantOptions = [
  { title: 'Flat', value: 'flat' },
  { title: 'Outlined', value: 'outlined' },
  { title: 'Elevated', value: 'elevated' },
]

// Priority options using shared utilities
const priorityOptions = getAllPriorityOptions().map((option) => ({
  text: option.label,
  value: option.value,
}))

// Methods
const handlePriorityChange = (newPriority: Priority) => {
  const previousPriority = currentPriority.value

  if (enableConsoleLogging.value) {
    console.log('handlePriorityChange called with:', newPriority)
    console.log('Current priority before change:', previousPriority)
  }

  currentPriority.value = newPriority
  priorityChangeCount.value++

  if (enableConsoleLogging.value) {
    console.log('Current priority after change:', currentPriority.value)
  }

  logEvent(
    'priority-change',
    `Priority changed from ${previousPriority} (${getPriorityLabel(previousPriority)}) to ${newPriority} (${getPriorityLabel(newPriority)})`,
    {
      componentType: 'PriorityChip',
      previousPriority,
      newPriority,
      previousLabel: getPriorityLabel(previousPriority),
      priorityLabel: getPriorityLabel(newPriority),
      size: selectedSize.value,
      variant: selectedVariant.value,
      readonly: isReadonly.value,
      changeCount: priorityChangeCount.value,
    },
  )
}

const handlePriorityChangeWithError = (newPriority: Priority) => {
  if (simulateError.value) {
    const error = new Error('Simulated network error: Failed to update priority')
    handleError(error)
    return
  }
  handlePriorityChange(newPriority)
}

const handleError = (error: Error) => {
  errorCount.value++
  logEvent('error', `Component error: ${error.message}`, {
    componentType: 'PriorityChip',
    error: error.message,
    stack: error.stack,
  })
}

const handlePriorityControlChange = (newPriority: Priority) => {
  logEvent(
    'control-change',
    `Priority changed via control panel to: ${newPriority} (${getPriorityLabel(newPriority)})`,
    {
      componentType: 'ControlPanel',
      newPriority,
      priorityLabel: getPriorityLabel(newPriority),
      source: 'configuration-panel',
    },
  )
}

const logEvent = (type: string, message: string, data?: Record<string, unknown>) => {
  const eventEntry: EventLogEntry = {
    timestamp: new Date(),
    type,
    message,
    data: {
      ...data,
      // Add additional context
      currentSize: selectedSize.value,
      currentVariant: selectedVariant.value,
      isReadonly: isReadonly.value,
      isLoading: isLoading.value,
      isDisabled: isDisabled.value,
      simulateError: simulateError.value,
      enableConsoleLogging: enableConsoleLogging.value,
    },
  }

  eventLog.value.unshift(eventEntry)

  // Keep only last 100 events for better debugging
  if (eventLog.value.length > 100) {
    eventLog.value = eventLog.value.slice(0, 100)
  }

  // Enhanced console logging with structured data (only if enabled)
  if (enableConsoleLogging.value) {
    const logLevel = type === 'error' ? 'error' : type === 'system' ? 'info' : 'log'
    console[logLevel](`[PriorityPlayground:${type}] ${message}`, eventEntry.data)

    // Additional detailed logging for debugging priority changes
    if (type === 'priority-change') {
      console.group('🔄 Priority Change Details')
      console.log('Previous Priority:', data?.previousPriority || 'unknown')
      console.log('New Priority:', data?.newPriority)
      console.log('Priority Label:', data?.priorityLabel)
      console.log('Component Size:', data?.size)
      console.log('Component State:', {
        readonly: data?.readonly,
        loading: data?.isLoading,
        disabled: data?.isDisabled,
      })
      console.groupEnd()
    }
  }
}

const clearEventLog = () => {
  eventLog.value = []
  priorityChangeCount.value = 0
  errorCount.value = 0
  logEvent('system', 'Event log and metrics cleared')
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString()
}

const getEventClass = (type: string): string => {
  switch (type) {
    case 'priority-change':
      return 'bg-blue-lighten-5'
    case 'error':
    case 'error-simulation':
      return 'bg-red-lighten-5'
    case 'system':
      return 'bg-grey-lighten-4'
    case 'loading-demo':
      return 'bg-orange-lighten-5'
    case 'control-change':
      return 'bg-green-lighten-5'
    case 'simulated-update':
      return 'bg-purple-lighten-5'
    default:
      return 'bg-grey-lighten-5'
  }
}

// Error simulation methods
const handleNetworkError = (newPriority: Priority) => {
  const error = new Error('Network error: Failed to connect to server')
  handleError(error)
  logEvent('error-simulation', `Simulated network error for priority change to ${newPriority}`, {
    errorType: 'network',
    attemptedPriority: newPriority,
  })
}

const handleValidationError = (newPriority: Priority) => {
  const error = new Error('Validation error: Invalid priority value provided')
  handleError(error)
  logEvent('error-simulation', `Simulated validation error for priority change to ${newPriority}`, {
    errorType: 'validation',
    attemptedPriority: newPriority,
  })
}

const handlePermissionError = (newPriority: Priority) => {
  const error = new Error('Permission error: User does not have permission to change priority')
  handleError(error)
  logEvent('error-simulation', `Simulated permission error for priority change to ${newPriority}`, {
    errorType: 'permission',
    attemptedPriority: newPriority,
  })
}

const triggerRandomError = () => {
  const errorTypes = ['network', 'validation', 'permission', 'timeout', 'server']
  const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
  const error = new Error(`Random ${randomType} error: Something went wrong`)
  handleError(error)
  logEvent('error-simulation', `Triggered random ${randomType} error`, {
    errorType: randomType,
    isRandom: true,
  })
}

// Loading simulation methods
const triggerLoadingDemo = () => {
  simulateUpdateLoading.value = true
  logEvent('loading-demo', 'Started loading demonstration', {
    duration: '3 seconds',
  })

  setTimeout(() => {
    simulateUpdateLoading.value = false
    logEvent('loading-demo', 'Completed loading demonstration', {
      success: true,
    })
  }, 3000)
}

const handleSimulatedUpdate = (newPriority: Priority) => {
  logEvent('simulated-update', `Simulated priority update to ${newPriority}`, {
    newPriority,
    priorityLabel: getPriorityLabel(newPriority),
    simulationType: 'loading-demo',
  })

  // Don't actually change the priority during loading demo
  // This simulates a real update scenario where the component
  // would be in loading state during the API call
}

// Initialize with a welcome message
logEvent('system', 'Priority Component Playground initialized', {
  component: 'PriorityChip',
  version: '1.0.0',
  features: [
    'error-simulation',
    'event-logging',
    'performance-metrics',
    'loading-demonstrations',
    'comprehensive-testing',
  ],
})
</script>

<style scoped>
.event-log {
  max-height: 600px;
  overflow-y: auto;
}

.event-entry {
  border-left: 3px solid currentColor;
}

code {
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
