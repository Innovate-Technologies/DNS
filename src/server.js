console.log("DNS")
console.log("---")
console.log("A decentralised Domain Name System server")
console.log("Copyright (C) 2015  Innovate Technologies (Maarten Eyskens, Léo Lam)")
console.log("---")

var dnsd = require('dnsd'),
    dns=require("./intern/dnslookup/dnslookup.js"),
    wait=require("wait.for")
dnsd.createServer(function(req,res){
    wait.launchFiber(handle,req,res)
}).listen(5353)

console.log('Server running at port 5353')

var handle=function(req,res) {
    for (var id in req.question){
        if (!req.question.hasOwnProperty(id)){
            return
        }
        var lookupresponse=wait.for(dns.lookup,req.question[id].name,req.question[id].type)
        if (typeof lookupresponse === "object"){
            for (var lid in lookupresponse){
                if (lookupresponse.hasOwnProperty(lid)){
                    res.answer.push(lookupresponse[lid])
                }
            }
        }else{
            res.answer.push(lookupresponse)
        }
        
    }
    res.end()
}