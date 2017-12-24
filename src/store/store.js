import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import DataSubstitution from '../components/DataSubstitution';

export const store = new Vuex.Store({
  state: {
    headerSubstitution: DataSubstitution.tableHeaders,
    data: [],
    checkedHeaders: [],
    filter: ''
  },
  getters: {
    data(state) {
      return state.data;
    },
    headerSubstitution(state) {
      return state.headerSubstitution;
    },
    tableHeader(state) {
      return Object.keys(state.headerSubstitution);
    },
    tableHeaderTranslated(state) {
      return function (key) {
        return state.headerSubstitution[key];
      }
    },
    checkedHeaders(state) {
      return state.checkedHeaders;
    },
    filteredData(state, getters) {
      let data = getters.data;
      if (getters.filter) {
        data =  getters.data.filter(row => {
          return Object.keys(row).some(key => {
            return String(row[key]).toLowerCase().indexOf(state.filter) > -1;
          })
        });
      }
      return data;
    },
    filter(state) {
      return state.filter;
    }
  },
  mutations: {
    setData(state, payload) {
      state.data = payload;
    },
    setCheckedHeaders(state, payload) {
      state.checkedHeaders = payload;
      localStorage.setItem('setCheckedHeaders', JSON.stringify(payload));
    },
    setFilter(state, payload) {
      state.filter = payload;
    }
  }
});
