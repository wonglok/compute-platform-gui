<template>
  <div class="full neu-bg overflow-y-auto">
    <Editor2D v-if="current" :current="current"></Editor2D>
  </div>
</template>

<script>
import * as UI from '../EditorSpace/ageUI'
// import draggable from 'vuedraggable'
import Editor2D from './Editor2D'
import { getID } from '../../Core/O3DNode'
import * as coder from './coder.js'
export default {
  components: {
    Editor2D
  },
  data () {
    return {
      current: false,
      // api: this.$store.getState()
    }
  },
  methods: {
    log (...args) {
      console.log(args)
    }
  },
  mounted () {
    this.current = {
      type: 'blockers',
      id: Math.random() + '',
      color: '#000000',
      stepper: 1.0,
      formula: '',
      blockers: coder.makeDemo1()
    }
    // this.$store.subscribe(console.log, state => state.wins)
    // console.log()
  }
}
</script>

<style>

</style>