import VueRouter from 'vue-router'
// import { MenuDocsData } from './components/WebGL/AppUIs/Docs/MenuListData'

export const routes = [
  {
    path: '/landing',
    component: () => import('./components/WebGL/AppUIs/Landing/LandingPage.vue')
  },
  {
    path: '/art',
    component: () => import('./components/WebGL/AppUIs/ART/ARTPage.vue')
  },
  // {
  //   path: '/editor',
  //   component: () => import('./components/WebGL/AppUIs/EditorUnit/EditorUnit.vue')
  // },
  {
    path: '/',
    component: () => import('./components/WebGL/AppUIs/EditorSpace/EditorSpace.vue')
  },
  {
    path: '/age',
    component: () => import('./components/age-0/pages/AgeEditor.vue')
  },

  // {
  //   path: '/pdf',
  //   component: () => import('./components/pdf/pdf.vue')
  // },

  // {
  //   path: '/docs',
  //   component: () => import('./components/WebGL/AppUIs/Docs/DocsLayout.vue'),
  //   children: [
  //     // {
  //     //   path: 'quick-start',
  //     //   component: () => import('./components/WebGL/AppUIs/DocsContent/QuickStart.vue'),
  //     // },
  //     ...MenuDocsData
  //   ]
  // },
  {
    path: '*',
    component: () => import('./components/WebGL/AppUIs/Shared/E404.vue')
  }
]

export const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior (to, from, savedPos) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPos) {
          resolve(savedPos)
        } else {
          resolve({ x: 0, y: 0 })
        }
      }, 1)
    })
  }
})