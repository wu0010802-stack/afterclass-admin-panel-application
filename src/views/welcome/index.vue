<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getStats } from "@/api/dashboard";
import RegistrationsList from "@/views/registrations/index.vue";
import * as echarts from "echarts";

defineOptions({
  name: "Welcome"
});

const stats = ref({
  totalRegistrations: 0,
  totalStudents: 0,
  totalCourseEnrollments: 0,
  totalSupplyOrders: 0,
  totalRevenue: 0,
  totalUnpaid: 0,
  totalWaitlist: 0
});

const loading = ref(true);
const dailyChartRef = ref<HTMLElement>();
const coursesChartRef = ref<HTMLElement>();

const initCharts = (data: any) => {
  if (dailyChartRef.value && data.daily) {
    const chart = echarts.init(dailyChartRef.value);
    chart.setOption({
      title: { text: '每日報名趨勢' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: data.daily.map((d: any) => d.date) 
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          data: data.daily.map((d: any) => d.count),
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { color: '#409EFF' },
          itemStyle: { color: '#409EFF' }
        }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  if (coursesChartRef.value && data.topCourses) {
    const chart = echarts.init(coursesChartRef.value);
    chart.setOption({
      title: { text: '熱門課程 Top 5' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: { 
        type: 'category', 
        data: data.topCourses.map((c: any) => c.name).reverse() 
      },
      series: [
        {
          name: '報名人數',
          type: 'bar',
          data: data.topCourses.map((c: any) => c.count).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }
};

const fetchData = async () => {
  try {
    const res: any = await getStats();
    if (res.statistics) {
      stats.value = res.statistics;
    }
    if (res.charts) {
      nextTick(() => initCharts(res.charts));
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
      <!-- Total Registrations -->
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>總報名人數</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalRegistrations }}</div>
          <div class="stat-sub">總學生數: {{ stats.totalStudents }}</div>
        </el-card>
      </el-col>
      
      <!-- Total Revenue -->
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card success-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>預估總營收</span>
            </div>
          </template>
          <div class="stat-value success-text">${{ stats.totalRevenue.toLocaleString() }}</div>
          <div class="stat-sub">含已完成與未繳費</div>
        </el-card>
      </el-col>

      <!-- Unpaid Amount -->
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card danger-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>未繳費金額</span>
            </div>
          </template>
          <div class="stat-value danger-text">${{ stats.totalUnpaid.toLocaleString() }}</div>
          <div class="stat-sub">請盡快確認款項</div>
        </el-card>
      </el-col>

      <!-- Waitlist -->
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card warning-border" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>候補人數</span>
            </div>
          </template>
          <div class="stat-value warning-text">{{ stats.totalWaitlist }}</div>
          <div class="stat-sub">等待名額釋出</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" class="mb-5">
      <el-col :span="12" :xs="24">
        <el-card shadow="hover">
          <div ref="dailyChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="24">
        <el-card shadow="hover">
          <div ref="coursesChartRef" style="height: 350px;"></div>
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
    border-left: 4px solid #ddd;
    margin-bottom: 20px;
    height: 100%;
}
/* Borders */
.primary-border { border-left-color: #409EFF; }
.success-border { border-left-color: #67C23A; }
.danger-border { border-left-color: #F56C6C; }
.warning-border { border-left-color: #E6A23C; }

/* Values */
.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    text-align: center;
    margin-bottom: 5px;
}
.success-text { color: #67C23A; }
.danger-text { color: #F56C6C; }
.warning-text { color: #E6A23C; }

.stat-sub {
    font-size: 12px;
    color: #909399;
    text-align: center;
}

.card-header {
    font-weight: bold;
    color: #606266;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-card :deep(.el-card__body) {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

:deep(.main) {
  padding: 0 !important;
}
</style>
