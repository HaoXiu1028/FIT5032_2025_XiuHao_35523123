<!-- src/views/admin/UserFeedback.vue -->
<template>
  <div class="feedback-container">
    <!-- 1. Average Score Statistics -->
    <el-card class="stats-card" shadow="never">
      <template #header><strong>Average Feature Ratings</strong></template>
      <div v-if="!loading" class="stats-grid">
        <div v-for="stat in feedbackStats" :key="stat.name" class="stat-item">
          <el-statistic :title="stat.name" :value="stat.average" precision="2">
             <template #suffix>
              <span class="rating-suffix">/ 5</span>
            </template>
          </el-statistic>
          <div class="rating-count">{{ stat.count }} ratings</div>
        </div>
      </div>
       <el-skeleton :rows="2" animated v-else />
    </el-card>

    <!-- 2. Detailed Feedback Table -->
    <h2 class="table-title">All Feedback Submissions</h2>
    <el-table :data="allFeedback" v-loading="loading" stripe border>
      <el-table-column prop="createdAt" label="Date" width="200" sortable>
        <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
      </el-table-column>
      <el-table-column prop="featureName" label="Feature" width="180" sortable />
      <el-table-column prop="score" label="Score" width="100" sortable align="center" />
      <el-table-column prop="comment" label="Comment" min-width="300" />
      <el-table-column prop="userEmail" label="Submitted By" width="220" sortable />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// --- State ---
const allFeedback = ref([]);
const loading = ref(true);
let unsubscribe = null; // To hold the listener cleanup function

const db = getFirestore();

// --- Data Fetching ---
onMounted(() => {
  const feedbackQuery = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
    allFeedback.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  });
});

// Cleanup listener on component unmount
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// --- Computed Property for Statistics ---
const feedbackStats = computed(() => {
  const stats = {};
  // Group feedback by featureName
  allFeedback.value.forEach(item => {
    if (!stats[item.featureName]) {
      stats[item.featureName] = { name: item.featureName, totalScore: 0, count: 0 };
    }
    stats[item.featureName].totalScore += item.score;
    stats[item.featureName].count += 1;
  });

  // Calculate average and convert to array for rendering
  return Object.values(stats).map(stat => ({
    ...stat,
    average: stat.count > 0 ? stat.totalScore / stat.count : 0
  }));
});

// --- Methods ---
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};
</script>

<style scoped>
.feedback-container { padding: 20px; }
.stats-card { margin-bottom: 30px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
.stat-item { text-align: center; }
.rating-suffix { font-size: 14px; color: #a8abb2; margin-left: 4px; }
.rating-count { font-size: 12px; color: #909399; margin-top: 5px; }
.table-title { font-size: 20px; margin-bottom: 15px; }
</style>