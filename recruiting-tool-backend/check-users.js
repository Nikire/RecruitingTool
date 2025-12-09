const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['alice@techinnovations.com', 'bob@techinnovations.com', 'charlie@digitalsolutions.com']
      }
    },
    select: {
      name: true,
      email: true,
      companyId: true,
      company: {
        select: {
          name: true
        }
      }
    }
  });

  console.log('Current user-company associations:');
  console.log(JSON.stringify(users, null, 2));

  await prisma.$disconnect();
}

checkUsers();
