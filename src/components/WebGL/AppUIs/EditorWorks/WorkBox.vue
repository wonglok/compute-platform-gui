<template>
  <div>
    <!-- @texture = rtt -->
    <slot @texture="texture = $event; $emit('texture', texture)"></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, DoubleSide, ExtrudeBufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, RepeatWrapping, Shape, ShapeBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three'
import O3DNode from '../../Core/O3DNode'
import { make } from '../ARTBlockers/art-coder'
import { loadTexture } from '../../Core/loadTexture'
export default {
  props: {
    work: {}
  },
  mixins: [
    O3DNode
  ],
  data () {
    return {
      texture: false,
      unitPos: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  },
  async mounted () {
    let scale = 1
    let boxDepth = 2 * scale
    let boxWidth = 40 * scale
    let boxHeight = 40 * scale

    let gap = 2 * scale

    let buttonHeight = 8 * scale
    let buttonWidth = 8 * scale

    let btnW = 10 / 4 * scale * 1.5

    let boxW = boxWidth - gap
    let boxH = boxHeight - gap

    let makeCurved = (width, height, boxDepth) => {
      var roundedRectShape = new Shape();

      let makeRect = ( ctx, x, y, width, height, radius ) => {
        ctx.moveTo( x, y + radius );
        ctx.lineTo( x, y + height - radius );
        ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
        ctx.lineTo( x + width - radius, y + height );
        ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
        ctx.lineTo( x + width, y + radius );
        ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
        ctx.lineTo( x + radius, y );
        ctx.quadraticCurveTo( x, y, x, y + radius );
      }

      makeRect(roundedRectShape, width * -0.5, height * -0.5, width, height, 8)

      let extrudeSettings = {
        depth: boxDepth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
      }
      // var geometry = new ExtrudeBufferGeometry(roundedRectShape, extrudeSettings)
      // geometry.rotateX(Math.PI * -0.5)
      // geometry.translate(0, 0, -boxDepth)
      var geometry = new ShapeBufferGeometry(roundedRectShape)
      geometry.rotateX(Math.PI * -0.5)

      return geometry
    }

    //------
    let makeBaseMesh = () => {
      // let geo = makeCurved(boxWidth, boxHeight, boxDepth, 1, 1)
      let geo = new BoxBufferGeometry(boxWidth, boxDepth, boxHeight, 1, 1)
      let mat = new MeshStandardMaterial({ color: new Color('#bababa') })

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      let baseMesh = new Mesh(geo, mat)
      baseMesh.name = 'base-mesh'
      baseMesh.layers.enable(1)
      // baseMesh.layers.enable(2)

      this.unitPos = baseMesh.position
      baseMesh.position.copy(this.work.position)

      this.$watch('unitPos', () => {
        this.work.position.x = baseMesh.position.x
        this.work.position.y = baseMesh.position.y
        this.work.position.z = baseMesh.position.z
        window.dispatchEvent(new Event('plot-curve'))
      }, { deep: true })

      if (this.ctx.ammo) {
        this.onClean(() => {
          this.ctx.ammo.removeMesh({ mesh: baseMesh })
        })
        this.ctx.ammo.addSimpleMesh({ mesh: baseMesh, mass: 1, flags: { isWorkBox: true, isWorld: true } })
      }

      if (this.ctx.panner) {
        let zero = new Vector3(0, 0, 0)
        let lerpRotation = new Vector3(0, 0, 0)

        baseMesh.userData.canRun = true
        // baseMesh.layers.enable(1)

        this.ctx.panner.add(baseMesh, {
          onDrag: () => {
            if (!baseMesh.userData.canRun) {
              return
            }
            window.dispatchEvent(new Event('plot-curve'))
            lerpRotation.copy(baseMesh.rotation)
            lerpRotation.lerp(zero, 0.2)
            baseMesh.rotation.set(lerpRotation.x, lerpRotation.y, lerpRotation.z)
            this.ctx.ammo.setMeshPosition({ mesh: baseMesh })
          }
        })

        // this.onLoop(() => {
        //   window.dispatchEvent(new Event('plot-curve'))
        // })

        this.onClean(() => {
          baseMesh.userData.canRun = false
          this.ctx.panner.remove(baseMesh)
        })
      }

      this.o3d.add(baseMesh)
      this.onClean(() => {
        this.o3d.remove(baseMesh)
      })

      return baseMesh
    }

    let makeButton = async ({ corner, color = '#0000ff', baseMesh, icon }) => {
      let geo = new CircleBufferGeometry(btnW, 24)
      let mat = new MeshBasicMaterial({ color: new Color(color), transparent: true })
      if (icon) {
        let texture = new TextureLoader().load(icon)
        mat.map = texture
      }
      let btn = new Mesh(geo, mat)
      btn.name = corner
      // btn.layers.enable(2)

      btn.rotation.x = Math.PI * -0.5
      btn.position.y += boxDepth * 0.5 + 3 / 4

      // console.log(corner)

      if (corner === 'tl') {
        btn.position.x = boxWidth * -0.5
        btn.position.z = boxHeight * -0.5
      }

      if (corner === 'tr') {
        btn.position.x = boxWidth * 0.5
        btn.position.z = boxHeight * -0.5

        this.ctx.rayplay.hover(btn, (v) => {
          btn.material.opacity = 1.0
        }, () => {
          btn.material.opacity = 0.08
        })
      }

      if (corner === 'bl') {
        btn.position.x = boxWidth * -0.5
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br') {
        btn.position.x = boxWidth * 0.5
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br2') {
        btn.position.x = boxWidth * 0.5 - btnW * 2 - gap * 0.5
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br3') {
        btn.position.x = boxWidth * 0.5 - btnW * 4 - gap * 1
        btn.position.z = boxHeight * 0.5
      }

      this.ctx.rayplay.add(btn, (v) => {
        console.log(v.object.name)
        this.$emit(corner, { work: this.work })
      })
      this.onClean(() => {
        this.ctx.rayplay.remove(btn)
      })

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      baseMesh.add(btn)

      this.onClean(() => {
        baseMesh.remove(btn)
      })

      return btn
    }

    let makeScreen = async ({ baseMesh }) => {
      let geo = new PlaneBufferGeometry(boxW, boxH)
      // let geo = makeCurved(boxW, boxH)
      let mat = new MeshStandardMaterial({ side: DoubleSide, color: new Color('#cccccc') })
      let screen = new Mesh(geo, mat)
      screen.name = 'preview'
      screen.layers.enable(2)
      // screen.layers.disable(1)

      screen.userData.hoverCursor = 'grab'

      screen.rotation.x = Math.PI * -0.5
      screen.position.y += boxDepth * 0.5 + 0.3

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      this.ctx.rayplay.add(screen, (v) => {
        console.log(v.object.name)
        this.$emit('preview', { work: this.work })
      })

      let onColor = new Color('#bababa').offsetHSL(0, 0, -0.3)
      let onOff = new Color('#bababa')

      this.ctx.rayplay.hover(screen, (v) => {
        baseMesh.material.color = onColor
        baseMesh.material.needsUpdate = true
      }, (v) => {
        baseMesh.material.color = onOff
        baseMesh.material.needsUpdate = true
      })

      this.onClean(() => {
        this.ctx.rayplay.remove(screen)
      })

      this.$on('texture', (texture) => {
        mat.map = texture
      })

      baseMesh.add(screen)
      this.onClean(() => {
        baseMesh.remove(screen)
      })

      return screen
    }

    let makeRoundedScreen = ({ baseMesh }) => {
      let roundedGeo = makeCurved(boxWidth, boxHeight, boxDepth)
      let roundedMat = new MeshStandardMaterial({ color: new Color('#bababa') })
      let screen = new Mesh(roundedGeo, roundedMat)
      screen.position.y = boxDepth * 0.5 + 0.3

      this.$on('texture', (texture) => {
        if (texture) {
          roundedMat.map = texture
          // texture.wrapS = texture.wrapT = RepeatWrapping
          texture.repeat.set(1 / 40, 1 / 40)
          texture.offset.set(0.5, 0.5)
        }
      })

      let onColor = new Color('#bababa').offsetHSL(0, 0, -0.3)
      let onOff = new Color('#bababa')

      this.ctx.rayplay.hover(screen, (v) => {
        baseMesh.material.color = onColor
        baseMesh.material.needsUpdate = true
      }, (v) => {
        baseMesh.material.color = onOff
        baseMesh.material.needsUpdate = true
      })

      this.onClean(() => {
        this.ctx.rayplay.remove(screen)
      })

      baseMesh.add(screen)
    }

    let baseMesh = makeBaseMesh()

    // makeButton({ corner: 'tl', color: '#ffffff', baseMesh, icon: require('./icon/unlink.png') })
    // if (!this.work.isGenesis) {
    makeButton({ corner: 'tr', color: '#ffffff', baseMesh, icon: require('./icon/close.png') })
    // }

    makeButton({ corner: 'bl', color: '#ffffff', baseMesh, icon: require('./icon/gear-black.png') })
    makeButton({ corner: 'br', color: '#ffffff', baseMesh, icon: require('./icon/box-out.svg') })
    makeButton({ corner: 'br2', color: '#ffffff', baseMesh, icon: require('./icon/box-in.svg') })
    // makeButton({ corner: 'br3', color: '#ffffff', baseMesh, icon: require('./icon/network.png') })
    // makeScreen({ baseMesh })

    makeRoundedScreen({ baseMesh })

    this.ctx.core.refresh()
  }
}
</script>

<style>

</style>