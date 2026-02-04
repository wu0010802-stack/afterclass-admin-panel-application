<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { getRegistrations, deleteRegistration, deleteWaitlist, getRegistrationDetail, updateRemark, togglePayment, updateRegistration } from "@/api/registrations";
import { getClasses } from "@/api/classes";
import { getCourses } from "@/api/courses";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import Search from "@iconify-icons/ep/search";
import Delete from "@iconify-icons/ep/delete";
import View from "@iconify-icons/ep/view";
import Download from "@iconify-icons/ep/download";
import EditPen from "@iconify-icons/ep/edit-pen";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import * as XLSX from "xlsx";

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

// Edit mode state
const isEditing = ref(false);
const editForm = reactive({
  student_name: "",
  birthday: "",
  class_name: "",
  courses: [] as {name: string, price: number}[],
  supplies: [] as {name: string, price: number}[]
});

// Available supplies (hardcoded like in frontend-public)
const supplyOptions = ref([
  { name: '全套舞蹈服裝', price: 1400 },
  { name: '舞衣', price: 700 },
  { name: '舞鞋', price: 250 },
  { name: '舞襪', price: 150 },
  { name: '舞袋', price: 300 }
]);

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
            remark: r.remark || "",
            type: r.type,
            status: r.status,
            is_paid: r.is_paid
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
  isEditing.value = false;
  try {
    const res: any = await getRegistrationDetail(row.id);
    currentDetail.value = res;
    // Initialize edit form with current values
    editForm.student_name = res.student_name || "";
    editForm.birthday = res.birthday || "";
    editForm.class_name = res.class_name || "";
    editForm.courses = (res.courses || []).map((c: any) => ({ name: c.name, price: c.price }));
    editForm.supplies = (res.supplies || []).map((s: any) => ({ name: s.name, price: s.price }));
  } finally {
    detailLoading.value = false;
  }
};

const handleDeleteFromDetail = () => {
  const isWaitlist = currentDetail.value.type === 'waitlist';
  const msg = isWaitlist 
    ? `確定要刪除 ${currentDetail.value.student_name} 的候補資料嗎？` 
    : `確定要刪除 ${currentDetail.value.student_name} 的報名資料嗎？`;
    
  ElMessageBox.confirm(msg, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    if (isWaitlist) {
        await deleteWaitlist(currentDetail.value.id);
    } else {
        await deleteRegistration(currentDetail.value.id);
    }
    message("刪除成功", { type: "success" });
    detailVisible.value = false;
    fetchData();
  });
};

const handleUpdateRemark = async () => {
    try {
        await updateRemark(currentDetail.value.id, { remark: currentDetail.value.remark });
        message("備註更新成功", { type: "success" });
        // Update the item in the list as well to reflect changes without refresh
        const item = registrations.value.find((r: any) => r.id === currentDetail.value.id);
        if (item) {
            item.remark = currentDetail.value.remark;
        }
    } catch (e) {
        message("更新失敗", { type: "error" });
    }
};

const handlePayment = async (row: any) => {
    try {
        console.log("Toggling payment for:", row.id, "Current status:", row.is_paid);
        const newStatus = !Boolean(row.is_paid);
        await togglePayment(row.id, { paid: newStatus });
        row.is_paid = newStatus;
        message(newStatus ? "已更新為已繳費" : "已更新為未繳費", { type: "success" });
        await fetchData();
    } catch (e) {
        console.error("Payment toggle failed:", e);
        message("更新失敗", { type: "error" });
    }
};

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  // Reset form to original values
  editForm.student_name = currentDetail.value.student_name || "";
  editForm.birthday = currentDetail.value.birthday || "";
  editForm.class_name = currentDetail.value.class_name || "";
  editForm.courses = (currentDetail.value.courses || []).map((c: any) => ({ name: c.name, price: c.price }));
  editForm.supplies = (currentDetail.value.supplies || []).map((s: any) => ({ name: s.name, price: s.price }));
};

// Helper functions for course/supply editing
const isCourseSelected = (courseName: string) => {
  return editForm.courses.some(c => c.name === courseName);
};

const toggleCourse = (course: {name: string, id: number}) => {
  const index = editForm.courses.findIndex(c => c.name === course.name);
  if (index >= 0) {
    editForm.courses.splice(index, 1);
  } else {
    // Get price from courseOptions
    const courseData = courseOptions.value.find(c => c.name === course.name);
    editForm.courses.push({ name: course.name, price: (courseData as any)?.price || 0 });
  }
};

