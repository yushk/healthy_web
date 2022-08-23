import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  }

]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '统计信息', icon: 'el-icon-pie-chart' }
      }
    ]
  },
  {
    path: '/data',
    component: Layout,
    meta: { title: '数据管理', icon: 'el-icon-box' },
    children: [{
      path: 'base',
      name: 'Base',
      component: () => import('@/views/data/base/index'),
      meta: { title: '基础数据管理', icon: 'el-icon-tickets' ,roles: ['worker'] }
    },
    {
      path: 'sport',
      name: 'Sport',
      component: () => import('@/views/data/sport/index'),
      meta: { title: '运动数据管理', icon: 'el-icon-bicycle' ,roles: ['worker']}
    },
    {
      path: 'case',
      name: 'Case',
      component: () => import('@/views/data/case/index'),
      meta: { title: '病例数据管理', icon: 'el-icon-service' ,roles: ['worker']}
    }
    ]
  },
  {
    path: '/t_task',
    component: Layout,
    children: [{
      path: '/t_task',
      name: 'TTask',
      component: () => import('@/views/teacher_task/index'),
      meta: { title: '作业管理', icon: 'el-icon-notebook-1', roles: ['teacher'] }
    }]
  },
  {
    path: '/s_task',
    component: Layout,
    children: [{
      path: '/s_task',
      name: 'STask',
      component: () => import('@/views/student_task/index'),
      meta: { title: '作业管理', icon: 'el-icon-notebook-2', roles: ['student'] }
    }]
  },
  {
    path: '/students',
    component: Layout,
    children: [{
      path: '/students',
      name: 'StudentInfo',
      component: () => import('@/views/student_info/index'),
      meta: { title: '学生信息', icon: 'el-icon-crop', roles: ['teacher', 'worker'] }
    }]
  },
  {
    path: '/teacher',
    component: Layout,
    children: [{
      path: '/teacher',
      name: 'TeacherInfo',
      component: () => import('@/views/teacher_info/index'),
      meta: { title: '教师信息', icon: 'el-icon-crop', roles: ['teacher', 'worker'] }
    }]
  },
  {
    path: '/class',
    component: Layout,
    children: [{
      path: '/class',
      name: 'Class',
      component: () => import('@/views/class/index'),
      meta: { title: '班级管理', icon: 'el-icon-c-scale-to-original', roles: ['teacher'] }
    }]
  }, {
    path: '/user',
    component: Layout,
    children: [{
      path: '/user',
      name: 'User',
      component: () => import('@/views/user/index'),
      meta: { title: '用户管理', icon: 'el-icon-user', roles: [] }
    }]
  },
  {
    path: '/upload',
    component: Layout,
    children: [{
      path: '/upload',
      name: 'Upload',
      component: () => import('@/views/upload/index'),
      meta: { title: '七牛', icon: 'dashboard', roles: ['root'] }
    }]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
