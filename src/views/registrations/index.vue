<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { getRegistrations, deleteRegistration, deleteWaitlist, getRegistrationDetail } from "@/api/registrations";
import { getClasses } from "@/api/classes";
import { getCourses } from "@/api/courses";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import Search from "@iconify-icons/ep/search";
import Delete from "@iconify-icons/ep/delete";
import View from "@iconify-icons/ep/view";
import Download from "@iconify-icons/ep/download";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "RegistrationsList"
});

const loading = ref(true);
const registrations = ref([]);
const searchTerm = ref("");
const classFilter = ref("");
const courseFilter = ref("");
const classOptions = ref<{id: number, name: string}[]>([]);
const courseOptions = ref<{id: number, name: string}[]>([]);
const detailVisible = ref(false);
const currentDetail = ref<any>({});
const detailLoading = ref(false);

const filteredRegistrations = computed(() => {
  let result = registrations.value;

  // Filter by Class Dropdown
  if (classFilter.value) {
    result = result.filter((reg: any) => reg.class_name === classFilter.value);
  }

  // Filter by Course Dropdown
  if (courseFilter.value) {
    // Check if the selected course is in the comma-separated course_names string
    result = result.filter((reg: any) => 
        reg.course_names && reg.course_names.includes(courseFilter.value)
    );
  }

  // Filter by Search Term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter((reg: any) => 
      (reg.student_name && reg.student_name.toLowerCase().includes(term)) ||
      (reg.class_name && reg.class_name.toLowerCase().includes(term))
    );
  }
  
  return result;
});

const fetchData = async () => {
  loading.value = true;
  try {
    // Fetch registrations
    try {
        const regRes: any = await getRegistrations();
        // Sanitize registration data
        const rawRegs = regRes.registrations || [];
        registrations.value = rawRegs.map((r: any) => ({
            id: r.id,
            student_name: r.student_name,
            birthday: r.birthday,
            class_name: r.class_name,
            course_count: r.course_count,
            supply_count: r.supply_count,
            created_at: r.created_at,
            course_names: r.course_names ? String(r.course_names) : "",
            type: r.type,
            status: r.status
        }));
    } catch (e) {
        console.error("Error fetching registrations:", e);
        registrations.value = [];
    }

    // Fetch classes
    try {
        const classRes: any = await getClasses();
        const rawClasses = Array.isArray(classRes) ? classRes : (classRes?.classes || []);
        classOptions.value = rawClasses.map((c: any) => ({
            id: Number(c.id),
            name: String(c.name)
        }));
    } catch (e) {
        console.error("Error fetching classes:", e);
        classOptions.value = [];
    }
    
    // Fetch courses
    try {
        const courseRes: any = await getCourses();
        const rawCourses = Array.isArray(courseRes) ? courseRes : (courseRes?.courses || []);
        courseOptions.value = rawCourses.map((c: any) => ({
            id: Number(c.id),
            name: String(c.name)
        }));
    } catch (e) {
        console.error("Error fetching courses:", e);
        courseOptions.value = [];
    }

  } catch(e) {
      console.error("Global fetch error:", e);
  } finally {
    loading.value = false;
  }
};

const handleView = async (row: any) => {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    const res: any = await getRegistrationDetail(row.id);
    currentDetail.value = res;
  } finally {
    detailLoading.value = false;
  }
};

const handleDelete = (row: any) => {
  const isWaitlist = row.type === 'waitlist';
  const msg = isWaitlist 
    ? `確定要刪除 ${row.student_name} 的候補資料嗎？` 
    : `確定要刪除 ${row.student_name} 的報名資料嗎？`;
    
  ElMessageBox.confirm(msg, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    if (isWaitlist) {
        await deleteWaitlist(row.id);
    } else {
        await deleteRegistration(row.id);
    }
    message("刪除成功", { type: "success" });
    fetchData();
  });
};

