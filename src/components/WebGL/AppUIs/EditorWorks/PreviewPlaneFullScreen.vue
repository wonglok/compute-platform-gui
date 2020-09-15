<template>
  <div>
    <!-- @texture = rtt -->
    <slot @texture="$emit('texture', $event)"></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, DoubleSide, LinearEncoding, Mesh, SpriteMaterial, MeshStandardMaterial, PlaneBufferGeometry, TextureLoader, Vector3, Sprite } from 'three'
import { getScreenYAxis, O3DNode, visibleHeightAtZDepthForCamYAxis, visibleWidthAtZDepthForCamYAxis } from '../../Core/O3DNode'
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
    let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
    let geo = new PlaneBufferGeometry(1, 1, 2, 2)
    let mat = new SpriteMaterial({ side: DoubleSide })
    let plane = new Sprite(mat)
    this.o3d.add(plane)

    this.onLoop(() => {
      let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
      plane.scale.x = screen.min
      plane.scale.y = screen.min

      plane.position.x = this.ctx.camera.position.x
      plane.position.y = -this.ctx.camera.position.z
    })

    this.$on('texture', ({ texture }) => {
      if (texture && mat.map !== texture) {
        let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
        let geo = new PlaneBufferGeometry(1, 1, 2, 2)
        plane.geometry = geo
        mat.map = texture
        texture.encoding = LinearEncoding
        console.log(texture)
        mat.needsUpdate = true
      }
    })
  }
}
</script>

<style>

</style>
