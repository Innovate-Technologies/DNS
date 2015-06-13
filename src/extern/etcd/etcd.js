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
        timeout: 1000
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
    etcd.get(key, function(err, res) {
        if (err) {
            callback(err)
            return
        }
        if (isJSON) {
            callback(null, JSON.parse(res.node.value))
        } else {
            callback(null, res.node.value)
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


module.exports.connectEtcd = function(discover) {
    wait.launchFiber(connectEtcd, discover)
}
module.exports.get = get