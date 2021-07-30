// Specialized custom feed for avalanche nodes
const http = require("http"); process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; const prom = require("prom-client"); const fetch = require("node-fetch"); const _ = require("underscore"); const registry = new prom.Registry(); const 
prices = new prom.Gauge({
    name: "prices",
    help: "Token prices",
    registers: [registry],
    labelNames: ["pair"]
});
const peerStatus = new prom.Gauge({
    name: "peerstatus",
    help: "Peer status",
    registers: [registry],
    labelNames: ["version", "status"]
});
const misc = new prom.Gauge({
    name: "misc",
    help: "Misc Feed",
    registers: [registry],
    labelNames: ["value"]
});
// add your IP here or use `localhost`
var ip = '127.0.0.1';
const update = async () => {
    try {
        
        try {
            // pull prices from coingecko
            const dat = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2%2Cbitcoin%2Cethereum&vs_currencies=usd');
            const json = await dat.json();
            btc_usd = json["bitcoin"].usd;
			eth_usd = json["ethereum"].usd;
            avax_usd = json['avalanche-2'].usd;
        } catch (err) {
            console.log(err);
        }
	    
	try {
            const dat = await fetch('https://avascan.info/api/v1/burned-fees');
            const json = await dat.json();
            burnSupplyX = json["X"];
        } catch (err) {
            console.log(err);
        }

		
	try {
            const post = {jsonrpc:"2.0", id: 1, method :"avm.getBalance", params :{address:"X-avax1slt2dhfu6a6qezcn5sgtagumq8ag8we75f84sw",assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z"}} ;
            // might need to use https:// or http:// depending on your set up
            const dat = await fetch ('http://'+ip+':9650/ext/bc/X', { headers: { 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify(post)});
            const json = await dat.json();
			binanceAVAX = json.result.balance * 10**-9;
        } catch (err) {
            console.log(err);
        }
		
	try {
            const post = {jsonrpc: "2.0",method: "eth_blockNumber",params: [],id: 1} ;
            const dat = await fetch ('http://'+ip+':9650/ext/bc/C/rpc', { headers: { 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify(post)});
            const json = await dat.json();
			blockNumber = parseInt(json.result, 16);
        } catch (err) {
            console.log(err);
        }
		
	try {
            const post = {jsonrpc:"2.0", id:1, method :"platform.getCurrentSupply", params: {}} ;
            const dat = await fetch ('http://'+ip+':9650/ext/bc/P', { headers: { 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify(post)});
            const json = await dat.json();
			AVAXsupply = json.result.supply * 10**-9;
        } catch (err) {
            console.log(err);
        }
		
	try {
            const post = {jsonrpc: "2.0", method: "eth_getBalance",params: ["0x0100000000000000000000000000000000000000","latest"],"id": 1} ;
            const dat = await fetch ('http://'+ip+':9650/ext/bc/C/rpc', { headers: { 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify(post)});
            const json = await dat.json();
			burnSupply = json.result * 10**-18;
        } catch (err) {
            console.log(err);
        }
		
		
        try {
            const post = { jsonrpc:"2.0", id: 1, method: "info.peers", params: { nodeIDs: [] } };
            const dat = await fetch ('http://'+ip+':9650/ext/info', { headers: { 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify(post)});
            const json = await dat.json();
            const nodeVersions = [];
            for (const node of json.result.peers) {
                if (!nodeVersions.includes(node.version)) {
                    peerStatus.labels(node.version, 'up').set(0);
                    peerStatus.labels(node.version, 'down').set(0);
                    nodeVersions.push(node.version);
                }
                peerStatus.labels(node.version, 'up').inc();
            }
        } catch (err) {
            console.log(err);
        }
		
		supplyPostBurn = AVAXsupply-burnSupply-burnSupplyX;
		
        prices.set({ pair: "btc_usd" }, btc_usd);
		prices.set({ pair: "eth_usd" }, eth_usd);
        prices.set({ pair: "avax_usd" }, avax_usd);
        prices.set({ pair: "avax_btc" }, avax_usd / btc_usd);
		prices.set({ pair: "avax_eth" }, avax_usd / eth_usd);
		misc.set({value: "binanceAVAXsupply"}, binanceAVAX);
		misc.set({value: "AVAXsupply"}, AVAXsupply);
		misc.set({value: "burnSupply"}, burnSupply);
    		misc.set({value: "burnSupplyX"}, burnSupplyX);
		misc.set({value: "supplyPostBurn"}, supplyPostBurn);
		misc.set({value: "blockNumber"}, blockNumber);
		
    } catch (err) {
        console.log(err);
    }
};
setInterval(update, 15000); update(); http.createServer(async (req,res) => {
    console.log(req.url);
    res.write(await registry.metrics());
    res.end();
    //using port 9800 for prometheus
}).listen(9800);
