<template>
  <div></div>
</template>

<script>
import { BufferGeometry, CatmullRomCurve3, CircleBufferGeometry, Color, Curve, Line, LinearInterpolant, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereBufferGeometry, Sprite, SpriteMaterial, TextureLoader, Vector3 } from 'three';
import { O3DNode } from '../../Core/O3DNode'
import SpriteText from 'three-spritetext'
export default {
  props: {
    core: {},
    arrow: {},
    arrowID: {}
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
  methods: {
    getArrow () {
      return this.arrow
    }
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

    var materialDash = new LineDashedMaterial({
      color: 0xffaa00,
      dashSize: 15 / 4,
      gapSize: 5 / 4
    })

    var materialBall = new MeshBasicMaterial({
      color: 0xffaa00
    })

    var curveO3D = new Line(undefined, materialDash)

    // if (this.arrow.direction === 'out') {
    //   curveO3D.material = materialOut
    // } else if (this.arrow.direction === 'in') {
    //   curveO3D.material = materialIn
    // }

    let cancelBall = new Mesh(new CircleBufferGeometry(5, 24), new MeshBasicMaterial({ transparent: true, opacity: 0.3, color: 0xffffff }))
    cancelBall.geometry.rotateX(Math.PI * -0.5)
    cancelBall.position.y += 10

    cancelBall.material.map = new TextureLoader().load(require('./icon/close.png'))

    let newSprite = new SpriteText()
    cancelBall.add(newSprite)

    let syncError = () => {
      newSprite.text = this.arrow.errorMsg
      newSprite.textHeight = 1
      newSprite.color = '#ff0000'
      newSprite.padding = 3
      newSprite.position.y += 4
      newSprite.position.z += -7.5
      newSprite.backgroundColor = 'rgba(255,255,255,0.6)'
      newSprite.visible = this.arrow.errorMsg !== ''

      // cancelBall.material.color = new Color('#ff0000').offsetHSL(0,0,0.35)
      // cancelBall.material.opacity = 1
    }
    syncError()
    this.$watch('arrow.errorMsg', syncError)

    this.o3d.add(cancelBall)

    if (this.ctx.rayplay) {
      this.onClean(() => {
        this.ctx.rayplay.remove(cancelBall)
      })
      this.ctx.rayplay.add(cancelBall, () => {
        this.core.removeArrow({ arrow: this.getArrow() })
      })
      this.ctx.rayplay.hover(cancelBall, () => {
        cancelBall.material.opacity = 1
        newSprite.material.opacity = 1
      }, () => {
        if (this.arrow.errorMsg) {
          cancelBall.material.opacity = 1
        } else {
          cancelBall.material.opacity = 0.08
        }
        newSprite.material.opacity = 0
      })
    }

    let ball = new Mesh(new CircleBufferGeometry(5 / 2, 10), materialBall)
    ball.rotateX(Math.PI * -0.5)
    this.o3d.add(ball)

    // if (this.arrow.direction === 'out') {
    //   ball.material = ballOutMat
    // } else if (this.arrow.direction === 'in') {
    //   ball.material = ballInMat
    // }

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

      if (this.arrow.errorMsg) {
        let time = window.performance.now() * 0.001
        ball.material.color.setHSL(0, 0.5, 0.5)
        cancelBall.material.color.setHSL(0,0.5, 0.7 + 0.3 * Math.abs(Math.sin(time)))
        curveO3D.material.color.setHSL(0, Math.abs(Math.sin(time)), 0.5)
      } else {
        curveO3D.material.color.set('#ffaa00')
      }

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