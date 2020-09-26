<template>
  <div class="full overflow-y-auto pb-24">
    <div class="mb-12"></div>
    <div class=" text-center text-4xl mb-6">
      請選擇特效
    </div>
    <div class=" text-center text-lg mb-12">
      Please Choose Effect
    </div>
    <div class="max-w-4xl mx-auto px-4" v-if="work">

      <!-- <div class="w-1/4 flex flex-col justify-center items-center">
        <div class="text-center mb-12">立方體 平面 矩陣 <br/> Cubic Face Cluster</div>
        <div>
          <img src="./icon/box-sphere.svg" class="  cursor-pointer" @click="$emit('choose', 'sphere-buffer-geometry')" alt="">
        </div>
      </div> -->

      <div v-if="canChoose.includes('material')">
        <div class="font-sans text-xl mb-3">
          Materials 視覺效果
        </div>
        <div @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('material'))">
          <div>{{ wbType.displayName }}</div>
        </div>
      </div>

      <div v-if="canChoose.includes('texture-media')">
        <div class="font-sans text-xl mb-3">
          Meida Texture 媒體紋理
        </div>
        <div @click="$emit('choose', wbType.type); onClickMic()" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('texture-media'))">
          <div>{{ wbType.displayName }}</div>
        </div>
      </div>

      <!-- <div v-if="canChoose.includes('texture-fragment')">
        <div class="font-sans text-xl mb-3">
          Color Texture 顏色 紋理
        </div>
        <div @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('texture-fragment'))">
          <div>{{ wbType.displayName }}</div>
        </div>
      </div> -->

      <div v-if="canChoose.includes('geometry')">
        <div class="font-sans text-xl mb-3">
          Geometry 幾何形狀
        </div>
        <div @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('geometry'))">
          <div>{{ wbType.displayName }}</div>
        </div>
      </div>

      <div v-if="canChoose.includes('draw-type')">
        <div class="font-sans text-xl  mb-3">
          Draw Type 畫圖
        </div>
        <div @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('draw-type'))">
          <div>{{ wbType.displayName }}</div>
        </div>
      </div>

      <!--
      <div v-show="canChoose.includes('material')" @click="$emit('choose', wbType.type)" class=" inline-block m-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" :key="wbType._id" v-for="wbType in wbTypes.filter(getType('material'))">
        <div>{{ wbType.displayName }}</div>
      </div> -->

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
import { O3DVue } from '../../Core/O3DVue.js'
import { WorkBoxTypes } from '../../Packages/FSCompiler/Core'
// import { getLang } from '../../Packages/Languages/index.js'
export default {
  mixins: [
    O3DVue
  ],
  props: {
  },
  data () {
    return {
      canChoose: [],
      filterKey: '',
      work: false,
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

    this.work = this.ctx.core.getCurrentWorkFrom()

    if (this.ctx.mouseMode === 'box-in') {
      this.filterKey = 'boxIn'
    } else if (this.ctx.mouseMode === 'box-out') {
      this.filterKey = 'boxOut'
    }

    this.canChoose = this.work.compatability[this.filterKey] || []
  },
  methods: {
    onClickMic () {
      this.$parent.onClickMic()
    },
    getType (v) {
      return (item) => {
        item.tags = item.tags || []
        return item.tags.includes(v)
      }
    }
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