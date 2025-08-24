<!-- src/views/Appointments/MyBookings.vue (Final Version) -->
<template>
  <div class="page-container">
    <!-- Show content only when user is confirmed to be logged in -->
    <div v-if="currentUser">
      <div class="actions-header">
        <h1 class="page-title">My Appointments</h1>
        <div class="controls-wrapper">
          <el-button :icon="ArrowLeft" @click="goBackToServices">Back to Services</el-button>
          <el-input v-model="searchQuery" placeholder="Search by doctor or service..." class="search-input" :prefix-icon="Search" clearable />
        </div>
      </div>
      <el-table :data="paginatedAppointments" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="formattedDate" label="Appointment Date & Time" sortable />
        <el-table-column prop="serviceType" label="Service" sortable />
        <el-table-column prop="doctorName" label="Doctor" sortable />
        <el-table-column prop="status" label="Status" sortable>
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleCancelAppointment(scope.row)" :disabled="scope.row.status !== 'Scheduled'">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-footer" v-if="filteredAppointments.length > 0">
        <el-pagination background layout="prev, pager, next" :total="filteredAppointments.length" :page-size="pageSize" v-model:current-page="currentPage" />
      </div>
    </div>
    <!-- Show a message if user is not logged in -->
    <div v-else-if="!loading">
      <p>Please log in to view your appointments.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
// 1. Import Firebase Auth functions directly
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, ArrowLeft } from '@element-plus/icons-vue';

const appointments = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const router = useRouter();
const db = getFirestore();

// 2. Create a local reactive variable to hold the user state
const currentUser = ref(null);
let unsubscribeAuth = null; // To hold the cleanup function for the listener

// 3. Set up the auth listener when the component is mounted
onMounted(() => {
  const auth = getAuth();
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, save their info
      currentUser.value = user;
      // Now that we have the user, fetch their appointments
      fetchAppointments(user.uid);
    } else {
      // User is logged out
      currentUser.value = null;
      appointments.value = []; // Clear any existing data
      loading.value = false;
    }
  });
});

// 4. Clean up the listener when the component is destroyed
onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});

// 5. Create a function to fetch data, which is called by the auth listener
let unsubscribeAppointments = null;
const fetchAppointments = (userId) => {
  loading.value = true;
  // Clean up previous listener if it exists
  if (unsubscribeAppointments) unsubscribeAppointments();

  const q = query(collection(db, 'appointments'), where("userId", "==", userId));
  unsubscribeAppointments = onSnapshot(q, (snapshot) => {
    appointments.value = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        formattedDate: data.appointmentDate.toDate().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
      };
    });
    loading.value = false;
  });
};

const goBackToServices = () => router.push('/appointments');

const handleCancelAppointment = (appointment) => {
  // ... (cancellation logic remains the same as before)
  ElMessageBox.confirm('Are you sure you want to cancel this appointment?', 'Confirm Cancellation', { type: 'warning' })
    .then(async () => {
      await runTransaction(db, async (transaction) => {
        const appointmentRef = doc(db, 'appointments', appointment.id);
        const serviceSlotRef = doc(db, 'available_services', appointment.serviceSlotId);
        transaction.update(appointmentRef, { status: 'Cancelled' });
        transaction.update(serviceSlotRef, { status: 'available' });
      });
      ElMessage.success('Appointment cancelled and slot is now available again.');
    }).catch(() => ElMessage.info('Cancellation aborted.'));
};

// Computed properties remain the same
const filteredAppointments = computed(() => {
  if (!searchQuery.value) return appointments.value;
  return appointments.value.filter(apt =>
    (apt.doctorName?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (apt.serviceType?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});
const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredAppointments.value.slice(start, end);
});
watch(searchQuery, () => { currentPage.value = 1; });
const getStatusTagType = (status) => ({ Scheduled: 'primary', Completed: 'success', Cancelled: 'info' }[status] || 'warning');
</script>

<style scoped>
.page-container { padding: 24px; }
.actions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; color: #303133; margin: 0; }
.controls-wrapper { display: flex; align-items: center; gap: 15px; }
.search-input { width: 250px; }
.pagination-footer { display: flex; justify-content: center; margin-top: 20px; }
</style>