<template>
  <div>
  </div>
</template>

<script>
import { LinearEncoding, PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { lookupHolder, O3DNode } from '../../Core/O3DNode'
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
    media: {
      default () {
        return {}
      }
    },
    work: {}
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
        THREE,
        media: this.media
      }

      miniBox = {
        ...miniBox,
        scene: new Scene(),
        camera: new PerspectiveCamera(75, 1, 0.1, 1000),
        renderTarget: this.renderTarget,
        work: this.work,
        onDefaultRender: () => {
          if (this.renderTarget) {
            this.ctx.renderer.setRenderTarget(this.renderTarget)
            this.ctx.renderer.render(miniBox.scene, miniBox.camera)
          }
        }
      }

      let Monitor = await core.makeWorkBoxMonitor({ work: this.work })
      if (Monitor) {
        Monitor.use({ box: miniBox, work: this.work, arrows: core.arrows, works: core.works })
        // console.log(Monitor)

        // this.$parent.$emit('texture', {
        //   enable: true,
        //   texture: this.renderTarget.texture
        // })
      }
    }

    // lookupHolder

    compileCode()

    this.$root.$on('refresh-ui', ({ work }) => {
      if (work._id === this.work._id) {
        if (miniBox) {
          miniBox.runRefresh()
        }
      }
    })

    this.$watch('work', () => {
      if (this.isDestroyed) {
        return
      }
      compileCode()
    })

    this.$watch('media', () => {
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
        return
      }

      if (!miniBox) {
        return
      }

      miniBox.runLoop()

      let orig = this.ctx.renderer.getRenderTarget()

      miniBox.onDefaultRender()

      if (this.renderTarget) {
        let holder = lookupHolder(this, 'isWorkBox')
        holder.texture = this.renderTarget.texture
      }

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