global.etcd = require("../../extern/etcd/etcd.js")
var cache = require("../cache/cache.js")
var discoverhost = ""
for (var id in process.argv) {
    if (process.argv.hasOwnProperty(id) && process.argv[id].indexOf("http") > -1) {
        discoverhost = process.argv[id]
    }
}
global.etcd.connectEtcd(discoverhost)


var lookup = function(name, type, callback) {
    if (name.indexOf("..") > -1 || type.indexOf("..") > -1) {
        callback(null, [])
        return
    }
    if (cache.isKeyInCache("/DNS/" + name + "/" + type)) {
        callback(null, cache.getFromCache("/DNS/" + name + "/"))
        return
    }
    global.etcd.get("/DNS/" + name + "/", {
        recursive: true
    }, function(err, res) {
        if (err) {
            callback(null, [])
            return
        }
        if (typeof res !== "object") {
            callback(null, res)
            return
        }
        var response = []
        for (var id in res) {
            for (var recordID in res[id]) {
                if (res[id].hasOwnProperty(recordID)) {
                    response.push({
                        name: name,
                        type: res[id][recordID].type,
                        data: res[id][recordID].value,
                        ttl: res[id][recordID].ttl,
                        class: 'IN'
                    })
                }
            }

        }
        callback(null, response)
        cache.addToChache("/DNS/" + name + "/", response)
    })
}


module.exports.lookup = lookup