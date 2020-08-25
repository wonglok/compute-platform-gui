<template>
  <li class="text-white text-sm list-none">
    <div
      :class="{bold: item.isFolder}"
      class="file-list-item hover:bg-gray-700"
    >
      <span class="mr-3 fiv-viv" :class="{ [`fiv-icon-${ext}`]: true }"></span>
      <span @click="onClickItem(item)">{{ title }}</span>
      <!-- <span class="p-1" @click="toggle">[{{ isOpen ? '-' : '+' }}]</span> -->
      <span class="add p-2 addicon" v-if="item.isFolder" @click="$emit('add-item', { folder: item })">+</span>
    </div>
    <ul class="pl-5 mb-1" v-show="isOpen" v-if="item.isFolder">
      <TreeItem
        class="item"
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
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
    item: Object,
    parent: Array
  },
  created () {
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
      return ex
    },
    isFolder () {
      return !this.item.isFile
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
    onClickItem (item) {
      if (!item.isFolder) {
        this.$emit('click-item', { item })
      }
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
.file-list-item{
  cursor: pointer;
}
.addicon{
  opacity: 0;
}
.file-list-item:hover .addicon{
  opacity: 1;
}
</style>