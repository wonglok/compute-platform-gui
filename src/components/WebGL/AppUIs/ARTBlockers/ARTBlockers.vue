<template>
<div class="editor-2D text-sm h-full">

  <div class="flex justify-evenly items-center h-full">
    <div class="h-full ">

      <ul class="cmd-row-col">
        <ARTBlockerItem
          v-if="tools"
          class="item"
          style="height: calc(50% - 20px + 5px); overflow-y: scroll;"
          :art="art"
          :ctx="ctx"
          :mode="'tools'"
          :parent="tools.children"
          :model="tools"
        />

        <ARTBlockerItem
          v-if="current && current.blockers && current.blockers.bin"
          class="item"
          style="height: calc(50% - 20px); overflow-y: scroll;"
          :mode="'bin'"
          :art="art"
          :ctx="ctx"
          :parent="current.blockers.bin.children"
          :model="current.blockers.bin"
        />
      </ul>
    </div>

    <div class="h-full">
      <ul class="cmd-row-col" v-if="current && current.blockers && current.blockers.vertex">
        <ARTBlockerItem
          class="item"
          style="height: calc(100% - 20px); overflow-y: scroll;"
          :parent="current.blockers.vertex.children"
          :model="current.blockers.vertex"
          :art="art"
          :ctx="ctx"
          :mode="'vertex'"

          @change="$emit('change')"

          @click-node="onClickNode($event)"
        />
      </ul>
    </div>

    <div class="h-full">
      <ul class="cmd-row-col" v-if="current && current.blockers && current.blockers.fragment">
        <ARTBlockerItem
          class="item"
          style="height: calc(100% - 20px); overflow-y: scroll;"
          :art="art"
          :ctx="ctx"
          :mode="'fragment'"
          @change="$emit('change')"

          :parent="current.blockers.fragment.children"
          :model="current.blockers.fragment"
          @click-node="onClickNode($event)"
        />
      </ul>
    </div>

  </div>
</div>
</template>

<script>
// import draggable from 'vuedraggable'
import ARTBlockerItem from './ARTBlockerItem.vue'
import * as coder from './art-coder.js'
// import Viewer from '../Viewer/Viewer.vue'

let rID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export default {
  components: {
    // draggablepo
    ARTBlockerItem,
    // Viewer
  },
  props: {
    current: {},
    art: {}
  },
  data () {
    let self = this
    return {
      ctx: self,
      console,
      JSON,
      rID,
      coder: coder.make(),
      // toolsStatic: coder.makeTools()
    }
  },
  mounted () {
    this.$emit('change', { fragmentCode: '' + this.fragmentCode, vertexCode: '' + this.vertexCode })
  },
  watch: {
    vertexCode () {
      this.$emit('change', { fragmentCode: '' + this.fragmentCode, vertexCode: '' + this.vertexCode })
    },
    fragmentCode () {
      this.$emit('change', { fragmentCode: '' + this.fragmentCode, vertexCode: '' + this.vertexCode })
    }
  },
  computed: {
    tools () {
      return {
        type: 'tools',
        put: false,
        pull: 'clone',
        displayName: 'Tools',
        children: [
          // {
          //   id: rID(),
          //   put: true,
          //   pull: true,
          //   type: 'update',
          //   displayName: 'Tools',
          //   data: {
          //     name: 'angleInc',
          //     modification: 'add-by',
          //     value: '0.1'
          //   }
          // },

          {
            id: rID(),
            put: true,
            pull: true,
            type: 'rotateX',
            displayName: `RotateX`,
            data: {
              amount: 'time * 3.5',
              select: 'xyz',
              variableName: 'dataInput',
            }
          },

          {
            id: rID(),
            put: true,
            pull: true,
            type: 'rotateY',
            displayName: `RotateY`,
            data: {
              amount: 'time * 3.5',
              select: 'xyz',
              variableName: 'dataInput',
            }
          },

          {
            id: rID(),
            put: true,
            pull: true,
            type: 'rotateZ',
            displayName: `RotateZ`,
            data: {
              amount: 'time * 3.5',
              select: 'xyz',
              variableName: 'dataInput',
            }
          },

          ...this.getDeclearVariable(),
          this.getSampler2D(),

          {
            id: rID(),
            put: false,
            pull: false,
            displayName: 'Repeat',
            type: 'repeat',
            data: {
              times: 5
            },
            children: [
            ]
          }
        ]
      }
    },
    vertexCode () {
      return this.coder.getCode(this.current.blockers.vertex, this.current.blockers.vertex.id, this)
    },
    fragmentCode () {
      return this.coder.getCode(this.current.blockers.fragment, this.current.blockers.fragment.id, this)
    }
  },
  methods: {
    getCTXVariables (mode) {
      return this.current.blockers[mode].children.filter(e => {
        return e.type === 'float'
        || e.type === 'vec2'
        || e.type === 'vec3'
        || e.type === 'vec4'
      })
    },
    getDeclearVariable () {
      return [
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'float',
          displayName: `float`,
          data: {
            name: 'myFloat',
            init: '0.0',
          }
        },
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'vec2',
          displayName: `vec2`,
          data: {
            name: 'myVector2',
            init: 'vec2(0.0, 0.0)',
          }
        },
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'vec3',
          displayName: `vec3`,
          data: {
            name: 'myVector3',
            init: 'vec3(0.0, 0.0, 0.0)',
          }
        },
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'vec4',
          displayName: `vec4`,
          data: {
            name: 'myVector4',
            init: 'vec4(0.0, 0.0, 0.0, 0.0)',
          }
        }
      ]
    },
    getSampler2D () {
      let sampler2D = this.art.config.extraUniforms[0]
      let sampler2DName = ''
      let variableName = ''

      if (sampler2D) {
        sampler2DName = sampler2D.name
      }

      return {
        id: rID(),
        put: true,
        pull: true,
        type: 'sampler2D',
        displayName: `Texture2D`,
        data: {
          variableName,
          array: 'uniforms',
          sampler2DName,
          uv: 'vUv'
        }
      }
    },
    onClickNode ({ model, parent }) {
      console.log(model, parent)
    }
  }
}
</script>

<style scoped>

.editor-2D{
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.horizontal{
  display: flex;
}

.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
.cmd-row-col{
  height: calc(100% - 20px);
}
</style>
