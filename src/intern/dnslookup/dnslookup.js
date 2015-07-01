var etcd=require("../../extern/etcd/etcd.js")
var cache=require("../cache/cache.js")
var discoverhost=""
for (var id in process.argv){
    if (process.argv.hasOwnProperty(id) && process.argv[id].indexOf("http")>-1){
        discoverhost=process.argv[id]
    }
}
etcd.connectEtcd(discoverhost)


var lookup=function(name,type,callback){
    if (name.indexOf("..")>-1 || type.indexOf("..")>-1){
        callback(null,[])
        return
    }
    if (cache.isKeyInCache("/DNS/"+name+"/"+type)){
        callback(null,cache.getFromCache("/DNS/"+name+"/"+type))
        return
    }
    etcd.get("/DNS/"+name+"/"+type,function(err,res){
        if (err){
            callback(null,[])
            return
        }
        if (typeof res !== "object"){
            callback(null,res)
            return
        }
        var response=[]
        for (var id in res){
            if (res.hasOwnProperty(id)){
                response.push({name:name, type:type, data:res[id].value, ttl:res[id].ttl, class: 'IN'})
            }
        }
        callback(null,response)
        cache.addToChache("/DNS/"+name+"/"+type,response,res[0].ttl)
    })
}


module.exports.lookup=lookup