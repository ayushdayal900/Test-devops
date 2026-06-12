FROM node:20-alpine

WORKDIR /backend

LABEL monitor="Ayush Dayal" \
      part="Mahalaxmi backend"
       
EXPOSE 5000


COPY package*.json ./

RUN npm ci

RUN addgroup -S backendgroup && \
    adduser -S backenduser -G backendgroup

COPY --chown=backenduser:backendgroup . .

USER backenduser

CMD ["node", "server.js"]
