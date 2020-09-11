<template>
  <div>
    <!-- @texture = rtt -->
    <slot @texture="texture = $event; $emit('texture', texture)"></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, TextureLoader, Vector3 } from 'three'
import { getScreen, O3DNode, visibleHeightAtZDepthForCamYAxis, visibleWidthAtZDepthForCamYAxis } from '../../Core/O3DNode'
import { make } from '../ARTBlockers/art-coder'
import { loadTexture } from '../../Core/loadTexture'
export default {
  props: {
  },
  mixins: [
    O3DNode
  ],
  data () {
    return {
      texture: false,
      unitPos: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  },
  async mounted () {
    let screen = getScreen({ depth: 0, camera: this.ctx.camera })
    let geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
    let mat = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
    let plane = new Mesh(geo, mat)
    this.o3d.add(plane)
    this.$on('texture', (tt) => {
      if (tt) {
        let screen = getScreen({ depth: 0, camera: this.ctx.camera })
        let geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
        plane.geometry = geo
        mat.map = tt
        mat.needsUpdate = true
      }
    })
  }
}
</script>

<style>

</style>