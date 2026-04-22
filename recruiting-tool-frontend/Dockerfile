FROM node:20-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN yarn build:vite -- --mode docker

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
