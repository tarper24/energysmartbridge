set -e

echo Listing Versions!
echo "nginx Version: $(nginx -v)"

for keyval in $(grep -E '": [^\{]' /data/options.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    eval export $keyval
done

#envsubst < /nginx.conf.template > /etc/nginx/nginx.conf;
exec nginx -g 'daemon off;' & mono EnergySmartBridge.exe -i -c /config/EnergySmartBridge.ini -e