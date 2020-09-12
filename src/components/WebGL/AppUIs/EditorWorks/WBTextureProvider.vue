<template>
  <div>
  </div>
</template>

<script>
import { PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'
import { WBTextureProviderEngine } from './WBTextureProviderEngine'
// import { MiniBoxEngine } from '../../Packages/FSCompiler/srcs/basic/src/monitor/MiniBoxEngine'

export default {
  mixins: [
    O3DNode
  ],
  props: {
    size: {
      default: 256
    },
    work: {},
    arrows: {}
  },
  async mounted () {
    let core = this.ctx.core
    let dpi = window.devicePixelRatio || 1
    this.renderTarget = new WebGLRenderTarget(this.size * dpi, this.size * dpi)

    let miniBox = false
    let compileCode = async () => {
      if (miniBox) {
        miniBox.goCleanUp()
      }
      if (this.isDestroyed) {
        return
      }

      miniBox = new WBTextureProviderEngine({ onMasterLoop: this.onLoop })
      miniBox.deps = {
        THREE
      }
      miniBox.userData = {
        scene: new Scene(),
        renderTarget: this.renderTarget,
        camera: new PerspectiveCamera( 75, 1, 0.1, 1000 ),
        work: this.work,
        arrows: this.arrows,
        onDefaultRender: () => {
          this.ctx.renderer.setRenderTarget(this.renderTarget)
          this.ctx.renderer.render(miniBox.userData.scene, miniBox.userData.camera)
        }
      }

      let Monitor = await core.makeWorkBoxMonitor({ work: this.work })
      if (Monitor) {
        Monitor.use(miniBox)
      }
    }

    compileCode()

    this.$watch('work', () => {
      if (this.isDestroyed) {
        return
      }
      compileCode()
    })

    this.$root.$on('compile-workbox', ({ work }) => {
      if (this.isDestroyed) {
        return
      }
      if (work._id === this.work._id) {
        compileCode()
      }
    })

    // this.$root.$on('refresh-workbox', ({ work }) => {
    //   if (work._id === this.work._id) {
    //     compileCode()
    //   }
    // })

    this.onLoop(() => {
      if (this.isDestroyed) {
        this.$parent.$emit('texture', {
          enable: false
        })
        return
      }

      if (!miniBox) {
        return
      }

      let orig = this.ctx.renderer.getRenderTarget()

      miniBox.userData.onDefaultRender()

      this.$parent.$emit('texture', {
        enable: true,
        texture: this.renderTarget.texture
      })

      this.ctx.renderer.setRenderTarget(orig)
    })

    this.onClean(() => {
      this.$parent.$emit('texture', {
        enable: false
      })
    })

  }
}
</script>

<style>

</style>