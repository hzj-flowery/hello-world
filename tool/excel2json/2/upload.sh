#!/bin/bash
echo $1 $2 $3
sshpass -p $1 sftp yoka-guest01@114.55.219.143 << EOF
cd '$2'
put '$3'
exit
EOF
