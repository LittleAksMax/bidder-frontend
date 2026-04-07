FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile
COPY . .

# Make sure to set Gateway URL with:
# docker build --build-arg VITE_API_GATEWAY_URL="https://some.url.com" ...
ARG VITE_API_GATEWAY_URL
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL

# Make sure there's something in it
RUN test -n "$VITE_API_GATEWAY_URL"

RUN yarn build

FROM --platform=$TARGETPLATFORM nginxinc/nginx-unprivileged:alpine3.23-perl AS stager
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 81
