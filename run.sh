#!/bin/bash
# 将该脚本放在一个工程目录(ps: /d/thor)的文件夹(首先确保docker已安装)，然后运行sudo或管理员运行:
# ps: bash ./run.sh 10.18.144.239

start=`date +%s`

ip=$1
if [ "$1" == "" ]; then
    echo "need local IP address as a parameter!"
    exit -1
fi

echo "docker load thor..."
docker load < ./thor.tar
if [ "$?" != "0" ]; then
    echo "docker load thor failed!"
fi

echo "docker image inspect redis..."
docker image inspect redis:latest &>/dev/null
if [ "$?" != "0" ]; then
    echo "docker pull redis..."
    docker pull redis
    if [ "$?" != "0" ]; then
        echo "docker pull redis failed!"
        exit -1
    fi
fi

echo "docker image inspect mongo..."
docker image inspect mongo:latest &>/dev/null
if [ "$?" != "0" ]; then
    echo "docker pull mongo..."
    docker pull mongo
    if [ "$?" != "0" ]; then
        echo "docker pull mongo failed!"
        exit -1
    fi
fi

docker container stop thor-redis thor-mongo my-thor
docker container rm thor-redis thor-mongo my-thor

if [ ! -d ./data ]; then
    mkdir ./data
fi

dataDir=/$(cd ./data; pwd)

mongoDir=$dataDir/mongo_data
redisDir=$dataDir/redis_data
export publicDir=$dataDir/public
# export network="host"
export network="bridge"

echo "mkdir..."
if [ ! -d $mongoDir ]; then
    mkdir $mongoDir
fi
if [ ! -d $redisDir ]; then
    mkdir $redisDir
fi
if [ ! -d $publicDir ]; then
    mkdir $publicDir
fi

echo "docker start to run..."
echo "run mongo..."

if [ $network == "host" ]; then
    docker run -it -d -v $mongoDir:/data/db --network=host --restart always --name thor-mongo mongo
else
    docker run -it -d -v $mongoDir:/data/db -p 27017:27017 --restart always --name thor-mongo mongo
fi

if [ "$?" != "0" ]; then
    docker container rm thor-mongo
    echo "docker run mongo failed!"
    exit -1
fi

echo "run redis..."

if [ $network == "host" ]; then
    docker run -it -d -v $redisDir:/data --network=host --restart always --name thor-redis redis
else
    docker run -it -d -v $redisDir:/data -p 6379:6379 --restart always --name thor-redis redis
fi

if [ "$?" != "0" ]; then
    docker container rm thor-redis
    echo "docker run redis failed!"
    exit -1
fi

echo "run thor..."

if [ $network == "host" ]; then
    docker run -it -d -v $publicDir:/thor/public --env HOST_PUBLIC=$publicDir --env NETWORK=$network --network=host --restart always --name my-thor thor
else
    docker run -it -d --link thor-redis:redis --link thor-mongo:mongo -p 7001:7001 -v $publicDir:/thor/public --env HOST_PUBLIC=$publicDir --env SERVER_ADDRESS=http://$ip:7001 --restart always --name my-thor thor
fi

if [ "$?" != "0" ]; then
    docker container rm my-thor
    echo "docker run thor failed!"
    exit -1
fi

echo "Thor run success!"

end=`date +%s` 
dif=$[ end - start ]
echo "this shell script execution duration: $dif s"