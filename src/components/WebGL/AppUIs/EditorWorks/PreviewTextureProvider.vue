<template>
  <div>
  </div>
</template>

<script>
import { PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three'
import { O3DNode } from '../../Core/O3DNode'
import * as THREE from 'three'
import { WBTextureProviderEngine } from './WBTextureProviderEngine'
import { RunCore } from '../../AppUIs/EditorWorks/RunCore.js'

export default {
  mixins: [
    O3DNode
  ],
  props: {
    size: {
      default: 256
    }
  },
  async mounted () {
    let core = this.ctx.core

    let setup = () => {
      let dpi = window.devicePixelRatio || 1
      if (this.runCore) {
        this.runCore.goCleanUp()
      }
      this.displayRenderTarget = new WebGLRenderTarget(this.size * dpi, this.size * dpi)
      this.runCore = new RunCore  ({ onMasterLoop: this.onLoop, core, renderer: this.ctx.renderer, display: this.displayRenderTarget })
    }

    this.$root.$on('refresh-ui', () => {
      if (this.runCore) {
        this.runCore.runRefresh()
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

    this.onLoop(() => {
      if (this.displayRenderTarget) {
        this.$parent.$emit('texture', {
          enable: true,
          texture: this.displayRenderTarget.texture
        })
      }
    })
  }
}
</script>

<style>

</style>