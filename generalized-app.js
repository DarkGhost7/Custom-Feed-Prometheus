// Specialized custom feed for avalanche nodes
const http = require("http"); process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; const prom = require("prom-client"); const fetch = require("node-fetch"); const _ = require("underscore"); const registry = new prom.Registry(); const 
prices = new prom.Gauge({
    name: "prices",
    help: "Token prices",
    registers: [registry],
    labelNames: ["pair"]
});
const misc = new prom.Gauge({
    name: "misc",
    help: "Misc Feed",
    registers: [registry],
    labelNames: ["value"]
});
// add your IP here
var ip = '127.0.0.1';
const update = async () => {
    try {
        
        try {
            // pull prices from coingecko
            // add the coin you want to pull here
            const dat = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kira-network%2Cbitcoin%2Cethereum&vs_currencies=usd');
            const json = await dat.json();
            btc_usd = json["bitcoin"].usd;
			eth_usd = json["ethereum"].usd;
            avax_usd = json['kira-network'].usd;
        } catch (err) {
            console.log(err);
        }

        prices.set({ pair: "btc_usd" }, btc_usd);
		prices.set({ pair: "eth_usd" }, eth_usd);
        prices.set({ pair: "kex_usd" }, kex_usd);
        prices.set({ pair: "kex_btc" }, kex_usd / btc_usd);
		prices.set({ pair: "kex_eth" }, kex_usd / eth_usd);

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