const isSupplySelected = (supplyName: string) => {
  return editForm.supplies.some(s => s.name === supplyName);
};

const toggleSupply = (supply: {name: string, price: number}) => {
  const index = editForm.supplies.findIndex(s => s.name === supply.name);
  if (index >= 0) {
    editForm.supplies.splice(index, 1);
  } else {
    editForm.supplies.push({ name: supply.name, price: supply.price });
  }
};

const saveEditing = async () => {
  try {
    await updateRegistration(currentDetail.value.id, {
      student_name: editForm.student_name,
      birthday: editForm.birthday,
      class_name: editForm.class_name,
      courses: editForm.courses,
      supplies: editForm.supplies
    });
    message("更新成功", { type: "success" });
    
    // Update currentDetail
    currentDetail.value.student_name = editForm.student_name;
    currentDetail.value.birthday = editForm.birthday;
    currentDetail.value.class_name = editForm.class_name;
    currentDetail.value.courses = [...editForm.courses];
    currentDetail.value.supplies = [...editForm.supplies];
    
    isEditing.value = false;
    
    // Refresh the list
    await fetchData();
    // Re-fetch detail to get updated total
    const res: any = await getRegistrationDetail(currentDetail.value.id);
    currentDetail.value = res;
  } catch (e) {
    message("更新失敗", { type: "error" });
  }
};

