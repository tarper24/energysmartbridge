FROM mono:latest AS build

WORKDIR /build
COPY ./EnergySmartBridge .
RUN nuget restore /build/EnergySmartBridge.sln
RUN msbuild /build/EnergySmartBridge.sln /t:Build /p:Configuration=Release
RUN mv /build/bin/Release /app

FROM nginx:1.24.0
#ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

RUN apt-get update && apt-get install -y openssl

COPY energysmart-proxy/nginx.conf.template .

RUN openssl req  -nodes -new -x509 -sha1 -subj '/CN=energysmartwaterheater.com' -keyout /etc/nginx/energysmartwaterheater.com.key -out /etc/nginx/energysmartwaterheater.com.crt -days 3650

EXPOSE 443/tcp

RUN apt-get install -y mono-devel
COPY --from=build /app .
COPY --from=build /app/EnergySmartBridge.ini /config/EnergySmartBridge.ini
COPY startup.sh .

CMD ["sh", "startup.sh"]