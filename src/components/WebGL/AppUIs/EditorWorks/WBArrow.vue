<template>
  <div></div>
</template>

<script>
import { BufferGeometry, CatmullRomCurve3, CircleBufferGeometry, Curve, Line, LinearInterpolant, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereBufferGeometry, Vector3 } from 'three';
import { O3DNode } from '../../Core/O3DNode'
export default {
  props: {
    arrow: {},
    core: {}
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
      color: 0xffaa00,
      dashSize: 15,
      gapSize: 5
    })

    var curveO3D = new Line(undefined, material)
    let ball = new Mesh(new CircleBufferGeometry(5, 10), new MeshBasicMaterial({ color: 0xffaa00 }))
    ball.rotateX(Math.PI * -0.5)
    this.o3d.add(ball)

    let plot = () => {
      let from = this.core.works.find(w => w._id === this.arrow.from)
      let to = this.core.works.find(w => w._id === this.arrow.to)
      if (!from || !to) {
        return
      }

      var curve = new CatmullRomCurve3([
        new Vector3(from.position.x, from.position.y - 4, from.position.z),
        new Vector3(to.position.x, to.position.y - 4, to.position.z)
      ]);

      var points = curve.getPoints(2);
      var geometry = new BufferGeometry().setFromPoints(points);
      curveO3D.geometry = geometry
      curveO3D.computeLineDistances()

      return {
        curve
      }
    }

    let pRes = plot()
    let curve = pRes.curve

    let i = 0
    this.onLoop(() => {
      curve.getPoint((i % 100) / 100, ball.position)
      i += 1 / 60 * 100.0 * 0.433
    })

    window.addEventListener('plot-curve', (evt) => {
      if (!this.isValid) {
        return
      }
      let pRes = plot()
      curve = pRes.curve
    })

    this.o3d.add(curveO3D)
  }
}
</script>

<style>

</style>