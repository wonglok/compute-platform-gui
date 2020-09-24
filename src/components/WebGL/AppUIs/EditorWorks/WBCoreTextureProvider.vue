<template>
  <div>
  </div>
</template>

<script>
import { LinearEncoding, PerspectiveCamera, Scene, Texture, Vector3, WebGLRenderTarget } from 'three'
import { lookupHolder, O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'

export default {
  mixins: [
    O3DNode
  ],
  props: {
    mode: {
      default: 'workbox'
    },
    canRun: {
      default: true
    },
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
  data () {
    return {
      isSuspend: false
    }
  },
  activated () {
    this.isSuspend = false
  },
  deactivated () {
    this.isSuspend = true
  },
  async mounted () {
    let core = this.ctx.core

    let workCore = this.ctx.workCore

    let setRenderTarget = () => {
      if (this.isDestroyed) {
        return
      }

      if (this.mode === 'preview') {
        let dpi = window.devicePixelRatio || 1
        this.renderTarget = new WebGLRenderTarget(this.size * dpi, this.size * dpi, {
          depthBuffer: false,
          stencilBuffer: false
        })
        workCore.previewRenderTargets.set(this.work._id, this.renderTarget)
      }
    }
    setRenderTarget()

    this.$watch('size', () => {
      setRenderTarget()
    })

    this.onLoop(() => {
      if (this.isDestroyed) {
        return
      }
      if (this.isSuspend) {
        return
      }

      let holder = lookupHolder(this, 'isTextureAttach')
      if (holder) {

        let renderTarget = false
        if (this.mode === 'workbox') {
          renderTarget = workCore.workboxRenderTargets.get(this.work._id)
        } else if (this.mode === 'preview') {
          renderTarget = workCore.previewRenderTargets.get(this.work._id)
        }

        if (renderTarget) {
          holder.texture = renderTarget.texture
        }
      }
    })

    // let miniBox = false
    // let compileCode = async () => {
    //   if (miniBox) {
    //     miniBox.goCleanUp()
    //   }
    //   if (this.isDestroyed) {
    //     return
    //   }

    //   miniBox = new WBTextureProviderEngine({ onMasterLoop: this.onLoop })
    //   miniBox.deps = {
    //     THREE,
    //     media: this.media
    //   }

    //   miniBox = {
    //     ...miniBox,
    //     scene: new Scene(),
    //     camera: new PerspectiveCamera(75, 1, 0.1, 1000),
    //     renderTarget: this.renderTarget,
    //     renderer: this.ctx.renderer,
    //     work: this.work,
    //     onDefaultRender: () => {
    //       if (this.renderTarget) {
    //         this.ctx.renderer.setRenderTarget(this.renderTarget)
    //         this.ctx.renderer.render(miniBox.scene, miniBox.camera)
    //       }
    //     }
    //   }

    //   let Monitor = await core.makeWorkBoxMonitor({ work: this.work })
    //   if (Monitor) {
    //     Monitor.use({ box: miniBox, work: this.work, arrows: core.arrows, works: core.works })
    //   }
    // }

    // // lookupHolder

    // compileCode()

    // this.$root.$on('refresh-ui', ({ work }) => {
    //   if (work._id === this.work._id) {
    //     if (miniBox) {
    //       miniBox.runRefresh()
    //     }
    //   }
    // })

    // this.$watch('work', () => {
    //   if (this.isDestroyed) {
    //     return
    //   }
    //   compileCode()
    // })

    // this.$watch('media', () => {
    //   if (this.isDestroyed) {
    //     return
    //   }
    //   compileCode()
    // })

    // this.$root.$on('compile-workbox', ({ work }) => {
    //   if (this.isDestroyed) {
    //     return
    //   }
    //   if (work._id === this.work._id) {
    //     compileCode()
    //   }
    // })

    // this.$root.$on('refresh-workbox', ({ work }) => {
    //   if (work._id === this.work._id) {
    //     compileCode()
    //   }
    // })

    // var frustum = new THREE.Frustum();
    // let matrix = new THREE.Matrix4()
    // let scanCanRun = (object) => {
    //   let camera = this.ctx.camera
    //   camera.updateMatrix()
    //   camera.updateMatrixWorld()
    //   camera.updateProjectionMatrix()

    //   matrix.identity()
    //   frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

    //   let isInFrustum = frustum.containsPoint(this.work.position)
    //   // console.log(this.work._id, isInFrustum, this.work.position.x)
    //   return isInFrustum
    // }

    // this.onLoop(() => {
    //   let scan = scanCanRun(this.o3d)
    //   if (!scan) {
    //     return
    //   }
    //   if (!this.canRun) {
    //     return
    //   }
    //   if (this.isDestroyed) {
    //     return
    //   }

    //   if (this.isSuspend) {
    //     return
    //   }

    //   if (!miniBox) {
    //     return
    //   }

    //   miniBox.runLoop()

    //   let orig = this.ctx.renderer.getRenderTarget()

    //   miniBox.onDefaultRender()

    //   if (this.renderTarget) {
    //     let holder = lookupHolder(this, 'isTextureAttach')
    //     if (holder) {
    //       holder.texture = this.renderTarget.texture
    //     }
    //     // this.$parent.$emit('texture', {
    //     //   enable: true,
    //     //   texture: this.renderTarget.texture
    //     // })
    //   }

    //   this.ctx.renderer.setRenderTarget(orig)
    // })

    // this.onClean(() => {
    //   this.$parent.$emit('texture', {
    //     enable: false
    //   })
    // })

  }
}
</script>

<style>

</style>