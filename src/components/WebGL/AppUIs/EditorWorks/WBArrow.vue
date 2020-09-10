<template>
  <div></div>
</template>

<script>
import { BufferGeometry, CatmullRomCurve3, CircleBufferGeometry, Color, Curve, Line, LinearInterpolant, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereBufferGeometry, TextureLoader, Vector3 } from 'three';
import { O3DNode } from '../../Core/O3DNode'
export default {
  props: {
    arrows: {},
    arrow: {},
    core: {}
  },
  mixins: [
    O3DNode
  ],
  data () {
    return {
      isValid: true
    }
  },
  beforeDestroy () {
    this.isValid = false
  },
  mounted () {
    var materialDash = new LineDashedMaterial({
      color: 0xffaa00,
      dashSize: 15 / 4,
      gapSize: 5 / 4
    })

    var curveO3D = new Line(undefined, materialDash)

    let cancelBall = new Mesh(new CircleBufferGeometry(5, 12), new MeshBasicMaterial({ transparent: true, opacity: 0.3, color: 0xffffff }))
    cancelBall.geometry.rotateX(Math.PI * -0.5)
    cancelBall.position.y += 10
    cancelBall.layers.enableAll()
    cancelBall.layers.disable(1)

    cancelBall.material.map = new TextureLoader().load(require('./icon/close.png'))

    this.o3d.add(cancelBall)

    if (this.ctx.rayplay) {
      let setup = () => {
        this.ctx.rayplay.remove(cancelBall)
        let getArrow = () => JSON.parse(JSON.stringify(this.arrow))
        this.ctx.rayplay.add(cancelBall, () => {
          this.$forceUpdate()
          this.$root.$forceUpdate()
          this.core.removeArrow({ arrow: getArrow() })
        })
        this.ctx.rayplay.hover(cancelBall, () => {
          cancelBall.material.opacity = 1
        }, () => {
          cancelBall.material.opacity = 0.08
        })
      }
      setup()
      this.$watch('arrow', () => {
        setup()
      }, { deep: true })
    }

    let ball = new Mesh(new CircleBufferGeometry(5 / 2, 10), new MeshBasicMaterial({ color: 0xffaa00 }))
    ball.rotateX(Math.PI * -0.5)
    this.o3d.add(ball)

    let pt1 = new Vector3()
    let pt2 = new Vector3()

    var curve = new CatmullRomCurve3([
      pt1,
      pt2
    ]);

    let plot = () => {
      let from = this.core.works.find(w => w._id === this.arrow.from)
      let to = this.core.works.find(w => w._id === this.arrow.to)
      if (!from || !to) {
        return
      }

      pt1.set(from.position.x, from.position.y + 0.1, from.position.z)
      pt2.set(to.position.x, to.position.y + 0.1, to.position.z)

      var points = curve.getPoints(2);
      var geometry = new BufferGeometry().setFromPoints(points);
      curveO3D.geometry = geometry
      curveO3D.computeLineDistances()
    }

    plot()

    let i = 0
    this.onLoop(() => {
      curve.getPointAt((i % 100) / 100, ball.position)
      i += 1 / 60 * 100.0 * 0.433

      curve.getPointAt(0.5, cancelBall.position)
      cancelBall.position.y += 1

      curveO3D.computeLineDistances()
    })

    window.addEventListener('plot-curve', (evt) => {
      if (!this.isValid) {
        return
      }
      plot()
    })

    this.o3d.add(curveO3D)
  }
}
</script>

<style>

</style>