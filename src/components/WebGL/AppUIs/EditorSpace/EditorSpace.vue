<template>
  <div class="w-full h-full relative overflow-hidden" ref="area">
    <!-- <div class="border" style="width: 600px; height: 400px;">
      <EditorWin @url="iframe = $event"></EditorWin>
    </div>
    <iframe :src="iframe" frameborder="0"></iframe> -->
    <!-- <Bloomer :settings="{
      exposure: 1.0,=
      bloomStrength: 2,
      bloomThreshold: 72.5 / 100.0,
      bloomRadius: 50.99 / 100.0 * 2
    }"></Bloomer> -->
    <!-- <pre>{{ core }}</pre> -->

    <O3D :px="50" :py="100" :pz="50">
      <DirectionalLight :color="0xffffff" :floorColor="0xffffff" :helper="isDev && isOff" :intensity="0.75"></DirectionalLight>
    </O3D>

    <O3D :px="0" :py="100" :pz="0">
      <AmbinetLight :color="0xffffff" :helper="isDev && isOff" :intensity="0.5"></AmbinetLight>
    </O3D>

    <O3D v-if="core && ammo">
      <WorkFloor @move-point="onMove($event)" @click-floor="onClickFloor" @delta="onPan($event)"></WorkFloor>

      <O3D v-for="work in core.works" :key="work._id" >
        <WBGenesis :key="work._id" :core="core" :works="core.works" :work="work" @tl="onClickTL($event)" @br="onClickBR($event)" @br3="onClickBR3($event)" @br2="onClickBR2($event)" @bl="onClickBL($event)" @preview="onClickPreview($event)" @tr="onRemoveWork($event)">
        </WBGenesis>
      </O3D>

      <O3D v-for="arrow in core.arrows" :key="arrow._id">
        <WBArrow :key="arrow._id" :core="core" :arrows="core.arrows" :arrow="arrow">
        </WBArrow>
      </O3D>
    </O3D>

    <div @click="onClickWrapper" class="absolute top-0 left-0 full" ref="wrapper">
      <div @click="onClickToucher" class="absolute top-0 left-0 full" ref="toucher"></div>
    </div>

    <div v-if="core">
      <EditBox v-for="win in core.wins" :key="win._id + '-wins'" :wins="core.wins" v-show="win.show" :win="win" :offset="offset" class="win-area">
        <EditorUnit :win="win" :wins="core.wins" v-if="win.appName === 'editor'"></EditorUnit>
        <!-- <PipelineController :win="win" :wins="wins" v-if="win.appName === 'project'"></PipelineController> -->
      </EditBox>
    </div>

    <CurosrImg v-if="cursor.enableImg" :cursor="cursor"></CurosrImg>
    <CursorArrow v-if="cursor.enableArrow" :from="core.getCurrentWorkFrom()" :cursor="cursor"></CursorArrow>

    <div class="absolute top-0 left-0 full bg-white" v-if="overlay === 'genesis'">
      <Genesis @choose="onChooseGenesis" @mouse-mode="mouseMode = $event" @overlay="overlay = $event"></Genesis>
    </div>

    <!-- <div ref="drag-area" class="age-drag-area age-layer full"></div> -->

  </div>
</template>

<script>
import Vue from 'vue'

