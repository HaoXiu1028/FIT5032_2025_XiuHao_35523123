<template>
    <el-container class="home-container">
      <!-- 顶部 Header -->
      <el-header class="home-header">
        <!-- 左侧空白占位，用于平衡右侧按钮，确保标题真居中 -->
        <div class="header-spacer"></div>
        
        <!-- 居中的标题 -->
        <div class="header-title">
          {{ welcomeMessage }}
        </div>
  
        <!-- 右侧的登录/注册按钮 -->
        <div class="header-buttons">
          <div v-if="!isLoggedIn">
            <el-button @click="goTo('/login')">Login</el-button>
            <el-button @click="goTo('/register')">Register</el-button>
          </div>
        </div>
      </el-header>
  
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside width="220px" class="home-aside">
          <el-menu
            default-active="home"
            class="el-menu-vertical-demo"
            router
          >
            <el-menu-item index="/home">
              <el-icon><House /></el-icon>
              <span>HomePage</span>
            </el-menu-item>
            <el-menu-item index="/activities">
              <el-icon><Football /></el-icon>
              <span>community activities</span>
            </el-menu-item>
            <el-sub-menu index="medical">
              <template #title>
                <el-icon><FirstAidKit /></el-icon>
                <span>medical services</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/Prevention">Prevention</el-menu-item>
                <el-menu-item index="/Appointments">Appointments</el-menu-item>
                <el-menu-item index="/map">
                    <el-icon><Location /></el-icon>
                    <span>Map</span>
                </el-menu-item>
                <!-- <el-menu-item index="/MyHealth">My Health</el-menu-item> -->
              </el-menu-item-group>
            </el-sub-menu>
            <el-menu-item index="/rating">
              <el-icon><Star /></el-icon>
              <span>service rating</span>
            </el-menu-item>
            <el-menu-item index="/myaccount">
              <el-icon><User /></el-icon>
              <span>my account</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
  
        <!-- 主内容区域 -->
        <el-main class="home-main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import { House, Football, FirstAidKit, Star, User } from '@element-plus/icons-vue';
  
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  const isLoggedIn = ref(false);
  const welcomeMessage = ref('Welcome to the Immigrant Health System');
  
  onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        isLoggedIn.value = true;
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        
        // 优先使用 username。只有当 username 不存在或为空时，才回退到使用 email。
        if (docSnap.exists() && docSnap.data().username && docSnap.data().username.trim() !== '') {
          welcomeMessage.value = `Hello, ${docSnap.data().username}`;
        } else {
          welcomeMessage.value = `Hello, ${user.email}`;
        }
      } else {
        isLoggedIn.value = false;
        welcomeMessage.value = 'Welcome to the Immigrant Health System';
      }
    });
  });
  
  const goTo = (path) => {
    router.push(path);
  };
  </script>
  
  <style scoped>
  .home-container {
    height: 100vh;
  }
  
  .home-header {
    background-color: #409EFF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 20px;
  }
  
  /* 新增和修改的样式 */
  .header-title {
    flex-grow: 1;
    text-align: center;
  }
  
  .header-spacer, .header-buttons {
    width: 200px; /* 确保左右两边宽度一致 */
    flex-shrink: 0;
  }
  
  .header-buttons {
    text-align: right;
  }
  /* ----- */
  
  .home-aside {
    background-color: #FFFFFF;
    border-right: 1px solid #e6e6e6;
  }
  
  .el-menu-vertical-demo {
    border-right: none;
  }
  
  .home-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
  </style>