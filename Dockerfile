From node:14

RUN mkdir -p /app/frontend && mkdir -p /app/backend

WORKDIR /app

COPY ./frontend/package.json /app/frontend/
COPY ./backend/package.json /app/backend/

RUN cd /app/frontend && npm install
RUN cd /app/backend && npm install

COPY . .

RUN cd /app/frontend && npm run build
RUN cd /app/backend && npm run build

EXPOSE 3000

CMD ["node", "/app/backend/out/http-server/index.js"]
