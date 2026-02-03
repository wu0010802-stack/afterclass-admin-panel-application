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
// ... existing code ...
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
// ... existing code ...
        <el-form-item label="影片連結" prop="video_url">
          <el-input v-model="formData.video_url" placeholder="URL" />
        </el-form-item>
        <el-form-item label="開放候補" prop="allow_waitlist">
          <el-switch v-model="formData.allow_waitlist" />
        </el-form-item>
      </el-form>
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
