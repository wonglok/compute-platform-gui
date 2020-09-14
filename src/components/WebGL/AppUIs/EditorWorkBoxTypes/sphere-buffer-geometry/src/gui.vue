<template>
  <div class="p-4 full overflow-scroll neu-bg ">
    <div class="rounded-lg neu-sm py-3 px-5 m-3">
      <div class="font-sans text-3xl mb-3">
        SphereBufferGeometry
      </div>
    </div>

    <div class="rounded-lg neu-sm py-3 px-5 m-3">
      <table>
        <tr>
          <th>
            Name
          </th>
          <th>
            Value
          </th>
          <th>
            Slider
          </th>
        </tr>
        <tr>
          <td class="p-3">Radius</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.radius" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="1" max="1000" step="1" v-model="gui.radius" @input="onRefresh"  /></td>
        </tr>
        <tr>
          <td class="p-3">Segment X</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.segmentX" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="1" max="100" step="1" v-model="gui.segmentX" @input="onRefresh"  /></td>
        </tr>
        <tr>
          <td class="p-3">Segment Y</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.segmentY" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="1" max="100" step="1" v-model="gui.segmentY" @input="onRefresh"  /></td>
        </tr>
      </table>
    </div>

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
  methods: {
    onRefresh () {
      this.$root.$emit('refresh-ui', { work: this.work })
    }
  },
  mounted () {

  }
}
</script>

<style>

</style>