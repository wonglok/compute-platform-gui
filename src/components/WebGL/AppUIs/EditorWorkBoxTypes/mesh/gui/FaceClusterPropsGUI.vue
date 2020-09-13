<template>
  <div class="p-4 full overflow-scroll">
    <div class=" font-sans text-3xl">
      FaceCluster GUI
    </div>
    <div class=" font-sans text-3xl">

      <div v-for="uniform in gui.extraUniforms" :key="uniform.name">
        <div v-if="uniform.updater === 'slider'">
          <input type="range" min="0" max="10" step="0.0001" v-model="uniform.value">
        </div>
        <div v-else-if="uniform.updater === 'select'">
          <select v-model="uniform.value">
            <option v-for="option in uniform.options" :key="option._id" :value="`${option.value}`">{{ option.display }}</option>
          </select>
        </div>
      </div>
    </div>
    <pre>{{ gui }}</pre>
  </div>
</template>

<script>
import { enableESC } from '../../WorkBoxGUIMixin'
export default {
  mixins: [
    // enableESC
  ],
  props: {
    win: {},
    work: {},
    works: {},
    core: {}
  },
  data () {
    return {

    }
  },
  computed: {
    gui () {
      return this.work.guiData
    }
  },
  mounted () {

  }
}
</script>

<style>

</style>