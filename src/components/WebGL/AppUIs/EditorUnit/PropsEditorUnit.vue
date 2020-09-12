<template>
  <div>
    <div class="text-sm">Props Edit Unit</div>
    <input v-if="work" type="range" min="-100" max="100" step="0.0001" class=" border-b border-black text-sm" v-model="work.data.fun">
  </div>
</template>

<script>
import { O3DNode } from '../../Core/O3DNode'
export default {
  mixins: [
    O3DNode
  ],
  props: {
    win: {}
  },
  data () {
    return  {
      work: false
    }
  },
  mounted () {
    this.work = this.ctx.core.getWorkByWin({ win: this.win })
    this.work.data.fun = this.work.data.fun || 0
  }
}
</script>

<style>

</style>
