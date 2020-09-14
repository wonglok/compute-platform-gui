<template>
  <div class="full overflow-y-auto pb-24">
    <div class="mb-12"></div>
    <div class=" text-center text-4xl mb-6">
      請選擇特效
    </div>
    <div class=" text-center text-lg mb-12">
      Please Choose Effect
    </div>
    <div class="max-w-4xl mx-auto">

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">立方體 平面 矩陣 <br/> Cubic Face Cluster</div>
        <div>
          <img src="./icon/box-sphere.svg" class="  cursor-pointer" @click="$emit('choose', 'sphere-buffer-geometry')" alt="">
        </div>
      </div> -->
      <div @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes">
        <div>{{ wbType.type }}</div>
      </div>

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">球體形狀 <br/> Sphere Shape</div>
        <div>
          <img src="./icon/box-sphere.svg" class="cursor-pointer" @click="$emit('choose', 'sphere-buffer-geometry')" alt="">
        </div>
      </div> -->

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
import { WorkBoxTypes } from '../../Packages/FSCompiler/Core'
// import { getLang } from '../../Packages/Languages/index.js'
export default {
  data () {
    return {
      wbTypes: WorkBoxTypes.slice()
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