<template>
  <div>
    <!-- @texture = rtt -->
    <slot></slot>
  </div>
</template>

<script>
import { BoxBufferGeometry, CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, PlaneBufferGeometry, Vector3 } from 'three'
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
    let scale = 4
    let boxDepth = 3 * scale
    let boxWidth = 40 * scale
    let boxHeight = 40 * scale

    let gap = 2 * scale

    let buttonHeight = 8 * scale
    let buttonWidth = 8 * scale

    let btnW = 10

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

      return baseMesh
    }

    let makeButton = async ({ corner, color = '#0000ff' }) => {
      let geo = new CircleBufferGeometry(btnW, 32)
      let mat = new MeshStandardMaterial({ color: new Color(color), transparent: true })
      let btn = new Mesh(geo, mat)
      btn.name = corner
      btn.layers.enableAll()
      btn.layers.disable(1)

      btn.rotation.x = Math.PI * -0.5
      btn.position.y += boxDepth * 0.5 + 1 + 1

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

      this.ctx.rayplay.add(btn, (v) => {
        console.log(v.object.name)
        this.$emit(corner, { work: this.work })
      })

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
        this.ctx.rayplay.remove(btn)
      })


      return btn
    }

    let makeScreen = () => {
      let geo = new PlaneBufferGeometry(boxW, boxH)
      let mat = new MeshStandardMaterial({ color: new Color('#cccccc') })
      let screen = new Mesh(geo, mat)
      screen.name = 'preview'
      screen.layers.enableAll()
      screen.layers.disable(1)

      screen.rotation.x = Math.PI * -0.5
      screen.position.y += boxDepth * 0.5 + 1

      this.onClean(() => {
        geo.dispose()
        mat.dispose()
      })

      if (this.ctx.rayplay) {
        this.ctx.rayplay.add(screen, (v) => {
          console.log(v.object.name)
          this.$emit('preview', { work: this.work })
        })
        this.onClean(() => {
          this.ctx.rayplay.remove(screen)
        })
      }

      return screen
    }
    let closeBtn = await loadTexture(require('./icon/close-circle.svg'))
    let baseMesh = makeBaseMesh()
    // let button1 = makeButton({ corner: 'tl', color: '#0000ff' })
    let button2 = makeButton({ corner: 'tr', color: '#ff0000' })
    // let button3 = makeButton({ corner: 'bl', color: '#00ff00' })
    // let button4 = makeButton({ corner: 'br', color: '#00ffff' })

    // baseMesh.add(button1)
    baseMesh.add(button2)
    // baseMesh.add(button3)
    // baseMesh.add(button4)

    this.onClean(() => {
      // baseMesh.remove(button1)
      baseMesh.remove(button2)
      // baseMesh.remove(button3)
      // baseMesh.remove(button4)
    })

    let screen = makeScreen()
    baseMesh.add(screen)
    this.onClean(() => {
      baseMesh.remove(screen)
    })

    this.o3d.add(baseMesh)
  }
}
</script>

<style>

</style>