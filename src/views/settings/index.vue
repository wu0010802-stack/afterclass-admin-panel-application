<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getRegistrationTime, saveRegistrationTime } from "@/api/settings";
import { message } from "@/utils/message";

defineOptions({
  name: "SystemSettings"
});

const loading = ref(true);
const form = reactive({
  start: "",
  end: ""
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getRegistrationTime();
    // Assuming backend returns { start: '...', end: '...' }
    // Line 216 default settings: 'registration_start', 'registration_end'
    // Server endpoint for GET /api/settings/registration-time returns json.
    // I need to confirm response structure. 
    // In server.py (not shown explicitly, but inferred):
    // likely returns { start: ..., end: ... }
    
    if (res.settings) {
         form.start = res.settings.start;
         form.end = res.settings.end;
    } else {
        // Fallback if structure is flat
        form.start = res.start || "";
        form.end = res.end || "";
    }
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!form.start || !form.end) {
    message("請設定開始與結束時間", { type: "warning" });
    return;
  }
  
  try {
    await saveRegistrationTime({
      start: form.start,
      end: form.end
    });
    message("儲存成功", { type: "success" });
  } catch (e) {
    // Error handled by interceptor
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never">
      <template #header>
        <div class="font-bold text-lg">報名時間設定</div>
      </template>
      
      <el-form label-width="120px" v-loading="loading">
        <el-form-item label="開始時間">
          <el-date-picker
            v-model="form.start"
            type="datetime"
            placeholder="選擇開始時間"
            value-format="YYYY-MM-DDTHH:mm"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item label="結束時間">
          <el-date-picker
            v-model="form.end"
            type="datetime"
            placeholder="選擇結束時間"
             value-format="YYYY-MM-DDTHH:mm"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSave">儲存設定</el-button>
        </el-form-item>
      </el-form>
      
      <div class="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-500">
        <p>⚠️ 注意：在設定的時間範圍外，學生將無法提交報名表單。</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.main {
    padding: 20px;
}
</style>
