<template>
  <div :horizontal="true" class="full h-full relative overflow-hidden flex flex-col">
    <div class="flex h-full w-full">

      <!-- <FolderTree class="full" :allowMultiselect="false" @nodeclick="onClick" v-model="tree.children"></FolderTree> -->
      <!-- <div class="h-full" v-if="iframe" :style="{ 'background-color': '#09161e' }">
        <iframe :src="unitWebURL" ref="iframer" :style="{ height: iframeHeight + 'px' }" class="w-full h-full" frameborder="0"></iframe>
      </div> -->

      <div style="width: 270px; background-color: #09161e;" class="w-full h-full p-3" >
        <keep-alive>
          <TreeItem class="select-none h-full overflow-scroll scrolling-touch " v-if="tree" @add-item="addItem" @add-folder="addFolder" @click-item="clickItem" :item="tree"></TreeItem>
        </keep-alive>
      </div>

      <div :style="{ width: 'calc(100% - 270px)', minWidth: '400px' }" class="h-full">
        <div style="height: 30px; background-color: #09161e;" class="text-white text-xs flex items-center">
          <div v-if="current">
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="onRun()">Run</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" @click="toggleFrame()">Toggle Preview</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" v-if="checkEnable()" @click="onRename()">Rename</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" v-if="checkEnable()" @click="onDeletePrompt()">Delete</button>
            <button class="mx-1 rounded-full px-3 border bg-white text-black" v-if="checkEnable()" @click="onMovePrompt()">Move</button>
          </div>
        </div>

        <div class="w-full bg-gray-800" :style="'height: calc(100% - 30px);'" ref="ace">
          <keep-alive>
            <ACE
              @wheel.prevent=""
              @wheel.stop=""
              v-if="current && current.type === 'file'"
              @save="() => {
                onRefresh()
                onSave()
              }"
              :key="current.path"
              :path="current.path"
              v-model="current.src"
              @input="() => { isDirty = true; }"
              @slide="() => { isDirty = true; onRefresh() }"
              theme="monokai"
              width="100%"
              :height="'calc(100%)'"
            >
            </ACE>
          </keep-alive>

          <div v-if="current && current.type === 'folder'" class="full flex justify-center items-center text-sm text-white">
            Folder {{ current.path }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="overlay === 'rename'" class="neu-bg absolute top-0 left-0 full tool-overlay z-50 flex justify-center items-center">
      <div class=" neu-lg bg-white rounded-lg p-10 py-12">
        <div>
          <input type="text" autofocus class="p-3 rounded-full px-4 outline-none" v-model="currentNewname" @keydown.esc="onOverlayCancel()" @keydown.enter="onRenameConfirm()">
        </div>
        <div class="flex justify-center pt-3">
          <button class="p-1 text-xs rounded-full my-1 mr-2" @click="onOverlayCancel()">Cancel</button>
          <button class="p-1 px-3 text-xs rounded-full my-1 text-white bg-blue-600" @click="onRenameConfirm()">Confirm</button>
        </div>
      </div>
    </div>

    <div v-if="overlay === 'delete'" class="neu-bg absolute top-0 left-0 full tool-overlay z-50 flex justify-center items-center">
      <div class=" neu-lg bg-white rounded-lg p-10 py-12">
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

    <div v-if="overlay === 'move'" class="neu-bg absolute top-0 left-0 full tool-overlay z-50 flex justify-center items-center">
      <div class=" neu-lg bg-white rounded-lg p-10 py-12">
        <div>
          <div class="text-sm">
            Move to other folder.
          </div>

          <TreeItem class="select-none bg-gray-800 p-3 rounded-lg" :showFolderOnly="true" v-if="tree" @click-item="onMoveConfrim" :item="tree"></TreeItem>

          <!-- <div class="text-sm p-2 bg-red-200 rounded-full px-4 my-2">{{ current.path }}</div> -->
          <!-- <input type="text" class="border-b border-black" v-model="currentNewname"> -->
        </div>
        <div class="flex justify-center pt-3">
          <button class="p-1 text-xs rounded-full my-1 mr-2" @click="onOverlayCancel()">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addFile, addFolder, treeToFlat, makeUnitPreview, makeUnitModule, injectToMain, flatToTree } from '../../Packages/FSCompiler/FSCompiler.js'
