<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Главная страница</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- Statistics Cards -->
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">Эпики</div>
            <div class="text-h4 text-primary">12</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">Пользовательские истории</div>
            <div class="text-h4 text-success">45</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">Требования</div>
            <div class="text-h4 text-info">128</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">Активные задачи</div>
            <div class="text-h4 text-warning">23</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Recent Activity -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Последние изменения</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Создан эпик "Система аутентификации"</v-list-item-title>
                <v-list-item-subtitle>2 часа назад</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Обновлено требование REQ-001</v-list-item-title>
                <v-list-item-subtitle>4 часа назад</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Добавлен комментарий к истории US-005</v-list-item-title>
                <v-list-item-subtitle>6 часов назад</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Быстрые действия</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              block
              class="mb-2"
              to="/epics"
            >
              <v-icon left>mdi-plus</v-icon>
              Создать эпик
            </v-btn>
            <v-btn
              color="success"
              block
              class="mb-2"
              to="/user-stories"
            >
              <v-icon left>mdi-plus</v-icon>
              Создать историю
            </v-btn>
            <v-btn
              color="info"
              block
              to="/requirements"
            >
              <v-icon left>mdi-plus</v-icon>
              Создать требование
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// Dashboard logic will be implemented later
</script>