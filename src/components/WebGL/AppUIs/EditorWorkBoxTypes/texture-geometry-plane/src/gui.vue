<template>
  <div class="p-4 full overflow-scroll ">
    <div class="rounded-lg border py-3 px-5 m-3">
      <div class="font-sans text-3xl">
        {{ work.displayName }}
      </div>
    </div>

    <div class="rounded-lg border py-3 px-5 m-3 overflow-x-auto scrolling-touch">
      <!-- <pre>{{ gui }}</pre> -->


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
        <!-- <tr>
          <td class="p-3">baseColor</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" min="1" max="1000" step="1" v-model="gui.baseColor" @input="onRefresh"  /></td>
          <td class="p-3">
            <Chrome :value="{ hex: gui.baseColor }" @input="(evt) => { gui.baseColor = evt.hex }"></Chrome>
          </td>
        </tr>
        <tr>
          <td class="p-3">offsetModifier</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" min="1" max="100" step="1" v-model="gui.offsetModifier" @input="onRefresh"  /></td>
          <td class="p-3">
            <Chrome :value="{ hex: gui.offsetModifier }" @input="(evt) => { gui.offsetModifier = evt.hex }"></Chrome>
          </td>
        </tr> -->

        <tr>
          <td class="p-3">SizeXY</td>
          <td class="p-3">
            <select class=" bg-transparent border-b border-black" type="text" :value="gui.sizeX" @input="($event) => { gui.sizeY = $event.target.value; gui.sizeX = $event.target.value; onRefresh(); }" @change="($event) => { gui.sizeY = $event.target.value; gui.sizeX = $event.target.value; onRefresh(); }">
              <option :value="128">128x128</option>
              <option :value="256">256x256</option>
              <option :value="512">512x512</option>
              <option :value="1024">1024x1024</option>
            </select>
          </td>
          <td class="p-3"></td>
        </tr>
        <tr>
          <td class="p-3">Influence Type</td>
          <td class="p-3">
            <select class=" bg-transparent border-b border-black" type="text" v-model="gui.influenceType" @input="onRefresh()" @change="onRefresh(); gui.refresher += 1">
              <option :value="'vertex'">Motion / Shape / Vertex</option>
              <option :value="'fragment'">Color / Fragment</option>
            </select>
          </td>
          <td class="p-3"></td>
        </tr>

        <!-- <tr>
          <td class="p-3">twisterX</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterX" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterX" @input="onRefresh"  /></td>
        </tr>

        <tr>
          <td class="p-3">twisterY</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterY" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterY" @input="onRefresh"  /></td>
        </tr>

        <tr>
          <td class="p-3">twisterZ</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterZ" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterZ" @input="onRefresh"  /></td>
        </tr>


        <tr>
          <td class="p-3">twisterSpeedX</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterSpeedX" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterSpeedX" @input="onRefresh"  /></td>
        </tr>

        <tr>
          <td class="p-3">twisterSpeedY</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterSpeedY" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterSpeedY" @input="onRefresh"  /></td>
        </tr>

        <tr>
          <td class="p-3">twisterSpeedZ</td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="text" v-model="gui.twisterSpeedZ" @input="onRefresh" /></td>
          <td class="p-3"><input class=" bg-transparent border-b border-black" type="range" min="0" max="1" step="0.001" v-model="gui.twisterSpeedZ" @input="onRefresh"  /></td>
        </tr> -->

      </table>

      <div>
        <ACE
          @wheel.prevent=""
          @wheel.stop=""
          @save="() => {
            onRefresh()
          }"
          :key="'./love.glsl'"
          :path="'./love.glsl'"
          v-model="gui.compute"
          @input="() => { }"
          @slide="() => { onRefresh() }"
          theme="monokai"
          width="100%"
          :height="'calc(500px)'"
        >
        </ACE>
      </div>

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