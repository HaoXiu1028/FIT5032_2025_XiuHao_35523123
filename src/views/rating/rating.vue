<!-- src/views/rating/rating.vue (FIXED) -->
<template>
  <div class="page-container">
    <h1 class="page-title">Feature Feedback & Rating</h1>
    <p class="page-description">
      Your feedback is valuable to us. Please rate the following features and leave your comments.
    </p>
    
    <div class="rating-form">
      <el-card v-for="item in feedbackItems" :key="item.name" class="rating-card">
        <template #header><strong>{{ item.name }}</strong></template>
        <div class="rating-body">
          <div class="score-section">
            <span class="rating-label">Your Score:</span>
            <el-rate v-model="item.score" :texts="['oops', 'disappointed', 'normal', 'good', 'great']" show-text />
          </div>
          <el-input
            v-model="item.comment"
            type="textarea"
            :rows="3"
            placeholder="Leave your comments here..."
            maxlength="500"
            show-word-limit
          />
        </div>
      </el-card>

      <el-button 
        type="primary" 
        size="large" 
        class="submit-button" 
        @click="handleSubmitFeedback"
        :loading="isSubmitting"
      >
        Submit All Feedback
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 1. Import all necessary Firebase functions, INCLUDING 'doc'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { ElMessage } from 'element-plus';

const isSubmitting = ref(false);
const feedbackItems = ref([
  { name: 'Community Activities', score: 0, comment: '' },
  { name: 'Prevention', score: 0, comment: '' },
  { name: 'Appointments', score: 0, comment: '' },
  { name: 'Map', score: 0, comment: '' }
]);
const db = getFirestore();
const router = useRouter();

const handleSubmitFeedback = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    ElMessage.error("You must be logged in to submit feedback.");
    router.push('/login');
    return;
  }
  
  isSubmitting.value = true;
  const submittedItems = feedbackItems.value.filter(item => item.score > 0);
  if (submittedItems.length === 0) {
    ElMessage.warning("Please rate at least one feature before submitting.");
    isSubmitting.value = false;
    return;
  }

  try {
    const batch = writeBatch(db);
    const feedbackCol = collection(db, 'feedback');

    submittedItems.forEach(item => {
      // 2. THIS IS THE FIX: Use the imported 'doc' function
      const newFeedbackRef = doc(feedbackCol); // Correct V9 syntax
      
      batch.set(newFeedbackRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        featureName: item.name,
        score: item.score,
        comment: item.comment,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    ElMessage.success("Thank you! Your feedback has been submitted successfully.");
    
    feedbackItems.value.forEach(item => {
      item.score = 0;
      item.comment = '';
    });

  } catch (error) {
    console.error("Error submitting feedback:", error);
    ElMessage.error("Failed to submit feedback. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Styles remain the same */
.page-container { max-width: 900px; margin: 0 auto; padding: 24px; }
.page-title { text-align: center; font-size: 28px; }
.page-description { text-align: center; color: #606266; margin-bottom: 30px; }
.rating-card { margin-bottom: 20px; }
.rating-body { display: flex; flex-direction: column; gap: 15px; }
.score-section { display: flex; align-items: center; gap: 10px; }
.rating-label { font-weight: 500; }
.submit-button { width: 100%; margin-top: 20px; }
</style>