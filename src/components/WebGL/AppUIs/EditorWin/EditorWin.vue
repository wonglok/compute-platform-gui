<template>
  <div class="flex h-full">
    <div style="width: 270px; background-color: #09161e;" class="h-full p-4">
      <TreeItem @add-item="addItem" @click-item="clickItem" :item="tree"></TreeItem>
      <!-- <FolderTree class="full" :allowMultiselect="false" @nodeclick="onClick" v-model="tree.children"></FolderTree> -->
    </div>
    <div style="width: calc(100% - 270px);" class="h-full">
      <ACE
        v-if="current"
        @save="() => {}"
        :path="current.path"
        v-model="current.src"
        @input="() => { isDirty = true; }"
        theme="chrome"
        width="100%"
        :height="'100%'"
      >
      </ACE>
      <!-- <button @click="compile()">Waaa</button> -->
    </div>
  </div>
</template>

<script>
import { compilTree, getDefaultTree } from '../../Packages/FSCompiler/FSCompiler.js'
import { O3DVue } from '../../Core/O3DVue.js'
import TreeItem from './TreeItem'
// import path from 'path'

//theme: "vs-dark",

export default {
  mixins: [
    O3DVue
  ],
  components: {
    TreeItem
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
    clickItem ({ item }) {
      console.log(item)
      this.current = item
    },
    addItem ({ item, parent }) {
      console.log(item, parent)
      item.children.push({
        name: 'new stuff',
        isFile: true,
        path:  item.path + '/new item.txt',
        src: `code`
      })
    },
    onClick (item) {
      console.log(item)
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