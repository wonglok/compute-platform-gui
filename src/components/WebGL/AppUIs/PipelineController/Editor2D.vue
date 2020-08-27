<template>
<div class="editor-2D text-sm h-full">

  <div class="horizontal h-full">
    <div class="h-full ">

      <ul class="cmd-row-col" v-if="tools">
        <LoopItem
          class="item"
          style="height: calc(100% - 20px); overflow-y: scroll;"
          :parent="tools.children"
          :model="tools"
        />
      </ul>
    </div>

    <div class="h-full">
      <ul class="cmd-row-col" v-if="current && current.blockers && current.blockers.tree">
        <LoopItem
          class="item"
          style="height: calc(100% - 20px); overflow-y: scroll;"
          :parent="current.blockers.tree.children"
          :model="current.blockers.tree"
          @click="openWindow($event)"
        />
      </ul>
    </div>

    <div class="h-full">
      <ul class="cmd-row-col" v-if="current && current.blockers && current.blockers.bin">
        <LoopItem
          class="item"
          style="height: calc(100% - 20px); overflow-y: scroll;"
          :mode="'bin'"
          :parent="current.blockers.bin.children"
          :model="current.blockers.bin"
        />
      </ul>
    </div>

  </div>
  <!-- <pre>{{ coder.getCode(current.blockers.tree, current.blockers.tree.id) }}</pre> -->
  <!-- <pre>{{ demo.tree }}</pre> -->

</div>
</template>

<script>
// import draggable from 'vuedraggable'
import LoopItem from './LoopItem.vue'
import * as coder from './coder.js'
// import Viewer from '../Viewer/Viewer.vue'

let rID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export default {
  components: {
    // draggable
    LoopItem,
    // Viewer
  },
  props: {
    current: {}
  },
  data () {
    return {
      console,
      JSON,
      rID,
      coder: coder.make(),
      tools: coder.makeTools()
    }
  },
  mounted () {
    this.current.formula = this.formula
  },
  watch: {
    formula () {
      this.current.formula = this.formula
    }
  },
  computed: {
    formula () {
      return this.coder.getCode(this.current.blockers.tree, this.current.blockers.tree.id)
    }
  },
  methods: {
    openWindow ({ model, parent }) {
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
