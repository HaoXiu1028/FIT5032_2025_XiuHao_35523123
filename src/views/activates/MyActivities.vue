<template>
  <div class="my-activities-container" v-loading="loading">
    <h2>我报名的活动</h2>
    <el-table :data="myActivities" style="width: 100%">
      <el-table-column prop="name" label="活动名称" width="200" />
      <el-table-column prop="startDate" label="开始日期" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.startDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="活动描述" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            @click="handleCancel(scope.row)"
          >
            取消报名
          </el-button>
        </template>
      </el-table-column>
    </el-table>
     <el-empty v-if="!loading && myActivities.length === 0" description="您还没有报名任何活动"></el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ElMessage, ElMessageBox } from 'element-plus';

const db = getFirestore();
const auth = getAuth();
const loading = ref(true);
const myActivities = ref([]);
let currentUser = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      fetchMyActivities();
    } else {
      loading.value = false;
    }
  });
});

const fetchMyActivities = async () => {
  if (!currentUser) return;
  loading.value = true;
  try {
    const activitiesRef = collection(db, "activities");
    const q = query(activitiesRef, where("registeredUsers", "array-contains", currentUser.uid));
    const querySnapshot = await getDocs(q);
    myActivities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    ElMessage.error("获取活动列表失败: " + error.message);
  } finally {
    loading.value = false;
  }
};

const handleCancel = async (activity) => {
  await ElMessageBox.confirm(
    `您确定要取消报名活动 "${activity.name}" 吗?`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  );

  try {
    const activityRef = doc(db, "activities", activity.id);
    await runTransaction(db, async (transaction) => {
      const activityDoc = await transaction.get(activityRef);
      if (!activityDoc.exists()) {
        throw "活动不存在!";
      }

      const registeredUsers = activityDoc.data().registeredUsers || [];
      // 确保用户真的已报名
      if (registeredUsers.includes(currentUser.uid)) {
         transaction.update(activityRef, {
            bookedSlots: activityDoc.data().bookedSlots - 1,
            registeredUsers: registeredUsers.filter(uid => uid !== currentUser.uid)
        });
      }
    });
    ElMessage.success("成功取消报名!");
    fetchMyActivities(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
        ElMessage.error("取消失败: " + error);
    }
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleString();
};
</script>

<style scoped>
.my-activities-container {
  padding: 20px;
}
h2 {
  margin-bottom: 20px;
}
</style>