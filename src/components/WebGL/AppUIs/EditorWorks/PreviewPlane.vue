<template>
  <div>
    <!-- @texture = rtt -->
    <slot @texture="$emit('texture', $event)"></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, DoubleSide, LinearEncoding, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, TextureLoader, Vector3 } from 'three'
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
      isTextureAttach: true,
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

    // this.$on('texture', ({ texture }) => {
    //   if (texture && mat.map !== texture) {
    //     let screen = getScreen({ depth: 0, camera: this.ctx.camera })
    //     let geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
    //     plane.geometry = geo
    //     mat.map = texture
    //     texture.encoding = LinearEncoding
    //     console.log(texture)
    //     mat.needsUpdate = true
    //   }
    // })

    this.onLoop(() => {
      let texture = this.texture
      if (texture && mat.map !== texture) {
        let screen = getScreen({ depth: 0, camera: this.ctx.camera })
        let geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
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
