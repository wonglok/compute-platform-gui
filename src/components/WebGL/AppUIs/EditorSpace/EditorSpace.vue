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
      <DirectionalLight :color="0xffffff" :floorColor="0xffffff" :helper="isDev && isOff" :intensity="0.8"></DirectionalLight>
    </O3D>

    <O3D :px="0" :py="100" :pz="0">
      <AmbinetLight :color="0xffffff" :helper="isDev && isOff" :intensity="0.4"></AmbinetLight>
    </O3D>

    <div v-if="core">
      <O3D :py="-10">
        <WorkFloor :mouseMode="mouseMode" d--move-point="onMove($event)" @click-floor="onClickFloor" @delta="onPan($event)"></WorkFloor>
      </O3D>

      <!-- Boxes -->
      <div v-for="work in core.works" :key="work._id">
        <WorkBox :key="work._id" :work="work" @tl="onClickTL($event)" @br="onClickBR($event)" @br3="onClickBR3($event)" @br2="onClickBR2($event)" @bl="onClickBL($event)" @preview="onClickPreview($event)" @tr="onRemoveWork($event)">
          <WBTextureProvider :canRun="!core.getCurrentWork()" :size="200" :media="media" :key="work._id" :work="work" v-if="work"></WBTextureProvider>

          <!-- <WBImageTextureProvider v-if="core.drawTypes.includes(work.type)" :key="work._id" :work="work"></WBImageTextureProvider> -->
          <!-- <GLFlower></GLFlower> -->
          <!-- <WBTextureDrawTypeProvider></WBTextureDrawTypeProvider> -->
        </WorkBox>
      </div>

      <!-- connections -->
      <WBArrow v-for="arrow in core.arrows" :key="arrow._id" :arrow="arrow" :arrowID="arrow._id" :core="core">
      </WBArrow>

      <!-- main -->
      <keep-alive>
        <O3D :py="-5" v-if="showPreview === 'fullscreen'" :visible="showPreview === 'fullscreen'" :rx="pi * -0.5">
          <PreviewPlaneFullScreen>
            <PreviewTextureProvider :media="media" :size="512"></PreviewTextureProvider>
          </PreviewPlaneFullScreen>
        </O3D>
      </keep-alive>

      <!-- top left 1 -->
      <keep-alive>
        <O3D v-if="showPreview === 'topleft'" :visible="showPreview === 'topleft'" :rx="pi * -0.5">
          <PreviewPlaneTopLeft>
            <PreviewTextureProvider :media="media" :size="512"></PreviewTextureProvider>
          </PreviewPlaneTopLeft>
        </O3D>
      </keep-alive>

      <!-- top left 2 -->
      <keep-alive>
        <O3D v-if="core.getCurrentWork()" :visible="core.getCurrentWork()" :rx="pi * -0.5">
          <PreviewPlaneTopLeft :offset="{ x: 0, y: -256, z: 0 }" >
            <WBTextureProvider :size="512" :media="media" :key="core.getCurrentWork()._id" :work="core.getCurrentWork()" v-if="core.getCurrentWork()"></WBTextureProvider>
          </PreviewPlaneTopLeft>
        </O3D>
      </keep-alive>

      <CurosrImg v-if="!isTouch && cursor.enableImg" :cursor="cursor"></CurosrImg>
      <CursorArrow v-if="!isTouch && cursor.enableArrow" :from="core.getCurrentWorkFrom()" :cursor="cursor"></CursorArrow>
    </div>

    <div @click="onClickWrapper" class="absolute top-0 left-0 full" ref="wrapper">
      <div @click="onClickToucher" class="absolute top-0 left-0 full" ref="toucher"></div>
    </div>

    <div class="absolute top-0 right-0 flex">
      <div class="p-3" v-if="core" v-show="core.works.some(e => e.needsMic)">
        <img src="./icon/mic-off.svg" v-if="!media.micNow" @click="onClickMic" class="w-10 h-10" alt="">
        <img src="./icon/mic-on.svg" v-if="media.micNow" @click="onClickMic" class="w-10 h-10" alt="">
      </div>

      <div class="p-3" v-if="!isMobileVertical">
        <img src="./icon/fullscreen.svg" @click="onClickFullScreen" class="w-10 h-10" alt="">
      </div>

      <div class="p-3">
        <img src="./icon/add.svg" @click="onClickAdd" class="w-10 h-10" alt="">
      </div>
    </div>

    <div v-if="core">
      <EditBox v-for="win in core.wins" :key="win._id + '-wins'" :wins="core.wins" v-show="win.show" :win="win" :offset="offset" class="win-area">
        <EditorUnit :key="win._id" :win="win" :wins="core.wins" v-if="win.appName === 'editor'"></EditorUnit>
        <EditWorkBox :key="win._id + '---'" :win="win" :work="core.getWorkByWin({ win })" :core="core" :wins="core.wins"></EditWorkBox>

        <!-- <PropsEditorUnit :key="win._id" :win="win" :wins="core.wins" v-if="win.appName === 'props-editor'"></PropsEditorUnit> -->
        <!-- <EditorUnit :initTree="core.engineCodeTree" :key="win._id" v-if="win.appName === 'edit-pipeline'"></EditorUnit> -->
        <!-- <EditorFacePipeline :key="win._id" :win="win" :wins="core.wins" v-if="win.appName === 'face-pipeline'"></EditorFacePipeline> -->
      </EditBox>
    </div>

    <!-- <div class="absolute top-0 left-0 full bg-white" v-if="overlayGUI">
      <component @choose="onChooseOverlay" @overlay="overlayGUI = $event" @mouse-mode="mouseMode = $event" :is="overlayGUI"></component>
    </div> -->

    <!-- <div v-if="core && !isMobileVertical" class="pointer-events-none cursor-pointer absolute top-0 left-0 p-3">
      <div :style="{ width: `${pSize + 2}px`, height: `${pSize + 2}px` }"  :class="{ 'rounded-lg border border-gray-500 mb-3': showPreview === 'topleft' || showPreview === 'topleft-large' }">
        <GLArtCanvas :suspendRender="false" :rounded="'9px 9px 9px 9px'">
          <PreviewPlane v-if="showPreview === 'topleft' || showPreview === 'topleft-large'">
            <PreviewTextureProvider :media="media" :size="512"></PreviewTextureProvider>
          </PreviewPlane>
        </GLArtCanvas>
      </div>

      <div :style="{ width: `${pSize}px`, height: `${pSize}px` }" :class="{ 'rounded-lg border border-gray-500': core.getCurrentWork() }">
        <GLArtCanvas :suspendRender="!core.getCurrentWork()" :style="{ visibility: core.getCurrentWork() ? 'visible' : 'hidden' }" :rounded="'9px 9px 9px 9px'">
          <PreviewPlane v-if="core.getCurrentWork()">
            <WBTextureProvider :media="media" :size="pSize" :key="core.getCurrentWork()._id" v-if="core.getCurrentWork()" :work="core.getCurrentWork()"></WBTextureProvider>
          </PreviewPlane>
        </GLArtCanvas>
      </div>
    </div> -->

    <div class="absolute top-0 left-0 full bg-white" v-if="overlay === 'box-out' || overlay === 'box-in'">
    <!-- <div class="absolute top-0 left-0 full bg-white" v-if="overlay === 'box-in'"> -->
      <OVBoxInMaker @choose="onChooseInfluence" @mouse-mode="mouseMode = $event" @overlay="overlay = $event"></OVBoxInMaker>
    </div>

    <div class="absolute top-0 left-0 full bg-white" v-if="overlay === 'genesis'">
      <OVGenesis @choose="onChooseGenesis" @overlay="overlay = $event"></OVGenesis>
    </div>

    <!-- <component v-show="false" v-if="dynamo" ref="dynamo" :is="dynamo"></component> -->
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
import { setupTimed, setupNow } from './Mic.js'

