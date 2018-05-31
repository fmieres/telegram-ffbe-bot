FROM node:alpine

RUN apk add python2 git --no-cache && \
    python -m ensurepip && \
    pip install --upgrade pip && \
    pip install pymongo

WORKDIR /usr/src

COPY package.json package-lock.json ./

RUN npm install

COPY . /usr/src

RUN npm update data

RUN chmod +x runme.sh

CMD ["./runme.sh"]