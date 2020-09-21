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
    <div class="rounded-lg border py-3 px-5 m-3 overflow-x-auto scrolling-touch">
      <div @click="tab = 'uniform'" class="font-sans text-xl mb-3 inline-block rounded-lg border-gray-500 border p-3 mx-2">
        Uniforms
      </div>
      <div @click="tab = 'vertex'" class="font-sans text-xl mb-3 inline-block rounded-lg border-gray-500 border p-3 mx-2">
        Vertex Shader
      </div>
      <div @click="tab = 'fragment'" class="font-sans text-xl mb-3 inline-block rounded-lg border-gray-500 border p-3 mx-2">
        Fragment Shader
      </div>
      <div @click="tab = 'varying'" class="font-sans text-xl mb-3 inline-block rounded-lg border-gray-500 border p-3 mx-2">
        Varyings
      </div>
      <!-- <div @click="tab = 'attributes'" class="font-sans text-xl mb-3 inline-block rounded-lg border-gray-500 border p-3 mx-2">
        Attributes
      </div> -->
    </div>
    <div v-if="tab === 'uniform'" class="rounded-lg border py-3 px-5 m-3">
      <div class="font-sans text-2xl mb-3">
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
        <tr>
          <td>Cluster Size</td>
          <td>{{ config.WIDTH }}</td>
          <td>
            <select v-model="config.WIDTH" @change="onRefresh">
              <option :value="32">32x32x32</option>
              <option :value="48">48x48x48</option>
              <option :value="96">96x96x96</option>
            </select>
          </td>
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

    <div v-if="tab === 'vertex'" class="rounded-lg border py-3 px-5 m-3">
      <keep-alive>
        <ACEFixedPos
          @save="onRefresh"
          :path="'ok.glsl'"
          v-model="config.vertexMain"
          dd-input="onRefresh"
          @slide="onRefresh"
          theme="chrome"
          width="100%"
          :offset="{ x: -250, y: 0 }"
          :height="'450px'"
        >
        </ACEFixedPos>
      </keep-alive>
    </div>
    <div v-if="tab === 'fragment'" class="rounded-lg border py-3 px-5 m-3">
      <keep-alive>
        <ACEFixedPos
          @save="onRefresh"
          :path="'ok.glsl'"
          v-model="config.fragmentMain"
          dd-input="onRefresh"
          @slide="onRefresh"
          theme="chrome"
          width="100%"
          :height="'450px'"
          :offset="{ x: -250, y: 0 }"
        >
        </ACEFixedPos>
      </keep-alive>
    </div>
    <div v-if="tab === 'varying'" class="rounded-lg border py-3 px-5 m-3">
      <keep-alive>
        <ACEFixedPos
          @save="onRefresh"
          :path="'ok.glsl'"
          v-model="config.varyingsStr"
          dd-input="onRefresh"
          @slide="onRefresh"
          theme="chrome"
          :offset="{ x: -250, y: 0 }"
          width="100%"
          :height="'450px'"
        >
        </ACEFixedPos>
      </keep-alive>
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
      tab: 'uniform'
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