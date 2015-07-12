var cache = {}

var isKeyInCache = function(key) {
    /* var time=Math.floor((new Date).getTime()/1000)
    
    if (!cache.hasOwnProperty(key)){
        return false
    }else if(ttl[key]<time){
        delete cache[key]
        delete ttl[key]
        return false
    }else{
        return true
    }*/
    return cache.hasOwnProperty(key)

}

var addToChache = function(key, value, ttlval) {
    cache[key] = value
    watchForUpdates(key)
}

var getFromCache = function(key) {
    return cache[key]
}

var watchForUpdates = function(key) {
    global.etcd.watch(key, function(err, change) {
        if (err || typeof change === "undefined" || typeof change.node === "undefined" || typeof change.node.value === "undefined") {
            return
        }
        var newval = change.node.value
        if (isJSON(newval)) {
            var info = JSON.parse(newval)
            var name=key.split("/")[2]
            var type=key.split("/")[3]
            var newCache = []
            for (var id in info) {
                if (info.hasOwnProperty(id)) {
                    newCache.push({
                        name: name,
                        type: type,
                        data: info[id].value,
                        ttl: info[id].ttl,
                        class: 'IN'
                    })
                }
            }
            cache[key]=newCache
        } else {
            delete cache[key] //dynamic updates not supported
        }
    })
}

var isJSON = function(text) {
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true
    } else {
        return false
    }
}


module.exports.addToChache = addToChache
module.exports.isKeyInCache = isKeyInCache
module.exports.getFromCache = getFromCache