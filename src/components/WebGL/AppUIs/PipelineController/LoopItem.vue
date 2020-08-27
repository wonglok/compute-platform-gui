<template>
  <li class="parent" :class="{ [model.type]: model.type === 'repeat' }">
    <div
      :class="{ bold: isFolder }"
      dclick="toggle"
    >
      <span @click="$emit('click', { model, parent })" v-if="model.type === 'repeat'">{{ model.type }} <input class="num" type="text" v-model="model.data.times" /> </span>
      <span @click="$emit('click', { model, parent })" v-else-if="model.type === 'mover2D.moveBy'">{{ model.type }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span @click="$emit('click', { model, parent })" v-else-if="model.type === 'mover2D.turnBy'">{{ model.type }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span @click="$emit('click', { model, parent })" v-else-if="model.type === 'mover2D.usePlane'">
        {{ model.type }}
        <select class="selector" type="text" v-model="model.data.usePlane">
          <option value="xy">xy</option>
          <option value="xz">xz</option>
          <option value="yz">yz</option>
        </select>
      </span>
      <span @click="$emit('click', { model, parent })" v-else-if="model.type === 'variable'">
        {{ model.type }}
        <input class="selector" type="text" v-model="model.data.name" />
        start at
        <input class="num" type="text" v-model="model.data.init" />
      </span>
      <span @click="$emit('click', { model, parent })" v-else-if="model.type === 'update'">
        {{ model.type }}
        <input class="selector" type="text" v-model="model.data.name" />
        <select class="selector" type="text" v-model="model.data.modification">
          <option value="add-by">Add</option>
          <option value="subtract-by">Subtract</option>
          <option value="multiply-by">Multiply</option>
          <option value="divided-by">Divided by</option>
          <option value="set-to">Set to</option>
        </select>
        <input class="num" type="text" v-model="model.data.value" />
      </span>
      <span @click="$emit('click', { model, parent })" v-else-if="mode === 'bin' && $parent.mode !== 'bin'">{{ model.type }} <button class=" outline-none rounded-full empty px-3 py-1 border border-black" @click="emptyTrash">Empty Trash</button></span>
      <span @click="$emit('click', { model, parent })" v-else>{{ model.type }} </span>
      <!-- <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span> -->
    </div>
    <draggable class="h-full" :tag="'ol'" v-model="model.children" :group="{ name: 'code', pull: model.pull, put: model.put }" :filter="'.ignore'" :clone="cloner" dshow="open" v-if="isFolder">
      <LoopItem
        class="item"
        v-for="(mm) in model.children"
        :key="mm.id"
        :parent="model.children"
        :model="mm"
        @click="$emit('click', $event)"
      >
      </LoopItem>
      <div class="add ignore" v-if="model.children && model.children.length === 0">drop here</div>
      <!-- <div :slot="'footer'" class="add" v-if="model.children.length === 0" @click="addChild">comment</div> -->
    </draggable>

  </li>
</template>

<script>
import draggable from 'vuedraggable'

let rID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

/*
Buffer Attributed Custom Shader Mesh

json = {
  WIDTH: 128,
  uniforms: [
    {
      name: 'time'
      type: 'float',
      updater: 'clock'
    },
    {
      name: 'speed',
      type: 'float',
      updater: 'slider'
    },
    {
      name: 'color',
      type: 'vec3',
      updater: 'picker'
    },
    {
      name: 'mic',
      type: 'sampler2D',
      updater: 'mic'
    }
  ],
  attributes: [
    {
      type: 'vec4',
      name: 'meta',
      fncArgs: [
        'WIDTH',
        `
          let ARR_VALUE = []
          let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
          let total = dimension * dimension * dimension
          let iii = 0
          for (var ix = 0; ix < dimension; ix++) {
            for (var iy = 0; iy < dimension; iy++) {
              for (var iz = 0; iz < dimension; iz++) {
                // console.log(iii)
                let id = iii / 4

                ARR_VALUE[iii + 0] = id % 6 // square vertex ID
                ARR_VALUE[iii + 1] = Math.floor(id / 6) // square ID
                ARR_VALUE[iii + 2] = total / 6.0 // percentage

                // dot id
                ARR_VALUE[iii + 3] = id // point ID

                iii += 4
              }
            }
          }
          return new Float32Array(ARR_VALUE)
        `
      ]
    },
    {
      type: 'vec4',
      name: 'color'
    },
    {
      type: 'vec3',
      name: 'position',
      fncArgs: [
        'WIDTH',
        `
        let ARR_VALUE = []
        let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
        // let total = WIDTH * WIDTH
        let iii = 0
        for (var ix = 0; ix < dimension; ix++) {
          for (var iy = 0; iy < dimension; iy++) {
            for (var iz = 0; iz < dimension; iz++) {
              // console.log(iii)
              // let id = iii / 4

              ARR_VALUE[iii + 0] = 0 // square vertex ID
              ARR_VALUE[iii + 1] = 0 // square ID
              ARR_VALUE[iii + 2] = 0 // percentage

              iii += 3
            }
          }
        }
        return new Float32Array(ARR_VALUE)
        `
      ]
    }
  ]
}

class CodeART {
  WIDTH () {
    return 128
  }
  vertexCount () {

  }
  uniforms () {
    return {

    }
  }
  vertexAttributes () {
    return [

    ]
  }
}

class CustomMesh {

}

*/

let output = {
  components: {
    draggable
  },
  props: {
    mode: {},
    model: Object,
    parent: Array
  },
  beforeCreate () {
    this.$options.components.LoopItem = output
  },
  data () {
    return {
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
      if (window.confirm('remove all forever?')) {
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
  border-radius: 5px;
  min-width: 200px;
  margin: 15px 4px;
  padding: 10px 10px;
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
  min-height: 150px;
  margin-top: 20px;
}
</style>
