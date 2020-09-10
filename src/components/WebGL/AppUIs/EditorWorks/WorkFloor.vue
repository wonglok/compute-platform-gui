<template>
  <div></div>
</template>

<script>
import { Mesh, MeshBasicMaterial, BoxBufferGeometry, Vector3, Color } from 'three'
import O3DNode from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  props: {
    mouseMode: {}
  },
  mounted () {
    let geo = new BoxBufferGeometry(40000, 10, 40000, 20, 3, 20)
    let mat = new MeshBasicMaterial({ color: 0xeeeeee, wireframe: false, transparent: true, opacity: 0.5 })
    let mesh = new Mesh(geo, mat)
    mesh.position.y = -1
    mesh.layers.enable(2)
    this.o3d.add(mesh)

    this.$watch('mouseMode', () => {
      if (this.ctx.isTouch) {
        if (this.mouseMode) {
          mat.color = new Color('#23ff23')
        } else {
          mat.color = new Color('#bababa')
        }
      }
    })

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
