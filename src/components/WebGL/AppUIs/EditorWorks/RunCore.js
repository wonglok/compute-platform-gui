import { Clock, Color, EventDispatcher, PerspectiveCamera, Scene } from 'three'
import * as THREE from 'three'
import Vue from 'vue'
import { Chrome } from 'vue-color'

export class RunCore extends EventDispatcher {
  constructor ({ onMasterLoop, core, display, renderer, media = {} }) {
    super()
    let box = this
    this.core = core
    this.display = display
    this.renderer = renderer
    this.onMasterLoop = onMasterLoop

    this.clock = new Clock()

    this.isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.cleanTasks = []
    this.refreshTask = []

    this.resources = {}
    this.workspaces = new Map()

    this.deps = {
      THREE,
      media
    }

    this.onRefresh = (fnc) => {
      this.refreshTask.push(fnc)
    }

    this.onLoop = (fnc) => {
      this.tasks.push(fnc)
    }

    this.onResize = (fnc) => {
      fnc()
      this.resizeTasks.push(fnc)
    }

    let intv = 0
    let internalResize = () => {
      clearTimeout(intv)
      intv = setTimeout(() => {
        this.resizeTasks.forEach(e => e())
      }, 16.8888)
    }

    window.addEventListener('resize', () => {
      internalResize()
    })

    this.goCleanUp = () => {
      this.isAborted = true
      if (this.vue) {
        this.vue.$destroy()
      }
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    this.scene = new Scene()
    this.scene.background = new Color('#ffffff')

    this.camera = new PerspectiveCamera(75, 1, 0.00001, 100000)
    this.camera.position.z = 150

    this.defaultRender = () => {
      let originalFrameBuffer = this.renderer.getRenderTarget()
      this.renderer.setRenderTarget(this.display)
      if (this.composer) {
        this.composer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
      this.renderer.setRenderTarget(originalFrameBuffer)
    }

    this.onMasterLoop(() => {
      this.runLoop()
      this.defaultRender()
    })

    let html = v => v[0]

    let makeRunVue = () => {
      return {
        props: {
          work: {},
          box: {}
        },
        template: `<div><slot></slot></div>`,
        beforeDestroy () {
          console.log('workbox runner: clean up ' + this.work._id)
        },
        async mounted () {
          let Module = await box.core.makePackageModule({ work: this.work })
          await Module.use({ box: this.box, work: this.work, arrows: core.arrows, works: core.works })
          console.log('workbox runner: setup ' + this.work._id)
        }
      }
    }

    this.vue = new Vue({
      components: {
        WorkRunner: makeRunVue()
      },
      template: html`
        <div>
          <div v-for="work in works" :key="work._id">
            <WorkRunner v-if="isReady(work)" :work="work" :box="box"></WorkRunner>
          </div>
        </div>
      `,
      methods: {
        isReady () {
          return true
        }
      },
      data () {
        return {
          box: box,
          works: box.core.works,
          arrwos: box.core.arrows
        }
      }
    })

    let div = document.createElement('div')
    this.vue.$mount(div)
  }
  runLoop () {
    if (this.isAborted) {
      return
    }

    try {
      this.tasks.forEach(e => e())
    } catch (e) {
      console.error(e)
    }
  }
  runRefresh () {
    if (this.isAborted) {
      return
    }

    try {
      this.refreshTask.forEach(e => e())
    } catch (e) {
      console.error(e)
    }
  }
}

export class CoreShell {
  constructor ({ work, $vm }) {
    this.work = work
    this.$vm = $vm

    this.last = {
      scriptCode: ''
    }

    let vueCode = this.getVueCode()

    this.$vm.dynamo = this.makeNewInstance({ vueCode })

    this.$vm.$root.$on('refresh-shell', () => {
      let vueCode = this.getVueCode()
      let { scriptCode } = this.processVueCode({ vueCode })
      if (scriptCode !== this.last.scriptCode) {
        this.$vm.dynamo = this.makeNewInstance({ vueCode })
      } else {
        this.onRefresh({ vueCode })
      }
      this.last.scriptCode = scriptCode
    })
  }

  getVueCode () {
    let file = this.work.fileTree.children.find(e => e.path === './gui.vue')
    if (file) {
      return file.src
    }
  }

  processVueCode ({ vueCode }) {
    let templateCode = vueCode.match(/<template>([\S\s]*?)<\/template>/gi)
    templateCode = templateCode[0]
    templateCode = templateCode.replace(/^<template>/, '')
    templateCode = templateCode.replace(/<\/template>$/, '')

    let styleCode = vueCode.match(/<style([\S\s]*?)<\/style>/gi)
    let styleHTML = styleCode[0]

    let scriptCode = vueCode.match(/<script>([\S\s]*?)<\/script>/gi)
    scriptCode = scriptCode[0]
    scriptCode = scriptCode.replace(/^<script>/, '')
    scriptCode = scriptCode.replace(/<\/script>$/, '')

    return {
      templateCode,
      styleHTML,
      scriptCode
    }
  }

  // compileTemplate ({ templateCode }) {
  //   let templateRenderFnc = Vue.compile(templateCode)
  //   return templateRenderFnc.render
  // }

  // onRefresh ({ vueCode }) {
  //   let { templateCode } = this.processVueCode({ vueCode })
  //   if (this.$vm.$refs.dynamo) {
  //     this.$vm.$refs.dynamo.$options.render = this.compileTemplate({ templateCode })
  //     this.$vm.$refs.dynamo.$forceUpdate()
  //   }
  // }

  getConfig ({ vueCode }) {
    let { scriptCode } = this.processVueCode({ vueCode })
    scriptCode = scriptCode.replace('export default ', 'return ')
    let fnc = new Function(scriptCode)
    let config = fnc()
    return config
  }

  makeNewInstance ({ vueCode }) {
    let config = this.getConfig({ vueCode })
    let { templateCode } = this.processVueCode({ vueCode })
    let newObj = {
      ...config,
      components: {
        Chrome
      },
      template: templateCode
      // mixins: [require('../../Core/RenderRoot.js').RenderRoot],
      // render: this.compileTemplate({ templateCode })
    }
    console.log(newObj)
    return newObj
  }
}
