<template>
  <div class="flex h-full">
    <div style="width: 270px; background-color: #09161e;" class="h-full p-4">
      <FolderTree class="full" :allowMultiselect="false" @nodeclick="onClick" v-model="tree.children"></FolderTree>
    </div>
    <div style="width: calc(100% - 270px);" class="h-full">
      <!-- <button @click="compile()">Waaa</button> -->
      <Monaco v-if="current" :key="current.path" :src="current.src" :path="current.path" class="full"></Monaco>
    </div>
  </div>
</template>

<script>
import { compilTree, getDefaultTree } from '../../Packages/FSCompiler/FSCompiler.js'
import FolderTree from 'sl-vue-tree'
import 'sl-vue-tree/dist/sl-vue-tree-dark.css'
import { O3DVue } from '../../Core/O3DVue.js'

//theme: "vs-dark",

export default {
  mixins: [
    O3DVue
  ],
  components: {
    FolderTree
  },
  data () {
    return {
      current: false,
      tree: getDefaultTree()
    }
  },
  mounted () {
    this.compile()
  },
  methods: {
    onClick (item) {
      console.log(item)
      console.log(this.tree)
      this.current = item
    },
    async compile () {
      let result = await compilTree({ tree: this.tree })
      // console.log(result)

      let blob = new Blob([result])
      let url = URL.createObjectURL(blob)

      if (this.script) {
        URL.revokeObjectURL(this.script.src)
        document.body.removeChild(this.script)
      }

      let script = document.createElement('script')
      script.src = url
      this.script = script

      try {
        document.body.appendChild(script)
      } catch (e) {
        console.trace(e)
      }
    }
  }
}
</script>

<style>

</style>