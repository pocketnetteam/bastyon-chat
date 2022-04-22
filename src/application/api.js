import f from './functions'
import Axios from './axios'
var { error } = require('./error')

import ChatStorage from "./chatstorage";

var ApiWrapper = function (core) {

	var self = this;
	var a = new Axios();

	var cache = {}
	var loading = {}
	var storages = {}

	var apis = {
		pocketnet : null
	}

	var ep = function(){
		return Promise.resolve()
	}

	var getstorage = function(p){

		if(!storages[p.storage]){
			return ChatStorage(p.storage, p.version || 1, p.time).then(storage => {

				storages[p.storage] = storage

				return Promise.resolve(storage)
			})
		}

		return Promise.resolve(storages[p.storage])
	}

	
	var scasheAct = function (ids, key, resultsKey, reload, storageparameters) {

		if (!_.isArray(ids)) ids = [ids]

		var waitLoading = {}

		if(!resultsKey) 
			resultsKey = key

		if(!cache[key]) {
			cache[key] = {}
		}

		if(!loading[key]) {
			loading[key] = {}
		}

		return (storageparameters ? getstorage(storageparameters) : ep()).then(storage => {

			if (storage){

				return Promise.all(_.map(ids, (id) => {

					if (cache[key][id]){
						return Promise.resolve()
					}

					return storage.get(id).then((stored) => {
						cache[key][stored[resultsKey]] = stored

						return Promise.resolve()
					}).catch(e => {
						return Promise.resolve()
					})

				}))

			}

			return Promise.resolve()

			
		}).then(r => {

			var idtoloadPrev = _.uniq(_.filter(ids, function (id) {
				return reload || !cache[key][id] || cache[key][id].nocache
			}))
	
			var idtoload = _.filter(idtoloadPrev, function (id) {
	
				if(!loading[key][id]) {
					loading[key][id] = true
					return true
				}
	
				waitLoading[id] = true
			})
	
			var handleResults = function (result, _ids) {

				return (storageparameters ? getstorage(storageparameters) : ep()).then(storage => {
					
					if(storage){
						return Promise.all(_.map(result, (row) => {

							if(!row[resultsKey]){
								return Promise.resolve()
							}

							return storage.set(row[resultsKey], row)

						}))
					}

					return Promise.resolve()
					
				}).then(() => {

					_.each(result, function (row) {

						if (row[resultsKey]) {
							cache[key][row[resultsKey]] = row
						}
	
					})
		
					_.each(_ids, function(id){
						delete loading[key][id]
						delete waitLoading[id]
		
						if(!cache[key][id])
							cache[key][id] = 'error'
					})
		
					var nresult = {};
		
					return f.pretry(() => {
		
						_.each(ids, function (id) {
		
							if (cache[key][id]) {
		
								if (cache[key][id] != 'error')
		
									nresult[id] = (cache[key][id])
		
								delete loading[key][id]
								delete waitLoading[id]
							}
		
						})
		
						return _.toArray(waitLoading).length == 0
		
					}).then(() => {
						return Promise.resolve(nresult)
					})

				})
	
				
	
			}
	
			return Promise.resolve({
				id: idtoload,
				handle: handleResults
			})
		})


		
		
	}

	var waitonline = function () {

		if (!core || !core.waitonline) {
			return Promise.resolve()
		}

		return core.waitonline()

	}

	var crequest = function (ids, key, rkey, reload, storageparameters) {

		return scasheAct(ids, key, rkey, reload, storageparameters).then(sh => {

			if (!sh.id.length) {
				return sh.handle([])
			}
	
			return Promise.reject(sh)

		})

		
	}

	var request = function (data, to) {

		return waitonline().then(() => {

			data || (data = {})

			return a.axios({
				to,
				data,
			}).then(r => {

				return Promise.resolve(r)

			})
				.catch(e => {

					if (e == 'noresponse') {

						return new Promise((resolve, reject) => {

							setTimeout(function () {
								request(data, to).then(r => {


									return resolve(r)

								}).catch(e => {

									return reject(e)

								})

							}, 3000)
						})

					}

					return Promise.reject(e)

				})


		})


	}

	self.clearCache = function (key) {

		if (!key) {
			cache = {}
		} else {
			delete cache[key]
		}
	}

	self.pocketnet = {

		common: (data, method) => {

			if(!data) data = {}

			if(!apis.pocketnet)
				apis.pocketnet = f.deep(window, 'POCKETNETINSTANCE.api')
				
			if(!apis.pocketnet && typeof Api != 'undefined'){
				apis.pocketnet = new Api(core)
			}	
				
			if (apis.pocketnet) {

				return apis.pocketnet.initIf().then(() => {
					return apis.pocketnet.wait.ready('use', 3000)
					
				}).then(r => {
					return apis.pocketnet.rpc(method, data.parameters)
				}).catch(e => {

					return {
						error : e
					}

					
				})
				
			}

			data.method = method
			data.node = '185.148.147.15'
			data.parameters = f.hexEncode(JSON.stringify(data.parameters || ""))

			return request(data, servers.pocketnet + '/rpc-' + (method || "common"))

		},
		
		userState: (addresses) => {

			if (!_.isArray(addresses)) addresses = [addresses]

			var parameters = [addresses.join(',')];

			return self.pocketnet.common({ parameters }, 'getuserstate')
		},

		search: (text) => {

			var parameters = [text, 'users'];

			return self.pocketnet.common({ parameters }, 'search').then(data => {
				return Promise.resolve(data.users?.data || [])
			})
		},

		userInfo: (addresses, reload) => {

			return crequest(addresses, 'pocketnet_userInfo', 'address', reload, {
				storage : 'userInfo',
				time : 60 * 60 * 24 
			}).catch(sh => {

				if(!sh || !sh.id) {
					return Promise.reject(sh)
				}

				var parameters = [sh.id, '1'];

				return self.pocketnet.common({ parameters }, 'getuserprofile').then(results => {

					return sh.handle(results, sh.id)

				})
			})
		},

		postInfo: (params) => {

			var parameters = [[params.parameters]]

			return self.pocketnet.common({ parameters }, 'getrawtransactionwithmessagebyid').then(results => {

				return Promise.resolve(results)

			})
		},

		pocketNetProfileAddress: (profile_name) => {

			var parameters = [[profile_name.parameters]]

			return self.pocketnet.common({ parameters }, 'getuseraddress').then(results => {

				return Promise.resolve(results)

			})
		},

		pocketNetProfileInfo: (profile_address) => {

			var parameters = [[profile_address.parameters]]

			return self.pocketnet.common({ parameters }, 'getuserprofile').then(results => {

				return Promise.resolve(results)

			})
		},


	}

	return self;
}

export default ApiWrapper

