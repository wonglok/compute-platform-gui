<template>
  <div>
  </div>
</template>

<script>
import { PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'
import { MiniBoxEngine } from './MiniBoxEngine'

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
    let compileCode = async () => {
      if (miniBox) {
        miniBox.goCleanUp()
      }

      miniBox = new MiniBoxEngine()

      miniBox.scene = new Scene()
      miniBox.camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
      miniBox.camera.position.z = 50

      let MyModule = await core.makeModuleByWork({ work: this.work })
      let deps = {
        THREE
      }

      MyModule.use({
        ...deps,
        bus: miniBox,
        onLoop: miniBox.onLoop,
        onResize: miniBox.onResize,
        onClean: miniBox.onClean,
        scene: miniBox.scene,
        cachedImport: async (...v) => console.log(v)
      })
    }

    compileCode()

    this.$root.$on('compile-workbox', ({ work }) => {
      if (work._id === this.work._id) {
        compileCode()
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