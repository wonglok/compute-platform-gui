<template>
  <div class="win-box full">
    <div class="win-title select-none" :style="getTitleStyle()" ref="win-title">
      <div class="flex justify-between items-center">
        <div>
          {{ win.title || 'New Box' }}
        </div>
        <div class="center" v-if="win.appName !== 'project'">
          <img class="age-gear click" src="./icon/gear.svg" @click="$emit('gear', { win, wins })" alt="">
        </div>
      </div>
    </div>
    <div class="bg-white win-content" ref="contentarea">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import * as UI from './ageUI.js'
export default {
  props: {
    wins: {},
    win: {}
  },
  created () {
    this.$on('delta-height', (deltaHeight) => {
      this.win.pos.h += deltaHeight
    })
    this.$on('gear', ({ win, wins }) => {
      this.$store.getState().minWin(win)
    })
  },
  methods: {
    getTitleStyle () {
      let types = UI.boxColorTypes
      // console.log(types[this.win.type])
      return {
        color: 'white',
        textShadow: 'rgb(37, 37, 37) 0px 0px 3px',
        backgroundImage: types[this.win.type] || ''
      }
    },
    setupSubCompo ({ subCompo }) {
      let makeDrag = UI.makeDrag
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
    this.setupSubCompo({ subCompo: this })
  }
}
</script>

<style>
.win-box{
  border-radius: 8px 8px 0px 0px;
  position: relative;
  border: hsla(0, 0%, 90%, 1) solid 1px;
  /* border-bottom: none; */
  background-color: transparent;
}


.win-title{
  border-radius: 8px 8px 0px 0px;
  overflow: hidden;
  cursor: grab;
  padding-left: 6px;
  padding-right: 6px;
  width: calc(100%);
  font-size: 14px;
  line-height: 26px;
  height: 26px;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px 3px;
  background-color: rgb(170, 170, 170);
}

.win-content{
  height: calc(100% - 26px);
  background: rgb(255, 255, 255);
}
</style>