const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get mqtt statistics
  app.get('/api/rest_api_statistics', auth, async (req, res) => {
    let rolesCount = 0
    await prisma.rest_api_roles.findMany()
      .then((result) => {
        rolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let usersCount = 0
    await prisma.rest_api_users.findMany()
      .then((result) => {
        usersCount = result.length
      })
      .catch((result) => {
        res.status(500).send(result);
      });

    let permissionsCount = 0
    await prisma.rest_api_permissions.findMany()
      .then((result) => {
        permissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userRolesCount = 0
    await prisma.rest_api_user_roles.findMany()
      .then((result) => {
        userRolesCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    let userPermissionsCount = 0
    await prisma.rest_api_user_permissions.findMany()
      .then((result) => {
        userPermissionsCount = result.length
      })
      .catch((result) => {
        res.status(500).send();
      });

    res.status(200).send({
      rest_api_roles: rolesCount,
      rest_api_users: usersCount,
      rest_api_permissions: permissionsCount,
      rest_api_user_roles: userRolesCount,
      rest_api_user_permissions: userPermissionsCount
    });
  });
}