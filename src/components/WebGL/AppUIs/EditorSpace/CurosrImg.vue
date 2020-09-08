<template>
  <div></div>
</template>

<script>
import { CylinderBufferGeometry, CircleBufferGeometry, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader } from 'three'
import O3DNode from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  props: {
    cursor: {}
  },
  mounted () {
    if (this.cursor.type === 'img') {
      let geo = new PlaneBufferGeometry(64, 64, 1, 1)
      geo.rotateX(Math.PI * -0.5)
      geo.translate(0, 10, 0)
      let mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, map: new TextureLoader().load(this.cursor.img) })
      let mesh = new Mesh(geo, mat)
      this.onLoop(() => {
        mesh.position.copy(this.cursor.position)
      })
      this.o3d.add(mesh)
    } else {
      let depth = 3
      let curveness = 6
      let geoFrame = new CylinderBufferGeometry(128 / 2, 128 / 2, depth, curveness, curveness)
      geoFrame.rotateY(Math.PI / 3 / 2)
      let geoScreen = new CircleBufferGeometry(128 / 2, curveness)
      geoScreen.rotateX(Math.PI * -0.5)
      let matScreen = new MeshBasicMaterial({ color: 0xffffff })

      let matFrame = new MeshBasicMaterial({ color: 0xaaaaaa })
      let screen = new Mesh(geoScreen, matScreen)
      let frame = new Mesh(geoFrame, matFrame)
      screen.position.y += depth / 2 + 0.1
      screen.scale.x *= 0.9
      // screen.scale.y *= 0.9
      screen.scale.z *= 0.9
      this.onLoop(() => {
        frame.position.copy(this.cursor.position)
      })
      frame.add(screen)
      this.o3d.add(frame)
    }
  },
  beforeDestroy () {
    // this.isComponentActive = false
    // if (process.env.NODE_ENV === 'development') {
    //   window.location.reload()
    // }
  }
}
</script>

<style>

</style>