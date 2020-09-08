<template>
  <div></div>
</template>

<script>
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader } from 'three'
import O3DNode from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  props: {
    cursor: {}
  },
  mounted () {
    let geo = new PlaneBufferGeometry(64, 64, 1, 1)
    geo.rotateX(Math.PI * -0.5)
    geo.translate(0, 10, 0)
    let mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, map: new TextureLoader().load(this.cursor.img) })
    let mesh = new Mesh(geo, mat)
    this.onLoop(() => {
      mesh.position.copy(this.cursor.position)
    })
    this.o3d.add(mesh)
  }
}
</script>

<style>

</style>