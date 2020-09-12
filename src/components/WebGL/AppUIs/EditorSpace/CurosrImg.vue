<template>
  <div></div>
</template>

<script>
import { CylinderBufferGeometry, CircleBufferGeometry, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, BoxBufferGeometry, DoubleSide } from 'three'
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
      let geo = new PlaneBufferGeometry(12, 12, 1, 1)
      geo.rotateX(Math.PI * -0.5)
      geo.translate(0, 1, 0)
      let mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, map: new TextureLoader().load(this.cursor.img) })
      let mesh = new Mesh(geo, mat)
      this.onLoop(() => {
        mesh.position.copy(this.cursor.position)
      })
      this.o3d.add(mesh)
    } else {
      let depth = 0.5 * 0.333
      let curveness = 36
      let width = 10
      let geoFrame = new CylinderBufferGeometry(width, width, depth, curveness)
      // geoFrame.rotateY(Math.PI / 3 / 2)
      let geoScreen = new CircleBufferGeometry(width, curveness)
      geoScreen.rotateX(Math.PI * -0.5)
      let matScreen = new MeshBasicMaterial({ side: DoubleSide, color: 0xffffff, transparent: true })
      let matScreenBase = new MeshBasicMaterial({ side: DoubleSide, color: 0xffffff, transparent: true })
      let matFrame = new MeshBasicMaterial({ color: 0xbababa })

      if (this.cursor.direction === 'in') {
        new TextureLoader().load(require('./icon/circle-in.svg'), (tex) => {
          matScreen.map = tex
          matScreen.needsUpdate = true
        })
      } else if (this.cursor.direction === 'out') {
        new TextureLoader().load(require('./icon/circle-out.svg'), (tex) => {
          matScreen.map = tex
          matScreen.needsUpdate = true
        })
      } else if (this.cursor.direction === 'inout') {
        new TextureLoader().load(require('./icon/box-target.svg'), (tex) => {
          matScreen.map = tex
          matScreen.needsUpdate = true
        })
      }

      let screen = new Mesh(geoScreen, matScreen)
      let frame = new Mesh(geoFrame, matFrame)
      screen.position.y += depth / 2 + 0.3
      screen.scale.x *= 0.95
      screen.scale.y *= 0.95
      screen.scale.z *= 0.95
      let screenBG = screen.clone()
      screenBG.position.y -= 0.1
      screenBG.material = matScreenBase
      frame.add(screenBG)
      this.onLoop(() => {
        frame.position.copy(this.cursor.position)
      })
      frame.add(screen)

      frame.layers.enableAll()
      frame.layers.disable(1)
      this.o3d.add(frame)
      this.o3d.position.y += 3
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