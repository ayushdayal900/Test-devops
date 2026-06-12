FROM node:20-alpine AS builder

WORKDIR /frontend

LABEL monitor="Ayush Dayal" \
    part="Mahalaxmi frontend"

COPY package*.json ./
RUN npm install

RUN addgroup -S frontendgroup && \
    adduser -S frontenduser -G frontendgroup && \
    chown -R frontenduser:frontendgroup /frontend

COPY --chown=frontenduser:frontendgroup . .


USER frontenduser

RUN npm run build

# running

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf 
COPY --from=builder /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
 
