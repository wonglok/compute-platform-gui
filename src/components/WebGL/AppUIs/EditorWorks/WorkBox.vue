<template>
  <div>
    <!-- @texture = rtt -->
    <slot @texture="$emit('texture', $event)"></slot>
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

    let boxW = boxWidth - gap * 0.75
    let boxH = boxHeight - gap * 0.75

    let makeCurved = (width, height, boxDepth, type = 'flat') => {
      var roundedRectShape = new Shape();

      let makeRect = (ctx, x, y, width, height, radius) => {
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

      makeRect(roundedRectShape, width * -0.5, height * -0.5, width, height, width * 0.175)

      if (type === 'flat') {
        let geometry = new ShapeBufferGeometry(roundedRectShape)
        geometry.rotateX(Math.PI * -0.5)

        return geometry
      } else if (type === 'extrude') {
        let extrudeSettings = {
          depth: boxDepth * 0.2,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 3,
          bevelSize: 1,
          bevelThickness: 1
        }

        let geometry = new ExtrudeBufferGeometry(roundedRectShape, extrudeSettings)
        geometry.rotateX(Math.PI * -0.5)
        geometry.translate(0, -boxDepth * 0.2, 0)

        return geometry
      }
    }

    //------
    let makeBaseMesh = () => {
      let geo = makeCurved(boxWidth, boxHeight, boxDepth, 'extrude')
      // let geo = new BoxBufferGeometry(boxWidth, boxDepth, boxHeight, 1, 1)
      let mat = new MeshStandardMaterial({ color: new Color('#bababa') })

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      if (this.work.workBoxFrameColor) {
        mat.color.set(this.work.workBoxFrameColor)
      }

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
        //
        // this.ctx.ammo.addSimpleMesh({ mesh: baseMesh, mass: 1, flags: { isWorkBox: true, isWorld: true } })
        this.ctx.ammo.addHullMesh({ mesh: baseMesh, mass: 1, flags: { isWorkBox: true, isWorld: true } })
      }

      if (this.ctx.panner) {
        let zero = new Vector3(0, 0, 0)
        let lerpRotation = new Vector3(0, 0, 0)
        let lerpYPosition = new Vector3(0, 10, 0)

        baseMesh.userData.canRun = true
        // baseMesh.layers.enable(1)

        this.ctx.panner.add(baseMesh, {
          onDrag: () => {
            if (!baseMesh.userData.canRun) {
              return
            }
            window.dispatchEvent(new Event('plot-curve'))
            lerpRotation.copy(baseMesh.rotation)
            lerpRotation.lerp(zero, 0.1)
            baseMesh.rotation.set(lerpRotation.x, lerpRotation.y, lerpRotation.z)
            lerpYPosition.x = baseMesh.position.x
            lerpYPosition.z = baseMesh.position.z
            lerpYPosition.y = 10

            baseMesh.position.lerp(lerpYPosition, 0.3)
            if (this.ctx.ammo) {
              this.ctx.ammo.setMeshPosition({ mesh: baseMesh })
            }
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

      btn.userData.hoverCursor = 'pointer'
      // btn.layers.enable(2)

      btn.rotation.x = Math.PI * -0.5
      btn.position.y += boxDepth * 0.5 + 3 / 4

      // console.log(corner)

      if (corner === 'tl') {
        btn.position.x = boxWidth * -0.5 + btnW * 0.5
        btn.position.z = boxHeight * -0.5 + btnW * 0.5


      }

      if (corner === 'tr') {
        btn.position.x = boxWidth * 0.5
        btn.position.z = boxHeight * -0.5

        this.ctx.rayplay.hover(btn, (v) => {
          btn.material.opacity = 1.0
        }, () => {
          btn.material.opacity = 0.25
        })
      }

      if (corner === 'bl') {
        btn.position.x = boxWidth * -0.5 + btnW
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br') {
        btn.position.x = boxWidth * 0.5 - btnW
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br2') {
        btn.position.x = boxWidth * 0.5 - btnW * 2 - gap * 0.5 - btnW
        btn.position.z = boxHeight * 0.5
      }

      if (corner === 'br3') {
        btn.position.x = boxWidth * 0.5 - btnW * 4 - gap * 1 - btnW
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

    // let makeScreen = async ({ baseMesh }) => {
    //   let geo = new PlaneBufferGeometry(boxW, boxH)
    //   let mat = new MeshStandardMaterial({ side: DoubleSide, color: new Color('#cccccc') })
    //   let screen = new Mesh(geo, mat)
    //   screen.name = 'preview'
    //   screen.layers.enable(2)
    //   // screen.layers.disable(1)

    //   screen.userData.hoverCursor = 'grab'

    //   screen.rotation.x = Math.PI * -0.5
    //   screen.position.y += boxDepth * 0.5 + 0.3

    //   this.onClean(() => {
    //     geo.dispose()
    //     mat.dispose()
    //   })

    //   this.ctx.rayplay.add(screen, (v) => {
    //     console.log(v.object.name)
    //     this.$emit('preview', { work: this.work })
    //   })

    //   let onColor = new Color('#bababa').offsetHSL(0, 0, -0.3)
    //   let onOff = new Color('#bababa')

    //   this.ctx.rayplay.hover(screen, (v) => {
    //     baseMesh.material.color = onColor
    //     baseMesh.material.needsUpdate = true
    //   }, (v) => {
    //     baseMesh.material.color = onOff
    //     baseMesh.material.needsUpdate = true
    //   })

    //   this.onClean(() => {
    //     this.ctx.rayplay.remove(screen)
    //   })

    //   this.$on('texture', (texture) => {
    //     mat.map = texture
    //   })

    //   baseMesh.add(screen)
    //   this.onClean(() => {
    //     baseMesh.remove(screen)
    //   })

    //   return screen
    // }

    let makeRoundedScreen = ({ baseMesh, close }) => {
      let roundedGeo = makeCurved(boxW, boxH, boxDepth)
      let roundedMat = new MeshBasicMaterial({ transparent: true })
      let screen = new Mesh(roundedGeo, roundedMat)
      screen.position.y = boxDepth * 0.5 + boxDepth * 0.2

      this.$on('texture', ({ texture }) => {
        if (texture && roundedMat.map !== texture) {
          roundedMat.map = texture
          // texture.wrapS = texture.wrapT = RepeatWrapping
          texture.repeat.set(1 / 40, 1 / 40)
          texture.offset.set(0.5, 0.5)
        }
      })

      //workBoxScreenColor

      // let onColor = new Color('#bababa').offsetHSL(0, 0, 0.14)
      // let offColor = new Color('#bababa')

      this.ctx.rayplay.add(screen, (v) => {
        console.log(v.object.name)
        this.$emit('preview', { work: this.work })
      })

      this.ctx.rayplay.hover(screen, (v) => {
        // baseMesh.material.color = onColor
        baseMesh.material.needsUpdate = true
        baseMesh.material.color.set(this.work.workBoxFrameColor).offsetHSL(0, 0, -0.08)

        // if (this.work.direction === 'out') {
        // } else if (this.work.direction === 'in') {
        //   baseMesh.material.color.set('#a6e22e').offsetHSL(0, 0, -0.08)
        // } else if (this.work.direction === 'inout') {
        //   baseMesh.material.color.set('#bababa').offsetHSL(0, 0, -0.08)
        // }

        // close.material.opacity = 1
      }, (v) => {
        baseMesh.material.needsUpdate = true
        baseMesh.material.color.set(this.work.workBoxFrameColor)

        // if (this.work.direction === 'out') {
        //   baseMesh.material.color.set('#e2bc2e')
        // } else if (this.work.direction === 'in') {
        //   baseMesh.material.color.set('#a6e22e')
        // } else if (this.work.direction === 'inout') {
        //   baseMesh.material.color.set('#bababa')
        // }

        // baseMesh.material.color = offColor
        // close.material.opacity = 0.08
      })

      this.onClean(() => {
        this.ctx.rayplay.remove(screen)
      })

      baseMesh.add(screen)
    }

    let getIcon = ({ work, key = 'br' }) => {
      let icon = require('./icon/box-out.svg')
      if (work.buttons[key].icon === 'circle-out') {
        icon = require('./icon/circle-out.svg')
      }
      if (work.buttons[key].icon === 'circle-in') {
        icon = require('./icon/circle-in.svg')
      }
      if (work.buttons[key].icon === 'icon-stack') {
        icon = require('./icon/icon-stack.svg')
      }
      return icon
    }

    let baseMesh = makeBaseMesh()

    if (this.work.buttons.tl) {
      makeButton({ corner: 'tl', color: '#ffffff', baseMesh })
    }

    if (this.work.buttons.tr) {
      let icon =  require('./icon/close.png')
      makeButton({ corner: 'tr', color: '#ffffff', baseMesh, icon })
    }

    if (this.work.buttons.bl) {
      let icon = require('./icon/icon-code.svg')
      makeButton({ corner: 'bl', color: '#ffffff', baseMesh, icon })
    }

    if (this.work.buttons.br) {
      let icon = getIcon({ work: this.work, key: 'br' })
      makeButton({ corner: 'br', color: '#ffffff', baseMesh, icon })
    }

    if (this.work.buttons.br2) {
      let icon = getIcon({ work: this.work, key: 'br2' })
      makeButton({ corner: 'br2', color: '#ffffff', baseMesh, icon })
    }

    // makeButton({ corner: 'br3', color: '#ffffff', baseMesh, icon: require('./icon/network.png') })
    // makeScreen({ baseMesh })

    makeRoundedScreen({ baseMesh, close: close })

    this.ctx.core.refresh()
  }
}
</script>

<style>

</style>