import { O3DVue } from '../../Core/O3DVue.js'
import { traverseDown } from '../../Core/O3DNode.js'
import TreeItem from './TreeItem'
import path from 'path'
// import { Splitpanes, Pane } from 'splitpanes'
// import 'splitpanes/dist/splitpanes.css'
//theme: "vs-dark",

/*
'https://unpkg.com/three@0.119.1/examples/js/misc/GPUComputationRenderer.js'
*/

export default {
  props: {
    initTree: {},
    win: {}
  },
  mixins: [
    O3DVue
  ],
  components: {
    TreeItem,
    // Splitpanes,
    // Pane
  },
  data () {
    return {
      spaceAPI: false,
      iframeHeight: 250,
      overlay: '',
      isDirty: false,
      iframe: true,
      unitWebURL: false,
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
    },
    overlay () {
      if (this.overlay !== '') {
        this.$root.escs = this.$root.escs || []
        this.$root.escs.push(() => {
          this.overlay = ''
        })
      }
    }
  },
  created () {
    window.addEventListener('resize', () => {
      let iframe = this.$refs['iframer']
      if (iframe) {
        iframe.contentWindow.dispatchEvent(new Event('resize'))
        iframe.contentWindow.postMessage({ event: 'resize' })
      }
    })
  },
  async mounted () {
    if (this.initTree) {
      let tree = this.initTree
      this.load({ tree })
    } else if (this.win) {
      this.work = this.$core.getWorkByWin({ win: this.win })
      this.works = this.$core.works
      this.arrows = this.$core.arrwos
      let tree = this.work.fileTree
      if (tree) {
        this.load({ tree })
      }
    }
    // this.spaceAPI = this.$store.getState()


    // let tt = 0
    // window.addEventListener('plot', () => {
    //   clearTimeout(tt)
    //   tt = setTimeout(() => {
    //     this.relayout()
    //   }, 10)
    // })
  },
  methods: {
    load ({ tree }) {
      this.tree = tree
      this.currentParent = this.tree.children
      this.current = this.tree.children[0]
      this.onSave()
    },
    checkEnable () {
      if (this.current.path === './') {
        return false
      } else if (this.current.path === './src') {
        return false
      } else if (this.current.path === './share.js') {
        return false
      } else if (this.current.path === './view.js') {
        return false
      } else {
        return true
      }
    },
    onMovePrompt () {
      this.overlay = 'move'
    },
    onMoveConfrim ({ item, parent }) {
      let arr = this.currentParent
      let idx = arr.findIndex(e => e._id === this.current._id)
      if (idx !== -1) {
        arr.splice(idx, 1)
      }
      item.children.push(this.current)

      let movedFolderPath = path.dirname(item.path)
      this.current.path = path.join(movedFolderPath, this.currentNewname)
      this.overlay = ''
    },
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
      let idx = arr.findIndex(e => e._id === this.current._id)
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

      // if (!this.iframe) {
      //   this.$parent.$emit('delta-height', -this.iframeHeight)
      // } else {
      //   this.$parent.$emit('delta-height', this.iframeHeight)
      // }

      window.dispatchEvent(new Event('resize'))
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 10)
    },
    clickItem ({ item, parent }) {
      this.currentParent = parent
      this.current = item
    },
    addItem ({ folder }) {
      // console.log(folder)
      addFile({ folder })
    },
    addFolder ({ folder }) {
      console.log(folder)
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

      let main = {
        name: 'myNewPackageName',
        list: treeToFlat(this.tree)
      }

      let others = ''

      // this.unitWebURL = await makeUnitPreviewIframe({ pack: main, others })

      this.$root.$emit('compile-workbox', { work: this.work })
      this.onRefresh()
    },
    onRefresh () {
      this.$root.$emit('refresh-ui', { work: this.work })
    }
  }
}
</script>

<style>
.tool-overlay{
  background-color: #dededeef;
}

.splitpanes__pane {
  transition: opacity 0.4s;
  box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
  justify-content: center;
  align-items: center;
  display: flex;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 5px;
  background-color: gray;
  /* background: linear-gradient(90deg, #ccc, #111); */
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 5px;
  background-color: gray;
  /* background: linear-gradient(0deg, #ccc, #111); */
}

</style>