<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Конфигурация системы</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-tabs v-model="activeTab">
            <v-tab value="requirement-types">Типы требований</v-tab>
            <v-tab value="relationship-types">Типы связей</v-tab>
            <v-tab value="status-models">Модели статусов</v-tab>
            <v-tab value="steering-documents">Steering Documents</v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab">
            <!-- Requirement Types Tab -->
            <v-tabs-window-item value="requirement-types">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Типы требований</h3>
                  <v-btn color="primary" prepend-icon="mdi-plus" @click="openRequirementTypeDialog">
                    Добавить тип
                  </v-btn>
                </div>

                <v-data-table
                  :headers="requirementTypeHeaders"
                  :items="requirementTypes"
                  class="elevation-1"
                >
                  <template v-slot:[`item.created_at`]="{ item }">
                    {{ formatDate(item.created_at) }}
                  </template>

                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="openEditRequirementTypeDialog(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="openDeleteRequirementTypeDialog(item)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Relationship Types Tab -->
            <v-tabs-window-item value="relationship-types">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Типы связей</h3>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openRelationshipTypeDialog"
                  >
                    Добавить тип
                  </v-btn>
                </div>

                <v-data-table
                  :headers="relationshipTypeHeaders"
                  :items="relationshipTypes"
                  class="elevation-1"
                >
                  <template v-slot:[`item.created_at`]="{ item }">
                    {{ formatDate(item.created_at) }}
                  </template>

                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="openEditRelationshipTypeDialog(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="openDeleteRelationshipTypeDialog(item)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Status Models Tab -->
            <v-tabs-window-item value="status-models">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Модели статусов</h3>
                  <v-btn color="primary" prepend-icon="mdi-plus" @click="openStatusModelDialog">
                    Добавить модель
                  </v-btn>
                </div>

                <v-data-table
                  :headers="statusModelHeaders"
                  :items="statusModels"
                  class="elevation-1"
                >
                  <template v-slot:[`item.is_default`]="{ item }">
                    <v-chip :color="item.is_default ? 'success' : 'grey'" size="small">
                      {{ item.is_default ? 'По умолчанию' : 'Обычная' }}
                    </v-chip>
                  </template>

                  <template v-slot:[`item.entity_type`]="{ item }">
                    {{ getEntityTypeLabel(item.entity_type) }}
                  </template>

                  <template v-slot:[`item.created_at`]="{ item }">
                    {{ formatDate(item.created_at) }}
                  </template>

                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      variant="text"
                      @click="viewStatusModel(item)"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="openEditStatusModelDialog(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      :disabled="item.is_default"
                      @click="openDeleteStatusModelDialog(item)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Steering Documents Tab -->
            <v-tabs-window-item value="steering-documents">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Steering Documents</h3>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openSteeringDocumentDialog"
                  >
                    Создать документ
                  </v-btn>
                </div>

                <v-data-table
                  :headers="steeringDocumentHeaders"
                  :items="steeringDocuments"
                  :loading="steeringDocumentsLoading"
                  class="elevation-1"
                  @click:row="navigateToSteeringDocument"
                >
                  <template v-slot:[`item.reference_id`]="{ item }">
                    <v-btn
                      variant="text"
                      color="primary"
                      @click.stop="navigateToSteeringDocument(null, { item })"
                    >
                      {{ item.reference_id }}
                    </v-btn>
                  </template>

                  <template v-slot:[`item.creator`]="{ item }">
                    {{ item.creator?.username || 'Неизвестно' }}
                  </template>

                  <template v-slot:[`item.created_at`]="{ item }">
                    {{ formatDate(item.created_at) }}
                  </template>

                  <template v-slot:[`item.updated_at`]="{ item }">
                    {{ formatDate(item.updated_at) }}
                  </template>

                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click.stop="openDeleteSteeringDocumentDialog(item)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Requirement Type Dialog -->
    <v-dialog v-model="requirementTypeDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingRequirementType ? 'Редактировать тип требования' : 'Создать тип требования' }}
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="requirementTypeForm.name"
              label="Название"
              variant="outlined"
              class="mb-3"
            />
            <v-textarea
              v-model="requirementTypeForm.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeRequirementTypeDialog">Отмена</v-btn>
          <v-btn color="primary" @click="saveRequirementType">
            {{ editingRequirementType ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Steering Document Dialog -->
    <v-dialog v-model="steeringDocumentDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingSteeringDocument ? 'Редактировать документ' : 'Создать документ' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="steeringDocumentFormRef" v-model="steeringDocumentFormValid">
            <v-text-field
              v-model="steeringDocumentForm.title"
              label="Название"
              variant="outlined"
              class="mb-3"
              :rules="titleRules"
              required
            />
            <v-textarea
              v-model="steeringDocumentForm.description"
              label="Описание (Markdown поддерживается)"
              variant="outlined"
              rows="5"
              :rules="descriptionRules"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeSteeringDocumentDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveSteeringDocument"
            :disabled="!steeringDocumentFormValid"
            :loading="savingSteeringDocument"
          >
            {{ editingSteeringDocument ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Steering Document Confirmation Dialog -->
    <v-dialog v-model="deleteSteeringDocumentDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить документ "{{ documentToDelete?.title }}"? Это действие
          нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDeleteSteeringDocumentDialog">Отмена</v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteSteeringDocument"
            :loading="deletingSteeringDocument"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Similar dialogs for relationship types and status models would go here -->
    <!-- For brevity, I'll include just the structure -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { steeringDocumentService } from '@/services'
import type { SteeringDocument } from '@/types'

interface RequirementType {
  id: string
  name: string
  description: string
  created_at: string
}

interface RelationshipType {
  id: string
  name: string
  description: string
  created_at: string
}

interface StatusModel {
  id: string
  name: string
  entity_type: string
  is_default: boolean
  created_at: string
}

const router = useRouter()

const activeTab = ref('requirement-types')
const requirementTypeDialog = ref(false)
const editingRequirementType = ref<RequirementType | null>(null)

// Steering Documents state
const steeringDocuments = ref<SteeringDocument[]>([])
const steeringDocumentsLoading = ref(false)
const steeringDocumentDialog = ref(false)
const editingSteeringDocument = ref<SteeringDocument | null>(null)
const deleteSteeringDocumentDialog = ref(false)
const documentToDelete = ref<SteeringDocument | null>(null)
const savingSteeringDocument = ref(false)
const deletingSteeringDocument = ref(false)
const steeringDocumentFormValid = ref(false)
const steeringDocumentFormRef = ref()

// Headers
const requirementTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false },
]

const relationshipTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false },
]

const statusModelHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип сущности', key: 'entity_type', sortable: true },
  { title: 'По умолчанию', key: 'is_default', sortable: true },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false },
]

const steeringDocumentHeaders = [
  { title: 'Reference ID', key: 'reference_id', sortable: true },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Creator', key: 'creator', sortable: false },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Updated At', key: 'updated_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Mock data
const requirementTypes = ref([
  {
    id: '1',
    name: 'Функциональное',
    description: 'Функциональные требования к системе',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Техническое',
    description: 'Технические требования и ограничения',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: 'Безопасность',
    description: 'Требования к безопасности системы',
    created_at: '2024-01-01',
  },
])

const relationshipTypes = ref([
  {
    id: '1',
    name: 'Зависит от',
    description: 'Требование зависит от другого требования',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Связано с',
    description: 'Требование связано с другим требованием',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: 'Конфликтует с',
    description: 'Требование конфликтует с другим требованием',
    created_at: '2024-01-01',
  },
])

const statusModels = ref([
  {
    id: '1',
    name: 'Стандартная модель эпиков',
    entity_type: 'epic',
    is_default: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Стандартная модель историй',
    entity_type: 'user_story',
    is_default: true,
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: 'Стандартная модель требований',
    entity_type: 'requirement',
    is_default: true,
    created_at: '2024-01-01',
  },
])

const requirementTypeForm = ref({
  name: '',
  description: '',
})

const steeringDocumentForm = ref({
  title: '',
  description: '',
})

// Validation rules
const titleRules = [
  (v: string) => !!v || 'Название обязательно',
  (v: string) => (v && v.length <= 500) || 'Название должно быть не более 500 символов',
]

const descriptionRules = [
  (v: string) => !v || v.length <= 50000 || 'Описание должно быть не более 50000 символов',
]

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getEntityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    epic: 'Эпик',
    user_story: 'Пользовательская история',
    acceptance_criteria: 'Критерий приемки',
    requirement: 'Требование',
  }
  return labels[type] || type
}

