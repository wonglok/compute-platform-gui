<template>
  <div>
  </div>
</template>

<script>
import { PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { lookupHolder, O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'
import { RunCore } from '../../AppUIs/EditorWorks/RunCore.js'

export default {
  mixins: [
    O3DNode
  ],
  props: {
    media: {
      default () {
        return {}
      }
    },
    size: {
      default: 256
    },
    sizeY: {
      default: 256
    }
  },
  data () {
    return {
      stopRunning: false
    }
  },
  activated () {
    this.stopRunning = false
  },
  deactivated () {
    this.stopRunning = true
  },
  async mounted () {
    let core = this.ctx.core
    let setupTexture = () => {
      let dpi = window.devicePixelRatio || 1
      this.displayRenderTarget = new WebGLRenderTarget(this.size * dpi, (this.size) * dpi)

      // this.$parent.$emit('texture', {
      //   enable: true,
      //   texture: this.displayRenderTarget.texture
      // })

      let holder = lookupHolder(this, 'isTextureAttach')
      if (holder) {
        holder.texture = this.displayRenderTarget.texture
      }
    }

    let setup = () => {
      if (this.runCore) {
        this.runCore.goCleanUp()
      }

      setupTexture()

      this.runCore = new RunCore({ onMasterLoop: this.onLoop, core, renderer: this.ctx.renderer, display: this.displayRenderTarget, media: this.media })
    }

    this.$root.$on('refresh-ui', () => {
      if (this.runCore) {
        this.runCore.runRefresh()
      }
    })

    this.onLoop(() => {
      if (this.stopRunning) {
        return
      }
      if (this.runCore) {
        this.runCore.runLoop()
        this.runCore.defaultRender()
      }
    })

    let getSignature = () => {
      return JSON.stringify([
        core.works.map(e => {
          return e._id
        }),
        core.arrows
      ])
    }

    this.$watch('size', () => {
      this.last = ''
    })
    this.$watch('media', () => {
      this.last = ''
    })
    this.$root.$on('compile-workbox', () => {
      this.last = ''
    })

    this.last = ''
    setInterval(() => {
      if (this.last === '') {
        this.last = getSignature()
        setup()
      } else {
        let latest = getSignature()
        if (this.last !== latest) {
          this.last = latest
          setup()
        }
      }
    }, 100)
  }
}
</script>

<style>

</style>