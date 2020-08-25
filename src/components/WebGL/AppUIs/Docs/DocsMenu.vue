<template>
  <div class="full relative">
    <GradientBG :pz="-20" v-if="camera"></GradientBG>
    <div class="absolute top-0 left-0 w-full">
      <div class="w-full flex items-center justify-between" style="height: 56px;">
        <div class="text-xl mx-4">
          O3D-GEN3
        </div>
        <div class="text-xl mx-4">
          <img src="./img/close.svg" @click="$emit('menu-toggle')" alt="">
        </div>
      </div>
      <div class="w-full">
        <DocsMenuList @menu-toggle="$emit('menu-toggle')" :neu="false"></DocsMenuList>
      </div>
    </div>
  </div>
</template>

<script>
import { RenderRoot } from '../../Core/RenderRoot'
import { PCamera } from '../../Core/PCamera'
import { Scene, Color } from 'three'

export default {
  mixins: [
    RenderRoot
  ],
  data () {
    return {
      scene: false,
      camera: false
    }
  },
  mounted () {
    this.scene = new Scene()
    this.camera = new PCamera({ element: this.ctx.element, onResize: this.onResize })
    this.camera.position.z = 100

    this.scene.background = new Color('#ffffff')
    this.scene.add(this.o3d)
  }
}
</script>

<style>

</style>