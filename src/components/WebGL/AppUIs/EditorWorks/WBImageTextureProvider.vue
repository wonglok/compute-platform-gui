<template>
  <div></div>
</template>

<script>
import { Texture, TextureLoader } from 'three'
import { O3DNode } from '../../Core/O3DNode'
export default {
  props: {
    work: {}
  },
  mixins: [
    O3DNode
  ],
  mounted () {
    // let texture = new TextureLoader()
    // this.onLoop(() => {
    //   // console.log('123')
    // })
    console.log(this.work)
    if (this.work.coverImage) {
      let texture = new TextureLoader().load(this.work.coverImage)
      this.onLoop(() => {
        this.$parent.$emit('texture', texture)
      })
    }
  }
}
</script>

<style>

</style>