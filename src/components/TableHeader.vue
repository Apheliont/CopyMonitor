<template>
  <th scope="col" class="header text-nowrap" :class="{'fixedWidth': header === 'Data'}">{{tableHeaderTranslated(header)}}</th>
</template>

<script>
    import { mapGetters } from 'vuex';
    export default {
      props: ['header'],
      computed: {
        ...mapGetters(['tableHeaderTranslated'])
      }
    }
</script>

<style scoped>
.header {
  padding: 8px 20px;
}

  .fixedWidth {
    min-width: 100px;
  }
</style>
