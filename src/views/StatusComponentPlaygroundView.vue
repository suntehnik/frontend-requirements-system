<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Status Components Playground</h1>
      <p class="text-body-1 text-medium-emphasis">
        Interactive testing environment for all status chip components
      </p>
    </div>

    <!-- Configuration Panel -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="text-h6">Configuration Controls</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedComponentType"
              :items="componentTypeOptions"
              label="Component Type"
              variant="outlined"
              density="compact"
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
          <v-col cols="12" md="1">
            <v-btn @click="clearEventLog" color="error" variant="outlined" size="small">
              Clear Log
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Advanced Controls -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="text-h6">Advanced Testing Controls</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-btn
              @click="runStressTest"
              color="primary"
              variant="outlined"
              block
              :loading="stressTestRunning"
            >
              Run Stress Test
            </v-btn>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn @click="testAllSizes" color="secondary" variant="outlined" block>
              Test All Sizes
            </v-btn>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn @click="testAllStates" color="info" variant="outlined" block>
              Test All States
            </v-btn>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn @click="exportEventLog" color="success" variant="outlined" block>
              Export Event Log
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
          <v-card-title class="text-h6">Component Examples</v-card-title>
          <v-card-text>
            <!-- Current Component Demo -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">{{ selectedComponentType }} - Interactive Demo</h3>
              <div class="d-flex align-center gap-4 mb-4">
                <!-- WorkflowStatusChip Demo -->
                <div v-if="selectedComponentType === 'WorkflowStatusChip'">
                  <WorkflowStatusChip
                    :status="currentWorkflowStatus"
                    :size="selectedSize"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @status-change="
                      simulateError
                        ? handleWorkflowStatusChangeWithError
                        : handleWorkflowStatusChange
                    "
                    @error="handleError"
                  />
                </div>

                <!-- LifecycleStatusChip Demo -->
                <div v-else-if="selectedComponentType === 'LifecycleStatusChip'">
                  <LifecycleStatusChip
                    :status="currentLifecycleStatus"
                    :size="selectedSize"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @status-change="
                      simulateError
                        ? handleLifecycleStatusChangeWithError
                        : handleLifecycleStatusChange
                    "
                    @error="handleError"
                  />
                </div>

                <!-- BinaryStatusChip Demo -->
                <div v-else-if="selectedComponentType === 'BinaryStatusChip'">
                  <BinaryStatusChip
                    :status="currentBinaryStatus"
                    :size="selectedSize"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @status-change="
                      simulateError ? handleBinaryStatusChangeWithError : handleBinaryStatusChange
                    "
                    @error="handleError"
                  />
                </div>

                <!-- ReviewStatusChip Demo -->
                <div v-else-if="selectedComponentType === 'ReviewStatusChip'">
                  <ReviewStatusChip
                    :status="currentReviewStatus"
                    :size="selectedSize"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @status-change="
                      simulateError ? handleReviewStatusChangeWithError : handleReviewStatusChange
                    "
                    @error="handleError"
                  />
                </div>

                <!-- PriorityChip Demo -->
                <div v-else-if="selectedComponentType === 'PriorityChip'">
                  <PriorityChip
                    :priority="currentPriority"
                    :size="selectedSize"
                    :readonly="isReadonly"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    @priority-change="
                      simulateError
                        ? handlePriorityChangeWithError
                        : handlePriorityChange
                    "
                    @error="handleError"
                  />
                </div>

                <!-- Placeholder for other components -->
                <div v-else>
                  <v-chip
                    :size="getSizeMapping(selectedSize).chipSize"
                    :loading="isLoading"
                    :disabled="isDisabled"
                    color="primary"
                    @click="!isReadonly && handleStatusChange('Demo Status')"
                  >
                    {{ selectedComponentType }} ({{ selectedSize }})
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- All Sizes Demo -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Size Variations</h3>
              <div class="d-flex align-center gap-4 mb-4">
                <!-- WorkflowStatusChip Size Examples -->
                <template v-if="selectedComponentType === 'WorkflowStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Small</div>
                    <WorkflowStatusChip :status="currentWorkflowStatus" size="small" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Medium</div>
                    <WorkflowStatusChip :status="currentWorkflowStatus" size="medium" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Large</div>
                    <WorkflowStatusChip :status="currentWorkflowStatus" size="large" readonly />
                  </div>
                </template>

                <!-- LifecycleStatusChip Size Examples -->
                <template v-else-if="selectedComponentType === 'LifecycleStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Small</div>
                    <LifecycleStatusChip :status="currentLifecycleStatus" size="small" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Medium</div>
                    <LifecycleStatusChip :status="currentLifecycleStatus" size="medium" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Large</div>
                    <LifecycleStatusChip :status="currentLifecycleStatus" size="large" readonly />
                  </div>
                </template>

                <!-- BinaryStatusChip Size Examples -->
                <template v-else-if="selectedComponentType === 'BinaryStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Small</div>
                    <BinaryStatusChip :status="currentBinaryStatus" size="small" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Medium</div>
                    <BinaryStatusChip :status="currentBinaryStatus" size="medium" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Large</div>
                    <BinaryStatusChip :status="currentBinaryStatus" size="large" readonly />
                  </div>
                </template>

                <!-- ReviewStatusChip Size Examples -->
                <template v-else-if="selectedComponentType === 'ReviewStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Small</div>
                    <ReviewStatusChip :status="currentReviewStatus" size="small" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Medium</div>
                    <ReviewStatusChip :status="currentReviewStatus" size="medium" readonly />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Large</div>
                    <ReviewStatusChip :status="currentReviewStatus" size="large" readonly />
                  </div>
                </template>

                <!-- PriorityChip Size Examples -->
                <template v-else-if="selectedComponentType === 'PriorityChip'">
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
                </template>

                <!-- Generic size examples for other components -->
                <template v-else>
                  <div class="text-center">
                    <div class="mb-2">Small</div>
                    <v-chip size="x-small" color="primary">Small</v-chip>
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Medium</div>
                    <v-chip size="small" color="primary">Medium</v-chip>
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Large</div>
                    <v-chip size="large" color="primary">Large</v-chip>
                  </div>
                </template>
              </div>
            </div>

            <!-- Status Examples by Type -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">{{ selectedComponentType }} Status Examples</h3>
              <div class="d-flex flex-wrap gap-2">
                <!-- WorkflowStatusChip Examples -->
                <template v-if="selectedComponentType === 'WorkflowStatusChip'">
                  <WorkflowStatusChip
                    v-for="status in workflowStatusOptions"
                    :key="status.value"
                    :status="status.value"
                    :size="selectedSize"
                    readonly
                  />
                </template>

                <!-- LifecycleStatusChip Examples -->
                <template v-else-if="selectedComponentType === 'LifecycleStatusChip'">
                  <LifecycleStatusChip
                    v-for="status in lifecycleStatusOptions"
                    :key="status.value"
                    :status="status.value"
                    :size="selectedSize"
                    readonly
                  />
                </template>

                <!-- BinaryStatusChip Examples -->
                <template v-else-if="selectedComponentType === 'BinaryStatusChip'">
                  <BinaryStatusChip
                    v-for="status in binaryStatusOptions"
                    :key="status.value"
                    :status="status.value"
                    :size="selectedSize"
                    readonly
                  />
                </template>

                <!-- ReviewStatusChip Examples -->
                <template v-else-if="selectedComponentType === 'ReviewStatusChip'">
                  <ReviewStatusChip
                    v-for="status in reviewStatusOptions"
                    :key="status.value"
                    :status="status.value"
                    :size="selectedSize"
                    readonly
                  />
                </template>

                <!-- PriorityChip Examples -->
                <template v-else-if="selectedComponentType === 'PriorityChip'">
                  <PriorityChip
                    v-for="priority in priorityOptions"
                    :key="priority.value"
                    :priority="priority.value"
                    :size="selectedSize"
                    readonly
                  />
                </template>

                <!-- Placeholder for other component types -->
                <template v-else>
                  <v-chip
                    v-for="status in getCurrentStatusOptions()"
                    :key="status.value"
                    :color="getStatusColor(String(status.value))"
                    :size="getSizeMapping(selectedSize).chipSize"
                    @click="handleStatusChange(String(status.value))"
                  >
                    {{ status.text }}
                  </v-chip>
                </template>
              </div>
            </div>

            <!-- State Variations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">State Variations</h3>
              <div class="d-flex flex-wrap gap-4">
                <!-- WorkflowStatusChip State Examples -->
                <template v-if="selectedComponentType === 'WorkflowStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <WorkflowStatusChip
                      :status="currentWorkflowStatus"
                      :size="selectedSize"
                      @status-change="handleWorkflowStatusChange"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <WorkflowStatusChip
                      :status="currentWorkflowStatus"
                      :size="selectedSize"
                      loading
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <WorkflowStatusChip
                      :status="currentWorkflowStatus"
                      :size="selectedSize"
                      disabled
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <WorkflowStatusChip
                      :status="currentWorkflowStatus"
                      :size="selectedSize"
                      readonly
                    />
                  </div>
                </template>

                <!-- LifecycleStatusChip State Examples -->
                <template v-else-if="selectedComponentType === 'LifecycleStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <LifecycleStatusChip
                      :status="currentLifecycleStatus"
                      :size="selectedSize"
                      @status-change="handleLifecycleStatusChange"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <LifecycleStatusChip
                      :status="currentLifecycleStatus"
                      :size="selectedSize"
                      loading
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <LifecycleStatusChip
                      :status="currentLifecycleStatus"
                      :size="selectedSize"
                      disabled
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <LifecycleStatusChip
                      :status="currentLifecycleStatus"
                      :size="selectedSize"
                      readonly
                    />
                  </div>
                </template>

                <!-- BinaryStatusChip State Examples -->
                <template v-else-if="selectedComponentType === 'BinaryStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <BinaryStatusChip
                      :status="currentBinaryStatus"
                      :size="selectedSize"
                      @status-change="handleBinaryStatusChange"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <BinaryStatusChip :status="currentBinaryStatus" :size="selectedSize" loading />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <BinaryStatusChip :status="currentBinaryStatus" :size="selectedSize" disabled />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <BinaryStatusChip :status="currentBinaryStatus" :size="selectedSize" readonly />
                  </div>
                </template>

                <!-- ReviewStatusChip State Examples -->
                <template v-else-if="selectedComponentType === 'ReviewStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <ReviewStatusChip
                      :status="currentReviewStatus"
                      :size="selectedSize"
                      @status-change="handleReviewStatusChange"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <ReviewStatusChip :status="currentReviewStatus" :size="selectedSize" loading />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <ReviewStatusChip :status="currentReviewStatus" :size="selectedSize" disabled />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <ReviewStatusChip :status="currentReviewStatus" :size="selectedSize" readonly />
                  </div>
                </template>

                <!-- PriorityChip State Examples -->
                <template v-else-if="selectedComponentType === 'PriorityChip'">
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <PriorityChip
                      :priority="currentPriority"
                      :size="selectedSize"
                      @priority-change="handlePriorityChange"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <PriorityChip
                      :priority="currentPriority"
                      :size="selectedSize"
                      loading
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <PriorityChip
                      :priority="currentPriority"
                      :size="selectedSize"
                      disabled
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <PriorityChip
                      :priority="currentPriority"
                      :size="selectedSize"
                      readonly
                    />
                  </div>
                </template>

                <!-- Generic state examples for other components -->
                <template v-else>
                  <div class="text-center">
                    <div class="mb-2">Normal</div>
                    <v-chip color="primary">Normal</v-chip>
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Loading</div>
                    <v-chip color="primary" loading>Loading</v-chip>
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Disabled</div>
                    <v-chip color="primary" disabled>Disabled</v-chip>
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Readonly</div>
                    <v-chip color="primary" variant="outlined">Readonly</v-chip>
                  </div>
                </template>
              </div>
            </div>

            <!-- Error State Demonstrations -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Error State Demonstrations</h3>
              <div class="d-flex flex-wrap gap-4">
                <!-- WorkflowStatusChip Error Examples -->
                <template v-if="selectedComponentType === 'WorkflowStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Network Error Simulation</div>
                    <WorkflowStatusChip
                      :status="currentWorkflowStatus"
                      :size="selectedSize"
                      @status-change="handleWorkflowStatusChangeWithError"
                      @error="handleError"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Validation Error</div>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="triggerValidationError('WorkflowStatusChip')"
                    >
                      Trigger Error
                    </v-btn>
                  </div>
                </template>

                <!-- LifecycleStatusChip Error Examples -->
                <template v-else-if="selectedComponentType === 'LifecycleStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Network Error Simulation</div>
                    <LifecycleStatusChip
                      :status="currentLifecycleStatus"
                      :size="selectedSize"
                      @status-change="handleLifecycleStatusChangeWithError"
                      @error="handleError"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Validation Error</div>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="triggerValidationError('LifecycleStatusChip')"
                    >
                      Trigger Error
                    </v-btn>
                  </div>
                </template>

                <!-- BinaryStatusChip Error Examples -->
                <template v-else-if="selectedComponentType === 'BinaryStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Network Error Simulation</div>
                    <BinaryStatusChip
                      :status="currentBinaryStatus"
                      :size="selectedSize"
                      @status-change="handleBinaryStatusChangeWithError"
                      @error="handleError"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Validation Error</div>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="triggerValidationError('BinaryStatusChip')"
                    >
                      Trigger Error
                    </v-btn>
                  </div>
                </template>

                <!-- ReviewStatusChip Error Examples -->
                <template v-else-if="selectedComponentType === 'ReviewStatusChip'">
                  <div class="text-center">
                    <div class="mb-2">Network Error Simulation</div>
                    <ReviewStatusChip
                      :status="currentReviewStatus"
                      :size="selectedSize"
                      @status-change="handleReviewStatusChangeWithError"
                      @error="handleError"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Validation Error</div>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="triggerValidationError('ReviewStatusChip')"
                    >
                      Trigger Error
                    </v-btn>
                  </div>
                </template>

                <!-- PriorityChip Error Examples -->
                <template v-else-if="selectedComponentType === 'PriorityChip'">
                  <div class="text-center">
                    <div class="mb-2">Network Error Simulation</div>
                    <PriorityChip
                      :priority="currentPriority"
                      :size="selectedSize"
                      @priority-change="handlePriorityChangeWithError"
                      @error="handleError"
                    />
                  </div>
                  <div class="text-center">
                    <div class="mb-2">Validation Error</div>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="triggerValidationError('PriorityChip')"
                    >
                      Trigger Error
                    </v-btn>
                  </div>
                </template>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">Performance Metrics</h3>
              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ eventLog.length }}</div>
                      <div class="text-caption">Total Events</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ statusChangeCount }}</div>
                      <div class="text-caption">Status Changes</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ errorCount }}</div>
                      <div class="text-caption">Errors</div>
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
                No events logged yet. Interact with components to see events.
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
import WorkflowStatusChip from '@/components/data-display/WorkflowStatusChip.vue'
import LifecycleStatusChip from '@/components/data-display/LifecycleStatusChip.vue'
import BinaryStatusChip from '@/components/data-display/BinaryStatusChip.vue'
import ReviewStatusChip from '@/components/data-display/ReviewStatusChip.vue'
import PriorityChip from '@/components/data-display/PriorityChip.vue'
import type {
  WorkflowStatus,
  LifecycleStatus,
  BinaryStatus,
  ReviewStatus,
  StatusChipSize,
  StatusOption,
  SizeConfig,
} from '@/types/status'
import type { Priority } from '@/types'
import { getAllPriorityOptions, getPriorityLabel } from '@/utils/priority-utils'

