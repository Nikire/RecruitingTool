# Recruiting tool BE

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
yarn install
```

### Setting up .env

- Create a `.env` file and follow the `.env.example` file to set up the environment variables.

- Here is a fast way to generate a `JWT_SECRET` key through the terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Running the app

```bash
# development
yarn run start

# watch mode
yarn run start:dev

# production mode
yarn run start:prod
```

## Swagger

You can see the API documentation by visiting the following URL once you got the app running: `http://localhost:{YOUR-SELECTED-BACKEND-PORT}/api`

## Prisma migrations

- Migrations are run automatically on docker container start, but you can run migrations by running the following command:

```bash
# run migrations
yarn run prisma migrate dev

# create new migration
yarn run prisma migrate dev --name <migration-name>
# Or simply run
yarn migrate <migration-name>
```

- For every change on the models you need to generate the Prisma client by running the following command:

```bash
npx prisma generate
```

- To keep prisma formated you can run the following command:

```bash
npx prisma format
```

To automate prisma formatting on save you can install Prisma plugin on your IDE and then inside the `schema.prisma` file you can manually trigger formatting using the keyboard shortcut (`Shift + Alt + F` for Windows/Linux or `Shift + Option + F` for Mac).

## License

This project is [MIT licensed](../LICENSE).
