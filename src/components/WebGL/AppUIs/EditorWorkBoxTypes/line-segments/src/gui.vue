<template>
  <div class="p-4 full overflow-scroll ">
    <div class="rounded-lg border py-3 px-5 m-3">
      <div class="font-sans text-3xl mb-3">
        {{ work.displayName }}
      </div>
      <div class="text-sm">
        Draw Item
      </div>
    </div>

    <!-- <div class=" font-sans text-3xl">
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
    </div> -->

    <!-- <pre class="">{{ gui }}</pre> -->

  </div>
</template>

<script>
export default {
  mixins: [
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