<template>
  <div class="full overflow-hidden">
    <div class="flex" :style="iframe ? 'height: calc(100% - 250px);' : 'height: calc(100%);'">
      <div style="width: 200px; background-color: #09161e;" class="h-full p-4 overflow-y scrolling-touch" @wheel.prevent="" @wheel.stop="">
        <TreeItem class="select-none" v-if="tree" @add-item="addItem" @click-item="clickItem" :item="tree"></TreeItem>
        <!-- <FolderTree class="full" :allowMultiselect="false" @nodeclick="onClick" v-model="tree.children"></FolderTree> -->
      </div>
      <div :style="{ width: 'calc(100% - 200px)', minWidth: '400px' }" class="h-full">
        <div style="height: 30px; background-color: #09161e;" class="text-white text-xs flex items-center">
          <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="onRun()">Run</button>
          <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="toggleFrame()">Toggle Preview</button>
        </div>
        <div class="w-full" :style="'height: calc(100% - 30px);'" ref="ace">
          <keep-alive>
            <ACE
              v-if="current"
              @save="() => {
                onSave()
              }"
              :key="current.path"
              :path="current.path"
              v-model="current.src"
              @input="() => { isDirty = true; }"
              @slider="() => { isDirty = true; }"
              theme="chrome"
              width="100%"
              :height="'100%'"
            >
            </ACE>
          </keep-alive>
        </div>
      </div>
    </div>
    <div v-if="iframe" class="w-full" style="height: 250px; background-color: #09161e;">
      <iframe :src="webURL" ref="iframer" class="w-full h-full" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
import { getDefaultTree, addFolder, makeURLByTree } from '../../Packages/FSCompiler/FSCompiler.js'
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
      isDirty: false,
      iframe: true,
      webURL: false,
      current: false,
      tree: false
    }
  },
  watch: {
    current () {
      window.dispatchEvent(new Event('plot'))
    }
  },
  mounted () {
    setTimeout(() => {
      this.tree = getDefaultTree()
      if (this.tree) {
        this.current = this.tree.children[0]
        this.onSave()
        this.$nextTick(() => {
          this.relayout()
        })
      }
    }, 1000)

    // let tt = 0
    // window.addEventListener('plot', () => {
    //   clearTimeout(tt)
    //   tt = setTimeout(() => {
    //     this.relayout()
    //   }, 10)
    // })
  },
  methods: {
    onRun () {
      if (!this.iframe) {
        this.toggleFrame()
      }
      this.onSave()
    },
    toggleFrame () {
      this.iframe = !this.iframe
      if (!this.iframe) {
        this.$parent.$emit('delta-height', -250)
      } else {
        this.$parent.$emit('delta-height', 250)
      }
    },
    relayout () {
    },
    clickItem ({ item }) {
      console.log(item)
      this.current = item
    },
    addItem ({ folder }) {
      // console.log(folder)
      addFolder({ folder })
    },
    onClick (item) {
      console.log(item)
      this.current = item
    },
    async onSave () {
      if (!this.tree) {
        return
      }

      this.webURL = await makeURLByTree({ tree: this.tree })
      // this.$emit('url', this.webURL)
      this.$nextTick(() => {
        this.relayout()
      })
    }
  }
}
</script>

<style>

</style>