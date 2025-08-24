<!-- src/views/admin/AppointmentManager.vue (FIXED) -->
<template>
  <div class="manager-container">
    <!-- 1. Controls: Search and Batch Actions -->
    <div class="controls-bar">
      <el-input
        v-model="searchQuery"
        placeholder="Search by user email, doctor, or service..."
        class="search-input"
        :prefix-icon="Search"
        clearable
      />
      <el-button
        type="danger"
        :icon="Delete"
        @click="handleBatchCancel"
        :disabled="selectedAppointments.length === 0"
      >
        Cancel Selected ({{ selectedAppointments.length }})
      </el-button>
    </div>

    <!-- 2. Data Table -->
    <el-table
      :data="paginatedAppointments"
      v-loading="loading"
      style="width: 100%"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="formattedDate" label="Appointment Date & Time" sortable />
      <!-- This column will now correctly display the email from the database record -->
      <el-table-column prop="userEmail" label="User Email" sortable />
      <el-table-column prop="doctorName" label="Doctor" sortable />
      <el-table-column prop="serviceType" label="Service" sortable />
      <el-table-column prop="status" label="Status" sortable>
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150" align="center">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 3. Pagination -->
    <div class="pagination-footer" v-if="filteredAppointments.length > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredAppointments.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- 4. Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="Edit Appointment Status" width="500px">
      <el-form label-position="top">
        <el-form-item label="User">
          <!-- This will now correctly display the email of the appointment being edited -->
          <strong>{{ currentEditingAppointment?.userEmail }}</strong>
        </el-form-item>
        <el-form-item label="Service">
          <span>{{ currentEditingAppointment?.serviceType }} with {{ currentEditingAppointment?.doctorName }}</span>
        </el-form-item>
        <el-form-item label="Current Status">
           <el-select v-model="currentEditingAppointment.status" placeholder="Select status">
            <el-option label="Scheduled" value="Scheduled" />
            <el-option label="Completed" value="Completed" />
            <el-option label="Cancelled" value="Cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateAppointment">Save Changes</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getFirestore, collection, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Delete } from '@element-plus/icons-vue';

const allAppointments = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const selectedAppointments = ref([]);
const editDialogVisible = ref(false);
const currentEditingAppointment = ref(null);

const db = getFirestore();

onMounted(() => {
  const q = collection(db, 'appointments');
  onSnapshot(q, (snapshot) => {
    allAppointments.value = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        formattedDate: data.appointmentDate.toDate().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
      };
    });
    loading.value = false;
  });
});

const filteredAppointments = computed(() => {
  if (!searchQuery.value) return allAppointments.value;
  return allAppointments.value.filter(apt =>
    (apt.userEmail?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
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

const handleSelectionChange = (val) => {
  selectedAppointments.value = val;
};

// --- FIXES ARE IN THE METHODS BELOW ---

const handleBatchCancel = () => {
  ElMessageBox.confirm(
    `Are you sure you want to cancel ${selectedAppointments.value.length} selected appointments?`,
    'Confirm Batch Cancellation',
    { type: 'warning' }
  ).then(async () => {
    loading.value = true;
    const batch = writeBatch(db);
    // The key change is here: we iterate over the *selected* appointments,
    // and use the data from each one ('apt'), not from a global variable.
    selectedAppointments.value.forEach(apt => {
      if (apt.status === 'Scheduled' && apt.serviceSlotId) {
        const appointmentRef = doc(db, 'appointments', apt.id);
        batch.update(appointmentRef, { status: 'Cancelled' });

        const serviceSlotRef = doc(db, 'available_services', apt.serviceSlotId);
        batch.update(serviceSlotRef, { status: 'available' });
      }
    });
    await batch.commit();
    loading.value = false;
    ElMessage.success('Services have been cancelled, and simulated notification emails have been sent.');
  }).catch(() => ElMessage.info('Batch cancellation aborted.'));
};

const openEditDialog = (appointment) => {
  // The key change is here: we are creating a copy of the *specific appointment*
  // that was passed in from the table row.
  currentEditingAppointment.value = { ...appointment };
  editDialogVisible.value = true;
};

const handleUpdateAppointment = async () => {
  if (!currentEditingAppointment.value) return;
  
  // All logic here now correctly refers to 'currentEditingAppointment.value',
  // which holds the data of the specific row being edited.
  const appointmentRef = doc(db, 'appointments', currentEditingAppointment.value.id);
  const newStatus = currentEditingAppointment.value.status;
  const shouldUpdateSlot = newStatus === 'Cancelled' && currentEditingAppointment.value.serviceSlotId;

  const batch = writeBatch(db);
  batch.update(appointmentRef, { status: newStatus });
  if (shouldUpdateSlot) {
    const serviceSlotRef = doc(db, 'available_services', currentEditingAppointment.value.serviceSlotId);
    batch.update(serviceSlotRef, { status: 'available' });
  }

  await batch.commit();
  editDialogVisible.value = false;
  ElMessage.success('Appointment updated successfully.');
  if (newStatus === 'Cancelled') {
    ElMessage.info('A simulated notification email has been sent to the user.');
  }
};
</script>

<style scoped>
.manager-container { padding: 20px; }
.controls-bar { display: flex; justify-content: space-between; margin-bottom: 20px; }
.search-input { max-width: 400px; }
.pagination-footer { display: flex; justify-content: center; margin-top: 20px; }
</style>