// Component state
const selectedComponentType = ref<string>('WorkflowStatusChip')
const selectedSize = ref<StatusChipSize>('medium')
const isReadonly = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isDisabled = ref<boolean>(false)
const simulateError = ref<boolean>(false)

// Current status for interactive demo
const currentWorkflowStatus = ref<WorkflowStatus>('Draft')
const currentLifecycleStatus = ref<LifecycleStatus>('Draft')
const currentBinaryStatus = ref<BinaryStatus>('Active')
const currentReviewStatus = ref<ReviewStatus>('Under Review')
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
const statusChangeCount = ref<number>(0)
const errorCount = ref<number>(0)
const stressTestRunning = ref<boolean>(false)

// Configuration options
const componentTypeOptions = [
  { title: 'WorkflowStatusChip', value: 'WorkflowStatusChip' },
  { title: 'LifecycleStatusChip', value: 'LifecycleStatusChip' },
  { title: 'BinaryStatusChip', value: 'BinaryStatusChip' },
  { title: 'ReviewStatusChip', value: 'ReviewStatusChip' },
  { title: 'PriorityChip', value: 'PriorityChip' },
]

const sizeOptions = [
  { title: 'Small', value: 'small' },
  { title: 'Medium', value: 'medium' },
  { title: 'Large', value: 'large' },
]

