<!-- src/views/Appointments/Appointments.vue (Direct Auth Check Method) -->
<template>
  <div class="page-container">
    <div class="actions-header">
      <h1 class="page-title">Book an Appointment</h1>
      <div class="controls-wrapper">
        <el-input v-model="searchQuery" placeholder="Search by service or doctor..." class="search-input" :prefix-icon="Search" clearable />
        <el-button type="success" :icon="UserIcon" @click="goToMyBookings">My Bookings</el-button>
      </div>
    </div>

    <!-- The rest of your template remains exactly the same -->
    <el-table :data="paginatedSlots" v-loading="loading" style="width: 100%" stripe>
      <el-table-column
        prop="formattedDateTime"
        label="Available Date & Time"
        sortable
        :sort-method="sortByDateTime"
      />
      <el-table-column prop="serviceType" label="Service" sortable />
      <el-table-column prop="doctorName" label="Doctor" sortable />
      <el-table-column prop="duration" label="Duration (mins)" sortable />
      <el-table-column label="Actions" width="150" align="center">
         <template #default="scope">
          <el-button size="small" type="primary" @click="handleBooking(scope.row)">Book This Slot</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-footer" v-if="filteredSlots.length > 0">
      <el-pagination background layout="prev, pager, next" :total="filteredSlots.length" :page-size="pageSize" v-model:current-page="currentPage" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
// 1. IMPORT getAuth from firebase/auth
import { getAuth } from 'firebase/auth'; 
import { getFirestore, collection, query, where, onSnapshot, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, User as UserIcon } from '@element-plus/icons-vue';

const availableSlots = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
// No more global user state needed in this file

const db = getFirestore();
const router = useRouter();

onMounted(() => {
  // Data fetching logic remains the same
  const q = query(collection(db, 'available_services'), where("status", "==", "available"));
  onSnapshot(q, (snapshot) => {
    availableSlots.value = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        originalTimestamp: data.appointmentDateTime,
        formattedDateTime: data.appointmentDateTime.toDate().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      };
    });
    loading.value = false;
  });
});

// All computed properties and watchers remain the same
const filteredSlots = computed(() => {
  if (!searchQuery.value) return availableSlots.value;
  return availableSlots.value.filter(slot =>
    slot.serviceType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    slot.doctorName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedSlots = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredSlots.value.slice(start, end);
});

watch(searchQuery, () => { currentPage.value = 1; });

const goToMyBookings = () => router.push('/my-bookings');
const sortByDateTime = (a, b) => a.originalTimestamp.toMillis() - b.originalTimestamp.toMillis();


// --- THIS IS THE KEY MODIFICATION ---
const handleBooking = (slot) => {
  // 2. GET THE AUTH INSTANCE
  const auth = getAuth();
  // 3. GET THE CURRENT USER AT THE MOMENT OF THE CLICK
  const currentUser = auth.currentUser;

  // 4. CHECK IF THE USER IS LOGGED IN
  if (!currentUser) {
    ElMessage.error("You must be logged in to book an appointment.");
    router.push('/login');
    return;
  }

  ElMessageBox.confirm(
    `Confirm booking for <strong>${slot.serviceType}</strong> with ${slot.doctorName}?`,
    'Confirm Your Booking',
    { dangerouslyUseHTMLString: true, confirmButtonText: 'Confirm', type: 'info' }
  ).then(async () => {
    try {
      await runTransaction(db, async (transaction) => {
        const serviceSlotRef = doc(db, 'available_services', slot.id);
        const newAppointmentRef = doc(collection(db, 'appointments'));

        transaction.update(serviceSlotRef, { status: "booked" });
        
        // 5. USE THE DYNAMICALLY FETCHED USER INFO
        transaction.set(newAppointmentRef, {
          userId: currentUser.uid,        // <-- Get ID directly from currentUser
          userEmail: currentUser.email,   // <-- Get Email directly from currentUser
          doctorName: slot.doctorName,
          serviceType: slot.serviceType,
          appointmentDate: slot.originalTimestamp,
          status: 'Scheduled',
          createdAt: serverTimestamp(),
          serviceSlotId: slot.id
        });
      });
      ElMessage.success('Appointment booked successfully!');
    } catch (e) {
      console.error("Transaction failed: ", e);
      ElMessage.error("Booking failed. The slot may have been taken.");
    }
  }).catch(() => {
    ElMessage.info('Booking cancelled.');
  });
};
</script>

<style scoped>
/* No changes to styles */
.page-container { padding: 24px; }
.actions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; color: #303133; margin: 0; }
.controls-wrapper { display: flex; align-items: center; gap: 15px; }
.search-input { width: 300px; }
.pagination-footer { display: flex; justify-content: center; margin-top: 20px; }
</style>