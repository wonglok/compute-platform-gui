<template>
  <div>
    <div v-if="!api" class="p-2 border border-black inline-block rounded-full" @click="setup">Setup Mic</div>
  </div>
</template>

<script>
import * as Mic from './Mic.js'
export default {
  props: {
    uniform: {}
  },
  data () {
    return {
      api: false,
    }
  },
  methods: {
    setup () {
      this.api = Mic.setup()
      let loop = () => {
        window.requestAnimationFrame(loop)
        if (this.api) {
          let { texture } = this.api.update()
          // console.log(this.uniform)
          this.uniform.value = texture
        }
      }
      loop()
    },
  },
  beforeDestroy () {
    // this.api = false
  }
}
</script>

<style>

</style>