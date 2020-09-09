<template>
  <div>
  </div>
</template>

<script>
import { PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'

class MiniBoxEngine {
  constructor () {
    let isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.onLoop = (v) => {
      this.tasks.push(v)
    }

    this.onResize = (v) => {
      v()
      this.resizeTasks.push(v)
    }

    let intv = 0
    let internalResize = () => {
      clearTimeout(intv)
      intv = setTimeout(() => {
        this.resizeTasks.forEach(e => e())
      }, 16.6668)
    }

    window.addEventListener('resize', () => {
      internalResize()
    })

    this.goCleanUp = () => {
      isAborted = true
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
    this.camera.position.z = 50

    var animate = () => {
      requestAnimationFrame(animate);

      if (isAborted) {
        return
      }

      try {
        this.tasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }
    animate()
  }
}

export default {
  mixins: [
    O3DNode
  ],
  props: {
    work: {}
  },
  async mounted () {
    let core = this.ctx.core
    let dpi = window.devicePixelRatio || 1
    this.renderTarget = new WebGLRenderTarget(128 * dpi, 128 * dpi)

    let miniBox = false
    let compile = async () => {
      if (miniBox) {
        miniBox.goCleanUp()
      }
      miniBox = new MiniBoxEngine()
      let Module = await core.makeModuleByWork({ work: this.work })
      Module.use({
        THREE,
        onLoop: miniBox.onLoop,
        onResize: miniBox.onResize,
        onClean: miniBox.onClean,
        scene: miniBox.scene,
        cachedImport: async (...v) => console.log(v)
      })
    }
    compile()

    this.$root.$on('compile-workbox', ({ work }) => {
      if (work._id === this.work._id) {
        compile()
      }
    })

    this.onLoop(() => {
      if (this.isDestroyed) {
        this.$parent.$emit('texture', false)
        return
      }
      if (!miniBox) {
        return
      }

      let orig = this.ctx.renderer.getRenderTarget()
      this.ctx.renderer.setRenderTarget(this.renderTarget)
      this.ctx.renderer.render(miniBox.scene, miniBox.camera)
      this.$parent.$emit('texture', this.renderTarget.texture)
      this.ctx.renderer.setRenderTarget(orig)
    })

    this.onClean(() => {
      this.$parent.$emit('texture', false)
    })

  }
}
</script>

<style>

</style>