// Status options by component type
const workflowStatusOptions: StatusOption<WorkflowStatus>[] = [
  { text: 'Бэклог', value: 'Backlog' },
  { text: 'Черновик', value: 'Draft' },
  { text: 'В работе', value: 'In Progress' },
  { text: 'Выполнено', value: 'Done' },
  { text: 'Отменено', value: 'Cancelled' },
]

const lifecycleStatusOptions: StatusOption<LifecycleStatus>[] = [
  { text: 'Черновик', value: 'Draft' },
  { text: 'Активно', value: 'Active' },
  { text: 'Устарело', value: 'Obsolete' },
]

const binaryStatusOptions: StatusOption<BinaryStatus>[] = [
  { text: 'Активно', value: 'Active' },
  { text: 'Неактивно', value: 'Inactive' },
]

const reviewStatusOptions: StatusOption<ReviewStatus>[] = [
  { text: 'На рассмотрении', value: 'Under Review' },
  { text: 'Одобрено', value: 'Approved' },
  { text: 'Отклонено', value: 'Rejected' },
  { text: 'Требует изменений', value: 'Needs Changes' },
]

// Priority options using shared utilities
const priorityOptions = getAllPriorityOptions().map(option => ({
  text: option.label,
  value: option.value,
}))

// Status color mapping
const statusColors: Record<string, string> = {
  // Workflow statuses
  Backlog: 'grey',
  Draft: 'orange',
  'In Progress': 'blue',
  Done: 'green',
  Cancelled: 'red',

  // Lifecycle statuses
  Active: 'green',
  Inactive: 'grey',
  Obsolete: 'orange',

  // Review statuses
  'Under Review': 'orange',
  Approved: 'green',
  Rejected: 'red',
  'Needs Changes': 'yellow',
}

