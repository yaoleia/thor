#!/bin/bash
# 将该脚本放在一个工程目录(ps: /d/thor)的文件夹(首先确保docker已安装)，然后运行sudo或管理员运行:
# bash ./run.sh (thor-$version.tar)

start=`date +%s`

thor_path=$1
if [ "$1" == "" ]; then
    echo "thor container file not found, use (thor.tar) by default!"
    thor_path="./thor.tar"
fi

echo "docker load thor..."
docker load < $thor_path
if [ "$?" != "0" ]; then
    echo "docker load thor failed!"
fi

echo "docker pull redis..."
docker pull redis
if [ "$?" != "0" ]; then
    echo "docker pull redis failed!"
    exit -1
fi

echo "docker pull mongo..."
docker pull mongo
if [ "$?" != "0" ]; then
    echo "docker pull mongo failed!"
    exit -1
fi

docker container stop thor-redis thor-mongo my-thor
docker container rm thor-redis thor-mongo my-thor

if [ ! -d ./data ]; then
    mkdir ./data
fi

dataDir=$(cd ./data; pwd)

mongoDir=$dataDir/mongo_data
redisDir=$dataDir/redis_data
publicDir=$dataDir/public

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
docker run -it -d -v $mongoDir:/data/db -p 27017:27017 --name thor-mongo mongo
if [ "$?" != "0" ]; then
    docker container rm thor-mongo
    echo "docker run mongo failed!"
    exit -1
fi

echo "run redis..."
docker run -it -v $redisDir:/data --name thor-redis -p 6379:6379 -d redis redis-server --appendonly yes
if [ "$?" != "0" ]; then
    docker container rm thor-redis
    echo "docker run redis failed!"
    exit -1
fi

echo "run thor..."
docker run -it -d --link thor-redis:redis --link thor-mongo:mongo -p 7500:7001 -v $publicDir:/thor/public --name my-thor thor
if [ "$?" != "0" ]; then
    docker container rm my-thor
    echo "docker run thor failed!"
    exit -1
fi

echo "port: 7500, thor run success!"

end=`date +%s` 
dif=$[ end - start ]
echo "this shell script execution duration: $dif s"