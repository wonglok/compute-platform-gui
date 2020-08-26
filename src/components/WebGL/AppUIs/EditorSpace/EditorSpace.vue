<template>
  <div class="w-full h-full relative overflow-hidden" ref="area">
    <!-- <div class="border" style="width: 600px; height: 400px;">
      <EditorWin @url="iframe = $event"></EditorWin>
    </div>
    <iframe :src="iframe" frameborder="0"></iframe> -->

    <div class="persp full">
      <div class="cam-gp full">
        <div ref="drag-area" class="age-drag-area age-layer full"></div>
          <EditBox v-for="win in wins" :key="win._id + '-wins'" :wins="wins" v-show="win.show" :win="win" :offset="offset" class="win-area">
            <EditorUnit :win="win" :wins="wins" v-if="win.appName === 'editor'"></EditorUnit>
            <PipelineController :win="win" :wins="wins" v-if="win.appName === 'project'"></PipelineController>
          </EditBox>
      </div>
    </div>

  </div>
</template>

<script>
import * as UI from './ageUI'
import { O3DVue } from '../../Core/O3DVue'
export default {
  mixins: [
    O3DVue
  ],
  data () {
    return {
      offset: {
        x: 0,
        y: 0
      },
      projects: false,
      wins: false
      // iframe: 'about:blank'
    }
  },
  methods: {
    setup () {
      this.$store.subscribe((v) => {
        this.wins = v
      }, s => s.wins)

      let item = this.$store.getState()
      item.bootup()

      // this.setupDrag({ dom: this.$refs['drag-area'] })
    },
    setupDrag ({ dom }) {
      dom.addEventListener('wheel', (evt) => {
        if (this.overlay) {
          return
        }
        evt.preventDefault()
        this.offset.x += -evt.deltaX
        this.offset.y += -evt.deltaY
        this.$forceUpdate()
        this.$nextTick(() => {
          this.$root.$forceUpdate()
          window.dispatchEvent(new Event('plot'))
        })
      }, { passive: false })

      UI.makeDrag({
        dom,
        onMM: ({ api }) => {
          this.offset.x += api.dX
          this.offset.y += api.dY
          this.$forceUpdate()
          this.$nextTick(() => {
            this.$root.$forceUpdate()
            window.dispatchEvent(new Event('plot'))
          })
        }
      })
    }
  },
  mounted () {
    setTimeout(() => {
      this.setup()
    })
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
