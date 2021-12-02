var _ = require('underscore');

var errors = {
    500 : 'networkerror',
    401 : 'unauthorized',
    511 : 'needcredentials',
    527 : 'emptyresponse',

    600 : "Wrong token",
    601 : "Can not login",
    602 : "Empty response"
}

function error(code, _error){
    return {
        code,
        error : _error || errors[code] || "undefined",
        isError : true
    }
}

function byError(_error){

    if(!_error) return null

    var code = _.findKey(errors, text => {
        return text == _error
    })

    if (code){
        return error(code)
    }

    return _error

   
}

export {
    error,
    byError
}