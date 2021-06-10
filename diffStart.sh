commitIdPath=./commitID.txt
#最近一次提交的id
latestCommitId=`git rev-parse --short HEAD`
#上一次提交的写入的id
lastCommitId=""
if test -s $commitIdPath
then
    echo "文件存在-----"
    lastCommitId=`cat $commitIdPath`
else
    echo "文件不存在-----"
fi
echo $lastCommitId
diffPath=./diff.txt
rm -rf $diffPath && touch $diffPath
git diff ${latestCommitId} 901261f --name-only > $diffPath
echo "差异化文件生成完成"
