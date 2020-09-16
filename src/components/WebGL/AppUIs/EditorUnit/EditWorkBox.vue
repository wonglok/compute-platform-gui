<template>
  <div class="full">

    <component class="full" ref="dynamo" :deps="deps" :vm="vm" :work="work" :works="works" :arrows="arrows" :core="core" v-if="dynamo" :is="dynamo"></component>

    <!-- {{ work }} -->
  </div>
</template>

<script>
import { CoreShell } from '../EditorWorks/RunCore'
import * as THREE from 'three'
export default {
  mixins: [
  ],
  props: {
    work: {},
    core: {},
    works: {},
    arrows: {}
  },
  data () {
    return {
      deps: {
        THREE
      },
      vm: this,
      dynamo: false
    }
  },
  methods: {
    async getVueFromWork ({ work }) {
      new CoreShell({ work, $vm: this })
    }
  },
  mounted () {
    this.getVueFromWork({ work: this.work })
  }
}
</script>

<style>

</style>