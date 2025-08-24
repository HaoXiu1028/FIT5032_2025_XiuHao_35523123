import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'



import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});


const fontAwesomeScript = document.createElement('script')
fontAwesomeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'
document.head.appendChild(fontAwesomeScript)

const app = createApp(App)




// Element组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'



app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
  
}


app.use(ElementPlus)
app.mount('#app')



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBNj2QWHgHWkeLmu3RZHubEZWxusRykoqs",
  authDomain: "immigrant--health-system-aad22.firebaseapp.com",
  projectId: "immigrant--health-system-aad22",
  storageBucket: "immigrant--health-system-aad22.firebasestorage.app",
  messagingSenderId: "601741824081",
  appId: "1:601741824081:web:a858d6d0712557a8cc6870"
};

// Initialize Firebase
initializeApp(firebaseConfig);







