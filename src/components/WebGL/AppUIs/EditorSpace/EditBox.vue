<!--

/**
 * Copyright 2019 WONG LOK

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
-->

<template>
  <div :style="getBoxLayoutStyle()" @click="focusApp" >
    <WinTitleBox class="relative" @gear="$emit('gear', $event)" v-if="wins && win" :wins="wins" :win="win">
      <slot :class="{ 'pointer-events-none select-none': isDown }"></slot>
      <div class="full absolute top-0 left-0" v-show="isDown"></div>
      <div v-if="useResize" class="win-resize win-box-top-left" ref="top-left"></div>
      <div v-if="useResize" class="win-resize win-box-top-right" ref="top-right"></div>
      <div v-if="useResize" class="win-resize win-box-bottom-left" ref="bottom-left"></div>
      <div v-if="useResize" class="win-resize win-box-bottom-right" ref="bottom-right"></div>
    </WinTitleBox>
    <!-- <slot :win="win" :wins="wins"></slot> -->
    <!-- <BoxDefault @gear="$emit('gear', $event)" @drop="$emit('drop', $event)" @clicker="$emit('clicker', $event)" :connections="connections" :win="win" :previewDOMs="previewDOMs" :connectorDOMs="connectorDOMs"></BoxDefault> -->
  </div>
</template>

<script>
// import * as AGE from '../api/age'
import * as AGEUI from './ageUI'

export default {
  components: {
    WinTitleBox: require('./WinTitleBox.vue').default
    // BoxDefault: require('./BoxDefault.vue').default
    // BoxDefault: require('./BoxDefault.vue').default
  },
  props: {
    enable3D: {
      default: false,
    },
    resize: {
      default: true
    },
    offset: {},
    win: {},
    wins: {},
    // type: {},
    // connections: {},
    // previewDOMs: {},
    // connectorDOMs: {}
  },
  data () {
    return {
      isDown: false,
      useResize: false,
      ready: false,
      omg: 0
    }
  },
  watch: {
    'win.resize' () {
      if (this.win.resize) {
        this.enableResize({ subCompo: this })
      }
    }
  },
  created () {
    // window.addEventListener('delta-height', ({ detail }) => {
    //   let { deltaHeight } = detail
    //   this.win.pos.h += deltaHeight
    // })
  },
  methods: {
    // eslint-disable-next-line
    enableResize ({ subCompo }) {
      this.useResize = true
      this.$nextTick(() => {
        let makeDrag = AGEUI.makeDrag

        let resize = () => {
          window.dispatchEvent(new Event('plot'))
          window.dispatchEvent(new Event('resize'))
        }

        makeDrag({
          dom: this.$refs['top-left'],
          onDown: () => {
            this.isDown = true
          },
          onUp: () => {
            this.isDown = false
          },
          onMM: ({ api }) => {
            this.win.pos.x += api.dX
            this.win.pos.y += api.dY
            this.win.pos.w -= api.dX
            this.win.pos.h -= api.dY

            if (this.win.pos.w < 76) {
              this.win.pos.w = 76
            }
            // if (this.win.pos.h < 86) {
            //   this.win.pos.h = 86
            // }
            resize()
          }
        })

        makeDrag({
          dom: this.$refs['top-right'],
          onDown: () => {
            this.isDown = true
          },
          onUp: () => {
            this.isDown = false
          },
          onMM: ({ api }) => {
            // this.win.pos.x += api.dX
            this.win.pos.y += api.dY
            this.win.pos.w += api.dX
            this.win.pos.h -= api.dY

            if (this.win.pos.w < 76) {
              this.win.pos.w = 76
            }
            // if (this.win.pos.h < 86) {
            //   this.win.pos.h = 86
            // }
            resize()
          }
        })

        makeDrag({
          dom: this.$refs['bottom-right'],
          onDown: () => {
            this.isDown = true
          },
          onUp: () => {
            this.isDown = false
          },
          onMM: ({ api }) => {
            // this.win.pos.x += api.dX
            // this.win.pos.y += api.dY
            this.win.pos.w += api.dX
            this.win.pos.h += api.dY

            if (this.win.pos.w < 76) {
              this.win.pos.w = 76
            }
            // if (this.win.pos.h < 86) {
            //   this.win.pos.h = 86
            // }
            resize()
          }
        })

        makeDrag({
          dom: this.$refs['bottom-left'],
          onDown: () => {
            this.isDown = true
          },
          onUp: () => {
            this.isDown = false
          },
          onMM: ({ api }) => {
            this.win.pos.x += api.dX
            // this.win.pos.y += api.dY
            this.win.pos.w -= api.dX
            this.win.pos.h += api.dY

            if (this.win.pos.w < 76) {
              this.win.pos.w = 76
            }
            // if (this.win.pos.h < 86) {
            //   this.win.pos.h = 86
            // }
            resize()
          }
        })
      })
    },
    // { _id: omg, val: omg, io: 'input', type: 'sampler2D', label: 'vec4' }
    focusApp () {
      AGEUI.focusApp({ wins: this.wins, win: this.win })
    },
    // getTitleStyle () {
    //   let types = AGE.boxColorTypes
    //   // console.log(types[this.win.type])
    //   return {
    //     color: 'white',
    //     textShadow: 'rgb(37, 37, 37) 0px 0px 3px',
    //     backgroundImage: types[this.win.type] || ''
    //   }
    // },
    getBoxLayoutStyle () {
      return {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: `${this.win.pos.w}px`,
        height: `${this.win.pos.h}px`,
        minHeight: `calc(26px)`,
        minWidth: `calc(100px)`,
        transform: `translate3d(${this.offset.x + this.win.pos.x}px, ${this.offset.y + this.win.pos.y}px, 1px) ${this.enable3D ? 'rotateY(15deg)' : ''}`
      }
    },
    setupSubCompo ({ subCompo }) {
      let makeDrag = AGEUI.makeDrag
      makeDrag({
        dom: subCompo.$refs['win-title'],
        onMM: ({ api }) => {
          this.win.pos.x += api.dX
          this.win.pos.y += api.dY

          window.dispatchEvent(new Event('plot'))
        }
      })
    }
  },
  mounted () {
    this.ready = true
    if (this.win.resize) {
      this.enableResize({ subCompo: this })
    }
  }
}
</script>

<style>

.win-box{
  border-radius: 8px 8px 0px 0px;
  /* position: relative; */
  border: hsla(0, 0%, 90%, 1) solid 1px;
  /* border-bottom: none; */
  background-color: transparent;
}

.win-resize{
  z-index: 100;
  opacity: 0.0;
  border-radius: 20px;
  width: 20px;
  height: 20px;
  background-color: rgba(43, 43, 43, 0.74);
  transition: opacity 0.3s;
  border: white solid 1px;
}
.win-resize:hover{
  cursor: grab;
  opacity: 1;
}
.win-box-top-left{
  position: absolute;
  top: -6px;
  left: -6px;
}
.win-box-top-right{
  position: absolute;
  top: -6px;
  right: -6px;
}
.win-box-bottom-left{
  position: absolute;
  bottom: -6px;
  left: -6px;
}
.win-box-bottom-right{
  position: absolute;
  bottom: -6px;
  right: -6px;

  opacity: 0.05;
}

.age-gear{
  border-radius: 20px;
  height: 20px;
  cursor: pointer;
}

</style>
