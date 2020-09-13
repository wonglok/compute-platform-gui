<template>
  <div class="">
    <div class="mb-12"></div>
    <div class=" text-center text-4xl mb-6">
      請選擇動畫種類
    </div>
    <div class=" text-center text-lg mb-12">
      What do you want to animate?
    </div>
    <div class="flex justify-around max-w-4xl mx-auto">

      <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">立方體 平面 矩陣 <br/> Cubic Face Cluster</div>
        <div>
          <img src="./icon/box-sphere.svg" class="  cursor-pointer" @click="$emit('choose', 'sphere-buffer-geometry')" alt="">
        </div>
      </div>

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">立方體群 <br/> Cube Cluster</div>
        <div>
          <img src="./img/cube-cluster.svg" class="  cursor-pointer" @click="$emit('choose', 'cube-distribution')" alt="">
        </div>
      </div>

      <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">平面群 <br/> Plane Cluster</div>
        <div>
          <img src="./img/plane-cluster.svg" class="  cursor-pointer" @click="$emit('choose', 'plane-distribution')" alt="">
        </div>
      </div> -->

      <!--  -->

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">動感 <br/> Motion</div>
        <div>
          <img src="./img/motion.svg" class="  cursor-pointer" @click="$emit('choose', 'motion')" alt="">
        </div>
      </div>

      <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">顏色 <br/> Color</div>
        <div>
          <img src="./img/color.svg" class="  cursor-pointer" @click="$emit('choose', 'color')" alt="">
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