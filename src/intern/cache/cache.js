var dnslookup=require("../dnslookup/dnslookup.js")

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

var addToCache = function(key, value) {
    cache[key] = value
    watchForUpdates(key)
}

var getFromCache = function(key) {
    return cache[key]
}

var watchForUpdates = function(key) {
    var watch=global.etcd.watcher(key, null, {recursive: true})
    watch.on("delete", function(){
        delete cache[key]
        watch.stop()
    })
    watch.on("error", function(){
        delete cache[key]
        watch.stop()
    })
    watch.on("set", function(change){
        delete cache[key]
        watch.stop()
        dnslookup.lookup(change.node.key.split("/")[2],"",function(){})
    })
}


module.exports.addToCache = addToCache
module.exports.isKeyInCache = isKeyInCache
module.exports.getFromCache = getFromCache