const handleExportExcel = () => {
  const rows = filteredRegistrations.value.map((reg: any) => {
    return {
      'ID': reg.id,
      '學生姓名': reg.student_name,
      '班級': reg.class_name || '未指定',
      '課程數': reg.course_count,
      '用品數': reg.supply_count,
      '報名時間': reg.created_at ? new Date(reg.created_at).toLocaleString() : '',
      '備註': reg.remark,
      '報名的課程': reg.course_names
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Adjust column widths
  const wscols = [
    { wch: 6 },  // ID
    { wch: 15 }, // Name
    { wch: 20 }, // Class
    { wch: 10 }, // Course Count
    { wch: 10 }, // Supply Count
    { wch: 25 }, // Time
    { wch: 30 }, // Remark
    { wch: 50 }  // Courses
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
  XLSX.writeFile(workbook, `報名資料_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const handleExportCsv = () => {
  const headers = ['ID', '學生姓名', '班級', '課程數', '用品數', '報名時間', '備註', '報名的課程'];

  const rows = filteredRegistrations.value.map((reg: any) => {
    const courseNames = reg.course_names ? String(reg.course_names) : '';
    const remark = reg.remark ? String(reg.remark) : '';
    return [
      reg.id,
      reg.student_name,
      reg.class_name || '未指定',
      reg.course_count,
      reg.supply_count,
      reg.created_at,
      `"${remark.replace(/"/g, '""')}"`,
      `"${courseNames.replace(/"/g, '""')}"`
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

const handleExportCommand = (command: string) => {
    if (command === 'excel') {
        handleExportExcel();
    } else {
        handleExportCsv();
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
          
          <el-dropdown split-button type="success" @click="handleExportExcel" @command="handleExportCommand">
            <span class="flex items-center">
               <iconify-icon-offline :icon="Download" class="mr-1" />
               匯出 Excel
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="excel">匯出 Excel (.xlsx)</el-dropdown-item>
                <el-dropdown-item command="csv">匯出 CSV (.csv)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>

      <el-table :data="filteredRegistrations" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序號" width="60" align="center" />
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
        <el-table-column prop="is_paid" label="繳費狀態" width="100" align="center">
            <template #default="scope">
                <el-button 
                    :type="scope.row.is_paid ? 'success' : 'info'" 
                    size="small" 
                    @click="handlePayment(scope.row)"
                >
                    {{ scope.row.is_paid ? '已繳費' : '未繳費' }}
                </el-button>
            </template>
        </el-table-column>
        <el-table-column prop="remark" label="備註" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button 
                link type="primary" 
                :icon="View" 
                @click="handleView(scope.row)"
            >詳細</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="報名詳細資料" width="600px">
        <div v-loading="detailLoading" v-if="currentDetail">
            <!-- View Mode -->
            <el-descriptions v-if="!isEditing" border :column="1">
                <el-descriptions-item label="學生姓名">{{ currentDetail.student_name }}</el-descriptions-item>
                <el-descriptions-item label="生日">{{ currentDetail.birthday || '未填寫' }}</el-descriptions-item>
                <el-descriptions-item label="班級">{{ currentDetail.class_name || '未指定' }}</el-descriptions-item>
                <el-descriptions-item label="Email">{{ currentDetail.email || '無' }}</el-descriptions-item>
                <el-descriptions-item label="報名時間">{{ currentDetail.created_at ? new Date(currentDetail.created_at).toLocaleString() : '' }}</el-descriptions-item>
            </el-descriptions>
            
            <!-- Edit Mode -->
            <el-form v-else label-width="100px">
                <el-form-item label="學生姓名">
                    <el-input v-model="editForm.student_name" />
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker 
                        v-model="editForm.birthday" 
                        type="date" 
                        placeholder="選擇生日"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="班級">
                    <el-select v-model="editForm.class_name" placeholder="選擇班級" clearable style="width: 100%">
                        <el-option 
                            v-for="cls in classOptions" 
                            :key="cls.id" 
                            :label="cls.name" 
                            :value="cls.name" 
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            
            <div class="mt-4">
                <div class="mb-2">
                    <span class="font-bold">後台備註</span>
                </div>
                <el-input 
                    v-model="currentDetail.remark" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="輸入備註事項..." 
                />
                <div class="mt-2">
                    <el-button type="warning" size="small" @click="handleUpdateRemark">
                        💾 點擊儲存備註
                    </el-button>
                </div>
            </div>
            
            <div class="mt-4">
                <h4 class="font-bold mb-2">已報名課程</h4>
                <!-- View Mode -->
                <el-table v-if="!isEditing" :data="currentDetail.courses || []" border size="small">
                    <el-table-column prop="name" label="課程名稱" />
                    <el-table-column prop="price" label="價格" width="100" />
                </el-table>
                <!-- Edit Mode -->
                <div v-else class="border rounded p-3 bg-gray-50">
                    <el-checkbox-group>
                        <div v-for="course in courseOptions" :key="course.id" class="mb-2">
                            <el-checkbox 
                                :checked="isCourseSelected(course.name)"
                                @change="toggleCourse(course)"
                            >
                                {{ course.name }}
                            </el-checkbox>
                        </div>
                    </el-checkbox-group>
                </div>
            </div>

            <div class="mt-4">
                <h4 class="font-bold mb-2">已訂購用品</h4>
                <!-- View Mode -->
                <template v-if="!isEditing">
                    <el-table v-if="currentDetail.supplies && currentDetail.supplies.length > 0" :data="currentDetail.supplies" border size="small">
                        <el-table-column prop="name" label="用品名稱" />
                        <el-table-column prop="price" label="價格" width="100" />
                    </el-table>
                    <div v-else class="text-gray-400">無</div>
                </template>
                <!-- Edit Mode -->
                <div v-else class="border rounded p-3 bg-gray-50">
                    <el-checkbox-group>
                        <div v-for="supply in supplyOptions" :key="supply.name" class="mb-2">
                            <el-checkbox 
                                :checked="isSupplySelected(supply.name)"
                                @change="toggleSupply(supply)"
                            >
                                {{ supply.name }} (${{ supply.price }})
                            </el-checkbox>
                        </div>
                    </el-checkbox-group>
                </div>
            </div>
            
             <div class="mt-4 text-right">
                <h3 class="text-xl font-bold text-red-500">總金額: ${{ currentDetail.total_amount }}</h3>
            </div>
        </div>
        
        <template #footer>
            <div class="flex justify-between">
                <div>
                    <el-button type="danger" @click="handleDeleteFromDetail" :icon="Delete">
                        刪除報名
                    </el-button>
                </div>
                <div>
                    <template v-if="!isEditing">
                        <el-button type="primary" @click="startEditing" :icon="EditPen">
                            編輯資料
                        </el-button>
                        <el-button @click="detailVisible = false">關閉</el-button>
                    </template>
                    <template v-else>
                        <el-button @click="cancelEditing">取消</el-button>
                        <el-button type="primary" @click="saveEditing">儲存變更</el-button>
                    </template>
                </div>
            </div>
        </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.main {
    padding: 20px;
}
</style>
