<template>
  <div></div>
</template>

<script>
import { Mesh, MeshBasicMaterial, BoxBufferGeometry, Vector3 } from 'three'
import O3DNode from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  mounted () {
    let geo = new BoxBufferGeometry(40000, 10, 40000, 20, 3, 20)
    let mat = new MeshBasicMaterial({ color: 0xeeeeee, wireframe: false, transparent: true, opacity: 0.5 })
    let mesh = new Mesh(geo, mat)
    mesh.position.y = -1
    this.o3d.add(mesh)

    if (this.ctx.ammo) {
      this.ctx.ammo.addSimpleMesh({ mesh, mass: 0, flags: { isFloor: true, isWorld: true } })
    }
    if (this.ctx.rayplay) {
      this.ctx.rayplay.add(mesh, (ev) => {
        this.$emit('click-floor', ev)
      })
      this.ctx.rayplay.move(mesh, (ev) => {
        this.$emit('move-point', { point: ev.ray.point })
      })
    }
  }
}
</script>

<style>
</style>
