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

# Telemetry. Vite inlines import.meta.env.VITE_* at BUILD time, so these have to
# arrive as build args - setting them on the running container does nothing.
# All optional: an empty value is falsy, which is exactly the "no PostHog / no
# Sentry account" path the app is written to degrade into.
ARG VITE_POSTHOG_KEY
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ARG VITE_SENTRY_ENVIRONMENT
ENV VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT
ARG VITE_SENTRY_TRACES_SAMPLE_RATE
ENV VITE_SENTRY_TRACES_SAMPLE_RATE=$VITE_SENTRY_TRACES_SAMPLE_RATE
ARG VITE_APP_VERSION
ENV VITE_APP_VERSION=$VITE_APP_VERSION

ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN yarn build:vite -- --mode docker

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
