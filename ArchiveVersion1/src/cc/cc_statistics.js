const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get mqtt statistics
  app.get('/api/cc_statistics', auth, async (req, res) => {
    let rolesCount = 0
    await prisma.cc_roles.findMany()
      .then((result) => {
        rolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let usersCount = 0
    await prisma.cc_users.findMany()
      .then((result) => {
        usersCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let permissionsCount = 0
    await prisma.cc_permissions.findMany()
      .then((result) => {
        permissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userRolesCount = 0
    await prisma.cc_user_roles.findMany()
      .then((result) => {
        userRolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userPermissionsCount = 0
    await prisma.cc_user_permissions.findMany()
      .then((result) => {
        userPermissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    res.status(200).send({
      cc_roles: rolesCount,
      cc_users: usersCount,
      cc_permissions: permissionsCount,
      cc_user_roles: userRolesCount,
      cc_user_permissions: userPermissionsCount
    });
  });
}