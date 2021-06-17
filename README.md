# Custom-Feed-Prometheus
This lets you add a custom feed for Prometheus / Grafana for crypto projects. 

If you havent yet set up prometheus/grafana check out this guide here
[Avax Node Monitoring Guide](https://docs.avax.network/build/tutorials/nodes-and-staking/setting-up-node-monitoring)

# How to use
Edit your prometheus yml file with
`sudo nano /etc/prometheus/prometheus.yml` adding in the content of prometheus yml under you other jobs. After updating and saving use to restart prometheus `sudo systemctl restart prometheus`. Then do `sudo systemctl status prometheus` to see if prometheus is working fine. If it isnt then you need to redo the config and make sure your spacing is correct.

If you want to open your ports to view the prometheus dashboard/jobs use
`sudo ufw allow 9090/tcp` replace your port # for each job 

Run avax-app.js script to pull these data feeds on port 9800

run with nohup to keep running after terminal is closed
`nohup node avax-app.js &` or `nohup node generalized-app.js &` depending on which script you want to use. 


Credit to @CarnivalBen on github for making this

