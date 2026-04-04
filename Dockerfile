FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginxinc/nginx-unprivileged:alpine3.23-perl AS stager
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 81
