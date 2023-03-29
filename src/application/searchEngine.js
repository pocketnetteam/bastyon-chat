import { _ } from "core-js";
import f from "./functions";

var Process = function(text, chats, parent /* SearchEngine */){
    var self = this

    var timelines = {}
    var events = {}
    var allevents = {}
    var results = {}
    var stopped = false
    var started = 0

    self.id = f.makeid()
    self.text = text
    self.clbks = {}
    self.hash = f.md5(_.map(chats, (c) => {
        return c.roomId
    }).join(''))

    var process = null

    self.destroy = function(){
        stopped = true
        timelines = {}
        events = {}
        results = {}
        self.clbks = {}
        allevents = {}
    }

    self.stop = function(){
        stopped = true
    }

    var processStopped = function(){

        if(performance.now() - started > 45000) return true

        var canexecute = _.find(timelines, (tl) => {
            return !tl.error && !tl.finished
        }) || false

        return !canexecute || stopped || (self.stopcase ? self.stopcase({timelines, events, results}) : false)
    }

    var stepInChats = function(){


        return f.processArray(chats, (e) => {
            //if(processStopped()) return Promise.reject('stopped')

            return stepInChat(e).then(() => {

                if(processStopped()) return Promise.reject('stopped')

            }).catch(e => {

                console.error(e)
                
                if(e == 'stopped'){
                    return Promise.reject(e)
                }

                return Promise.resolve()
            })


        }).then(() => {

            if(processStopped()) return Promise.reject('stopped')

            return stepInChats()
        })
    }

    var stepInChat = function(chat){

        var mChat = parent.mtrx.client.getRoom(chat.roomId)

        if(!mChat){
            tl.error = 'nochat'
            return Promise.reject(tl.error)
        }

        if(!timelines[chat.roomId]){
            timelines[chat.roomId] = {

                line : new parent.mtrx.sdk.TimelineWindow(
                    parent.mtrx.client,
                    mChat.getLiveTimeline().getTimelineSet()
                ),

                loadingPromise : null,
                loaded : false,
                finished : false
            }
                
        }

        var tl = timelines[chat.roomId]

        if (tl.error) return Promise.reject(error)
        if (tl.finished) return Promise.reject('finished')

        return new Promise((resolve, reject) => {

            if (tl.loaded){
                return resolve(null)
            }

            if(!tl.loadingPromise) tl.loadingPromise = tl.line.load().then(() => {
                return parent.mtrx.kit.allchatmembers([mChat], false, true)
                
            }).then((r) => {
                return parent.mtrx.kit.prepareChat(mChat);
            }).then(() => {

                tl.loaded = true

            }).catch(error => {
                tl.error = error
                console.error(error)
                return Promise.reject(error)
            }).finally(() => {
                delete tl.loadingPromise
            })

            if(processStopped()) return reject('stopped')

            return tl.loadingPromise.then().then(() => {
                resolve(true)
            }).catch(reject)

        }).then((first) => {

            if(processStopped()) return Promise.reject('stopped')


            if(!first){

                console.log("tl.line.canPaginate('b')", tl.line.canPaginate('b'), chat.roomId, tl.line._eventCount)

                if(!tl.line.canPaginate('b')){
                    tl.finished = true

                    return Promise.reject('finished')
                }
                else{
                    
                    return tl.line.paginate('b', 80)
                }
            }

            return Promise.resolve()
        }).then(() => {

            if(processStopped()) return Promise.reject('stopped')

            var curallevents = tl.line.getEvents()

            var diff = _.filter(curallevents, (e) => {
                return !_.find(allevents[chat.roomId], (e2) => {
                    return e.event.event_id == e2.event.event_id
                })
            })

            console.log('diff.length', diff.length)

            if (!curallevents.length || (allevents[chat.roomId] && !diff.length)){
                tl.finished = true

                return Promise.reject('finished')
            }

            allevents[chat.roomId] = curallevents

            var curevents = _.filter(curallevents, (e) => {
                return e.event.type == 'm.room.message'
            })

            if(!events[chat.roomId]) events[chat.roomId] = []

            console.log('curevents.length 1', curevents.length)

            curevents = _.filter(curevents, (e) => {
                return !_.find(events[chat.roomId], (e2) => {
                    return e.event.event_id == e2.event.event_id
                })
            })
            console.log('curevents.length 2', curevents.length)


            

            

            events[chat.roomId] = events[chat.roomId].concat(curevents)

            return Promise.resolve(curevents)

            // curevents
        }).then((curevents) => {

            return f.processArray(curevents, (e) => {

                if(processStopped()) return Promise.reject('stopped')

                if (!mChat.pcrypto) return Promise.resolve();

                if (e.event.decrypted) return Promise.resolve();

                var pr = null;
                var subtype = f.deep(e, "event.content.msgtype");

                if (subtype == "m.encrypted") {

                    pr = mChat.pcrypto
                        .decryptEvent(e.event)
                        .then((d) => {
                            e.event.decrypted = d;

                            return Promise.resolve();
                        })
                        .catch((e) => {
                            e.event.decrypted = {
                                msgtype: "m.bad.encrypted",
                            };

                            return Promise.resolve();
                        });
                }

                if (!pr) return Promise.resolve();

                return pr.catch((e) => {
                    return Promise.resolve();
                });

            }).then(() => {
                return Promise.resolve(curevents)
            })

        }).then(curevents => {

            var curresults = searchInEvents(curevents)

            if(!results[chat.roomId]) results[chat.roomId] = []

            results[chat.roomId] = results[chat.roomId].concat(curresults)

            results[chat.roomId] = _.sortBy(results[chat.roomId], (e) => {
                return (e.replacingEventDate() || e.getDate() || Infinity)
            })

            if(!processStopped()) emit()

            return Promise.resolve()

        })

    }

    var searchInEvents = function(curevents){
        return f.clientsearch(text, curevents, (e) => {

            var subtype = f.deep(e, "event.content.msgtype");
            
            if (subtype == 'm.file'){
                try{
                    var parsed = JSON.parse(e.event.content.body || "{}") || {}

                    return parsed.name || ""

                }catch(e){

                }
                
            }

            return (((e.event.decrypted || e.event.content) || {}).body || "").toLowerCase()
        })
    }

    var emit = function(){
       
        _.each(self.clbks, (c) => {
            c({
                id : self.id, text, results
            })
        })
    }

    self.execute = function(){

        if(process) return process

        emit()

        started = performance.now()

        process = stepInChats().catch(e => {
            console.error(e)
        }).finally(() => {
            process = null
        })

        return process
    }

    self.updateText = function(_txt){
        text = _txt

        results = {}

        _.each(events, (es, id) => {
            results[id] = searchInEvents(es)
        })

        console.log('results', results)

        emit()
    }

    return self
}

var SearchEngine = function (mtrx) {
    var self = this
    var processes = {}

    self.execute = function(text = '', chats, stopcase, clbks = {}){

        text = text.toLowerCase()

        var hash = f.md5(_.map(chats, (c) => {
            return c.roomId
        }).join(''))

        var lpr = _.find(processes, (process) => {
            return process.text == text && process.hash == hash
        })

        if (lpr) {
            lpr.stopcase = stopcase
            lpr.clbks = clbks
            return lpr
        }

        var process = new Process(text, chats, self)

        process.clbks = clbks

        /*process.clbks['vuex'] = (data) =>{
            mtrx.core.store.commit(
                "SEARCH_BY_MESSAGES",
                data
            );
        }*/

        process.stopcase = stopcase

        processes[process.id] = process

        return process
    }

    self.getprocess = function(id){
        return processes[id]
    }

    self.stopall = function(){
        console.log('stopall')
        _.each(processes, (process) => {
            process.stop()
        })
    }

    self.destroy = function(){
        _.each(processes, (process) => {
            process.destroy()
        })

        processes = {}
    }

    self.mtrx = mtrx

    return self
}

export default SearchEngine