FROM node:14.17.0-alpine3.12 as builder

WORKDIR /app

COPY ./frontend/package.json /app/frontend/
COPY ./backend/package.json /app/backend/

RUN cd /app/frontend && npm install
RUN cd /app/backend && npm install

COPY . .

RUN cd /app/frontend && npm run build
RUN cd /app/backend && npm run build

FROM node:14.17.0-alpine3.12

WORKDIR /app

COPY --from=builder /app/frontend/build frontend/build
COPY --from=builder /app/backend/node_modules backend/node_modules
COPY --from=builder /app/backend/out backend/out

EXPOSE 3000

CMD ["node", "/app/backend/out/http-server/index.js"]
