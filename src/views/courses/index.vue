<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/api/courses";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";

defineOptions({
  name: "CoursesList"
});

const loading = ref(true);
const courses = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增課程");
const isEdit = ref(false);

const formRef = ref();
const formData = reactive({
  id: null,
  name: "",
  price: 0,
  sessions: 20,
  frequency: "每週1次，1次1小時",
  capacity: 30,
  description: "",
  video_url: "",
  allow_waitlist: true
});

const rules = {
  name: [{ required: true, message: "請輸入課程名稱", trigger: "blur" }],
  price: [{ required: true, message: "請輸入價格", trigger: "blur" }]
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getCourses();
    courses.value = res.courses || [];
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "新增課程";
  Object.assign(formData, {
    id: null,
    name: "",
    price: 0,
    sessions: 20,
    frequency: "每週1次，1次1小時",
    capacity: 30,
    description: "",
    video_url: "",
    allow_waitlist: true
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  dialogTitle.value = "編輯課程";
  Object.assign(formData, row);
  // Ensure default true if undefined
  if (formData.allow_waitlist === undefined) {
      formData.allow_waitlist = true;
  }
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`確定要刪除課程「${row.name}」嗎？`, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    await deleteCourse(row.id);
    message("刪除成功", { type: "success" });
    fetchData();
  });
};

const handleSubmit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        await updateCourse(formData.id, formData);
        message("更新成功", { type: "success" });
      } else {
        await createCourse(formData);
        message("新增成功", { type: "success" });
      }
      dialogVisible.value = false;
      fetchData();
    }
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between">
          <span class="font-bold">課程列表</span>
          <el-button type="primary" @click="handleAdd">新增課程</el-button>
        </div>
      </template>

      <el-table :data="courses" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="課程名稱" min-width="150" />
        <el-table-column prop="price" label="價格" width="100" />
        <el-table-column prop="sessions" label="堂數" width="80" />
        <el-table-column prop="frequency" label="頻率" min-width="150" />
        <el-table-column prop="capacity" label="容量" width="80" />
        <el-table-column prop="used" label="已報名" width="80">
             <template #default="scope">
                <el-tag :type="scope.row.used >= scope.row.capacity ? 'danger' : 'success'">
                    {{ scope.row.used || 0 }}
                </el-tag>
             </template>
        </el-table-column>
        <el-table-column prop="waitlist_count" label="候補數" width="80">
             <template #default="scope">
                <el-tag type="warning" v-if="scope.row.waitlist_count > 0">
                    {{ scope.row.waitlist_count }}
                </el-tag>
                <span v-else>-</span>
             </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="EditPen" @click="handleEdit(scope.row)">編輯</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="課程名稱" prop="name">
          <el-input v-model="formData.name" placeholder="例：幼兒感統" />
        </el-form-item>
        <el-form-item label="價格" prop="price">
          <el-input-number v-model="formData.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="堂數" prop="sessions">
           <el-input-number v-model="formData.sessions" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="頻率" prop="frequency">
          <el-input v-model="formData.frequency" />
        </el-form-item>
        <el-form-item label="容量上限" prop="capacity">
           <el-input-number v-model="formData.capacity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="說明" prop="description">
          <el-input v-model="formData.description" type="textarea" />
        </el-form-item>
        <el-form-item label="影片連結" prop="video_url">
          <el-input v-model="formData.video_url" placeholder="URL" />
        </el-form-item>
        <el-form-item label="開放候補" prop="allow_waitlist">
          <el-switch v-model="formData.allow_waitlist" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">儲存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.main {
    padding: 20px;
}
</style>
