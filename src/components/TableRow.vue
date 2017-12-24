<template>
    <tr>
      <th scope="row">{{index}}</th>
      <app-table-cell v-for="(tableCell, key) in tableRow" :tableCell="tableCell" :myKey="key" :key="key" :class="{'table-success': actionStatus === 3, 'table-danger': actionStatus < 0}"></app-table-cell>
    </tr>
</template>

<script>
  import TableCell from './TableCell';

  export default {
    props: ['tableRow', 'index'],
    components: {
      appTableCell: TableCell
    },
    computed: {
      actionStatus() {
        return Number(this.tableRow['Status']);
      }
    },
  }
</script>

<style scoped>

</style>
