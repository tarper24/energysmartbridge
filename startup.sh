envsubst < /nginx.conf.template > /etc/nginx/nginx.conf;
exec nginx -g 'daemon off;' & mono EnergySmartBridge.exe -i -c /config/EnergySmartBridge.ini -e