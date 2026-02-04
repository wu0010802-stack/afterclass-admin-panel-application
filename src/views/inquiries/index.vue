<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getInquiries, markInquiryRead, deleteInquiry } from "@/api/inquiries";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import Delete from "@iconify-icons/ep/delete";
import Check from "@iconify-icons/ep/check";

defineOptions({
  name: "InquiriesList"
});

const loading = ref(true);
const inquiries = ref<any[]>([]);

const unreadCount = computed(() => {
  return inquiries.value.filter(i => !i.is_read).length;
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getInquiries();
    inquiries.value = res.inquiries || [];
  } catch (e) {
    console.error("Error fetching inquiries:", e);
    inquiries.value = [];
  } finally {
    loading.value = false;
  }
};

const handleMarkRead = async (row: any) => {
  try {
    await markInquiryRead(row.id);
    row.is_read = true;
    message("已標記為已讀", { type: "success" });
  } catch (e) {
    message("操作失敗", { type: "error" });
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `確定要刪除這則提問嗎？`,
    "警告",
    {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(async () => {
    try {
      await deleteInquiry(row.id);
      message("刪除成功", { type: "success" });
      fetchData();
    } catch (e) {
      message("刪除失敗", { type: "error" });
    }
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-TW');
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
            <span class="font-bold text-lg">家長提問列表</span>
            <el-tag v-if="unreadCount > 0" type="danger" size="small">
              {{ unreadCount }} 則未讀
            </el-tag>
          </div>
        </div>
      </template>

      <el-table :data="inquiries" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="電話" width="130" />
        <el-table-column prop="question" label="問題內容" min-width="300">
          <template #default="scope">
            <div style="white-space: pre-wrap;">{{ scope.row.question }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提問時間" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="is_read" label="狀態" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_read ? 'info' : 'danger'" size="small">
              {{ scope.row.is_read ? '已讀' : '未讀' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.is_read"
              link 
              type="success" 
              :icon="Check" 
              @click="handleMarkRead(scope.row)"
            >已讀</el-button>
            <el-button 
              link 
              type="danger" 
              :icon="Delete" 
              @click="handleDelete(scope.row)"
            >刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.main {
  padding: 20px;
}
</style>
