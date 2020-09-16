<template>
  <div class="p-4 full overflow-scroll ">
    <div class="rounded-lg border py-3 px-5 m-3">
      <div class="font-sans text-3xl mb-3">
        {{ work.displayName }}
      </div>
      <div class="text-sm">
        Dynamic Vertex Visual Object
      </div>
    </div>

    <div class="rounded-lg border py-3 px-5 m-3">
      <div class="font-sans text-xl mb-3">
        Uniforms
      </div>
      <table>
        <tr>
          <th>
            Name
          </th>
          <th>
            Value
          </th>
          <th>
            Editor
          </th>
        </tr>
        <tr v-for="uniform in config.extraUniforms" :key="uniform.name">
          <td class="p-3">{{ uniform.name }}</td>
          <td class="p-3">
            <div v-if="['select', 'slider'].includes(uniform.updater)">
              <input class=" bg-transparent border-b border-black" type="text" v-model="uniform.value" @input="onRefresh" />
            </div>
            <div v-else-if="(uniform.updater) === 'mic-now'">
              Realtime Mic
            </div>
            <div v-else-if="(uniform.updater) === 'mic'">
              Timed Mic
            </div>
          </td>
          <td class="p-3">
            <div v-if="uniform.updater === 'slider'">
              <input type="range" min="0" max="10" step="0.01" v-model="uniform.value" @input="onRefresh">
            </div>
            <div v-else-if="uniform.updater === 'select'">
              <select v-model="uniform.value" @change="onRefresh">
                <option v-for="option in uniform.options" :key="option._id" :value="`${option.value}`">{{ option.display }}</option>
              </select>
            </div>
          </td>
        </tr>
      </table>

      <!-- <pre>{{ config }}</pre> -->
    </div>

  </div>
</template>

<script>
export default {
  mixins: [
  ],
  props: {
    deps: {},
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
    },
    config () {
      return this.work.guiData.config
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