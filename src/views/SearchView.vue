<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Поиск</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <!-- Search Input -->
            <v-text-field
              v-model="searchQuery"
              label="Поисковый запрос"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              @keyup.enter="performSearch"
              @input="onSearchInput"
            />

            <!-- Filters -->
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedEntityTypes"
                  :items="entityTypeOptions"
                  label="Типы сущностей"
                  multiple
                  chips
                  variant="outlined"
                  @update:model-value="performSearch"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Статус"
                  variant="outlined"
                  clearable
                  @update:model-value="performSearch"
                />
              </v-col>
            </v-row>

            <!-- Search Button -->
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              @click="performSearch"
              :loading="loading"
            >
              Найти
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search Results -->
    <v-row v-if="searchResults.length > 0 || hasSearched" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Результаты поиска
            <v-spacer />
            <v-chip v-if="totalResults > 0"> Найдено: {{ totalResults }} </v-chip>
          </v-card-title>

          <v-card-text v-if="searchResults.length > 0">
            <!-- Results grouped by entity type -->
            <div v-for="group in groupedResults" :key="group.type" class="mb-6">
              <h3 class="text-h6 mb-3">
                {{ getEntityTypeLabel(group.type) }} ({{ group.results.length }})
              </h3>

              <v-list>
                <v-list-item
                  v-for="result in group.results"
                  :key="result.entity_id"
                  :to="getResultLink(result)"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon>{{ getEntityIcon(result.entity_type) }}</v-icon>
                  </template>

                  <v-list-item-title>
                    <span class="font-weight-bold">{{ result.reference_id }}:</span>
                    <span v-html="highlightText(result.title)"></span>
                  </v-list-item-title>

                  <v-list-item-subtitle v-if="result.description">
                    <span v-html="highlightText(result.description.substring(0, 200))"></span>
                    <span v-if="result.description.length > 200">...</span>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-chip size="small">
                      {{ getEntityTypeLabel(result.entity_type) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <!-- Pagination -->
            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              @update:model-value="performSearch"
            />
          </v-card-text>

          <v-card-text v-else-if="hasSearched && !loading">
            <div class="text-center text-grey-darken-1 py-8">
              <v-icon size="64" class="mb-4">mdi-magnify</v-icon>
              <div class="text-h6">Ничего не найдено</div>
              <div>Попробуйте изменить поисковый запрос или фильтры</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search Suggestions -->
    <v-row v-if="!hasSearched" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Популярные поисковые запросы</v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                @click="() => {
                  searchQuery = suggestion
                  performSearch()
                }"
              >
                {{ suggestion }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface SearchResult {
  entity_type: string
  entity_id: string
  reference_id: string
  title: string
  description: string
}

interface SearchResultGroup {
  type: string
  results: SearchResult[]
}

const route = useRoute()
const router = useRouter()

// Search state
const searchQuery = ref('')
const selectedEntityTypes = ref(['epic', 'user_story', 'requirement'])
const selectedStatus = ref('')
const currentPage = ref(1)
const loading = ref(false)
const hasSearched = ref(false)

// Results
const searchResults = ref<SearchResult[]>([])
const totalResults = ref(0)
const totalPages = ref(0)

// Options
const entityTypeOptions = [
  { title: 'Эпики', value: 'epic' },
  { title: 'Пользовательские истории', value: 'user_story' },
  { title: 'Критерии приемки', value: 'acceptance_criteria' },
  { title: 'Требования', value: 'requirement' },
]

const statusOptions = [
  { title: 'Backlog', value: 'Backlog' },
  { title: 'Draft', value: 'Draft' },
  { title: 'In Progress', value: 'In Progress' },
  { title: 'Done', value: 'Done' },
  { title: 'Active', value: 'Active' },
  { title: 'Obsolete', value: 'Obsolete' },
]

const searchSuggestions = [
  'аутентификация',
  'пароль',
  'пользователь',
  'безопасность',
  'валидация',
  'токен',
  'форма',
]

// Computed
const groupedResults = computed((): SearchResultGroup[] => {
  const groups: Record<string, SearchResult[]> = {}

  searchResults.value.forEach((result) => {
    if (!groups[result.entity_type]) {
      groups[result.entity_type] = []
    }
    groups[result.entity_type].push(result)
  })

  return Object.entries(groups).map(([type, results]) => ({
    type,
    results,
  }))
})

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  hasSearched.value = true

  try {
    // Mock search - will be replaced with real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock results
    searchResults.value = [
      {
        entity_type: 'epic',
        entity_id: '1',
        reference_id: 'EP-001',
        title: 'Система аутентификации',
        description: 'Реализация безопасной системы аутентификации пользователей',
      },
      {
        entity_type: 'user_story',
        entity_id: '1',
        reference_id: 'US-001',
        title: 'Вход в систему',
        description: 'Как пользователь, я хочу войти в систему',
      },
      {
        entity_type: 'requirement',
        entity_id: '1',
        reference_id: 'REQ-001',
        title: 'Валидация пароля',
        description: 'Система должна проверять пароль пользователя',
      },
    ].filter(
      (item) =>
        selectedEntityTypes.value.includes(item.entity_type) &&
        (item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.value.toLowerCase())),
    )

    totalResults.value = searchResults.value.length
    totalPages.value = Math.ceil(totalResults.value / 10)

    // Update URL
    router.push({
      path: '/search',
      query: {
        q: searchQuery.value,
        types: selectedEntityTypes.value.join(','),
        status: selectedStatus.value || undefined,
        page: currentPage.value.toString(),
      },
    })
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  // Debounced search will be implemented later
}

const getEntityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    epic: 'Эпики',
    user_story: 'Пользовательские истории',
    acceptance_criteria: 'Критерии приемки',
    requirement: 'Требования',
  }
  return labels[type] || type
}

const getEntityIcon = (type: string) => {
  const icons: Record<string, string> = {
    epic: 'mdi-folder-multiple',
    user_story: 'mdi-book-open-variant',
    acceptance_criteria: 'mdi-check-circle-outline',
    requirement: 'mdi-file-document',
  }
  return icons[type] || 'mdi-file'
}

const getResultLink = (result: SearchResult) => {
  const links: Record<string, string> = {
    epic: `/epics/${result.entity_id}`,
    user_story: `/user-stories/${result.entity_id}`,
    acceptance_criteria: `/user-stories/${result.entity_id}`, // Navigate to parent user story
    requirement: `/requirements/${result.entity_id}`,
  }
  return links[result.entity_type] || '/'
}

const highlightText = (text: string) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Initialize from URL params
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string
    performSearch()
  }
})
</script>

<style scoped>
:deep(mark) {
  background-color: yellow;
  padding: 0 2px;
}
</style>