const handleExport = () => {
  const headers = ['ID', '學生姓名', '班級', '課程數', '用品數', '報名時間', '報名的課程'];

  const rows = filteredRegistrations.value.map((reg: any) => {
    const courseNames = reg.course_names ? String(reg.course_names) : '';
    return [
      reg.id,
      reg.student_name,
      reg.class_name || '未指定',
      reg.course_count,
      reg.supply_count,
      reg.created_at,
      `"${courseNames.replace(/"/g, '""')}"` // Escape double quotes
    ];
  });

  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF'; 
  let csv = headers.join(',') + '\n';
  csv += rows.map(row => row.join(',')).join('\n');

  const blob = new Blob([BOM + csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = `報名資料_${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename)
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex gap-2 items-center">
             <span class="font-bold text-lg mr-2">報名列表</span>
             
             <!-- Class Filter Dropdown -->
             <el-select 
                v-model="classFilter" 
                placeholder="全部班級" 
                clearable 
                style="width: 160px"
             >
                <el-option label="全部班級" value="" />
                <el-option 
                    v-for="cls in classOptions" 
                    :key="cls.id" 
                    :label="cls.name" 
                    :value="cls.name" 
                />
             </el-select>

             <!-- Course Filter Dropdown -->
             <el-select 
                v-model="courseFilter" 
                placeholder="全部課程" 
                clearable 
                style="width: 160px"
             >
                <el-option label="全部課程" value="" />
                <el-option 
                    v-for="course in courseOptions" 
                    :key="course.id" 
                    :label="course.name" 
                    :value="course.name" 
                />
             </el-select>

             <el-input 
               v-model="searchTerm" 
               placeholder="輸入學生姓名..." 
               style="width: 200px"
               :prefix-icon="useRenderIcon(Search)"
               clearable
             />
          </div>
          <el-button type="success" :icon="useRenderIcon(Download)" @click="handleExport">匯出資料</el-button>
        </div>
      </template>

      <el-table :data="filteredRegistrations" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="student_name" label="學生姓名" min-width="100" />
        <el-table-column prop="birthday" label="生日" width="120">
             <template #default="scope">
                {{ scope.row.birthday || '-' }}
             </template>
        </el-table-column>
        <el-table-column prop="class_name" label="班級" width="140">
             <template #default="scope">
                {{ scope.row.class_name || '未指定' }}
             </template>
        </el-table-column>
        <el-table-column prop="course_count" label="課程數" width="80" align="center" />
        <el-table-column prop="supply_count" label="用品數" width="80" align="center" />
        <el-table-column prop="created_at" label="報名時間" width="180">
            <template #default="scope">
                {{ new Date(scope.row.created_at).toLocaleString() }}
            </template>
        </el-table-column>
        <el-table-column prop="course_names" label="報名的課程" min-width="200">
            <template #default="scope">
               <el-tag v-for="(course, index) in (scope.row.course_names ? scope.row.course_names.split('、') : [])" :key="index" class="mr-1 mb-1" size="small">
                   {{ course }}
               </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
                v-if="scope.row.type === 'registration'"
                link type="primary" 
                :icon="View" 
                @click="handleView(scope.row)"
            >詳細</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="報名詳細資料" width="600px">
        <div v-loading="detailLoading" v-if="currentDetail">
            <el-descriptions border :column="1">
                <el-descriptions-item label="學生姓名">{{ currentDetail.student_name }}</el-descriptions-item>
                <el-descriptions-item label="班級">{{ currentDetail.class_name || '未指定' }}</el-descriptions-item>
                <el-descriptions-item label="Email">{{ currentDetail.email || '無' }}</el-descriptions-item>
                <el-descriptions-item label="報名時間">{{ currentDetail.created_at ? new Date(currentDetail.created_at).toLocaleString() : '' }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="mt-4">
                <h4 class="font-bold mb-2">已報名課程</h4>
                <el-table :data="currentDetail.courses || []" border size="small">
                    <el-table-column prop="name" label="課程名稱" />
                    <el-table-column prop="price" label="價格" width="100" />
                </el-table>
            </div>

            <div class="mt-4" v-if="currentDetail.supplies && currentDetail.supplies.length > 0">
                <h4 class="font-bold mb-2">已訂購用品</h4>
                <el-table :data="currentDetail.supplies" border size="small">
                    <el-table-column prop="name" label="用品名稱" />
                    <el-table-column prop="price" label="價格" width="100" />
                </el-table>
            </div>
            
             <div class="mt-4 text-right">
                <h3 class="text-xl font-bold text-red-500">總金額: ${{ currentDetail.total_amount }}</h3>
            </div>
        </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.main {
    padding: 20px;
}
</style>
