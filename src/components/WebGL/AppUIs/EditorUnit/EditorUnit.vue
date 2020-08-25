<template>
  <div class="full relative overflow-hidden">
    <div class="flex" :style="iframe ? 'height: calc(100% - 250px);' : 'height: calc(100%);'">
      <div style="width: 200px; background-color: #09161e;" class="h-full p-4 overflow-y scrolling-touch" @wheel.prevent="" @wheel.stop="">
        <TreeItem class="select-none" v-if="tree" @add-item="addItem" @click-item="clickItem" :item="tree"></TreeItem>
        <!-- <FolderTree class="full" :allowMultiselect="false" @nodeclick="onClick" v-model="tree.children"></FolderTree> -->
      </div>
      <div :style="{ width: 'calc(100% - 200px)', minWidth: '400px' }" class="h-full">
        <div style="height: 30px; background-color: #09161e;" class="text-white text-xs flex items-center">
          <div v-if="current">
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="onRun()">Run</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="toggleFrame()">Toggle Preview</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="onRename()">Rename</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="onDeletePrompt()">Delete</button>
          </div>
        </div>
        <div class="w-full bg-gray-800" :style="'height: calc(100% - 30px);'" ref="ace">
          <keep-alive>
            <ACE
              v-if="current && current.isFolder === false"
              @save="() => {
                onSave()
              }"
              :key="current.path"
              :path="current.path"
              v-model="current.src"
              @input="() => { isDirty = true; }"
              @slider="() => { isDirty = true; }"
              theme="monokai"
              width="100%"
              :height="'100%'"
            >
            </ACE>
          </keep-alive>

          <div v-if="current && current.isFolder" class="full flex justify-center items-center text-sm">
            Folder {{ current.path }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="iframe" class="w-full" style="height: 250px; background-color: #09161e;">
      <iframe :src="webURL" ref="iframer" class="w-full h-full" frameborder="0"></iframe>
    </div>

    <div v-if="overlay === 'rename'" class="absolute top-0 left-0 full tool-overlay z-50 flex justify-center items-center">
      <div class="bg-white rounded-lg p-10 py-12">
        <div>
          <input type="text" autofocus class="border-b border-black" v-model="currentNewname" @keydown.esc="onOverlayCancel()" @keydown.enter="onRenameConfirm()">
        </div>
        <div class="flex justify-center pt-3">
          <button class="p-1 text-xs rounded-full my-1 mr-2" @click="onOverlayCancel()">Cancel</button>
          <button class="p-1 px-3 text-xs rounded-full my-1 text-white bg-blue-600" @click="onRenameConfirm()">Confirm</button>
        </div>
      </div>
    </div>

    <div v-if="overlay === 'delete'" class="absolute top-0 left-0 full tool-overlay z-50 flex justify-center items-center">
      <div class="bg-white rounded-lg p-10 py-12">
        <div>
          <div class="text-sm">
            Are you sure you want to delete:
          </div>
          <div class="text-sm p-2 bg-red-200 rounded-full px-4 my-2">{{ current.path }}</div>
          <!-- <input type="text" class="border-b border-black" v-model="currentNewname"> -->
        </div>
        <div class="flex justify-center pt-3">
          <button class="p-1 text-xs rounded-full my-1 mr-2" @click="onOverlayCancel()">Cancel</button>
          <button class="p-1 px-3 text-xs rounded-full my-1 text-white bg-red-600" @click="onDeleteConfirm()">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDefaultTree, addFolder, makeURLByTree } from '../../Packages/FSCompiler/FSCompiler.js'
import { O3DVue } from '../../Core/O3DVue.js'
import { traverseDown } from '../../Core/O3DNode.js'
import TreeItem from './TreeItem'
import path from 'path'
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
      overlay: '',
      isDirty: false,
      iframe: true,
      webURL: false,
      current: false,
      currentParent: false,
      currentNewname: '',
      currentFileFolder: '',
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
        this.currentParent = this.tree.children
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
    onRename () {
      this.currentFileFolder = path.dirname(this.current.path)
      this.currentNewname = path.basename(this.current.path)
      this.overlay = 'rename'
    },
    onRenameConfirm () {
      this.current.path = path.join(this.currentFileFolder, this.currentNewname)
      this.overlay = ''
    },
    onOverlayCancel () {
      this.overlay = ''
    },
    onDeleteConfirm () {
      let arr = this.currentParent
      let idx = arr.findIndex(e => e.path === this.current.path)
      if (idx !== -1) {
        arr.splice(idx, 1)
        this.currentParent = false
        this.current = false
      }
      this.overlay = ''
    },
    onDeletePrompt () {
      this.overlay = 'delete'
    },
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
    clickItem ({ item, parent }) {
      this.currentParent = parent
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
.tool-overlay{
  background-color: rgba(255, 255, 255, 0.712);
}
</style>