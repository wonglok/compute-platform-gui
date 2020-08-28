<template>
  <div class="w-full h-full relative">
    <div v-if="art" class="h-full relative w-7/12">
      <div class="flex items-center p-3 border-b border-black" style="height: 50px;">
        Graphics Pipeline
        <span class="px-1">::</span>
        <select class="cursor-pointer" :value="art.config.WIDTH" @change="art.config.WIDTH = $event.target.value; flush()">
          <option value="64">Size 96x96x96</option>
          <option value="64">Size 64x64x64</option>
          <option value="48">Size 48x48x48</option>
          <option value="32">Size 32x32x32</option>
        </select>

        <span class="px-1">/</span>
        <span class="cursor-pointer" @click="settings = 'core'; panel = 'core'; now.code = coreCodes[0]">Core</span>
        <span class="px-1">/</span>
        <span class="cursor-pointer" @click="settings = 'attributes'; panel = 'attributes'; now.attr = art.config.extraAttrs[0]">Attributes</span>
        <span class="px-1">/</span>
        <span class="cursor-pointer" @click="settings = 'uniforms'; panel = 'uniforms'; now.uniform = art.config.extraUniforms[0]">Uniforms</span>
        <span class="px-1">/</span>
        <span class="cursor-pointer" @click="settings = 'blockers'; panel = 'blockers';">Blockers</span>
      </div>

      <div v-if="settings === 'core'" class="p-3 border-b border-black flex items-center" style="height: calc(50px);">
        <div class="inline-block p-2 cursor-pointer " :key="li.name + 'li'" v-for="li in coreCodes" @click="setCurrent(li)">
          {{ li.name }}
        </div>
      </div>

      <div v-if="settings === 'attributes'" class="p-3 border-b border-black flex items-center" style="height: calc(50px);">
        <span @click="addNewAttr({ attrs: art.config.extraAttrs })">+ Attributes</span>
        <span class="px-1">::</span>
        <span :key="attr.name" v-for="(attr, i) in art.config.extraAttrs" @click="now.attr = attr">
          {{ attr.name }}
          <span class="px-1" v-if="i !== art.config.extraAttrs.length - 1">/</span>
        </span>
      </div>

      <div v-if="settings === 'uniforms'" class="p-3 border-b border-black flex items-center" style="height: calc(50px);">
        <span @click="addNewUniforms({ uniforms: art.config.extraUniforms })">+ Uniforms</span>
        <span class="px-1">::</span>
        <span :key="uniform.name" v-for="(uniform, i) in art.config.extraUniforms" @click="now.uniform = uniform">
          {{ uniform.name }}
          <span class="px-1" v-if="i !== art.config.extraUniforms.length - 1">/</span>
        </span>
      </div>

      <div v-if="settings === 'blockers'" class="p-3 flex items-center" style="height: calc(100% - 50px);">
        <ARTBlockers :art="art" v-if="art" :current="art.config.blockers" @change="onChangeCode($event)"></ARTBlockers>
      </div>

      <div v-if="panel === 'uniforms'" class="" style="height: calc(100% - 50px * 2);">
        <div v-if="art && now.uniform" :key="now.uniform.name" class="p-3">
          <div class="py-2">
            Current Uniform: {{ now.uniform.name }}
          </div>

          <Mic v-if="now.uniform.updater === 'mic'" :uniform="now.uniform"></Mic>
        </div>
      </div>

      <div v-if="panel === 'attributes'" class="" style="height: calc(100% - 50px * 2);">
        <div
          v-if="art && now.attr"
          class="p-3 border-black border-b"
          style="height: 50px;"
        >
          <div>
            {{ now.attr.name }}
            Attribute Type:
            <select v-model="now.attr.type" @change="onChangeAttrType({ type: now.attr.type, attr: now.attr })">
              <option value="float">Float</option>
              <option value="vec2">Vector2</option>
              <option value="vec3">Vector3</option>
              <option value="vec4">Vector4</option>
            </select>
          </div>
        </div>

        <div
        style="height: calc(100% - 50px);"
        class="">
          <ACEFixedPos
            v-if="art && now.attr"
            @save="(v) => {
              now.attr.terser = v; now.attr.needsUpdate = true; flush()
            }"
            :key="now.attr.name"
            :path="'omg.js'"
            v-model="now.attr.terser"
            @input="(v) => { now.attr.terser = v; now.attr.needsUpdate = true; }"
            @slider="(v) => { now.attr.terser = v; now.attr.needsUpdate = true; }"
            theme="chrome"
            width="100%"
            :height="'100%'"
          >
          </ACEFixedPos>
        </div>
      </div>

      <div v-if="panel === 'core'" class="" style="height: calc(100% - 50px * 2);">
        <ACEFixedPos
          v-if="art && now.code"
          @save="(v) => {
            now.code.setter(v)
          }"
          :key="now.code.name"
          :path="now.code.path"
          v-model="now.code.src"
          @input="(v) => { now.code.setter(v) }"
          @slider="(v) => { now.code.setter(v) }"
          theme="chrome"
          width="100%"
          :height="'100%'"
        >
        </ACEFixedPos>

        <div class="full flex justify-center items-center" v-else>
          Code Editor
        </div>
      </div>

    </div>

    <div class="absolute top-0 right-0 w-5/12 h-full z-40 text-white ">
      <GLArtCanvas :rounded="'0px 0px 0px 0px'" :bgcolor="'#232323'" class="full">
        <ART @art="art = $event; setup(art)"></ART>
      </GLArtCanvas>
    </div>

    <div v-if="art && art.config.extraUniforms.filter(e => e.needsAuhtorises && !e.value).length > 0" class="absolute top-0 right-0 w-5/12 h-full z-50" style="background-color: rgba(255,255,255,0.85);">
      <div class="h-full flex justify-center items-center">
        <div :key="ui" v-for="(uniform, ui) in art.config.extraUniforms">
          <Mic v-if="uniform.updater === 'mic'" :uniform="uniform"></Mic>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ART } from './ART.js'
