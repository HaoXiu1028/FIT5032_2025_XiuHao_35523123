<!-- <template>
  <div class="login-container">
    <div class="login-box">
      <h2>登入您的账户</h2>
      <p>Welcome to Immigrant Health System</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="email" v-model="email" placeholder="邮箱" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="密码" required>
        </div>
        <div class="form-group admin-check">
          <input type="checkbox" id="isAdmin" v-model="isAdmin">
          <label for="isAdmin">以管理员身份登入</label>
        </div>
        <button type="submit" class="login-button">登 入</button>
      </form>
      
      <div class="signup-link">
        <span>没有账户？</span>
        <a href="/register">立即创建一个</a>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      isAdmin: false,
    };
  },
  methods: {
    handleLogin() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          console.log('Firebase 认证成功! 准备跳转主界面...');
          
          // 1. 设置标记，让 App.vue 知道需要弹窗
          sessionStorage.setItem('showLoginGreeting', 'true');

          // 2. 跳转到您之前可以正常工作的根路径'/'
          this.$router.push('/'); 

        })
        .catch((error) => {
          console.error("登录失败:", error.message);
          alert("登录失败: " + error.code + " - " + error.message);
        });
    }
  }
};
</script> -->


<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登入您的账户</h2>
      <p>Welcome to Immigrant Health System</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="email" v-model="email" placeholder="邮箱" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="密码" required>
        </div>
        <div class="form-group admin-check">
          <input type="checkbox" id="isAdmin" v-model="isAdmin">
          <label for="isAdmin">以管理员身份登入</label>
        </div>
        <button type="submit" class="login-button">登 入</button>
      </form>
      
      <div class="signup-link">
        <span>没有账户？</span>
        <a href="/register">立即创建一个</a>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      isAdmin: false,
    };
  },
  methods: {
    handleLogin() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          console.log('Firebase 认证成功! 准备跳转主界面...');
          
          // 步骤 1: 在跳转之前，设置一个临时标记。
          sessionStorage.setItem('showLoginGreeting', 'true');

          // 步骤 2: 跳转到您之前可以正常工作的根路径'/'。
          this.$router.push('/'); 

        })
        .catch((error) => {
          console.error("登录失败:", error.message);
          alert("登录失败: " + error.code + " - " + error.message);
        });
    }
  }
};
</script>

<style scoped>
/* 您已有的样式，未改动 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f7f6;
  font-family: Arial, sans-serif;
}
.login-box {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}
h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}
p {
  color: #777;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-group.admin-check {
  display: flex;
  align-items: center;
}
.form-group.admin-check input {
  margin-right: 0.5rem;
}
.login-button {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.signup-link {
  margin-top: 1.5rem;
  color: #555;
}
.signup-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
</style>