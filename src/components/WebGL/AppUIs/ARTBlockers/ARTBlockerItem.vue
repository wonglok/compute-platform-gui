<template>
  <li class="parent text-xs" :class="{ [model.type]: model.type === 'repeat' }">
    <div
      :class="{ bold: isFolder }"
      dclick="toggle"
    >
      <span @click="$emit('click-node', { model, parent })" v-if="model.type === 'repeat'">{{ model.displayName }} <input class="num text-xs rounded-full p-1 px-2 m-1" type="text" v-model="model.data.times" /> </span>
      <!-- <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'mover2D.moveBy'">{{ model.displayName }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'mover2D.turnBy'">{{ model.displayName }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'mover2D.usePlane'">
        {{ model.displayName }}

        <select class="selector" type="text" v-model="model.data.usePlane">
          <option value="xy">xy</option>
          <option value="xz">xz</option>
          <option value="yz">yz</option>
        </select>
      </span> -->

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'sampler2D'">
        {{ model.displayName }}
        <br/>
        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
        </select>

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>
        =
        texture2D(
          <select class="text-xs border-gray-400 border rounded-full" type="text" v-model="model.data.sampler2DName">
            <option v-for="uni in art.config.extraUniforms" :key="uni.name" :value="uni.name">{{ uni.name }}</option>
          </select>
        ,
          <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.uv" />
        );

        <!-- <div v-for="uni in art.config.extraUniforms" :key="uni.name">
          <Mic v-if="model.data.sampler2DName === uni.name" :uniform="uni"></Mic>
        </div> -->
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'select'">
        <b>{{ model.displayName }}</b> <br/>

        {{ coder.fromSelectToType(model.data.select) }}
        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.name" />
        <br/> =
        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
        </select>

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>
        .
        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx" :class="{ 'bg-orange-500': model.data.select === '' }" v-model="model.data.select">
          <option value="x">x</option>
          <option value="y">y</option>
          <option value="z">z</option>
          <option value="xy">xy</option>
          <option value="xyz">xyz</option>
          <option value="xyzw">xyzw</option>
        </select>
        ;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'rotateX'">
        <b>{{ model.displayName }}</b> <br/>

        {{ model.data.variableName }}.{{ model.data.select }}

        <br/> =
        rotateX(
          <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.amount" />
        )

        *

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>
        .

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx" :class="{ 'bg-orange-500': model.data.select === '' }" v-model="model.data.select">
          <option value="xyz">xyz</option>
          <option value="zxy">zxy</option>
          <option value="yzx">yzx</option>
        </select>
        ;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'rotateY'">
        <b>{{ model.displayName }}</b> <br/>

        {{ model.data.variableName }}.{{ model.data.select }}

        <br/> =
        rotateY(
          <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.amount" />
        )

        *

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>
        .

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx" :class="{ 'bg-orange-500': model.data.select === '' }" v-model="model.data.select">
          <option value="xyz">xyz</option>
          <option value="zxy">zxy</option>
          <option value="yzx">yzx</option>
        </select>
        ;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'rotateZ'">
        <b>{{ model.displayName }}</b> <br/>

        {{ model.data.variableName }}.{{ model.data.select }}

        <br/> =
        rotateZ(
          <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.amount" />
        )

        *

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>

        .

        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx" :class="{ 'bg-orange-500': model.data.select === '' }" v-model="model.data.select">
          <option value="xyz">xyz</option>
          <option value="zxy">zxy</option>
          <option value="yzx">yzx</option>
        </select>

        ;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'float'">
        <b>{{ model.displayName }}</b> <br/>

        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.name" />
        <br/> =
        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.init" />;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'output'">
        <b>{{ model.displayName }}</b> <br/>

        vec4 {{ model.data.name }}
        <br/> =
        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'vertex'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
          <option v-for="(vv, vi) in ctx.getCTXVariables('vertex').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>
        <select class="border-gray-400 border text-xs rounded-full px-2" type="text" v-if="ctx && mode === 'fragment'" :class="{ 'bg-orange-500': model.data.variableName === '', 'bg-red-500': detectNotFound({ array: ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4'), name: model.data.variableName }) }" v-model="model.data.variableName">
          <!-- <option v-if="model.data.variableName === ''" value="">(You need a vec4.)</option> -->
          <option v-for="(vv, vi) in ctx.getCTXVariables('fragment').filter(e => e.type === 'vec4')" :key="vi" :value="vv.data.name">{{ vv.data.name }}</option>
        </select>;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'vec2'">
        <b>{{ model.displayName }}</b> <br/>

        vec2 <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.name" />
        <br/> =
        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.init" />;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'vec3'">
        <b>{{ model.displayName }}</b> <br/>

        vec3 <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.name" />
        <br/> =
        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.init" />;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'vec4'">
        <b>{{ model.displayName }}</b> <br/>

        vec4 <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.name" />
        <br/> =
        <input class="px-2 rounded-full text-xs border border-gray-400" type="text" v-model="model.data.init" />;
      </span>

      <span @click="$emit('click-node', { model, parent })" v-else-if="model.type === 'update'">
        {{ model.displayName }}

        <input class="selector" type="text" v-model="model.data.name" />
        <select class="selector" type="text" v-model="model.data.modification">
          <option value="add-by">Add</option>
          <option value="subtract-by">Subtract</option>
          <option value="multiply-by">Multiply</option>
          <option value="divided-by">Divided by</option>
          <option value="set-to">Set to</option>
        </select>
        <input class="num p-1 px-2 rounded-full text-xs border" type="text" v-model="model.data.value" />
      </span>
      <span @click="$emit('click-node', { model, parent })" v-else-if="mode === 'bin' && $parent.mode !== 'bin'">{{ model.displayName }} <button class=" outline-none rounded-full empty px-3 py-1 border border-black" @click="emptyTrash">Empty Trash</button></span>
      <span @click="$emit('click-node', { model, parent })" v-else>{{ model.displayName }} </span>
      <!-- <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span> -->
    </div>
    <draggable class="h-full" :tag="'ol'" v-model="model.children" :group="{ name: model.group || 'code', pull: model.pull, put: model.put }" :filter="'.ignore'" :clone="cloner" dshow="open" v-if="isFolder">
      <ARTBlockerItem
        class="item"
        v-for="(mm) in model.children"
        :key="mm.id"
        :parent="model.children"
        :model="mm"
        :art="art"
        :ctx="ctx"
        :mode="mode"
        @change="$emit('change', $event)"
        @click-node="$emit('click-node', $event)"
      >
      </ARTBlockerItem>

      <div class="add ignore" v-if="model.children && model.children.length === 0">drop here</div>
      <!-- <div :slot="'footer'" class="add" v-if="model.children.length === 0" @click="addChild">comment</div> -->
    </draggable>

  </li>
</template>

<script>
import draggable from 'vuedraggable'
// import * as Mic from '../ART/Mic.js'
import * as coder from './art-coder.js'

let rID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

let output = {
  components: {
    draggable,
    // Mic: require('../ART/Mic.vue').default
  },
  props: {
    ctx: {},
    art: {},
    mode: {},
    model: Object,
    parent: Array
  },
  beforeCreate () {
    this.$options.components.ARTBlockerItem = output
  },
  data () {
    return {
      coder,
      console,
      open: false
    }
  },
  computed: {
    isFolder () {
      return this.model.children
    }
  },
  methods: {
    detectNotFound ({ array, name }) {
      return !array.map(e => e.data.name).includes(name)
    },

    cloner (el) {
      return {
        ...el,
        pull: true,
        put: true,
        data: {
          ...el.data
        },
        id: rID()
      }
    },

    remvoePlaceHolder () {
      if (this.$parent) {
        var idx = this.$parent.model.children.findIndex(pc => pc.id === this.model.id)
        this.$parent.model.children.splice(idx, 1)
      }
    },

    // toggle () {
    //   if (this.isFolder) {
    //     this.open = !this.open
    //   }
    // },

    // changeType () {
    //   if (!this.isFolder) {
    //     this.$set(this.model, 'children', [])
    //     this.addChild()
    //     this.open = true
    //   }
    // },

    // addChild () {
    //   this.model.children.unshift({
    //     id: rID(),
    //     put: true,
    //     pull: true,
    //     type: 'comment',
    //     data: {
    //       comment: '// please type some note'
    //     }
    //   })
    // },

    emptyTrash () {
      if (window.confirm('Empty Trash?')) {
        this.model.children = []
      }
    }
  },
  mounted () {
    this.$emit('ready', {
      model: this.model
    })
  }
}
export default output
</script>

<style scoped>
.bold{
  font-weight: bold;
}
.parent{
  background-color: rgba(255, 255, 255, 0.829);
}
.repeat.parent{
  background-color: rgba(143, 134, 226, 0.123);
}
.item{
  min-width: 200px;
  border-radius: 5px;
  max-width: 250px;
  margin: 15px 4px;
  padding: 5px 7px;
  border: rgb(20, 193, 236) solid 1px;
}
ol {
  padding-left: 3px;
}
.num{
  width: 40px;
}
.selector{
  width: 50px;
}
.add{
  display: flex;
  justify-content: center;
  align-items: center;
  border: gray dashed 2px;
  border-radius: 10px;
  min-height: 100px;
  margin-top: 20px;

}

</style>
