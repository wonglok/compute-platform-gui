<template>
  <div class="h-full w-full">
    <div class="w-full" style="height: 56px;">
      <DocsNav :suspendRender="showMenu" @menu-toggle="showMenu = !showMenu"></DocsNav>
    </div>
    <div class="w-full flex" style="height: calc(100% - 56px);">
      <div class="docs-menu">
        <DocsMenuList></DocsMenuList>
      </div>
      <div class="docs-content">
        <router-view></router-view>
      </div>
    </div>
    <div class="absolute top-0 left-0 w-full h-full" v-if="showMenu">
      <DocsMenu :suspendRender="!showMenu" class="w-full h-full" @menu-toggle="showMenu = !showMenu"></DocsMenu>
    </div>
  </div>
</template>

<script>
import { O3DVue } from '../../Core/O3DVue'
export default {
  mixins: [
    O3DVue
  ],
  data () {
    return {
      showMenu: false
    }
  }
}
</script>

<style lang="postcss">
.docs-menu{
  @apply hidden;
}
.docs-content{
  width: 100%;
  height: 100%;
  background-color: #dedede;
}
@screen lg {
  .docs-menu{
    @apply block;
    width: 270px;
  }
  .docs-content{
    width: calc(100% - 270px);
  }
}
</style>