import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import rating from '../views/rating/rating.vue'
import quickAccess from '../views/quickAccess/quickAccess.vue'
import login from '../views/login/login.vue'
import news from '../views/news/news.vue'
import register from '../views/login/register.vue'
import activities from '../views/activates/activities.vue'
import Appointments from '../views/Appointments/Appointments.vue'
import myHealth from '../views/Health/myHealth.vue'
import Prevention from '../views/Prevention/Prevention.vue'
import Home from '../views/home/home.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import MyAccount from '../views/account/MyAccount.vue'
import MyActivities from '../views/activates/MyActivities.vue'
import Map from '../views/map/map.vue'
import MyBookings from '../views/Appointments/MyBookings.vue'






const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {path:'/',
      name:'',
      component:Home,
      children:[
        {path: '', name: 'defaultHome', component: quickAccess },
        {path:'rating',name:'rating',component:rating},
        {path:'home',name:'home',component:quickAccess},
        {path:'news',name:'news',component:news},
        {path:'activities',name:'activities',component:activities},
        {path:'my-activities', name:'my-activities', component:MyActivities},
        {path:'Prevention',name:'Prevention',component:Prevention},
        {path:'Appointments',name:'Appointments',component:Appointments},
        {path:'MyHealth',name:'MyHealth',component:myHealth},
        {path:'map', name:'map', component: Map},
        {path:'myaccount', name:'myaccount', component:MyAccount},
        { 
          path: 'my-bookings', // <-- 定义页面的URL访问地址
          name: 'my-bookings', 
          component: MyBookings   // <-- 将地址和组件关联起来
        },
      ]
    },
    {path:'/login',name:'login',component:login},
    {path:'/register',name:'register',component:register},
    {
      path: '/admin',
      name: 'adminDashboard',
      component: AdminDashboard
    },
    {
      path: '/admin',
      name: 'adminDashboard',
      component: AdminDashboard
    },



    // {
    //   path:'./quick',
    //   name:'quick',
    //   component:quickAccess
    // }
  ]
})

export default router
