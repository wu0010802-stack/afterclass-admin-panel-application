<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getStats } from "@/api/dashboard";
import RegistrationsList from "@/views/registrations/index.vue";

defineOptions({
  name: "Welcome"
});

const stats = ref({
  totalRegistrations: 0,
  totalStudents: 0,
  totalCourseEnrollments: 0,
  totalSupplyOrders: 0
});

const loading = ref(true);

const fetchData = async () => {
  try {
    const res: any = await getStats();
    if (res.statistics) {
      stats.value = res.statistics;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="welcome">
    <el-row :gutter="20" class="mb-5">
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>總報名人數</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalRegistrations }}</div>
        </el-card>
      </el-col>
      
       <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card accent-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>總學生數</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalStudents }}</div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>課程報名數</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalCourseEnrollments }}</div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card accent-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>用品訂購數</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalSupplyOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="registration-list-container">
      <RegistrationsList />
    </div>
  </div>
</template>

<style scoped>
.welcome {
    padding: 20px;
}
.stat-card {
    border-left: 4px solid #2f6f4e;
    margin-bottom: 20px;
}
.primary-border {
    border-left-color: #2f6f4e;
}
.accent-border {
    border-left-color: #e07a5f;
}
.stat-value {
    font-size: 36px;
    font-weight: 700;
    color: #2f6f4e;
    text-align: center;
}
.accent-border .stat-value {
    color: #e07a5f;
}
.accent-border .stat-value {
    color: #e07a5f;
}
.card-header {
    font-weight: bold;
    color: #7f8c8d;
}
.stat-card :deep(.el-card__body) {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100px;
}
/* Reduce padding of the embedded component if necessary */
:deep(.main) {
  padding: 0 !important;
}
</style>
