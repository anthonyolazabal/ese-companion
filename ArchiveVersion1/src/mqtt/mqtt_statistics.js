const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get mqtt statistics
  app.get('/api/statistics', auth, async (req, res) => {
    let rolesCount = 0
    await prisma.roles.findMany()
      .then((result) => {
        rolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let usersCount = 0
    await prisma.users.findMany()
      .then((result) => {
        usersCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let permissionsCount = 0
    await prisma.permissions.findMany()
      .then((result) => {
        permissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userRolesCount = 0
    await prisma.user_roles.findMany()
      .then((result) => {
        userRolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userPermissionsCount = 0
    await prisma.user_permissions.findMany()
      .then((result) => {
        userPermissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    res.status(200).send({
      roles: rolesCount,
      users: usersCount,
      permissions: permissionsCount,
      user_roles: userRolesCount,
      user_permissions: userPermissionsCount
    });
  });
}