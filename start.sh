#!/bin/sh

cd /opt/emqttd
./bin/emqttd start &

cd /root/file-server/public/images
file-browser &

cd /root/file-server
DEBUG=file-server & npm start
