<template>
    <div class="activities-container">
      <!-- 顶部操作栏 -->
      <div class="actions-bar">
        <el-form :inline="true" :model="filters" @submit.prevent="fetchActivities">
          <el-form-item>
            <el-input v-model="filters.name" placeholder="搜索活动名称" clearable></el-input>
          </el-form-item>
          <el-form-item>
             <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchActivities">查询</el-button>
            <el-button @click="clearFilters">清空</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="$router.push('/my-activities')">My Activities</el-button>
      </div>
  
      <!-- 活动列表 -->
      <el-table :data="activities" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="活动名称" width="200" />
        <el-table-column prop="startDate" label="开始日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.startDate) }}
          </template>
        </el-table-column>
         <el-table-column prop="endDate" label="结束日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="活动描述" />
        <el-table-column label="名额" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.bookedSlots >= scope.row.totalSlots ? 'danger' : 'success'">
              {{ scope.row.bookedSlots }} / {{ scope.row.totalSlots }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              v-if="!isRegistered(scope.row)"
              type="primary"
              size="small"
              :disabled="scope.row.bookedSlots >= scope.row.totalSlots"
              @click="handleRegister(scope.row)"
            >
              {{ scope.row.bookedSlots >= scope.row.totalSlots ? '已满' : '报名' }}
            </el-button>
            <el-tag v-else type="info">已报名</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, doc, runTransaction, arrayUnion, query, where, Timestamp } from "firebase/firestore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { ElMessage } from 'element-plus';
  
  const db = getFirestore();
  const auth = getAuth();
  const loading = ref(true);
  const activities = ref([]);
  let currentUser = null;
  
  const filters = ref({
    name: '',
    dateRange: []
  });
  
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
      }
      fetchActivities();
    });
  });
  
  const fetchActivities = async () => {
    loading.value = true;
    try {
      const activitiesRef = collection(db, "activities");
      let q = query(activitiesRef);
  
      // 根据名称筛选 (Firestore 不支持模糊搜索，这里做前缀匹配)
      if (filters.value.name) {
         q = query(q, where("name", ">=", filters.value.name), where("name", "<=", filters.value.name + '\uf8ff'));
      }
      // 根据日期范围筛选
      if (filters.value.dateRange && filters.value.dateRange.length === 2) {
        q = query(q, where("startDate", ">=", Timestamp.fromDate(filters.value.dateRange[0])));
        q = query(q, where("startDate", "<=", Timestamp.fromDate(filters.value.dateRange[1])));
      }
  
      const querySnapshot = await getDocs(q);
      activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      ElMessage.error("获取活动列表失败: " + error.message);
    } finally {
      loading.value = false;
    }
  };
  
  const clearFilters = () => {
      filters.value.name = '';
      filters.value.dateRange = [];
      fetchActivities();
  };
  
  const handleRegister = async (activity) => {
    if (!currentUser) {
      ElMessage.warning("请先登录再报名！");
      return;
    }
  
    const activityRef = doc(db, "activities", activity.id);
    try {
      await runTransaction(db, async (transaction) => {
        const activityDoc = await transaction.get(activityRef);
        if (!activityDoc.exists()) {
          throw "活动不存在!";
        }
  
        const data = activityDoc.data();
        if (data.bookedSlots >= data.totalSlots) {
          throw "该活动名额已满！";
        }
         if (data.registeredUsers && data.registeredUsers.includes(currentUser.uid)) {
          throw "您已经报名过此活动！";
        }
  
        transaction.update(activityRef, {
          bookedSlots: data.bookedSlots + 1,
          registeredUsers: arrayUnion(currentUser.uid)
        });
      });
      ElMessage.success("报名成功！");
      fetchActivities(); // 报名成功后刷新列表
    } catch (error) {
      ElMessage.error("报名失败: " + error);
    }
  };
  
  const isRegistered = (activity) => {
      return currentUser && activity.registeredUsers && activity.registeredUsers.includes(currentUser.uid);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleString();
  };
  
  </script>
  
  <style scoped>
  .activities-container {
    padding: 20px;
  }
  .actions-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  </style>