#!/bin/bash
docker container stop my-redis my-mongo my-thor
docker container rm my-redis my-mongo my-thor
docker run -it -d -v /d/thor/dbdata:/data/db --name my-mongo mongo
docker run -it -d -v /d/thor/redisdata:/data --name my-redis redis
docker run -it -d --link my-redis:redis --link my-mongo:mongo -p 7500:7001 -v /d/thor/public:/thor/public --name thor thor:v0.0.3