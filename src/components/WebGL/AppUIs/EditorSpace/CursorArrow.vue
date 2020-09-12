<template>
  <div></div>
</template>

<script>
import { BufferGeometry, CatmullRomCurve3, CircleBufferGeometry, Color, Curve, Line, LinearInterpolant, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereBufferGeometry, Vector3 } from 'three';
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
    var materialIn = new LineDashedMaterial({
      color: new Color('#a6e22e'),
      dashSize: 15 / 4,
      gapSize: 5 / 4
    })

    var materialOut = new LineDashedMaterial({
      color: new Color('#e2bc2e'),
      dashSize: 15 / 4,
      gapSize: 5 / 4
    })

    var ballInMat = new MeshBasicMaterial({ color: new Color('#a6e22e') })
    var ballOutMat = new MeshBasicMaterial({ color: new Color('#e2bc2e') })

    var curveO3D = new Line(undefined, materialOut)

    let ball = new Mesh(new CircleBufferGeometry(5 / 2, 10), ballInMat)
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

      if (this.cursor.direction === 'in') {
        pt2.set(from.position.x, from.position.y, from.position.z)
        pt1.set(to.position.x, to.position.y, to.position.z)
        curveO3D.material = materialIn
        ball.material = ballInMat
      } else if (this.cursor.direction === 'out') {
        pt1.set(from.position.x, from.position.y, from.position.z)
        pt2.set(to.position.x, to.position.y, to.position.z)
        curveO3D.material = materialOut
        ball.material = ballOutMat
      }

      var points = curve.getPoints(2);
      var geometry = new BufferGeometry().setFromPoints(points);
      curveO3D.geometry = geometry
      curveO3D.computeLineDistances()
    }
    plot()

    let i = 0
    this.onLoop(() => {
      curve.getPoint((i % 100) / 100, ball.position)
      i += 1 / 60 * 100.0 * 1.

      plot()
    })

    this.o3d.add(curveO3D)
  }
}
</script>

<style>

</style>