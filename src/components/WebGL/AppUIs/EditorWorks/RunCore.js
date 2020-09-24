import { Clock, Color, EventDispatcher, PerspectiveCamera, Scene } from 'three'
import * as THREE from 'three'
import Vue from 'vue'
import { Chrome } from 'vue-color'
// import { O3DVue } from '../../Core/O3DVue'

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export class RunCore extends EventDispatcher {
  constructor ({ onMasterLoop, core, display, renderer, media = {} }) {
    super()
    let box = this
    this._id = getID()
    this.core = core
    this.display = display
    this.renderer = renderer
    this.onMasterLoop = onMasterLoop

    this.clock = new Clock()

    this.isAborted = false
    this.tasks = []
    this.resizeTasks = []
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
      if (this.display) {
        this.renderer.setRenderTarget(this.display)
        if (this.composer) {
          this.composer.render()
        } else {
          this.renderer.render(this.scene, this.camera)
        }
        this.renderer.setRenderTarget(originalFrameBuffer)
      }
    }

    this.onMasterLoop(() => {

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
          console.log(box._id, 'workbox runner: clean up ' + this.work._id)
        },
        async mounted () {
          let Module = await box.core.makePackageModule({ work: this.work })
          await Module.use({ box: this.box, work: this.work, arrows: core.arrows, works: core.works })
          console.log(box._id, 'workbox runner: setup ' + this.work._id)
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