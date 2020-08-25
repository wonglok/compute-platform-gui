<template>
  <div class="full " :class="{ ' p-3 neu-bg py-6': neu }">
    <router-link :to="link.path" v-for="link in links" :key="link.path">
      <div class="px-3 py-2 mx-6font-light "  @click="$emit('menu-toggle')" :class="{ 'text-gray-600  mb-6 text-center neu-sm rounded-full bg-gray-100': neu }">
        {{ link.name }}
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    neu: {
      default: true
    }
  },
  data () {
    return {
      links: require('./MenuListData.js').MenuListData
    }
  }
}
</script>

<style>

</style>