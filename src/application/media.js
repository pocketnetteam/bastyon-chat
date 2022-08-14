import f from './functions';

var Media = function () {
    var self = this

    self.gettingmedia = false

    var permissions = {

        ios : {
            audio : function(){

                return new Promise((resolve, reject) => {
  
                    var needMic = true;
                    var needCamera = false;

                    cordova.plugins.iosrtc.requestPermission(needMic, needCamera, function (permissionApproved) {

                        if(permissionApproved) resolve()
                        else reject('permissions')
                    })

                })
    
            },

            video : function(){

                return new Promise((resolve, reject) => {
  
                    var needMic = true;
                    var needCamera = true;

                    cordova.plugins.iosrtc.requestPermission(needMic, needCamera, function (permissionApproved) {
                    // permissionApproved will be true if user accepted permission otherwise will be false.
                        if(permissionApproved) resolve()
                        else reject('permissions')

                    })

                })
    
            } 
        },

        audio : function(){

            var permissions = window.cordova.plugins.permissions;

            return new Promise((resolve, reject) => {

                if (permissions){

                    permissions.hasPermission(permissions.RECORD_AUDIO, (status) => {


                        if (status.hasPermission) {

                            resolve()

                        }
                        else {
                            permissions.requestPermission(permissions.RECORD_AUDIO, () => {

                                resolve()

                            }, () => {


                                reject('permissions')

                            });

                        }

                    });

                }
                else{
                    reject('permissions')
                }

            })

            

        },

        video : function(){

            var permissions = window.cordova.plugins.permissions;

            return new Promise((resolve, reject) => {

                if (permissions){

                    permissions.hasPermission(permissions.CAMERA, (status) => {

                        if (status.hasPermission) {

                            resolve()

                        }
                        else {

                            permissions.requestPermission(permissions.CAMERA, () => {

                                resolve()

                            }, () => {

                                reject('permissions')

                            });

                        }

                    });

                }
                else{
                    reject('permissions')
                }

            })

            

        }
      
    }

    var initPermissions = function(mediasettings){

        var callperm = function(f, setting){
            if (setting){
                return f()
            }
            else{
                return Promise.resolve()
            }
        }

        if(window.cordova && window.device){

            var ios = f.isios()

            return callperm(ios ? permissions.ios.audio : permissions.audio, mediasettings.audio).then(() => {
                return callperm(ios ? permissions.ios.video : permissions.video, mediasettings.video)
            }).catch(e => {
                console.error("E", e)
                return Promise.reject(e)
            })

        }

        return Promise.resolve()

    }

    var initMedia = function(mediasettings){

        return new Promise((resolve, reject)=> {


            initPermissions(mediasettings).then(() => {

                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia(mediasettings).then(resolve).catch(reject);
                } else {
                    (
                        navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia
                    )
                    (mediasettings, resolve, reject);
                }

            }).catch(reject)

        })
        
    }
    
    self.get = function(mediasettings){

        return initMedia(mediasettings)

    }

}


export default Media