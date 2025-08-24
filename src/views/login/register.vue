<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>创建您的账户</h2>
          <span>Join the Immigrant Health System Community</span>
        </div>
      </template>

      <el-form :model="registerForm" ref="registerFormRef" @submit.prevent="handleRegister">
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" :prefix-icon="User" size="large"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" size="large"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" show-password :prefix-icon="Lock" size="large"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" class="register-button" size="large">注 册</el-button>
        </el-form-item>
      </el-form>

      <el-divider>已有账户？</el-divider>
      
      <p class="login-link">
        <router-link to="/login">立即登入</router-link>
      </p>

    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致！');
    return;
  }

  const auth = getAuth();
  const db = getFirestore();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, registerForm.value.email, registerForm.value.password);
    const user = userCredential.user;

    // 在 Firestore 中为新用户创建一个文档，并设置角色为 'user'
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: 'user', // 默认角色
      createdAt: new Date()
    });

    ElMessage.success('注册成功！');
    router.push('/login'); // 注册成功后跳转到登录页

  } catch (error) {
    console.error("Register error:", error.code, error.message);
    ElMessage.error(`注册失败: ${error.message}`);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.register-card {
  width: 400px;
}
.card-header {
  text-align: center;
}
.card-header h2 {
  margin: 0;
  color: #333;
}
.card-header span {
  font-size: 14px;
  color: #999;
}
.register-button {
  width: 100%;
}
.login-link {
  text-align: center;
  margin-top: 10px;
}
</style>