import { getID } from '../../Core/O3DNode.js'

export default {
  props: {
  },
  mixins: [
    require('../../Core/O3DVue').O3DVue
  ],
  data () {
    return {
      now: {
        code: false,
        attr: false,
        uniform: false,
      },

      settings: 'blockers',
      panel: 'blockers',

      current: false,
      art: false,
      coreCodes: false
    }
  },
  methods: {
    addNewUniforms ({ uniforms }) {
      uniforms.push(this.art.getNewUniform())
      this.flush()
    },
    addNewAttr ({ attrs }) {
      attrs.push(this.art.getNewAttr())
      this.flush()
    },
    onChangeCode (event) {
      this.art.config.blockers.vertexCode = event.vertexCode
      this.art.config.blockers.fragmentCode = event.fragmentCode
      this.flush()
    },
    setup () {
      this.coreCodes = [
        {
          name: 'Vertex Main Function',
          path: 'omg.glsl',
          src: this.art.config.vertexMain,
          setter: (v) => {
            this.art.config.vertexMain = v
            this.flush()
          }
        },
        {
          name: 'Fragment Main Function',
          path: 'omg.glsl',
          src: this.art.config.fragmentMain,
          setter: (v) => {
            this.art.config.fragmentMain = v
            this.flush()
          }
        },
        {
          name: 'Varyings',
          path: 'omg.glsl',
          src: this.art.config.varyingsStr,
          setter: (v) => {
            this.art.config.varyingsStr = v
            this.flush()
          }
        }
      ]
      this.now.code = this.coreCodes[0]
      this.now.uniform = this.art.config.extraUniforms[0]
    },
    onChangeAttrType ({ type, attr }) {
      if (type === 'float') {
        attr['cont'] = 1
      } else if (type === 'vec2') {
        attr['cont'] = 2
      } else if (type === 'vec3') {
        attr['cont'] = 3
      } else if (type === 'vec4') {
        attr['cont'] = 4
      }
      attr.needsUpdate = true
      this.flush()
    },
    setCurrent (li) {
      this.now.code = li
    },
    async setupGraphics () {
    },
    flush () {
      this.art.config = ({
        ...this.art.config
      })
    }
},
mounted () {
    this.setupGraphics()
  }
}
</script>

<style>
</style>
