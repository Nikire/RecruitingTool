FROM node:20

ARG API_PORT=4000

ENV API_PORT=${API_PORT}

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate

EXPOSE ${API_PORT}

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]