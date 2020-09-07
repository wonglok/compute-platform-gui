<template>
  <div class="win-box full">
    <div class="win-title select-none" :style="getTitleStyle()" ref="win-title">
      <div class="flex justify-between items-center">
        <div>
          {{ win.title || 'New Box' }}
        </div>
        <div class="center flex" v-if="win.appName !== 'project'">
          <!-- <img class="age-win-title-icon click" src="./icon/wins.svg" @click="$emit('min-win', { win, wins })" alt=""> -->
          <img class="age-win-title-icon click" src="./icon/close-circle.svg" @click="$emit('min-win', { win, wins })" alt="">
        </div>
      </div>
    </div>
    <div class="bg-white win-content" ref="contentarea">
      <slot v-if="showMain"></slot>
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
  data () {
    return {
      showMain: true
    }
  },
  created () {
    this.$on('delta-height', (deltaHeight) => {
      this.win.pos.h += deltaHeight
    })

    this.$on('min-win', ({ win, wins }) => {
      this.$core.removeWin({ win })
    })

    this.$watch('win.pos', () => {
      // window.dispatchEvent(new Event('resize'))
    }, { deep: true })
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
    // this.$el.addEventListener('touchmove', (ev) => {
    //   ev.stopImmediatePropagation()
    //   ev.stopPropagation()
    // })

    this.$root.escs = this.$root.escs || []
    this.$root.escs.push(() => {
      let win = this.wins.find(e => e.show)
      if (win) {
        this.$core.removeWin({ win })
      }
    })
  },
  activated () {

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
  padding-left: 8px;
  padding-right: 8px;
  width: calc(100%);
  font-size: 12px;
  line-height: 26px;
  height: 26px;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px 3px;
  background-color: rgb(170, 170, 170);
}

.win-content{
  height: calc(100% - 26px);
  background: rgb(255, 255, 255);
}

.age-win-title-icon{
  height: 18px;
  margin-left: 4px;
}
</style>