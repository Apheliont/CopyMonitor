<template>
  <td v-if="checkedHeaders.includes(myKey)">
    <span v-if="myKey !== 'Data' && myKey !== 'Status'" class="text-nowrap">{{tableCell}}</span>
    <span v-if="myKey === 'Status'" class="text-nowrap">{{tableCell | status}}</span>
    <div v-if="myKey === 'Data' && tableCell" class="progress">
      <div class="progress-bar bg-success progress-bar-striped bar" role="progressbar" :style="{width: tableCell + '%'}"
           :aria-valuenow="{tableCell}" aria-valuemin="0" aria-valuemax="100">{{tableCell}}%
      </div>
    </div>
  </td>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    filters: {
      status(value) {
        if (value === 3) {
          return 'Копируется...';
        }
        if (value < 0) {
          return 'Ошибка';
        }
      }
    },
    props: ['tableCell', 'myKey'],
    computed: {
      ...mapGetters(['checkedHeaders'])
    }
  }
</script>

<style scoped>
  .bar {
    transition-duration: 0.6s;
  }

</style>
