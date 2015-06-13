# (IT)DNS

DNS (ITDNS in cases where it may be confusing) is a small DNS server with etcd as database backend.
The purpose of DNS is serving the corect IP to a hostname in a CoreOS cluster with a low ttl. 

DNS is a lightweigt system ment to serve simple records, don't excpect any magic. 

---
How to use
----------
You can use use DNS in two setups. Docker and in a standard server with Node.JS.
###Docker
1. Get the Docker container `docker pull meyskens/dns`
2. Start the docker container with your etcd discovery url:
   `docker run -e DISCOVER="https://discovery.etcd.io/KEY" -p 53:53 --name DNS meyskens/dns`
3. Add a DNS record to etcd, eg. `etcdctl set "/DNS/sub.doma.in/A/" "[{"value":"127.0.0.1","ttl":10}]"`
4. That's it!

###Node.JS
1. Git clone the repo and go to `src`
2. Install the dependencies `npm install`
3. Start the DNS server with the discovery url `node server.js "https://discovery.etcd.io/KEY"`
4. Add a DNS record to etcd, eg. `etcdctl set "/DNS/sub.doma.in/A/" "[{"value":"127.0.0.1","ttl":10}]"`
5. That's it! (I'm sure you will do it differently)