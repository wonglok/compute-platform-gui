<template>
  <O3D>
    <slot></slot>
  </O3D>
</template>

<script>
import { O3DNode } from '../../Core/O3DNode'
import { ART } from './ART'
export default {
  props: {
    config: {
      default: false
    }
  },
  mixins: [O3DNode],
  methods: {
    main () {
      let art = new ART({ renderer: this.renderer, onLoop: this.onLoop, onClean: this.onClean })
      this.o3d.add(art.out.o3d)
      this.$emit('art', art)

      this.$watch('config', (v) => {
        art.conifg = v
      })
    }
  },
  mounted () {
    this.main()
  }
}
</script>

<style>
</style>
