import { _ } from "core-js";
import f from "./functions";

var Process = function(text, chats, parent /* SearchEngine */){
    var self = this

    var timelines = {}
    var events = {}
    var results = {}
    var stopped = false

    self.id = f.makeid()
    self.text = text
    self.clbks = {}

    var process = null

    self.destroy = function(){
        stopped = true
        timelines = {}
        events = {}
        results = {}
        self.clbks = {}
    }

    self.stop = function(){
        stopped = true
    }

    var processStopped = function(){

        var canexecute = _.find(timelines, (tl) => {
            return !tl.error && !tl.finished
        }) || false

        return !canexecute || stopped || self.stopcase ? self.stopcase({timelines, events, results}) : false
    }

    var stepInChats = function(){

        console.log("chats", chats)

        return f.processArray(chats, (e) => {
            console.log("CHAT", e)
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
        })
    }

    var stepInChat = function(chat){

        console.log("CHAT", chat)

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

            if(tl.loaded){
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
                if(this.timeline.canPaginate('b')){
                    tl.finished = true

                    return Promise.reject('finished')
                }
                else{
                    return tl.line.paginate('b', 20)
                }
            }

            return Promise.resolve()
        }).then(() => {

            if(processStopped()) return Promise.reject('stopped')

            var curevents = _.filter(tl.line.getEvents(), (e) => {
                return e.event.type == 'm.room.message'
            })

            if(!events[chat.roomId]) events[chat.roomId] = []

            curevents = _.filter(curevents, (e) => {
                return !_.find(events[chat.roomId], (e2) => {
                    return e.event.event_id != e2.event.event_id
                })
            })

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

            console.log("TEXT2", curresults)

            if(!results[chat.roomId]) results[chat.roomId] = []

            results[chat.roomId] = results[chat.roomId].concat(curresults)

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

            console.log("TEXT", (((e.event.decrypted || e.event.content) || {}).body || "").toLowerCase())

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

        process = stepInChats().finally(() => {
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

        emit()
    }

    return self
}

var SearchEngine = function (mtrx) {
    var self = this
    var processes = {}

    self.execute = function(text = '', chats, stopcase, clbks = {}){

        text = text.toLowerCase()

        var lpr = _.find(processes, (process) => {
            return process.text == text
        })

        if (lpr) {
            lpr.stopcase = stopcase
            return lpr
        }

        var process = new Process(text, chats, self)

        console.log('clbks', clbks)

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