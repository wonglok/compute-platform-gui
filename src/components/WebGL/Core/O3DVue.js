export let parent = (vm) => vm.$parent// || vm.getRootNode().host
export let traverseParent = (vm, key) => {
  if (vm[key]) {
    return vm[key]
  } else if (parent(vm) && parent(vm)[key]) {
    return parent(vm)[key]
  } else {
    vm = parent(vm)
    if (!vm) {
      return false
    }
    return traverseParent(vm, key)
  }
}

export const O3DVue = {
  data () {
    return {
      CTXProxy: false
    }
  },
  created () {
    this.$options.components.O3D = require('./O3D.vue').default
    this.$options.components.O3DHTML = () => import('./O3DHTML.vue')
    this.$options.components.O2DHTML = () => import('./O2DHTML.vue')
    this.$options.components.O3DWindow = () => import('./O3DWindow.vue')
    this.$options.components.O3DSprite = () => import('./O3DSprite.vue')
    this.$options.components.Portal = () => import('./Portal.vue')
    this.$options.components.PCamera = () => import('./PCamera.vue')

    this.$options.components.BaseCanvas = () => import('../Packages/Editor/BaseCanvas.vue')
    this.$options.components.O3DEditor = () => import('../Packages/Editor/O3DEditor.vue')

    let folderCompos = require('./async-gl-content.js').default
    for (let kn in folderCompos) {
      this.$options.components[kn] = folderCompos[kn]
    }

    let vm = this
    this.CTXProxy = new Proxy({}, {
      get: (obj, prop) => {
        return traverseParent(vm, prop)
      }
    })
  },
  computed: {
    ctx () {
      return this.CTXProxy
    }
  }
}