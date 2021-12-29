

import MTRX from "./mtrx.js";
import Notifier from "./notifier.js";
import PNUser from "./user/pnuser.js";
import ApiWrapper from "./api.js";
import Pcrypto from "./pcrypto.js";
import listeners from './listeners'
import f from './functions'

class Core {
    constructor(vm, p){
        if(!p) p = {}

        this.options = {
            listofproxies : p.listofproxies
        }

        if(!p.mtrx) p.mtrx = {}
            p.mtrx.baseUrl = 'http://' + p.domain

        if (p.mtrx.baseUrl == 'https://vamily.ru'){

           /* p.mtrx.baseUrl = 'http://vamily.ru:5009'
            p.domain = 'vamily.ru:5009'*/

            this.options.burn = {
                v : 'minutes',
                w : 120,
                m : 30,
                b : 15
            }
        }
        else{
            this.options.burn = {
                v : 'days',
                w : 7,
                m : 2,
                b : 1
            }
        }

        

        this.apiHandlers = {
            error : function(){},
            success : function(){}
        }

        this.domain = p.domain

        this.vm = vm
        this.mtrx = new MTRX(this, p.mtrx)
        this.user = new PNUser(this, p.user || {})
        this.notifier = new Notifier(this, p.notifier || {})
        this.pcrypto = new Pcrypto(this, p.pcrypto || {})
        this.api = new ApiWrapper(this, p.servers)

        this.onlineListener = new listeners.online(this)
        this.focusListener = new listeners.focus(this)
        this.online = true
        this.focus = true
        this.store = vm.$store
        this.loading = true

        this.external = {}
        this.hiddenInParent = false

        this.pcrypto.init(this.user)

    }

    hideInParent = function(v){
        this.hiddenInParent = v
        this.store.commit('hiddenInParent', v)
    }

    canback = function(){
        return this.store.state.gallery ? false : true
    }

    update = function({block}){

        this.pcrypto.set.block(block)
    }

    destroy = function(){
        this.store.commit('clearall')
        this.removeEvents()

        if(!this.vm.$route.name != 'chats')
            this.vm.$router.push('/chats')

        this.user.destroy()
        this.mtrx.destroy()
        this.pcrypto.destroy()

        if (window.POCKETNETINSTANCE){
            window.POCKETNETINSTANCE.platform.matrixchat.unlink(this)
        }

        this.vm.$destroy();

    }

    init = function(){
        
        this.focusListener.init()
        this.onlineListener.init()

        this.initEvents()

        if (window.POCKETNETINSTANCE){
            window.POCKETNETINSTANCE.platform.matrixchat.link(this)
        }
    }

    

    setUnauthorized = function(v){
        this.unauthorized = v
        this.store.commit('SET_UNAUTHORIZED', v)
    }

    initWithUserBase = function(){

        this.loading = true

        return this.user.checkCredentials().then(state => {

            return this.user.userInfo(true)

        }).then(r => {

            if(!r){
                return Promise.reject('unknown')
            }

            return this.mtrx.init()

        }).then(r => {
            this.loading = false
            this.setUnauthorized(null)

            
            var r = this.pcrypto.helpers.checkuser()

            if (f.deep(this.user,'userinfo.name'))
                this.mtrx.client.setDisplayName(f.deep(this.user,'userinfo.name'))

            return Promise.resolve()

        }).catch(e => {

            console.error(e)
            
            this.loading = false

            if(e == 'unauthorized' || e == 'unknown'){
                this.setUnauthorized(e)
            }

            return Promise.resolve()

        })
    }

    initWithUser = function(credentials){


        this.user.setCredentials(credentials)

        return this.initWithUserBase().then(() => {
            return this.user.initKeysProcess()
        }).catch(e => {
            return Promise.resolve()
        })

    }

    waitonline = function(){

        if(this.online) return Promise.resolve()

        return new Promise((resolve, reject) => {

            f.retry(() => {
                return this.online;
            }, function () {

                resolve()

            }, 5)

        })


    }

    removeEvents = function(){
        delete this.focusListener.clbks.resume.core
        delete this.focusListener.clbks.pause.core
        delete this.onlineListener.clbks.online.core
        delete this.onlineListener.clbks.offline.core
    }

    initEvents = function(){
        this.focusListener.clbks.resume.core = (time) => {

            this.focus = this.focusListener.focus

            if(time > 60){
            }
        }

        this.focusListener.clbks.pause.core = () => {
            this.focus = this.focusListener.focus
        }

        this.onlineListener.clbks.online.core = (time) => {
            this.online = this.onlineListener.online
        }

        this.onlineListener.clbks.offline.core = () => {
            this.online = this.onlineListener.online
        }
    }

