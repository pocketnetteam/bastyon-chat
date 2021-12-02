import f from './functions'

var FocusListener = function (platform) {

    var self = this;
    var inited = false;
    var unfocustime = null;

    self.focus = true;
    self.clbks = {
        resume : {},
        pause : {}
    }

    window.focus();

    var resume = function (e, resume) {

        var focustime = platform.currentTime()
        var time = focustime - (unfocustime || focustime)

        self.focus = true;

        /*if (time > 120 && (window.cordova)) {
           
        }*/

        _.each(self.clbks.resume, function(c){
            c(time)
        })
        

        if (self.titleManager) {
            self.titleManager.clear();
        }

    }

    var pause = function () {

        self.focus = false;

        unfocustime = platform.currentTime()

        _.each(self.clbks.pause, function(c){
            c()
        })
    }

   

    self.init = function () {

        inited = true;

        if (window.cordova) {

            document.addEventListener("pause", pause, false);
            document.addEventListener("resume", resume, false);

            return
        }

        window.addEventListener('blur', pause);
        window.addEventListener('focus', resume);


    }

    self.destroy = function () {

        self.clbk = {
            resume : {},
            pause : {}
        }

        if (!inited) return

        if (window.cordova) {

            document.removeEventListener("pause", pause, false);
            document.removeEventListener("resume", resume, false);

            return
        }

        window.removeEventListener('blur', pause);
        window.removeEventListener('focus', resume);

        inited = false;

    }

    return self;
}

var OnlineListener = function (platform) {

    var self = this;
    var interval = null;
    var offlinetime = null;

    self.online = f.deep(window, 'navigator.onLine');
    self.clbks = {
        online : {},
        offline : {}
    }

    if(!self.online){
        offlinetime = platform.currentTime()
    }

    self.init = function () {

        /*interval = f.retry(function () {

            var online = f.deep(window, 'navigator.onLine');

            if (self.online != online) {

                self.online = online;

                return true;

            }


        }, function () {

            if (!self.online) {

                var onlinetime = platform.currentTime()
                var time = onlinetime - (offlinetime || onlinetime)

                _.each(self.clbks.online, function (c) {
                    c(time)
                })
            }
            else {

                offlinetime = platform.currentTime()

                _.each(self.clbks.offline, function (c) {
                    c()
                })
            }

            self.init();

        }, 50)*/

    }
    
    self.destroy = function(){
        if (interval){

            clearInterval(interval)
            
            interval = null
        }

        self.clbks = {
            online : {},
            offline : {}
        }
    }
        

    return self
}


export default {
    focus : FocusListener,
    online : OnlineListener
}