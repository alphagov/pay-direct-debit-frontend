FROM node:12.21.0-alpine3.12@sha256:ed65b1d010ad52d59cbd045b5c976dbe6df343b87c0e4c69091fa925158bed06

### Needed to run appmetrics and pact-mock-service
COPY sgerrand.rsa.pub /etc/apk/keys/sgerrand.rsa.pub
RUN ["apk", "--no-cache", "add", "ca-certificates", "python2", "build-base"]
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk && apk add --no-cache glibc-2.28-r0.apk && rm -f glibc-2.28-r0.apk
###

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install --production

ENV PORT 9000
ENV LD_LIBRARY_PATH /app/node_modules/appmetrics

EXPOSE 9000

WORKDIR /app
ADD . /app

RUN ["ln", "-s", "/tmp/node_modules", "/app/node_modules"]

CMD ["npm", "start"]
