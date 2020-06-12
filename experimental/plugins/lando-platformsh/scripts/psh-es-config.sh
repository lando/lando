#!/bin/sh
# Update network
sed -i 's/-\s_global_/#&/' /etc/elasticsearch/elasticsearch.yml
sed -i 's/_local_/_eth0_/' /etc/elasticsearch/elasticsearch.yml
sed -i 's/^http/#http/' /etc/elasticsearch/elasticsearch.yml
sed -i 's/\shost:/#&/' /etc/elasticsearch/elasticsearch.yml
sed -i 's/-\s_eth0_/#&/' /etc/elasticsearch/elasticsearch.yml
sed -i 's/-\s_global_/#&/' /etc/elasticsearch/elasticsearch.yml
