<template>
  <div class="">
    <div class="mb-12"></div>
    <div class=" text-center text-4xl mb-6">
      您想畫設麽？
    </div>
    <div class=" text-center text-lg mb-12">
      What do you want to draw?
    </div>
    <div class="flex justify-around max-w-4xl mx-auto">
      <!--
      <div class=" w-1/4  flex flex-col justify-center items-center">
        <div class="text-center mb-12">點陣 Dots</div>
        <div>
          <img src="./img/dots.svg" class="  cursor-pointer" @click="$emit('choose', 'points')" alt="">
        </div>
      </div>

      <div class=" w-1/4  flex flex-col justify-center items-center">
        <div class="text-center mb-12">線 Line</div>
        <div>
          <img src="./img/lines.svg" class="  cursor-pointer" @click="$emit('choose', 'linesegments')" alt="">
        </div>
      </div> -->

      <div class=" w-1/4  flex flex-col justify-center items-center">
        <div class="text-center mb-12">網面 Mesh</div>
        <div>
          <img src="./img/faces.svg" class="  cursor-pointer" @click="$emit('choose', 'mesh')" alt="">
        </div>
      </div>

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">立方體 平面 矩陣 <br/> Cubic Face Cluster</div>
        <div>
          <img src="./img/cube-cluster.svg" class="  cursor-pointer" @click="$emit('choose', 'cube-face-cluster')" alt="">
        </div>
      </div> -->

    </div>
  </div>
</template>

<script>
// import { getLang } from '../../Packages/Languages/index.js'
export default {
  data () {
    return {
      // tt: getLang('genesis')
    }
  },
  mounted () {
    this.$root.escs = this.$root.escs || []
    this.cancel = () => {
      this.$emit('overlay', false)
      this.$emit('mouse-mode', '')
    }
    this.$root.escs.push(this.cancel)
  },
  beforeDestroy () {
    let idx = this.$root.escs.indexOf(this.cancel)
    if (idx !== -1) {
      this.$root.escs.splice(idx, 1)
    }
  }
}
</script>

<style>
</style>