<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { type TabItem, type ListItem } from "./data";
import NoticeList from "./components/NoticeList.vue";
import BellIcon from "~icons/ep/bell";
import { getRegistrations } from "@/api/registrations";
import { getInquiries } from "@/api/inquiries";

const noticesNum = ref(0);
const notices = ref<TabItem[]>([]);
const activeKey = ref("");

const fetchData = async () => {
    try {
        // Fetch registrations and inquiries in parallel
        const [regRes, inqRes]: any[] = await Promise.all([
            getRegistrations(),
            getInquiries()
        ]);
        
        const regs = regRes.registrations || [];
        const inquiries = inqRes.inquiries || [];
        
        // Build registration notifications (new + updates)
        const regList: ListItem[] = regs.slice(0, 15).map((reg: any) => {
            // Check if this is an update (updated_at differs from created_at)
            const createdAt = reg.created_at ? new Date(reg.created_at).getTime() : 0;
            const updatedAt = reg.updated_at ? new Date(reg.updated_at).getTime() : 0;
            const isUpdate = updatedAt > createdAt + 60000; // More than 1 minute difference = update
            
            return {
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + reg.student_name,
                title: isUpdate ? `📝 資料修改：${reg.student_name}` : `🆕 新報名：${reg.student_name}`,
                description: `班級：${reg.class_name}`,
                datetime: (isUpdate ? reg.updated_at : reg.created_at)?.split('T')[0] || '',
                type: "1",
                rawDate: isUpdate ? reg.updated_at : reg.created_at || ''
            };
        });
        
        // Build inquiry notifications
        const inqList: ListItem[] = inquiries.slice(0, 10).map((inq: any) => ({
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + inq.name,
            title: `❓ 家長提問：${inq.name}`,
            description: inq.question.length > 30 ? inq.question.substring(0, 30) + '...' : inq.question,
            datetime: inq.created_at?.split('T')[0] || '',
            type: "2",
            rawDate: inq.created_at || '',
            extra: inq.is_read ? '' : '未讀'
        }));

        notices.value = [
            {
                key: "1",
                name: "報名通知",
                list: regList,
                emptyText: "暫無報名通知"
            },
            {
                key: "2",
                name: "家長提問",
                list: inqList,
                emptyText: "暫無家長提問"
            }
        ];
        
        activeKey.value = "1";

        // Calculate unread count based on last read time from localStorage
        const lastReadTime = localStorage.getItem('notice_last_read_time') || '0';
        
        // Count unread registrations
        const unreadRegs = regList.filter(item => {
            // @ts-ignore
            return new Date(item.rawDate).getTime() > new Date(lastReadTime).getTime();
        }).length;
        
        // Count unread inquiries (either new since last read, or marked as unread in DB)
        const unreadInqs = inqList.filter(item => {
            // @ts-ignore
            return item.extra === '未讀' || new Date(item.rawDate).getTime() > new Date(lastReadTime).getTime();
        }).length;

        noticesNum.value = unreadRegs + unreadInqs;
        
    } catch (error) {
        console.error("Failed to fetch notifications", error);
    }
};

onMounted(() => {
    fetchData();
});

const getLabel = computed(
  () => item =>
    item.name + (item.list.length > 0 ? `(${item.list.length})` : "")
);

const onVisibleChange = (val: boolean) => {
    if (val) {
        noticesNum.value = 0;
        // Save current time as last read time
        localStorage.setItem('notice_last_read_time', new Date().toISOString());
    }
};
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end" @visible-change="onVisibleChange">
    <span
      :class="[
        'dropdown-badge',
        'navbar-bg-hover',
        'select-none',
        Number(noticesNum) !== 0 && 'mr-[10px]'
      ]"
    >
      <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="BellIcon" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '360px' }"
        >
          <el-empty
            v-if="notices.length === 0"
            description="暫無訊息"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane :label="getLabel(item)" :name="`${item.key}`">
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" :emptyText="item.emptyText" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
