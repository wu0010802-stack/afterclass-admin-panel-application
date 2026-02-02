<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getClasses, createClass, updateClass, deleteClass } from "@/api/classes";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Plus from "@iconify-icons/ep/plus";
import Edit from "@iconify-icons/ep/edit";
import Delete from "@iconify-icons/ep/delete";

defineOptions({
  name: "ClassesManagement"
});

const loading = ref(true);
const classes = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增班級");
const formLoading = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const form = ref({
    name: ""
});

const rules = {
    name: [{ required: true, message: "請輸入班級名稱", trigger: "blur" }]
};
const formRef = ref();

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getClasses();
    classes.value = res;
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
    isEdit.value = false;
    currentId.value = null;
    form.value = { name: "" };
    dialogTitle.value = "新增班級";
    dialogVisible.value = true;
};

const handleEdit = (row: any) => {
    isEdit.value = true;
    currentId.value = row.id;
    form.value = { name: row.name };
    dialogTitle.value = "編輯班級";
    dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`確定要刪除班級 "${row.name}" 嗎？`, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
        await deleteClass(row.id);
        message("刪除成功", { type: "success" });
        fetchData();
    } catch (error: any) {
        // Error handling is done globally usually, but just in case
    }
  });
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            formLoading.value = true;
            try {
                if (isEdit.value && currentId.value) {
                    await updateClass(currentId.value, form.value);
                    message("更新成功", { type: "success" });
                } else {
                    await createClass(form.value);
                    message("新增成功", { type: "success" });
                }
                dialogVisible.value = false;
                fetchData();
            } finally {
                formLoading.value = false;
            }
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
        <div class="flex justify-between items-center">
          <span class="font-bold text-lg">班級管理</span>
          <el-button type="primary" :icon="useRenderIcon(Plus)" @click="handleAdd">新增班級</el-button>
        </div>
      </template>

      <el-table :data="classes" v-loading="loading" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="班級名稱" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">編輯</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="班級名稱" prop="name">
                <el-input v-model="form.name" placeholder="例如：玫瑰 Rose" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="formLoading">確定</el-button>
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
