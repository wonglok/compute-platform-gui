<template>
  <div class="full">
    <div ref="box" class="full"></div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
export default {
  props: {
    path: {},
    src: {},
  },
  mounted () {
    monaco.editor.create(this.$refs['box'], {
      value: "function hello() {\n\talert('Hello world!');\n}",
      language: 'js',
      theme: 'vs-dark'
    });
  }
}
</script>

<style>

</style>