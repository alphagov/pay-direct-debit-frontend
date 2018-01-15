FROM govukpay/nodejs:6.12.2

ARG CHAMBER_URL=https://github.com/segmentio/chamber/releases/download/v1.13.0/chamber-v1.13.0-linux-amd64

ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production

ENV PORT 9000
EXPOSE 9000

WORKDIR /app
ADD . /app

RUN ln -s /tmp/node_modules /app/node_modules

RUN apk add openssl && \
    mkdir -p bin && \
    wget -qO bin/chamber $CHAMBER_URL && \
    sha256sum -c chamber.sha256sum && \
    chmod 755 bin/chamber && \
    apk del --purge openssl

CMD ./docker-startup.sh
