<template>
  <div><slot v-if="sprite"></slot></div>
</template>

<script>
import { Sprite, SpriteMaterial } from 'three'
import { O3DNode } from '../Core/O3DNode.js'
export default {
  mixins: [O3DNode],
  props: {
  },
  data () {
    return {
      sprite: false,
      scene: false,
      camera: false,
      composer: false
    }
  },
  mounted () {
    let mat = new SpriteMaterial({ map: null, sizeAttenuation: true })
    let sprite = new Sprite(mat)

    this.o3d.add(sprite)
    this.sprite = sprite

    this.$on('config', ({ width, height, map }) => {
      sprite.scale.set(width, height, 1)
      mat.map = map
      mat.needsUpdate = true
    })
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.o3d)
  }
}
</script>

<style>

</style>