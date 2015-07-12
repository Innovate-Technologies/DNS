var etcd;
var rest = require("restler")
var wait = require("wait.for")

var connectEtcd = function(discover) {
    if (discover === "") {
        var nodeetcd = require('node-etcd')
        etcd = new nodeetcd()
    } else {
        var nodeetcd = require('node-etcd')
        var hosts = getHost(discover)
        console.log(hosts)
        etcd = new nodeetcd(hosts)
    }
}

var getHost = function(discover, callback) {
    var discoverRes = wait.for(doHTTPGet, discover)
    if (discoverRes.node.nodes.length === 0) {
        console.log("Empty cluster")
        process.exit()
        return
    }

    var allHosts;
    var hostID = 0
    var gotHosts = false

    while (!gotHosts) {
        allHosts = wait.for(doHTTPGet, discoverRes.node.nodes[hostID].value + "/v2/admin/machines")
        if (allHosts.length > 0) {
            gotHosts = true
        } else {
            hostID++
        }
    }

    var hosts = []

    for (var id in allHosts) {
        if (allHosts.hasOwnProperty(id)) {
            hosts.push(allHosts[id].clientURL.replace("http://", "").replace("https://", ""))
        }
    }

    return hosts

}

var doHTTPGet = function(url, callback) {
    rest.get(url, {
        timeout: 10000
    }).on("complete", function(res) {
        if (res instanceof Error) {
            callback(res)
            return
        }
        callback(null, res)
    }).on("timeout", function() {
        callback(null, [])
    })
}


var get = function(key, callback) {
    if (typeof etcd === "undefined"){
        callback("etcd is not started yet")
        return
    }
    etcd.get(key, function(err, res) {
        if (err) {
            callback(err)
            return
        }
        if (isJSON(res.node.value)) {
            callback(null, JSON.parse(res.node.value))
        } else {
            callback(null, res.node.value)
        }
    })
}

var set=function(key,value){
    etcd.set(key,value)
}

var isJSON = function(text) {
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true
    } else {
        return false
    }
}

var watch= function(key,callback){
    etcd.watch(key,callback)
}


module.exports.connectEtcd = function(discover) {
    wait.launchFiber(connectEtcd, discover)
}
module.exports.get = get
module.exports.set = set
module.exports.watch = watch