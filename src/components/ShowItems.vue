<template>
  <div>
    <app-search></app-search>
    <table class="table table-striped table-bordered table-hover table-sm table-responsive-md">
      <thead class="thead-dark">
      <tr @contextmenu="openMenu">
        <th scope="col" class="hashTag">#</th>
        <app-table-header v-for="(header, index) in tableHeader" :header="header" :key="index"
                          :class="{hideColumn: isColumnHidden(header)}">
        </app-table-header>
      </tr>
      </thead>
      <transition-group name="tableRow" tag="tbody"
                        @before-enter="beforeEnter"
                        @enter="enter"
                        @leave="leave">
        <app-table-row v-for="(tableRow, index) in filteredData" :tableRow="tableRow" :index="index" :key="index">
        </app-table-row>
      </transition-group>
    </table>
    <ul class="right-click-menu" tabindex="-1" ref="contextMenu" v-if="viewMenu" @focusout="closeMenu"
        :style="{top:top, left:left}">
      <li v-for="(item, index) in tableHeader">
        <input type="checkbox" :id="index" :value="item" v-model="checkedHeaders"><label :for="index">{{tableHeaderTranslated(item)}}</label>
      </li>
    </ul>
  </div>
</template>

<script>
  import TableRow from './TableRow';
  import TableHeader from './TableHeader';
  import Search from './Search';
  import Velocity from '../libs/velocity.min';
  import {mapGetters} from 'vuex';
  import {mapMutations} from 'vuex';

  export default {
    components: {
      appTableRow: TableRow,
      appTableHeader: TableHeader,
      appSearch: Search
    },
    data() {
      return {
        viewMenu: false,
        top: '0px',
        left: '0px',
      }
    },
    sockets: {
      newData(data) {
        this.$store.commit('setData', data);
      }
    },
    created() {
      const savedData = localStorage.getItem('setCheckedHeaders');
      if (savedData) {
        this.$store.commit('setCheckedHeaders', JSON.parse(savedData));
      } else {
        this.$store.commit('setCheckedHeaders', this.$store.getters.tableHeader);
      }
    },
    computed: {
      ...mapGetters(['data', 'headerSubstitution', 'tableHeader', 'tableHeaderTranslated', 'filteredData']),
      checkedHeaders: {
        get() {
          return this.$store.getters.checkedHeaders;
        },
        set(value) {
          this.$store.commit('setCheckedHeaders', value);
        }
      }
    },
    methods: {
      ...mapMutations(['setData', 'setCheckedHeaders']),
      setMenu(top, left) {
        const largestHeight = window.innerHeight - this.$refs.contextMenu.offsetHeight - 25;
        const largestWidth = window.innerWidth - this.$refs.contextMenu.offsetWidth - 25;

        if (top > largestHeight) top = largestHeight;

        if (left > largestWidth) left = largestWidth;

        this.top = top + 'px';
        this.left = left + 'px';
      },

      closeMenu(e) {
        if (!this.$refs.contextMenu.contains(e.relatedTarget)) {
          this.viewMenu = false;
        }
      },

      openMenu(e) {
        this.viewMenu = true;
        this.$nextTick(function () {
          this.$refs.contextMenu.focus();
          this.setMenu(e.y, e.x)
        });
        e.preventDefault();
      },

      isColumnHidden(index) {
        return !this.checkedHeaders.includes(index);
      },

      beforeEnter: function (el) {
        el.style.opacity = 0;
        el.style.height = 0;
      },
      enter: function (el, done) {
        const delay = el.dataset.index * 50;
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 1, height: '1.6em' },
            { complete: done }
          )
        }, delay)
      },
      leave: function (el, done) {
        const delay = el.dataset.index * 50;
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 0, height: 0 },
            { complete: done }
          )
        }, delay)
      }
    }
  }
</script>

<style scoped>

  .right-click-menu {
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 250px;
    z-index: 999999;
  }

  .right-click-menu li {
    border-bottom: 1px solid #E0E0E0;
    margin: 0;
    padding: 5px 15px;
  }

  .right-click-menu input[type="checkbox"] {
    margin-right: 10px;
  }

  .right-click-menu li:hover {
    background: #dcdcdc;
  }

  .hideColumn {
    display: none;
  }

  /*.tableRow-enter {*/
    /*opacity: 0;*/
    /*transform: translateY(20px);*/
  /*}*/

  /*.tableRow-enter-active {*/
    /*transition-duration: 0.4s;*/
  /*}*/

  /*.tableRow-leave {*/

  /*}*/

  /*.tableRow-leave-to {*/
    /*transform: translateY(-20px);*/
    /*opacity: 0;*/
    /*transition-duration: 0.4s;*/
    /*position: absolute;*/
  /*}*/

  .hashTag {
    padding: 8px 10px;
  }
</style>
