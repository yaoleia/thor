FROM node:12.19.0

WORKDIR /thor

RUN npm config set registry https://registry.npm.taobao.org

COPY . .

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
RUN npm i --production

WORKDIR /thor/web
RUN npm i --production
RUN npm run build

WORKDIR /thor

EXPOSE 7001

CMD [ "npm", "run", "start:prod" ]
