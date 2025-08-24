<template>
    <div class="account-container">
      <el-card class="account-card">
        <template #header>
          <div class="card-header">
            <h2>我的账户</h2>
            <span>管理您的个人信息</span>
          </div>
        </template>
  
        <!-- 修改个人信息表单 -->
        <el-form :model="profileForm" label-width="80px" class="profile-form">
          <h3>个人信息</h3>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username"></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="profileForm.gender" placeholder="请选择性别">
              <el-option label="男" value="male"></el-option>
              <el-option label="女" value="female"></el-option>
              <el-option label="保密" value="secret"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdateProfile">保存更改</el-button>
          </el-form-item>
        </el-form>
  
        <el-divider />
  
        <!-- 修改密码表单 -->
        <el-form :model="passwordForm" label-width="80px" class="password-form">
          <h3>修改密码</h3>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="handleChangePassword">更新密码</el-button>
          </el-form-item>
        </el-form>
        
        <el-divider />
  
        <!-- 退出登录 -->
        <div class="logout-section">
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
  
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAuth, onAuthStateChanged, updatePassword, signOut } from "firebase/auth";
  import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
  import { ElMessage } from 'element-plus';
  
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  const profileForm = ref({
    email: '',
    username: '',
    gender: '',
  });
  const passwordForm = ref({
    newPassword: '',
  });
  
  let currentUser = null;
  
  // 组件加载时，监听认证状态
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        // 获取用户信息
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            profileForm.value.email = userData.email;
            profileForm.value.username = userData.username || '';
            profileForm.value.gender = userData.gender || '';
          }
        });
      } else {
        // 如果没有用户登录，跳转到登录页
        router.push('/login');
      }
    });
  });
  
  // 更新个人信息
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        username: profileForm.value.username,
        gender: profileForm.value.gender,
      });
      ElMessage.success('个人信息更新成功！');
    } catch (error) {
      ElMessage.error(`更新失败: ${error.message}`);
    }
  };
  
  // 修改密码
  const handleChangePassword = async () => {
    if (!currentUser || !passwordForm.value.newPassword) {
      ElMessage.warning('请输入新密码');
      return;
    }
    try {
      await updatePassword(currentUser, passwordForm.value.newPassword);
      ElMessage.success('密码修改成功！请重新登录。');
      // 修改密码后强制退出，让用户用新密码登录
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      ElMessage.error(`密码修改失败: ${error.message}`);
    }
  };
  
  // 退出登录
  const handleLogout = async () => {
    try {
      await signOut(auth);
      ElMessage.success('您已成功退出登录！');
      router.push('/login');
    } catch (error) {
      ElMessage.error(`退出失败: ${error.message}`);
    }
  };
  </script>
  
  <style scoped>
  .account-container {
    display: flex;
    justify-content: center;
    padding: 40px;
    background-color: #f0f2f5;
  }
  .account-card {
    width: 600px;
  }
  .card-header {
    text-align: center;
  }
  h3 {
    color: #333;
    margin-bottom: 20px;
  }
  .logout-section {
    text-align: center;
    margin-top: 20px;
  }
  </style>