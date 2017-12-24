<template>
    <div>
      <input type="text" class="search form-control" placeholder="Искать..." v-model="filterValue">
    </div>
</template>

<script>
    export default {
        computed: {
          filterValue: {
            get() {
              return this.$store.getters.filter;
            },
            set(value) {
              this.$store.commit('setFilter', value.toLowerCase());
            }
          }
        }
    }
</script>

<style scoped>
.search {
  margin: 5px 35px;
  width: 400px;
  outline: none;
  box-shadow:none !important;
  border:1px solid #ccc !important;
}
</style>
