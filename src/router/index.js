import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
/* 用户列表界面 */
import Users from '../components/user/Users.vue'
/* 权限列表界面 */
import Rights from '../components/power/Rights.vue'
/* 角色列表 */
import Roles from '../components/power/Roles.vue'
/* 商品分类列表 */
import Cate from '../components/goods/Cate.vue'
/* 分类参数界面 */
import Params from '../components/goods/Params.vue'
/* 商品列表界面 */
import List from '../components/goods/List.vue'
/* 添加商品界面 */
import Add from '../components/goods/Add.vue'
/* 商品订单界面 */
import Order from '../components/order/Order.vue'
/* 商品报表界面 */
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { 
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {path:'/welcome',component: Welcome},
      {path:'/users',component: Users},
      {path:'/rights',component: Rights},
      {path:'/roles',component: Roles},
      {path:'/categories',component: Cate},
      {path:'/params',component: Params},
      {path:'/goods',component: List},
      {path:'/goods/add',component: Add},
      {path:'/orders',component: Order},
      {path:'/reports',component: Report},
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, form, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行 ， next('/login') 强制跳转


  // 如果用户访问的登录页，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage 中获取到保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token,强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
