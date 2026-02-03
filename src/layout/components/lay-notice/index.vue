<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { noticesData, type TabItem, type ListItem } from "./data";
import NoticeList from "./components/NoticeList.vue";
import BellIcon from "~icons/ep/bell";
import { getRegistrations } from "@/api/registrations";

const noticesNum = ref(0);
const notices = ref<TabItem[]>([]);
const activeKey = ref("");

const fetchData = async () => {
    try {
        const res: any = await getRegistrations();
        const regs = res.registrations || [];
        
        // Map registrations to notification items (take top 10 latest)
        const list: ListItem[] = regs.slice(0, 10).map((reg: any) => ({
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + reg.student_name, // Random avatar
            title: `新報名：${reg.student_name}`,
            description: `班級：${reg.class_name}`,
            datetime: reg.created_at?.split('T')[0] || '',
            type: "1",
            // Store raw created_at for comparison, removing microseconds to avoid parsing issues
            rawDate: reg.created_at?.split('.')[0] || reg.created_at
        }));

        notices.value = [
            {
                key: "1",
                name: "報名通知",
                list: list,
                emptyText: "暫無新報名"
            }
        ];
        
        activeKey.value = "1";

        // Calculate unread count based on last read time from localStorage
        const lastReadTime = localStorage.getItem('notice_last_read_time') || '0';
        const unreadCount = list.filter(item => {
             // @ts-ignore
             return new Date(item.rawDate).getTime() > new Date(lastReadTime).getTime();
        }).length;

        noticesNum.value = unreadCount;
        
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
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
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
