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
                  <v-btn color="primary" prepend-icon="mdi-plus" @click="openRelationshipTypeDialog">
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
                    <v-chip
                      :color="item.is_default ? 'success' : 'grey'"
                      size="small"
                    >
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

    <!-- Similar dialogs for relationship types and status models would go here -->
    <!-- For brevity, I'll include just the structure -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const activeTab = ref('requirement-types')
const requirementTypeDialog = ref(false)
const editingRequirementType = ref<RequirementType | null>(null)

// Headers
const requirementTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const relationshipTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const statusModelHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип сущности', key: 'entity_type', sortable: true },
  { title: 'По умолчанию', key: 'is_default', sortable: true },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Mock data
const requirementTypes = ref([
  {
    id: '1',
    name: 'Функциональное',
    description: 'Функциональные требования к системе',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Техническое',
    description: 'Технические требования и ограничения',
    created_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Безопасность',
    description: 'Требования к безопасности системы',
    created_at: '2024-01-01'
  }
])

const relationshipTypes = ref([
  {
    id: '1',
    name: 'Зависит от',
    description: 'Требование зависит от другого требования',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Связано с',
    description: 'Требование связано с другим требованием',
    created_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Конфликтует с',
    description: 'Требование конфликтует с другим требованием',
    created_at: '2024-01-01'
  }
])

const statusModels = ref([
  {
    id: '1',
    name: 'Стандартная модель эпиков',
    entity_type: 'epic',
    is_default: true,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Стандартная модель историй',
    entity_type: 'user_story',
    is_default: true,
    created_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Стандартная модель требований',
    entity_type: 'requirement',
    is_default: true,
    created_at: '2024-01-01'
  }
])

const requirementTypeForm = ref({
  name: '',
  description: ''
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getEntityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'epic': 'Эпик',
    'user_story': 'Пользовательская история',
    'acceptance_criteria': 'Критерий приемки',
    'requirement': 'Требование'
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
</script>