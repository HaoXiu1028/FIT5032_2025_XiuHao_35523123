<!-- src/views/admin/AdminDashboard.vue (Final Version with Live Data) -->
<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Administrator! Manage your platform here.</p>
      </div>
      <el-button type="danger" plain :icon="SwitchButton" @click="handleLogout">
        Logout
      </el-button>
    </header>

    <el-tabs v-model="activeTab" class="dashboard-tabs">
      
      <!-- Tab 1 (Default): Dashboard Overview with LIVE DATA -->
      <el-tab-pane label="Dashboard Overview" name="overview">
        <div class="overview-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-card">
                  <div class="stat-icon" style="background-color: #e6f7ff; color: #1890ff;">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-title">Total Users</div>
                    <!-- Data is now bound to a reactive variable -->
                    <div class="stat-value">{{ stats.totalUsers }}</div>
                    <!-- Display user types breakdown -->
                    <div class="stat-detail">
                      Regular Users: {{ stats.userTypes.user || 0 }} | Admins: {{ stats.userTypes.admin || 0 }}
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-card">
                   <div class="stat-icon" style="background-color: #f6ffed; color: #52c41a;">
                    <el-icon><Finished /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-title">Total Appointments Made</div>
                    <div class="stat-value">{{ stats.totalAppointments }}</div>
                    <div class="stat-detail">&nbsp;</div> <!-- Placeholder for alignment -->
                  </div>
                </div>
              </el-card>
            </el-col>
            <col :span="8">
              <el-card shadow="hover">
                <div class="stat-card">
                  <div class="stat-icon" style="background-color: #fffbe6; color: #faad14;">
                    <el-icon><List /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-title">Currently Available Slots</div>
                    <div class="stat-value">{{ stats.availableServices }}</div>
                    <div class="stat-detail">&nbsp;</div> <!-- Placeholder for alignment -->
                  </div>
                </div>
              </el-card>
            </col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Appointment Management -->
      <el-tab-pane label="Appointment Management" name="appointments">
        <AppointmentManager />
      </el-tab-pane>

      <!-- Tab 3: User Feedback (Placeholder) -->
      <el-tab-pane label="User Feedback" name="feedback">
        <UserFeedback />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// 1. Import Firebase functions
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import UserFeedback from './UserFeedback.vue'; 
import AppointmentManager from './AppointmentManager.vue';
import { SwitchButton, User, Finished, List } from '@element-plus/icons-vue';

const activeTab = ref('overview'); 
const router = useRouter();
const db = getFirestore();

// 2. Create a reactive object to hold all statistics
const stats = ref({
  totalUsers: 0,
  userTypes: {},
  totalAppointments: 0,
  availableServices: 0
});

// 3. Store unsubscribe functions for cleanup
let unsubscribers = [];

// 4. Fetch data when component is mounted
onMounted(() => {
  // Listener for Users
  const usersQuery = collection(db, 'users');
  const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
    stats.value.totalUsers = snapshot.size;
    const types = {};
    snapshot.forEach(doc => {
      const role = doc.data().role || 'user'; // Default to 'user' if role is not defined
      types[role] = (types[role] || 0) + 1;
    });
    stats.value.userTypes = types;
  });
  
  // Listener for Appointments
  const appointmentsQuery = collection(db, 'appointments');
  const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
    stats.value.totalAppointments = snapshot.size;
  });

  // Listener for Available Services
  const servicesQuery = query(collection(db, 'available_services'), where('status', '==', 'available'));
  const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
    stats.value.availableServices = snapshot.size;
  });

  // Store all unsubscribe functions
  unsubscribers = [unsubUsers, unsubAppointments, unsubServices];
});

// 5. Clean up listeners when component is unmounted to prevent memory leaks
onUnmounted(() => {
  unsubscribers.forEach(unsub => unsub());
});

const handleLogout = () => {
  console.log("Admin logged out.");
  router.push('/login');
};

</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.dashboard-header h1 { font-size: 28px; margin: 0; }
.dashboard-header p { color: #909399; margin-top: 5px; }
.dashboard-tabs { margin-top: 20px; }

.overview-content { padding: 20px; }
.placeholder-content { padding: 40px; text-align: center; background-color: #f9f9f9; border-radius: 8px; }
.placeholder-content h2 { font-size: 22px; }
.placeholder-content p { color: #606266; margin-bottom: 25px; }

.stat-card { display: flex; align-items: center; }
.stat-icon { font-size: 24px; padding: 12px; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; }
.stat-info { display: flex; flex-direction: column; }
.stat-title { color: #909399; font-size: 14px; margin-bottom: 5px; }
.stat-value { font-size: 22px; font-weight: bold; color: #303133; }
/* New style for sub-details */
.stat-detail {
  font-size: 12px;
  color: #c0c4cc;
  min-height: 18px; /* To prevent layout shift */
}
</style>