import { Clock, Color, EventDispatcher, PerspectiveCamera, Scene, WebGLRenderTarget } from 'three'
import * as THREE from 'three'
import Vue from 'vue'
import { Chrome } from 'vue-color'
// import { O3DVue } from '../../Core/O3DVue'

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export class WorkCore extends EventDispatcher {
  constructor ({ core, display, renderer, media = {}, $vm }) {
    super()
    let box = this
    this.$vm = $vm
    this._id = getID()
    this.core = core
    this.display = display
    this.renderer = renderer
    // this.onMasterLoop = onMasterLoop

    this.clock = new Clock()

    this.isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.refreshTask = []

    this.resources = {}
    this.workspaces = new Map()
    this.workboxRenderTargets = new Map()
    this.previewRenderTargets = new Map()

    this.deps = {
      THREE,
      media
    }

    this.onClean = (fnc) => {
      this.cleanTasks.push(fnc)
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

    // this.onMasterLoop(() => {

    // })

    let html = v => v[0]

    let makeRunVue = () => {
      return {
        props: {
          work: {},
          box: {},
          size: {}
        },
        template: `<div><slot></slot></div>`,
        beforeDestroy () {
          this.isDestroyed = true
          console.log(box._id, 'workbox runner: clean up ' + this.work._id)
        },
        data () {
          return {
            isDestroyed: false,
          }
        },
        async mounted () {
          let miniBox = false

          let dpi = window.devicePixelRatio || 1
          let renderTarget = new WebGLRenderTarget(this.size * dpi, this.size * dpi, {
            depthBuffer: false,
            stencilBuffer: false
          })
          box.workboxRenderTargets.set(this.work._id, renderTarget)

          var frustum = new THREE.Frustum()
          let matrix = new THREE.Matrix4()
          let scanCanRun = () => {
            let camera = box.$vm.ctx.camera
            camera.updateMatrix()
            camera.updateMatrixWorld()
            camera.updateProjectionMatrix()

            matrix.identity()
            frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

            let isInFrustum = frustum.containsPoint(this.work.position)
            // console.log(this.work._id, isInFrustum, this.work.position.x)
            return isInFrustum
          }

          box.onLoop(() => {
            let canRun = scanCanRun()
            let renderTargetWorkbox = box.workboxRenderTargets.get(this.work._id)
            let renderTargetPreview = box.previewRenderTargets.get(this.work._id)
            if (renderTargetWorkbox && miniBox && canRun) {
              let orig = box.renderer.getRenderTarget()
              box.renderer.setRenderTarget(renderTargetWorkbox)
              box.renderer.render(miniBox.scene, miniBox.camera)
              if (renderTargetPreview) {
                box.renderer.setRenderTarget(renderTargetPreview)
              }
              box.renderer.render(miniBox.scene, miniBox.camera)
              box.renderer.setRenderTarget(orig)
            }
          })

          let compile = async () => {
            miniBox = {
              ...this.box,
              work: this.work,
              scene: new Scene(),
              runRefresh () {
                box.runRefresh()
              },
              camera: new PerspectiveCamera(75, 1, 0.1, 1000),
            }

            let Module = await box.core.makeWorkBoxMonitor({ work: this.work })
            await Module.use({ box: miniBox, work: this.work, arrows: core.arrows, works: core.works })
            console.log(box._id, 'workbox monitor runner: setup ' + this.work._id)
          }

          compile()

          box.$vm.$root.$on('compile-workbox', ({ work }) => {
            if (this.isDestroyed) {
              return
            }
            if (work._id === this.work._id) {
              compile()
            }
          })
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
            <WorkRunner v-if="isReady(work)" :size="256" :work="work" :box="box"></WorkRunner>
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
