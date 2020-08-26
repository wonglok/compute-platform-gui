<template>
  <li class="parent" :class="{ [model.type]: model.type === 'repeat' }">
    <div
      :class="{ bold: isFolder }"
      @click="toggle"
      dblclick="changeType"
    >

      <span v-if="model.type === 'repeat'">{{ model.type }} <input class="num" type="text" v-model="model.data.times" /> </span>
      <span v-else-if="model.type === 'mover2D.moveBy'">{{ model.type }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span v-else-if="model.type === 'mover2D.turnBy'">{{ model.type }} <input class="num" type="text" v-model="model.data.amount" /> </span>
      <span v-else-if="model.type === 'mover2D.usePlane'">
        {{ model.type }}
        <select class="selector" type="text" v-model="model.data.usePlane">
          <option value="xy">xy</option>
          <option value="xz">xz</option>
          <option value="yz">yz</option>
        </select>
      </span>
      <span v-else-if="model.type === 'variable'">
        {{ model.type }}
        <input class="selector" type="text" v-model="model.data.name" />
        start at
        <input class="num" type="text" v-model="model.data.init" />
      </span>
      <span v-else-if="model.type === 'update'">
        {{ model.type }}
        <input class="selector" type="text" v-model="model.data.name" />
        <select class="selector" type="text" v-model="model.data.modification">
          <option value="add-by">add</option>
          <option value="subtract-by">subtract</option>
          <option value="multiply-by">multiply</option>
          <option value="divided-by">divided by</option>
          <option value="set-to">set to</option>
        </select>
        <input class="num" type="text" v-model="model.data.value" />
      </span>
      <span v-else-if="mode === 'bin' && $parent.mode !== 'bin'">{{ model.type }} <button class=" outline-none rounded-full empty px-3 py-1 border border-black" @click="emptyTrash">Empty Trash</button></span>
      <span v-else>{{ model.type }} </span>
      <!-- <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span> -->
    </div>
    <draggable :tag="'ol'" v-model="model.children" :group="{ name: 'code', pull: model.pull, put: model.put }" :filter="'.ignore'" :clone="cloner" dshow="open" v-if="isFolder">
      <LoopItem
        class="item"
        v-for="(mm) in model.children"
        :key="mm.id"
        :model="mm"
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

let output = {
  components: {
    draggable
  },
  props: {
    mode: {},
    model: Object
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
    toggle () {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    changeType () {
      if (!this.isFolder) {
        this.$set(this.model, 'children', [])
        this.addChild()
        this.open = true
      }
    },
    addChild () {
      this.model.children.unshift({
        id: rID(),
        put: true,
        pull: true,
        type: 'comment',
        data: {
          comment: '// please type some note'
        }
      })
    },
    emptyTrash () {
      this.model.children = []
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
  background-color: rgba(255, 255, 255, 0.5);
}
.repeat.parent{
  background-color: rgba(69, 58, 173, 0.123);
}
.item{
  min-width: 200px;
  margin: 10px;
  padding: 10px;

  border: rgb(37, 144, 194) solid 1px;
}
ol {
  padding-left: 5px;
}
.num{
  width: 40px;
}
.selector{
  width: 60px;
}
</style>
