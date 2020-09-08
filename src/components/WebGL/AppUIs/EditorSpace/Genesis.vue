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
      <div class="">
        <div class="text-center mb-12">點 Dot</div>
        <div>
          <img src="./img/dots.svg" alt="">
        </div>
      </div>
      <div>
        <div class="text-center mb-12">線 Line</div>
        <div>
          <img src="./img/lines.svg" alt="">
        </div>
      </div>
      <div>
        <div class="text-center mb-12">面 Faces</div>
        <div>
          <img src="./img/faces.svg" alt="">
        </div>
      </div>
    </div>

    <div class="absolsute top-0 right-0">
      <div class="p-5">

      </div>
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
  }
}
</script>

<style>

</style>