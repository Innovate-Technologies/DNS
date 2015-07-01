FROM ubuntu:14.04

ENV DISCOVER=""

RUN sudo apt-get update
RUN sudo apt-get -y install nodejs npm git

RUN sudo ln -s /usr/bin/nodejs /usr/bin/node

COPY ./src /src
RUN cd /src; npm install

EXPOSE  5353
EXPOSE  5353/udp

CMD sudo /usr/bin/node /src/server.js $DISCOVER
