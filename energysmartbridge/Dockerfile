FROM nginx:1.24.0

RUN apt-get update && apt-get install -y openssl && apt-get install -y nodejs && apt-get install -y npm

COPY nginx.conf /etc/nginx/nginx.conf

RUN openssl req  -nodes -new -x509 -sha1 -subj '/CN=energysmartwaterheater.com' -keyout /etc/nginx/energysmartwaterheater.com.key -out /etc/nginx/energysmartwaterheater.com.crt -days 3650

ADD package.json ./
ADD package-lock.json ./

RUN npm install

COPY . .

EXPOSE 443/tcp

CMD [ "sh", "run.sh" ]