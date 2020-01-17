import Vue from 'vue'
import Vuex from 'vuex'
import { Cookies } from 'quasar'
import { http } from '../boot/axios'
import listCodes from '../utils/commonCodes'

Vue.use(Vuex)

export default function ({ ssrContext }) {
  const Store = new Vuex.Store({
    state: {
      user: null,
      version: process.env.VERSION,
      apisList: null,
      tag: {
        id: ''
      },
      path: {
        id: ''
      },
      response: {
        id: ''
      },
      apiData: {},
      tagIndex: null,
      pathIndex: null,
      responseIndex: null,
      rulesId: null,
      typeMethods: [
        {
          label: 'Get',
          value: 'GET'
        },
        {
          label: 'Post',
          value: 'POST'
        },
        {
          label: 'Put',
          value: 'PUT'
        },
        {
          label: 'Delete',
          value: 'DELETE'
        }
      ],
      typeCodes: listCodes
    },
    getters: {
      getUser: state => {
        return state.user
      },
      getApiData (state) {
        return state.apiData
      },
      getVersion (state) {
        return state.version
      },
      getTypeMethods (state) {
        return state.typeMethods
      },
      getTypeCodes (state) {
        return state.typeCodes
      },
      getTag (state) {
        return state.tag
      },
      getPath (state) {
        return state.path
      },
      getResponse (state) {
        return state.response
      },
      getTagIndex (state) {
        return state.tagIndex
      },
      getPathIndex (state) {
        return state.pathIndex
      },
      getRulesId (state) {
        return state.rulesId
      }
    },
    mutations: {
      async boot (state) {
        const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies // otherwise we're on client
        const user = await cookies.get('user')
  
        if (user !== undefined) {
          state.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            headers: user.headers
          }
        } else {
          state.user = {
            id: null,
            email: 'email@email.com',
            name: 'Nothing',
            headers: {
              auth: 'nothing nothing'
            }
          }
        }
      },
      async setApiData (state, id) {
        try {
          if (id[1] === 'DocView') {
            const result = await http.get(`api/api/getapiandendpoints/${id[0]}`, { headers: state.user.headers })
            state.apiData = await result.data
          }
          if (id[1] === 'DocViewTeam') {
            state.rulesId = id[0]
            const result = await http.get(`api/teamdocs/api/getapiandendpoints/${id[0]}`, { headers: state.user.headers })
            state.apiData = await result.data
          }
          if (id[1] === 'DocViewPublic') {
            const result = await http.get(`api/geral/getapiandtags/${id[0]}`, { headers: state.user.headers })
            state.apiData = await result.data
          }
        } catch (error) {
          console.log(error.response.data.error)
        }
      },
      async setPathsByTagIndex (state, tag) {
        if (tag[1] === 'DocView') {
          try {
            const result = await http.get(`api/api/getverbsandcodes/${tag[0]}`, { headers: state.user.headers })
            Vue.set(state.apiData.tags[state.tagIndex], 'paths', await result.data)
          } catch (error) {
            console.log(error.response.data.error)
          }
        }
        if (tag[1] === 'DocViewTeam') {
          try {
            const result = await http.get(`api/teamdocs/api/getverbsandcodes/${state.rulesId}/${tag[0]}`, { headers: state.user.headers })
            Vue.set(state.apiData.tags[state.tagIndex], 'paths', await result.data)
          } catch (error) {
            console.log(error.response.data.error)
          }
        }
        if (tag[1] === 'DocViewPublic') {
          try {
            const result = await http.get(`api/geral/getpathsandresponses/${tag[0]}`, { headers: state.user.headers })
            Vue.set(state.apiData.tags[state.tagIndex], 'paths', await result.data)
          } catch (error) {
            console.log(error.response.data.error)
          }
        }
      },
      setResponseTest (state, response) {
        const _ = state
        Vue.set(_.apiData.tags[_.tagIndex].paths[_.pathIndex], 'response', response)
      },
      setTag (state, tag) {
        state.tag = tag
      },
      setPath (state, path) {
        state.path = path
      },
      setResponse (state, response) {
        state.response = response
      },
      setTagIndex (state, tagIndex) {
        state.tagIndex = tagIndex
      },
      setPathIndex (state, pathIndex) {
        state.pathIndex = pathIndex
      },
      setResponseIndex (state, responseIndex) {
        state.responseIndex = responseIndex
      },
      setNewTag (state, tag) {
        let index
        if (state.apiData.tags === undefined) {
          index = 0
          Vue.set(state.apiData, 'tags', tag)
        } else {
          index = state.apiData.tags.length
          Vue.set(state.apiData.tags, index, tag[0])
        }
      },
      setNewPath (state, newPath) {
        let index
        if (state.apiData.tags[state.tagIndex].paths === undefined) {
          index = 0
          Vue.set(state.apiData.tags[state.tagIndex], 'paths', newPath)
        } else {
          index = state.apiData.tags[state.tagIndex].paths.length
          Vue.set(state.apiData.tags[state.tagIndex].paths, index, newPath[0])
        }
      },
      setNewResponse (state, newResponse) {
        let index
        if (state.apiData.tags[state.tagIndex].paths[state.pathIndex].responses === undefined) {
          index = 0
          Vue.set(state.apiData.tags[state.tagIndex].paths[state.pathIndex], 'responses', newResponse)
        } else {
          index = state.apiData.tags[state.tagIndex].paths[state.pathIndex].responses.length
          Vue.set(state.apiData.tags[state.tagIndex].paths[state.pathIndex].responses, index, newResponse[0])
        }
      },
      removeTag (state) {
        Vue.delete(state.apiData.tags, state.tagIndex)
      },
      removePath (state) {
        Vue.delete(state.apiData.tags[state.tagIndex].paths, state.pathIndex)
      },
      removeResponse (state) {
        Vue.delete(state.apiData.tags[state.tagIndex].paths[state.pathIndex].responses, state.responseIndex)
      }
    },
    actions: {
      boot ({ commit }) {
        commit('boot')
      },
      setApiData ({ commit }, id) {
        commit('setApiData', id)
      },
      setPathsByTagIndex ({ commit }, tag) {
        commit('setPathsByTagIndex', tag)
      },
      setResponseTest ({ commit }, response) {
        commit('setResponseTest', response)
      },
      setTag ({ commit }, tag) {
        commit('setTag', tag)
      },
      setPath ({ commit }, path) {
        commit('setPath', path)
      },
      setResponse ({ commit }, response) {
        commit('setResponse', response)
      },
      setTagIndex ({ commit }, tagIndex) {
        commit('setTagIndex', tagIndex)
      },
      setPathIndex ({ commit }, pathIndex) {
        commit('setPathIndex', pathIndex)
      },
      setResponseIndex ({ commit }, responseIndex) {
        commit('setResponseIndex', responseIndex)
      },
      setNewTag ({ commit }, tag) {
        commit('setNewTag', tag)
      },
      setNewPath ({ commit }, path) {
        commit('setNewPath', path)
      },
      setNewResponse ({ commit }, response) {
        commit('setNewResponse', response)
      },
      removeTag ({ commit }) {
        commit('removeTag')
      },
      removePath ({ commit }) {
        commit('removePath')
      },
      removeResponse ({ commit }) {
        commit('removeResponse')
      }
    }
  })
  return Store
}
