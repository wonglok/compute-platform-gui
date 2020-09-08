<template>
  <div>
    <!-- @texture = rtt -->
    <slot></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, TextureLoader, Vector3 } from 'three'
import O3DNode from '../../Core/O3DNode'
import { make } from '../ARTBlockers/art-coder'
import { loadTexture } from '../../Core/loadTexture'
export default {
  props: {
    project: {},
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
    let boxDepth = 1 * scale
    let boxWidth = 40 * scale
    let boxHeight = 40 * scale

    let gap = 2 * scale

    let buttonHeight = 8 * scale
    let buttonWidth = 8 * scale

    let btnW = 10 / 4 * scale * 1.5

    let boxW = boxWidth - gap
    let boxH = boxHeight - gap

    //------
    let makeBaseMesh = () => {
      let geo = new BoxBufferGeometry(boxWidth, boxDepth, boxHeight, 1, 1)
      let mat = new MeshStandardMaterial({ color: new Color('#bababa') })

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      let baseMesh = new Mesh(geo, mat)
      baseMesh.name = 'base-mesh'
      baseMesh.layers.enable(1)

      this.unitPos = baseMesh.position
      baseMesh.position.copy(this.work.position)

      this.$watch('unitPos', () => {
        this.work.position.x = baseMesh.position.x
        this.work.position.y = baseMesh.position.y
        this.work.position.z = baseMesh.position.z
      }, { deep: true })

      if (this.ctx.ammo) {
        this.ctx.ammo.addSimpleMesh({ mesh: baseMesh, mass: 1, flags: { isOp: true, isWorld: true } })
        this.onClean(() => {
          this.ctx.ammo.removeMesh({ mesh: baseMesh })
        })
      }

      if (this.ctx.panner) {
        this.ctx.panner.setLayer(1)
        let zero = new Vector3(0, 0, 0)
        let lerpRotation = new Vector3(0, 0, 0)

        baseMesh.userData.canRun = true

        this.ctx.panner.add(baseMesh, {
          onDrag: () => {
            if (!baseMesh.userData.canRun) {
              return
            }
            window.dispatchEvent(new CustomEvent('plot-curve', { detail: { work: this.work } }))
            lerpRotation.copy(baseMesh.rotation)
            lerpRotation.lerp(zero, 0.2)
            baseMesh.rotation.set(lerpRotation.x, lerpRotation.y, lerpRotation.z)
            this.ctx.ammo.setMeshPosition({ mesh: baseMesh })
          }
        })

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
      btn.layers.enableAll()
      btn.layers.disable(1)

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
        geo.dispose()
        mat.dispose()
        this.ctx.rayplay.remove(btn)
      })

      baseMesh.add(btn)

      this.onClean(() => {
        baseMesh.remove(btn)
      })

      return btn
    }

    let makeScreen = async ({ baseMesh }) => {
      let geo = new PlaneBufferGeometry(boxW, boxH)
      let mat = new MeshStandardMaterial({ color: new Color('#cccccc') })
      let screen = new Mesh(geo, mat)
      screen.name = 'preview'
      screen.layers.enableAll()
      screen.layers.disable(1)

      screen.userData.hoverCursor = 'grab'

      screen.rotation.x = Math.PI * -0.5
      screen.position.y += boxDepth * 0.5 + 1 / 4

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      if (this.ctx.rayplay) {
        this.ctx.rayplay.add(screen, (v) => {
          console.log(v.object.name)
          this.$emit('preview', { work: this.work })
        })
        this.ctx.rayplay.hover(screen, (v) => {
          mat.emissive = new Color('#bababa')
        }, () => {
          mat.emissive = new Color('#000000')
        })
        this.onClean(() => {
          this.ctx.rayplay.remove(screen)
        })
      }

      baseMesh.add(screen)
      this.onClean(() => {
        baseMesh.remove(screen)
      })

      return screen
    }

    let baseMesh = makeBaseMesh()

    // makeButton({ corner: 'tl', color: '#ffffff', baseMesh, icon: require('./icon/unlink.png') })
    makeButton({ corner: 'tr', color: '#ffffff', baseMesh, icon: require('./icon/close.png') })
    makeButton({ corner: 'bl', color: '#ffffff', baseMesh, icon: require('./icon/pencil.png') })
    makeButton({ corner: 'br', color: '#ffffff', baseMesh, icon: require('./icon/network.png') })
    makeButton({ corner: 'br2', color: '#ffffff', baseMesh, icon: require('./icon/add-bg.png') })
    makeButton({ corner: 'br3', color: '#ffffff', baseMesh, icon: require('./icon/unlink.png') })

    makeScreen({ baseMesh })
  }
}
</script>

<style>

</style>