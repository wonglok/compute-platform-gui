<template>
  <li class="text-white text-sm list-none">
    <div
      :class="{'is-folder': isFolder }"
      class="file-list-item hover:bg-gray-700 cursor-pointer"
      v-show="showFolderOnly && isFolder || !showFolderOnly"

      @click="onClickItem(item, parent)"
    >
      <span class="mr-3 ml-1 fiv-viv cursor-pointer" :class="{ [`fiv-icon-${ext}`]: true }" ></span>
      <span class="file-tree-file-item py-1" :class="{ 'cursor-pointer': !isFolder }" @click="onClickItem(item, parent)">{{ title }}</span>
      <!-- <span class="p-1" @click="toggle">[{{ isOpen ? '-' : '+' }}]</span> -->
      <span class="add px-2 addicon cursor-pointer rounded-full border-white border ml-3" v-if="!showFolderOnly && isFolder" @click="$emit('add-item', { folder: item })">+</span>
    </div>
    <ul class="pl-5 mb-1" v-show="isOpen" v-if="isFolder">
      <TreeItem
        class="item"
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :showFolderOnly="showFolderOnly"
        :parent="item.children"
        @click-item="$emit('click-item', $event)"
        @add-item="$emit('add-item', $event)"
      ></TreeItem>
    </ul>
  </li>
</template>

<script>
import path from 'path'
import '../../../../assets/file-icons/file-icon-vivid.min.css'

export default {
  props: {
    showFolderOnly: {
      default: false
    },
    item: Object,
    parent: Array
  },
  created () {
    this.$on('refresh', () => {
      this.$forceUpdate()
    })
    this.$options.components.TreeItem = require('./TreeItem.vue').default
  },
  data () {
    return {
      isOpen: true
    }
  },
  computed: {
    ext () {
      let ex = path.extname(this.item.path).split('.').join('')
      if (ex === 'glsl') {
        ex = 'txt'
      }
      if (ex === 'vert') {
        ex = 'txt'
      }
      if (ex === 'frag') {
        ex = 'txt'
      }
      if (ex === '') {
        ex = 'folder'
      }
      return ex
    },
    isFolder () {
      return this.item.type === 'folder'
    },
    title () {
      let title = path.basename(this.item.path)
      if (title === '.') {
        title = 'root'
      }
      return title
    }
  },
  methods: {
    onClickItem (item, parent) {
      // if (!isFolder) {
      this.$emit('click-item', { item, parent })
      // }
    },
    toggle () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    }
  }
}
</script>

<style>
.addicon{
  opacity: 0;
}
.file-list-item:hover .addicon{
  opacity: 1;
}
</style>