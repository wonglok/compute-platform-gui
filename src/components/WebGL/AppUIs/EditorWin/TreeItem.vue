<template>
  <li class="text-white text-sm">
    <div
      :class="{bold: isFolder}"
    >
      <span class="fiv-viv mr-1" :class="{ [`fiv-icon-${ext}`]: true }"></span>
      <span @click="$emit('click-item', { item })">{{ title }}</span>
      <span class="p-1" v-if="isFolder" @click="toggle">[{{ isOpen ? '-' : '+' }}]</span>
    </div>
    <ul class="pl-5" v-show="isOpen" v-if="isFolder">
      <li class="add" @click="$emit('add-item', { item, parent })">+</li>
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
    toggle () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    }
  }
}
</script>

<style>

</style>