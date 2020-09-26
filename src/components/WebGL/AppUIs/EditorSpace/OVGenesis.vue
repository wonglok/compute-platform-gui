<template>
  <div class="">
    <div class="mb-12"></div>
    <div class=" text-center text-4xl mb-6">
      您想畫設麽？
    </div>
    <div class=" text-center text-lg mb-12">
      Please choose your compute draw type.
    </div>
    <div class="flex justify-around flex-wrap max-w-4xl mx-auto px-4">
      <div class="mx-5 my-5">
        <div class="text-center mb-12">點陣 Points</div>
        <div class=" text-center">
          <img src="./img/dots.svg" class=" inline-block cursor-pointer" @click="$emit('choose', 'points')" alt="">
        </div>
      </div>
      <!--  -->

      <div class="mx-5 my-5">
        <div class="text-center mb-12">線段 Line Segments</div>
        <div class=" text-center">
          <img src="./img/lines.svg" class=" inline-block cursor-pointer" @click="$emit('choose', 'line-segments')" alt="">
        </div>
      </div>

      <!-- -->
      <div class="mx-5 my-5">
        <div class="text-center mb-12">網面 Mesh</div>
        <div class=" text-center">
          <img src="./img/faces.svg" class=" inline-block cursor-pointer" @click="$emit('choose', 'mesh')" alt="">
        </div>
      </div>

      <div class="mx-5 my-5">
        <div class="text-center mb-12">視覺計算 平面矩陣 <br/> Visual Compute Cluster</div>
        <div class=" text-center">
          <img src="./img/cube-cluster.svg" class=" inline-block cursor-pointer" @click="$emit('choose', 'compute-visual-cluster')" alt="">
        </div>
      </div>

    </div>
  </div>
</template>

<script>
// import { getLang } from '../../Packages/Languages/index.js'
/**
 *
 * stackable. for generating step by step GLSL
 */

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