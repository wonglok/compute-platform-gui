<template>
  <div></div>
</template>

<script>
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import O3DNode from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  mounted () {
    this.controls = new OrbitControls(this.ctx.camera, this.ctx.element)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.03
    this.onLoop(() => {
      this.controls.update()
    })
  }
}
</script>

<style>

</style>