export default {
  mixins: [
    RenderRoot
  ],
  data () {
    return {
      media: {
        micNow: false,
        micPast: false
      },
      showPreview: window.innerWidth > 767 ? 'topleft' : 'fullscreen',
      isMobileVertical: window.innerWidth <= 500 && window.innerHeight > window.innerWidth,
      pSize: 270,
      overlayGUI: false,
      dynamo: false,
      shell: false,
      rayplay: false,
      isTouch: 'ontouchstart' in window,
      screen: false,
      overlay: 'genesis',
      isComponentActive: true,
      ammo: false,
      camera: false,
      scene: false,
      core: false,
      showBGLayer: true,
      mouseMode: '',
      offset: {
        x: 0,
        y: 0
      },
      cursor: {
        type: 'img',
        position: new Vector3(),
        img: '',
        direction: 'in',
        enable: false
      }
      // iframe: 'about:blank'
    }
  },
  watch: {
    'core.works' () {
      if (this.core.works.length === 0) {
        this.overlay = 'genesis'
      }
    },
    mouseMode () {
      let restore = () => {
        this.mouseMode === ''
        this.cursor.enableArrow = false
        this.cursor.enableImg = false
        this.$forceUpdate()
      }
      /*
      else if (this.mouseMode === 'connect') {
        this.cursor.type = 'img'
        this.cursor.img = `${require('./img/network.png')}`
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      } else if (this.mouseMode === 'influence') {
        this.cursor.img = `${require('./img/add.png')}`
        this.cursor.type = 'block'
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      }
      */

      if (this.mouseMode === '') {
        let idx = this.$root.escs.findIndex(e => e === restore)
        if (idx !== -1) {
          this.$root.escs.splice(idx, 1)
        }
        this.cursor.enableArrow = false
        this.cursor.enableImg = false
        this.$forceUpdate()
      } else if (this.mouseMode === 'box-out') {
        this.cursor.img = `${require('./icon/box-target.svg')}`
        this.cursor.type = 'block'
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.cursor.direction = 'out'
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      } else if (this.mouseMode === 'box-in') {
        this.cursor.img = `${require('./icon/energy.svg')}`
        this.cursor.type = 'block'
        this.cursor.direction = 'in'
        this.cursor.enableImg = true
        this.cursor.enableArrow = true
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      } else if (this.mouseMode === 'genesis') {
        this.cursor.img = `${require('./img/add.png')}`
        this.cursor.type = 'block'
        this.cursor.direction = 'inout'
        this.cursor.enableImg = true
        this.cursor.enableArrow = false
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(restore)
        this.$forceUpdate()
      }
    }
  },
  created () {
    window.addEventListener('plot-curve', () => {
      needsForceUpate = true
    })
    let needsForceUpate = true
    this.onLoop(() => {
      if (needsForceUpate) {
        this.$forceUpdate()
      }
    })
    this.$watch('currentWorkInWin', () => {
      if (!this.isMobileVertical) {
        if (this.currentWorkInWin) {
          this.__showPreview = this.showPreview
          this.__pSize = this.pSize

          this.showPreview = 'topleft'
          this.pSize = 270
        } else {
          this.showPreview = this.__showPreview
          this.pSize = this.__pSize
        }
        window.dispatchEvent(new Event('resize'))
      }
    })
  },
  computed: {
    currentWorkInWin () {
      if (this.core) {
        return this.core.getCurrentWork()
      } else {
        return false
      }
    }
  },
  methods: {
    onClickMic () {
      let timed = setupTimed()
      let now = setupNow()
      this.media.micPast = timed
      this.media.micNow = now
      this.onLoop(() => {
        timed.update()
        now.update()
      })
    },
    onClickFullScreen () {
      let list = [
        'fullscreen',
        'topleft'
      ]
      this.previewIdx = this.previewIdx || 0
      this.showPreview = list[this.previewIdx % list.length]
      this.previewIdx++
      // if (this.showPreview === 'topleft-large') {
      //   this.pSize = 512
      // } else {
      //   this.pSize = 270
      // }

      window.dispatchEvent(new Event('resize'))
    },
    // togglePSize () {
    //   if (this.pSize !== 512) {
    //     this.pSize = 512
    //   } else if (this.pSize === 512) {
    //     this.pSize = 270
    //   }
    //   window.dispatchEvent(new Event('resize'))
    // },
    onChooseOverlay (ev) {
      console.log(ev)
    },
    onClickAdd () {
      this.overlay = 'genesis'
    },
    onClickGear () {
      // this.core.openPipelineSystem()
    },
    onChooseInfluence (chosen) {
      this.core.onSetCurrentWorkType({ type: chosen })

      let work = this.core.createWorkAtPos({
        type: this.core.current.workType,
        position: {
          x: this.cursor.position.x,
          y: 0,
          z: this.cursor.position.z
        },
        direction: this.cursor.direction
      })

      setTimeout(() => {
        if (this.mouseMode === 'box-in') {
          this.core.onAddArrow({ direction: 'in', workTo: work })
        } else if (this.mouseMode === 'box-out') {
          this.core.onAddArrow({ direction: 'out', workTo: work })
        }
        this.mouseMode = ''
      }, 10)

      // this.mouseMode = this.overlay
      this.overlay = false
    },
    onChooseGenesis (chosen) {
      this.core.onSetCurrentWorkType({ type: chosen })
      // this.mouseMode = 'genesis'

      let work = this.core.createWorkAtPos({
        type: this.core.current.workType,
        position: {
          x: this.camera.position.x + (Math.random() - 0.5) * 20,
          y: 10,
          z: this.camera.position.z
        }
      })

      this.overlay = false
    },
    onClickFloor (ev) {
      // if (this.mouseMode === 'influence') {
      //   let work = this.core.createWorkAtPos({
      //     direction: 'out',
      //     position: {
      //       x: ev.event.point.x,
      //       y: 0,
      //       z: ev.event.point.z
      //     }
      //   })

      //   this.core.onAddArrow({ direction: 'out', workTo: work })
      //   this.mouseMode = ''
      // } else

      /*
      else if (this.mouseMode === 'connect') {
        // console.log('click-floor', ev)
        this.mouseMode = ''
      }
      */

      if (this.mouseMode === 'box-in') {
        this.overlay = 'box-in'
        // let work = this.core.createWorkAtPos({
        //   position: {
        //     x: ev.event.point.x,
        //     y: 0,
        //     z: ev.event.point.z
        //   }
        // })

        // setTimeout(() => {
        //   this.core.onAddArrow({ direction: 'in', workTo: work })
        //   this.mouseMode = ''
        // }, 10)
      } else if (this.mouseMode === 'box-out') {
        this.overlay = 'box-out'

        // let work = this.core.createWorkAtPos({
        //   position: {
        //     x: ev.event.point.x,
        //     y: 0,
        //     z: ev.event.point.z
        //   }
        // })

        // setTimeout(() => {
        //   this.core.onAddArrow({ direction: 'out', workTo: work })
        //   this.mouseMode = ''
        // }, 10)
      } else if (this.mouseMode === 'genesis') {
        let work = this.core.createWorkAtPos({
          position: {
            x: ev.event.point.x,
            y: 0,
            z: ev.event.point.z
          },
          type: 'preview',
          direction: this.cursor.direction

          // position: {
          //   x: this.cursor.position.x,
          //   y: 0,
          //   z: this.cursor.position.z
          // }
        })
        this.mouseMode = ''

        // this.overlay = 'genesis'
        // console.log('genesis')
      } else if (this.core.works.length === 0) {
        this.overlay = 'genesis'
      }
    },
    onMove({ point }) {
      // this.cursor.position.x = point.x
      // this.cursor.position.y = point.y
      // this.cursor.position.z = point.z
    },
    onClickTL ({ work }) {

    },
    onClickBR ({ work }) {
      this.core.onSetCurrentWorkFrom({ work })
      if (work.buttons.br) {
        this.mouseMode = work.buttons.br.mouseMode
        if (work.buttons.br.gui) {
          this.overlayGUI = work.buttons.br.gui
        }
      } else {
        this.mouseMode = ''
      }
      // this.overlay = 'box-out'
    },
    onClickBR3 ({ work }) {
      // this.core.removeLinksOfWork({ work })
    },
    onClickBR2 ({ work }) {
      this.core.onSetCurrentWorkFrom({ work })
      if (work.buttons.br2) {
        this.mouseMode = work.buttons.br2.mouseMode
      } else {
        this.mouseMode = ''
      }

      // this.core.onSetCurrentWorkFrom({ work })
      // this.mouseMode = 'box-in'

      // this.overlay = 'box-in'
    },
    onClickToucher () {

    },
    onClickWrapper () {

    },
    onClickBL ($event) {
      this.onEditWork($event)
    },
    onClickPreview ($event) {
      if (this.mouseMode === 'box-out') {
        // this.overlay = 'box-out'

        this.core.onAddArrow({ direction: 'out', workTo: $event.work })
        this.mouseMode = ''
        this.core.refresh()
      } else if (this.mouseMode === 'box-in') {
        // this.overlay = 'box-in'

        this.core.onAddArrow({ direction: 'in', workTo: $event.work })
        this.mouseMode = ''
        this.core.refresh()
      } else {
        this.core.provideWindowWithAppName({ work: $event.work })
      }
    },
    onEditWork ({ work }) {
      this.core.provideWorkWin({ work })
    },
    onRemoveWork ({ work }) {
      this.core.moveWorkToTrash({ work })
    },
    async setupAmmo () {
      // let ammo = new AmmoPhysics({
      //   onLoop: this.onLoop,
      //   onClean: this.onClean
      // })
      // await ammo.waitForSetup()
      // this.ammo = ammo
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

      // this.rayplay.setLayer(2)

      this.camera.position.y = 125
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
      this.panner.setLayer(1)
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
      this.$refs.wrapper.addEventListener('wheel', (evt) => {
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

    this.core = new AppCore({ onLoop: this.onLoop, $root: this.$root })
    Vue.prototype.$core = this.core

    // run demo
    // this.core.addDemoOps()

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

    window.addEventListener('resize', () => {
      this.isMobileVertical = window.innerWidth <= 500 && window.innerHeight > window.innerWidth
    }, false)
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
