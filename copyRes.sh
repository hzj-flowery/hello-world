src=./webgl/bin/res
dst=./webglServer
rm -rf $dst/res && mkdir -p $dst/res
cp -rf $src $dst

echo "资源拷贝结束,按任意键结束"
read p