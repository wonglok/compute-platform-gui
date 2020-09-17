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
    offset: {
      default () {
        return new Vector3()
      }
    }
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
    let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
    let geo = new PlaneBufferGeometry(1, 1, 2, 2)
    let mat = new SpriteMaterial({ side: DoubleSide })
    let plane = new Sprite(mat)
    this.o3d.add(plane)

    this.onLoop(() => {
      let vmin = Math.min(window.innerWidth, window.innerHeight)
      let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
      plane.scale.x = screen.min / vmin * 256
      plane.scale.y = screen.min / vmin * 256

      plane.position.x = this.ctx.camera.position.x - screen.width * 0.5 + plane.scale.x * 0.5
      plane.position.y = -this.ctx.camera.position.z + screen.height * 0.5 + plane.scale.y * -0.5 + screen.min / vmin * this.offset.y
    })

    // this.$on('texture', ({ texture }) => {
    //   if (texture && mat.map !== texture) {
    //     let screen = getScreenYAxis({ depth: 0, camera: this.ctx.camera })
    //     let geo = new PlaneBufferGeometry(1, 1, 2, 2)
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
