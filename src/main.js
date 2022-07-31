import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/* 导入全局样式表 */
import './assets/css/global.css'
/* 导入字体图标 */
import './assets/fonts/iconfont.css'
/* 导入axios库 */
import axios from 'axios'
/* 导入 treeTable */
import TreeTable from 'vue-table-with-tree-grid'
/* 导入富文本 */
import VueQuillEditor from 'vue-quill-editor'
/* 导入富文本CSS样式 */
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

/* 注册组件 */
Vue.use(VueQuillEditor);

/* 配置请求和路径 */
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.defaults.baseURL ='https://lianghj.top:8888/api/private/v1/'

//axios 请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象添加，token 验证的 Authorization 字段
  //把 token 赋值给 字段
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});

/* 挂载到Vue原型上 */
Vue.prototype.$http = axios

// 可以阻止 vue 在启动时生产环境下不提示
Vue.config.productionTip = false

/* 注册 tree-table组件 */
Vue.component('tree-table', TreeTable)

/* 时间全局过滤器 */
Vue.filter('dateFormat',function(originVal) {
  let date = new Date(originVal);

  let y = date.getFullYear();
  /* padStart 不足两位补0 */
  let m = (date.getMonth() + 1 + '').padStart(2,'0');
  let d = (date.getDate() + '').padStart(2,'0');

  let h = (date.getHours() + '').padStart(2,'0');
  let mm = (date.getMinutes() + '').padStart(2,'0');
  let ss = (date.getSeconds() + '').padStart(2,'0');

  return `${y}-${m}-${d}  ${h}:${mm}:${ss}`
}) 

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