import * as UI from './ageUI'
import { Scene, Vector2, Vector3 } from 'three'
import { RenderRoot } from '../../Core/RenderRoot'
import { PCamera } from '../../Core/PCamera'
import { RayPlay } from '../../Core/RayPlay'
import { Dragger } from './Dragger'
import { AmmoPhysics } from './AmmoPhysics'
import { getID, getScreen } from '../../Core/O3DNode'
import { AppCore } from '../../Packages/FSCompiler/Core'
export default {
  mixins: [
    RenderRoot
  ],
  data () {
    return {
      screen: false,
      overlay: '',
      isComponentActive: true,
      ammo: false,
      camera: false,
      scene: false,
      core: false,
      mouseMode: '',
      offset: {
        x: 0,
        y: 0
      },
      cursor: {
        type: 'img',
        position: new Vector3(),
        img: '',
        enable: false
      }
      // iframe: 'about:blank'
    }
  },
  watch: {
    mouseMode () {
      let restore = () => {
        this.mouseMode === ''
        this.cursor.enableArrow = false
        this.cursor.enableImg = false
        this.$forceUpdate()
      }
      if (this.mouseMode === '') {
        let idx = this.$root.escs.findIndex(e => e === restore)
        if (idx !== -1) {
          this.$root.escs.splice(idx, 1)
        }
        this.cursor.enableArrow = false
        this.cursor.enableImg = false
        this.$forceUpdate()
      } else if (this.mouseMode === 'connect') {
        this.cursor.type = 'img'
        this.cursor.img = `${require('./img/network.png')}`
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      } else if (this.mouseMode === 'create') {
        this.cursor.img = `${require('./img/add.png')}`
        this.cursor.type = 'block'
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      }
    }
  },
  created () {
  },
  methods: {
    onChooseGenesis (chosen) {
      this.core.onSetCurrentGenesisType({ type: chosen })
      this.overlay = false
      this.mouseMode = 'create'
    },
    onClickFloor (ev) {
      if (this.mouseMode === 'create') {
        let work = this.core.createWorkAtPos({
          position: {
            x: ev.event.point.x,
            y: 0,
            z: ev.event.point.z
          }
        })
        this.core.onAddArrow({ workTo: work })
        this.mouseMode = ''
      } else if (this.mouseMode === 'connect') {
        // console.log('click-floor', ev)
        this.mouseMode = ''
      }
    },
    onMove({ point }) {
      this.cursor.position.x = point.x
      this.cursor.position.y = point.y
      this.cursor.position.z = point.z
    },
    onClickTL ({ work }) {

    },
    onClickBR ({ work }) {
      this.core.onSetCurrentWorkFrom({ work })
      this.mouseMode = 'connect'
    },
    onClickBR3 ({ work }) {
      this.core.removeLinksOfWork({ work })
    },
    onClickBR2 ({ work }) {
      this.core.onSetCurrentWorkFrom({ work })
      this.overlay = 'genesis'
    },
    onClickToucher () {

    },
    onClickWrapper () {

    },
    onClickBL ($event) {
      this.onEditWork($event)
    },
    onClickPreview ($event) {
      if (this.mouseMode === 'connect') {
        this.core.onAddArrow({ workTo: $event.work })
        this.mouseMode = ''
        return
      }
    },
    onEditWork ({ work }) {
      this.core.provideWorkWin({ work })
    },
    onRemoveWork ({ work }) {
      this.core.removeWork({ work })
    },
    async setupAmmo () {
      let ammo = new AmmoPhysics({
        onLoop: this.onLoop,
        onClean: this.onClean
      })
      await ammo.waitForSetup()
      this.ammo = ammo
    },
    setupGraphics () {
      this.camera = new PCamera({
        element: this.element,
        onResize: this.onResize
      })

      // this.mouseWorldPos = new RayPlay({
      //   toucher: this.$refs.toucher,
      //   wrapper: this.$refs.wrapper,
      //   // rendererDOM: this.ctx.renderer.domElement,
      //   onResize: this.onResize,
      //   onLoop: this.onLoop,
      //   camera: this.camera,
      //   onClean: this.onClean
      // })

      this.scene = new Scene()
      this.scene.add(this.o3d)

      this.rayplay = new RayPlay({
        toucher: this.$refs.toucher,
        wrapper: this.$refs.wrapper,
        // rendererDOM: this.ctx.renderer.domElement,
        onResize: this.onResize,
        onLoop: this.onLoop,
        camera: this.camera,
        onClean: this.onClean
      })

      this.camera.position.y = 100
      this.camera.position.z = 0
      this.camera.lookAt(this.scene.position)

      // this.setupDrag({ dom: this.renderer.domElement })
      this.screen = getScreen({ camera: this.camera, depth: 0 })
      this.onResize(() => {
        this.screen = getScreen({ camera: this.camera, depth: 0 })
      })
      // this.onLoop(() => {
      //   this.camera.position.x = -this.offset.x / this.screen.width
      //   this.camera.position.z = -this.offset.y / this.screen.height
      // })

      this.panner = new Dragger({
        o3d: this.o3d,
        toucher: this.$refs.toucher,
        wrapper: this.$refs.wrapper,
        // rendererDOM: this.ctx.renderer.domElement,
        onResize: this.onResize,
        onLoop: this.onLoop,
        camera: this.camera,
        onClean: this.onClean
      })
    },
    onPan (delta) {
      this.camera.position.x -= delta.x
      this.camera.position.y -= delta.y
      this.camera.position.z -= delta.z
    },
    setup () {
      // this.$store.subscribe((v) => {
      //   this.works = v
      // }, state => state.works)

      // this.$store.subscribe((v) => {
      //   this.wins = v
      // }, state => state.wins)

      // this.core = this.$store.getState()
      // this.core.addDemoOps()

      // this.wins = this.core.wins
      // this.ops = this.core.ops
    },
    // setupDrag ({ dom }) {
    //   dom.addEventListener('wheel', (evt) => {
    //     if (this.overlay) {
    //       return
    //     }
    //     evt.preventDefault()
    //     evt.stopImmediatePropagation()
    //     this.offset.x += -evt.deltaX
    //     this.offset.y += -evt.deltaY

    //     // this.$forceUpdate()
    //     // this.$nextTick(() => {
    //     //   this.$root.$forceUpdate()
    //     //   window.dispatchEvent(new Event('plot'))
    //     // })
    //   }, { passive: false })

    //   UI.makeDrag({
    //     dom,
    //     onMM: ({ api }) => {
    //       this.offset.x += api.dX
    //       this.offset.y += api.dY

    //       // this.$forceUpdate()
    //       // this.$nextTick(() => {
    //       //   this.$root.$forceUpdate()
    //       //   window.dispatchEvent(new Event('plot'))
    //       // })
    //     }
    //   })
    // },
    setupDOM () {
      this.$el.addEventListener('wheel', (evt) => {
        evt.preventDefault()
        evt.stopImmediatePropagation()
      })
    }
  },
  async mounted () {
    await this.setupAmmo()
    this.setup()
    this.setupGraphics()
    this.setupDOM()
    this.core = new AppCore()
    this.core.addDemoOps()
    Vue.prototype.$core = this.core

    this.$root.escs = this.$root.escs || []

    window.addEventListener('keydown', (ev) => {
      if (!this.isComponentActive) {
        return
      }
      if (ev.keyCode === 27) {
        let item = this.$root.escs.pop()
        if (item) {
          item()
        }
      }
    })
  },
  beforeDestroy () {
    this.isComponentActive = false
    if (process.env.NODE_ENV === 'development') {
      window.location.reload()
    }
  }
}
</script>

<style>
.box{
  width: 100%;
  height: 100%;
}
.persp{
  perspective: 100vmax;
}
.cam-gp{
  transform-style: preserve-3d;
}

.win-area{
  position: absolute;
  top: 0%;
  left: 0px;

  /* transform: rotateY(16deg); */
}


.age-drag-area{
  cursor: grab;
}

.age-layers{
  position: relative;
  width: 100%;
  height: 100%;
}

.age-layer{
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

.age-editor{
  overflow: hidden;
  background-color: #F5F5F5;
}


</style>