const openRequirementTypeDialog = () => {
  editingRequirementType.value = null
  requirementTypeForm.value = { name: '', description: '' }
  requirementTypeDialog.value = true
}

const openEditRequirementTypeDialog = (item: RequirementType) => {
  editingRequirementType.value = item
  requirementTypeForm.value = { ...item }
  requirementTypeDialog.value = true
}

const closeRequirementTypeDialog = () => {
  requirementTypeDialog.value = false
  editingRequirementType.value = null
}

const saveRequirementType = () => {
  // TODO: Implement actual save logic
  console.log('Saving requirement type:', requirementTypeForm.value)
  closeRequirementTypeDialog()
}

const openDeleteRequirementTypeDialog = (item: RequirementType) => {
  // TODO: Implement delete confirmation dialog
  console.log('Delete requirement type:', item)
}

// Placeholder methods for other types
const openRelationshipTypeDialog = () => {
  console.log('Open relationship type dialog')
}

const openEditRelationshipTypeDialog = (item: RelationshipType) => {
  console.log('Edit relationship type:', item)
}

const openDeleteRelationshipTypeDialog = (item: RelationshipType) => {
  console.log('Delete relationship type:', item)
}

const openStatusModelDialog = () => {
  console.log('Open status model dialog')
}

const openEditStatusModelDialog = (item: StatusModel) => {
  console.log('Edit status model:', item)
}

const openDeleteStatusModelDialog = (item: StatusModel) => {
  console.log('Delete status model:', item)
}

const viewStatusModel = (item: StatusModel) => {
  console.log('View status model:', item)
}

// Steering Documents methods
const loadSteeringDocuments = async () => {
  try {
    steeringDocumentsLoading.value = true
    const response = await steeringDocumentService.list({ include: 'creator' })
    steeringDocuments.value = response.data || []
  } catch (error) {
    console.error('Error loading steering documents:', error)
    steeringDocuments.value = []
  } finally {
    steeringDocumentsLoading.value = false
  }
}

const openSteeringDocumentDialog = () => {
  editingSteeringDocument.value = null
  steeringDocumentForm.value = { title: '', description: '' }
  steeringDocumentDialog.value = true
}

const closeSteeringDocumentDialog = () => {
  steeringDocumentDialog.value = false
  editingSteeringDocument.value = null
  steeringDocumentFormValid.value = false
}

const saveSteeringDocument = async () => {
  if (!steeringDocumentFormValid.value) return

  try {
    savingSteeringDocument.value = true

    if (editingSteeringDocument.value) {
      // Update existing document
      await steeringDocumentService.update(editingSteeringDocument.value.id, {
        title: steeringDocumentForm.value.title,
        description: steeringDocumentForm.value.description || undefined,
      })
    } else {
      // Create new document
      await steeringDocumentService.create({
        title: steeringDocumentForm.value.title,
        description: steeringDocumentForm.value.description || undefined,
      })
    }

    // Refresh the list to show the new/updated document
    await loadSteeringDocuments()
    closeSteeringDocumentDialog()
  } catch (error) {
    console.error('Error saving steering document:', error)
  } finally {
    savingSteeringDocument.value = false
  }
}

const navigateToSteeringDocument = (event: Event | null, { item }: { item: SteeringDocument }) => {
  router.push(`/steering-documents/${item.reference_id}`)
}

const openDeleteSteeringDocumentDialog = (item: SteeringDocument) => {
  documentToDelete.value = item
  deleteSteeringDocumentDialog.value = true
}

const closeDeleteSteeringDocumentDialog = () => {
  deleteSteeringDocumentDialog.value = false
  documentToDelete.value = null
}

const confirmDeleteSteeringDocument = async () => {
  if (!documentToDelete.value) return

  try {
    deletingSteeringDocument.value = true
    await steeringDocumentService.delete(documentToDelete.value.id)
    
    // Refresh the list to remove the deleted document
    await loadSteeringDocuments()
    closeDeleteSteeringDocumentDialog()
  } catch (error) {
    console.error('Error deleting steering document:', error)
  } finally {
    deletingSteeringDocument.value = false
  }
}

// Watch for tab changes to refresh data when needed
watch(activeTab, (newTab) => {
  if (newTab === 'steering-documents') {
    loadSteeringDocuments()
  }
})

// Load steering documents when component mounts
onMounted(() => {
  loadSteeringDocuments()
})
</script>
