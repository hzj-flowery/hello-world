#!/bin/sh
ENGINE_VER=2.4.1
PROJ=$(cd "$(dirname "$0")"/..;pwd)
echo $PROJ

COCOS=/Applications/CocosCreator/Creator/${ENGINE_VER}/CocosCreator.app/Contents

${COCOS}/MacOS/CocosCreator --path ${PROJ}/main --build "platform=${PLATFORM};debug=false;webOrientation=landscape;buildPath=${OUT}" && \
node ${PROJ}/tools/build/index.js ${PROJ}/main/build/wechatgame ${PROJ}/dist