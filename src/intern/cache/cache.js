var cache={}
var ttl={}

var isKeyInCache=function(key){
    var time=Math.floor((new Date).getTime()/1000)
    
    if (!cache.hasOwnProperty(key)){
        return false
    }else if(ttl[key]<time){
        delete cache[key]
        delete ttl[key]
        return false
    }else{
        return true
    }
}

var addToChache=function(key,value,ttlval){
    var time=Math.floor((new Date).getTime()/1000)
    cache[key]=value
    ttl[key]=Math.floor(time+ttlval)
}

var getFromCache=function(key){
    return cache[key]
}

module.exports.addToChache=addToChache
module.exports.isKeyInCache=isKeyInCache
module.exports.getFromCache=getFromCache