FROM govukpay/nodejs:alpine-3.8.1

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install --production

ENV PORT 9000
ENV LD_LIBRARY_PATH /app/node_modules/appmetrics

EXPOSE 9000

WORKDIR /app
ADD . /app

RUN ln -s /tmp/node_modules /app/node_modules

CMD ./docker-startup.sh
