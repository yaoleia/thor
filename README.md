# Thor

## Intelligent industrial manufacturing light service.

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

## 技术栈
后端：egg.js(koa) socket.io-server redis mongo
前端：react redux antd-pro socket.io fabric umi (web子仓库可切换其他框架vue-cli、roadhog等)
部署：docker bash-shell (windows系统)
docker build -t thor:latest .
docker save thor:latest > ./thor.tar
docker load < ./thor.tar
docker run -it -d --link easy-mock-redis:redis --link easy-mock-mongo:mongo -p 7500:7001 -v /Users/admin/Documents/public:/thor/public --name thor thor:latest