    externalLink = function(pobj){
        this.external = pobj

    }

    destroyExternalLink = function(){
        this.external = {}
    }

    currentTime = function () {
        var created = Math.floor((new Date().getTime()) / 1000)

        if (this.timeDifference) {
            created += this.timeDifference
        }

        return created;
    }

    wait = function(){
        return f.pretry(() => {
			return !this.loading
		}).then(() => {

			return Promise.resolve()

		})
    }

    joinRoom(roomid){
        return this.wait().then(() => {

            return this.mtrx.wait()

        }).then(() => {

            if (this.unauthorized){

                this.store.commit('JOINROOM', roomid)
                
                return Promise.reject(this.unauthorized)
            }

            return Promise.resolve()

        }).then(info => {

            if (this.store.state.chatsMap[roomid]){
                /// old chat
                this.vm.$router.push('/chat?id=' + roomid)
            }
            else
            {
                this.store.commit('JOINROOM', roomid)
                this.vm.$router.push('/publicPreview?id=' + roomid)
            }

            return Promise.resolve()
        })
    }

    connect(address){

        return this.wait().then(() => {

            return this.mtrx.wait()

        }).then(() => {

            if (this.unauthorized){

                this.store.commit('CONNECT', f.hexEncode(address))
                
                return Promise.reject(this.unauthorized)
            }

            else{
                return this.user.usersInfo([address], true)
            }

        }).then(info => {

            var roomId = this.mtrx.kit.tetatetid(info[0], this.user.userinfo)

            if(!roomId) return Promise.reject(e)

            if (this.store.state.chatsMap[roomId]){
                /// old chat
                this.vm.$router.push('/chat?id=' + roomId)
            }
            else
            {
                this.store.commit('CONTACT', roomId)
                this.vm.$router.push('/chat?id=' + roomId + '&u=' + f.hexEncode(address))
            }

            return Promise.resolve()
        })
    }

    cancelshare(){
        this.store.commit('SHARE', null)

        return Promise.resolve()
    }

    share(share){
		this.store.commit('SHARE', share)

        this.vm.$router.push('/chats')

        return Promise.resolve()
	}

    goto(roomId){

        this.cancelDefaultRoute = true;

        this.mtrx.wait().then(() => {
            this.vm.$router.push('/chat?id=' + roomId);
        });
    }

    gotoRoute(route){

        this.cancelDefaultRoute = true;

        this.mtrx.wait().then(() => {
            this.vm.$router.push(route);
        });
    }

    updateUser(){
        
        return this.user.userInfo(true).then(r => {

            /*if (this.unauthorized){
                return this.initWithUserBase()
            }*/
            
        })
    }

    isactive(){
        return this.vm.$store.state.minimized && this.vm.$store.state.active && this.vm.$store.state.pocketnet
    }   

    sitemessage(title){

        var position = "bottom-right";

        if (this.vm.$store.state.mobile){
            position = 'top-left'
        }
            
        this.vm.$message({
            title: title,
            zIndex: 999,
            supportHTML: true,
            wrapperClassName: "notificationWrapper",
            position: position,
            type: 'info',
            duration : 2000
          })
    }

    menu(v){

        this.store.commit('SET_MENU', v ? {
			items : v.items,
			item : v.item,
            handler : v.handler
		} : null)
    }

    invitepnt(){

        var ui = f.deep(this, 'user.userinfo.source')

        if(ui){

            if (window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.platform){
                
                if(this.backtoapp) this.backtoapp()

                window.POCKETNETINSTANCE.platform.ui.socialshare('welcome?connect=' + ui.address, {
                    sharing : {
                        image : '',
                        images : [ui.i],
                        title : this.vm.$i18n.t("caption.joinApp"),
                        html : {
                            body : this.vm.$i18n.t("caption.joinApp") + ' ' + this.vm.$i18n.t("caption.hasInvitedToJoin"),
                            preview : this.vm.$i18n.t("caption.joinApp") + ' ' + this.vm.$i18n.t("caption.hasInvitedToJoin")
                        },
            
                        text : {
                            body : this.vm.$i18n.t("caption.joinApp") + ' ' + this.vm.$i18n.t("caption.hasInvitedToJoin"),
                            preview : this.vm.$i18n.t("caption.joinApp") + ' ' + this.vm.$i18n.t("caption.hasInvitedToJoin")
                        }
                    
                    },
                    embedding : {
                        type : 'connect',
                        id : ui.address
                    }
                })

            }
            else{
                var l = 'https://bastyon.com/welcome?connect=' + ui.address

                f.copytext(l)

                this.sitemessage('The link was copied successfully')
            }

        }

        else{
            this.sitemessage('The error was occuried')
        }

            
    }

}

export default Core