// Size configuration mapping
const sizeConfigMapping: Record<StatusChipSize, SizeConfig> = {
  small: {
    chipSize: 'x-small',
    selectWidth: '120px',
  },
  medium: {
    chipSize: 'small',
    selectWidth: '140px',
  },
  large: {
    chipSize: 'large',
    selectWidth: '160px',
  },
}

// Computed properties
const getCurrentStatusOptions = () => {
  switch (selectedComponentType.value) {
    case 'WorkflowStatusChip':
      return workflowStatusOptions
    case 'LifecycleStatusChip':
      return lifecycleStatusOptions
    case 'BinaryStatusChip':
      return binaryStatusOptions
    case 'ReviewStatusChip':
      return reviewStatusOptions
    case 'PriorityChip':
      return priorityOptions
    default:
      return workflowStatusOptions
  }
}

// Methods
const getSizeMapping = (size: StatusChipSize): SizeConfig => {
  return sizeConfigMapping[size]
}

const getStatusColor = (status: string): string => {
  return statusColors[status] || 'grey'
}

const handleStatusChange = (newStatus: string) => {
  logEvent('status-change', `Status changed to: ${newStatus}`, {
    componentType: selectedComponentType.value,
    newStatus,
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
}

const handleWorkflowStatusChange = (newStatus: WorkflowStatus) => {
  currentWorkflowStatus.value = newStatus
  statusChangeCount.value++
  logEvent('status-change', `WorkflowStatus changed to: ${newStatus}`, {
    componentType: 'WorkflowStatusChip',
    newStatus,
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
}

const handleWorkflowStatusChangeWithError = (newStatus: WorkflowStatus) => {
  if (simulateError.value) {
    const error = new Error('Simulated network error: Failed to update status')
    handleError(error)
    return
  }
  handleWorkflowStatusChange(newStatus)
}

const handleLifecycleStatusChange = (newStatus: LifecycleStatus) => {
  currentLifecycleStatus.value = newStatus
  statusChangeCount.value++
  logEvent('status-change', `LifecycleStatus changed to: ${newStatus}`, {
    componentType: 'LifecycleStatusChip',
    newStatus,
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
}

const handleLifecycleStatusChangeWithError = (newStatus: LifecycleStatus) => {
  if (simulateError.value) {
    const error = new Error('Simulated network error: Failed to update lifecycle status')
    handleError(error)
    return
  }
  handleLifecycleStatusChange(newStatus)
}

const handleBinaryStatusChange = (newStatus: BinaryStatus) => {
  currentBinaryStatus.value = newStatus
  statusChangeCount.value++
  logEvent('status-change', `BinaryStatus changed to: ${newStatus}`, {
    componentType: 'BinaryStatusChip',
    newStatus,
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
}

const handleBinaryStatusChangeWithError = (newStatus: BinaryStatus) => {
  if (simulateError.value) {
    const error = new Error('Simulated network error: Failed to update binary status')
    handleError(error)
    return
  }
  handleBinaryStatusChange(newStatus)
}

const handleReviewStatusChange = (newStatus: ReviewStatus) => {
  currentReviewStatus.value = newStatus
  statusChangeCount.value++
  logEvent('status-change', `ReviewStatus changed to: ${newStatus}`, {
    componentType: 'ReviewStatusChip',
    newStatus,
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
}

const handleReviewStatusChangeWithError = (newStatus: ReviewStatus) => {
  if (simulateError.value) {
    const error = new Error('Simulated network error: Failed to update review status')
    handleError(error)
    return
  }
  handleReviewStatusChange(newStatus)
}

const handlePriorityChange = (newPriority: Priority) => {
  currentPriority.value = newPriority
  statusChangeCount.value++
  logEvent('priority-change', `Priority changed to: ${newPriority} (${getPriorityLabel(newPriority)})`, {
    componentType: 'PriorityChip',
    newPriority,
    priorityLabel: getPriorityLabel(newPriority),
    size: selectedSize.value,
    readonly: isReadonly.value,
  })
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
    componentType: selectedComponentType.value,
    error: error.message,
    stack: error.stack,
  })
}

const triggerValidationError = (componentType: string) => {
  const error = new Error(`Validation error in ${componentType}: Invalid status value provided`)
  handleError(error)
}

const logEvent = (type: string, message: string, data?: Record<string, unknown>) => {
  const eventEntry: EventLogEntry = {
    timestamp: new Date(),
    type,
    message,
    data: {
      ...data,
      // Add additional context
      currentComponent: selectedComponentType.value,
      currentSize: selectedSize.value,
      isReadonly: isReadonly.value,
      isLoading: isLoading.value,
      isDisabled: isDisabled.value,
      simulateError: simulateError.value,
    },
  }

  eventLog.value.unshift(eventEntry)

  // Keep only last 100 events for better debugging
  if (eventLog.value.length > 100) {
    eventLog.value = eventLog.value.slice(0, 100)
  }

  // Enhanced console logging with structured data
  const logLevel = type === 'error' ? 'error' : type === 'system' ? 'info' : 'log'
  console[logLevel](`[StatusPlayground:${type}] ${message}`, eventEntry.data)
}

const clearEventLog = () => {
  eventLog.value = []
  statusChangeCount.value = 0
  errorCount.value = 0
  logEvent('system', 'Event log and metrics cleared')
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString()
}

const getEventClass = (type: string): string => {
  switch (type) {
    case 'status-change':
      return 'bg-blue-lighten-5'
    case 'error':
      return 'bg-red-lighten-5'
    case 'system':
      return 'bg-grey-lighten-4'
    default:
      return 'bg-grey-lighten-5'
  }
}

// Advanced testing methods
const runStressTest = async () => {
  stressTestRunning.value = true
  logEvent('system', 'Starting stress test', { testType: 'stress' })

  try {
    // Test rapid status changes
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      switch (selectedComponentType.value) {
        case 'WorkflowStatusChip':
          const workflowStatuses: WorkflowStatus[] = [
            'Backlog',
            'Draft',
            'In Progress',
            'Done',
            'Cancelled',
          ]
          currentWorkflowStatus.value = workflowStatuses[i % workflowStatuses.length]
          break
        case 'LifecycleStatusChip':
          const lifecycleStatuses: LifecycleStatus[] = ['Draft', 'Active', 'Obsolete']
          currentLifecycleStatus.value = lifecycleStatuses[i % lifecycleStatuses.length]
          break
        case 'BinaryStatusChip':
          const binaryStatuses: BinaryStatus[] = ['Active', 'Inactive']
          currentBinaryStatus.value = binaryStatuses[i % binaryStatuses.length]
          break
        case 'ReviewStatusChip':
          const reviewStatuses: ReviewStatus[] = [
            'Under Review',
            'Approved',
            'Rejected',
            'Needs Changes',
          ]
          currentReviewStatus.value = reviewStatuses[i % reviewStatuses.length]
          break
        case 'PriorityChip':
          const priorities: Priority[] = [1, 2, 3, 4]
          currentPriority.value = priorities[i % priorities.length]
          break
      }

      logEvent('stress-test', `Rapid status change ${i + 1}/10`, {
        iteration: i + 1,
        newStatus: getCurrentStatus(),
      })
    }

    logEvent('system', 'Stress test completed successfully', { testType: 'stress', iterations: 10 })
  } catch (error) {
    logEvent(
      'error',
      `Stress test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        testType: 'stress',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    )
  } finally {
    stressTestRunning.value = false
  }
}

const testAllSizes = () => {
  logEvent('system', 'Testing all size variants', { testType: 'size-test' })

  const sizes: StatusChipSize[] = ['small', 'medium', 'large']
  let currentIndex = 0

  const testNextSize = () => {
    if (currentIndex < sizes.length) {
      selectedSize.value = sizes[currentIndex]
      logEvent('size-test', `Testing size: ${sizes[currentIndex]}`, {
        size: sizes[currentIndex],
        iteration: currentIndex + 1,
        total: sizes.length,
      })
      currentIndex++
      setTimeout(testNextSize, 1000)
    } else {
      logEvent('system', 'Size test completed', { testType: 'size-test' })
    }
  }

  testNextSize()
}

const testAllStates = () => {
  logEvent('system', 'Testing all component states', { testType: 'state-test' })

  const states = [
    { readonly: false, loading: false, disabled: false, name: 'normal' },
    { readonly: true, loading: false, disabled: false, name: 'readonly' },
    { readonly: false, loading: true, disabled: false, name: 'loading' },
    { readonly: false, loading: false, disabled: true, name: 'disabled' },
  ]

  let currentIndex = 0

  const testNextState = () => {
    if (currentIndex < states.length) {
      const state = states[currentIndex]
      isReadonly.value = state.readonly
      isLoading.value = state.loading
      isDisabled.value = state.disabled

      logEvent('state-test', `Testing state: ${state.name}`, {
        state: state.name,
        readonly: state.readonly,
        loading: state.loading,
        disabled: state.disabled,
        iteration: currentIndex + 1,
        total: states.length,
      })

      currentIndex++
      setTimeout(testNextState, 1500)
    } else {
      // Reset to normal state
      isReadonly.value = false
      isLoading.value = false
      isDisabled.value = false
      logEvent('system', 'State test completed', { testType: 'state-test' })
    }
  }

  testNextState()
}

const exportEventLog = () => {
  const exportData = {
    timestamp: new Date().toISOString(),
    playground: {
      selectedComponent: selectedComponentType.value,
      selectedSize: selectedSize.value,
      settings: {
        readonly: isReadonly.value,
        loading: isLoading.value,
        disabled: isDisabled.value,
        simulateError: simulateError.value,
      },
    },
    metrics: {
      totalEvents: eventLog.value.length,
      statusChanges: statusChangeCount.value,
      errors: errorCount.value,
    },
    events: eventLog.value,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `status-components-playground-log-${new Date().toISOString().slice(0, 19)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  logEvent('system', 'Event log exported', {
    exportType: 'json',
    eventCount: eventLog.value.length,
    filename: a.download,
  })
}

const getCurrentStatus = () => {
  switch (selectedComponentType.value) {
    case 'WorkflowStatusChip':
      return currentWorkflowStatus.value
    case 'LifecycleStatusChip':
      return currentLifecycleStatus.value
    case 'BinaryStatusChip':
      return currentBinaryStatus.value
    case 'ReviewStatusChip':
      return currentReviewStatus.value
    case 'PriorityChip':
      return currentPriority.value
    default:
      return 'Unknown'
  }
}

// Initialize with a welcome message
logEvent('system', 'Status Components Playground initialized', {
  availableComponents: componentTypeOptions.map((opt) => opt.value),
  version: '1.0.0',
  features: ['error-simulation', 'stress-testing', 'event-logging', 'performance-metrics'],
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
