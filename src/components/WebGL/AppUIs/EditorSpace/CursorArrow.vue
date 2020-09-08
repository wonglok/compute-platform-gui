<template>
  <div></div>
</template>

<script>
import { BufferGeometry, CatmullRomCurve3, CircleBufferGeometry, Curve, Line, LinearInterpolant, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereBufferGeometry, Vector3 } from 'three';
import { O3DNode } from '../../Core/O3DNode'
export default {
  props: {
    cursor: {},
    core: {},
    from: {}
  },
  mixins: [
    O3DNode
  ],
  data () {
    return {
      isValid: true,
    }
  },
  beforeDestroy () {
    this.isValid = false
  },
  mounted () {
    var material = new LineDashedMaterial({
      color: 0xde20bd,
      dashSize: 15 / 4,
      gapSize: 5 / 4
    })

    var curveO3D = new Line(undefined, material)
    let ball = new Mesh(new CircleBufferGeometry(5 / 2, 10), new MeshBasicMaterial({ color: 0xde20bd }))
    ball.rotateX(Math.PI * -0.5)
    this.o3d.add(ball)

    let pt1 = new Vector3()
    let pt2 = new Vector3()
    var curve = new CatmullRomCurve3([
      pt1,
      pt2
    ]);

    let plot = () => {
      let from = this.from
      let to = {
        position: this.cursor.position
      }

      if (!from || !to) {
        return
      }

      pt1.set(from.position.x, from.position.y - 4, from.position.z)
      pt2.set(to.position.x, to.position.y - 4, to.position.z)

      var points = curve.getPoints(2);
      var geometry = new BufferGeometry().setFromPoints(points);
      curveO3D.geometry = geometry
      curveO3D.computeLineDistances()

      return {
        curve
      }
    }

    plot()
    let i = 0
    this.onLoop(() => {
      curve.getPoint((i % 100) / 100, ball.position)
      i += 1 / 60 * 100.0 * 0.553

      plot()
    })

    this.o3d.add(curveO3D)
  }
}
</script>

<style>

</style>