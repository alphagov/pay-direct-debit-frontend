FROM govukpay/nodejs:6.12.2

ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production

ENV PORT 9000
EXPOSE 9000

WORKDIR /app
ADD . /app

RUN ln -s /tmp/node_modules /app/node_modules

RUN apk add openssl && \
    mkdir -p bin && \
    apk del --purge openssl

CMD ./docker-startup.sh
