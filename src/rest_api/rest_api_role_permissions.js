const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get rest_api_roles_permission
  app.get('/api/rest_api_role_permissions', auth, async (req, res) => {
    await prisma.rest_api_role_permissions.findMany()
      .then((result) => {
        res.status(200).json(result);
      });
  });

  //Get a rest_api_role (by default no details about permissions associated : extend=true)
  app.get('/api/rest_api_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.rest_api_role_permissions.findMany({
        where: {
          role: {
            equals: parseInt(req.params.roleId),
          },
          permission: {
            equals: parseInt(req.params.permissionId),
          }
        },
        select: {
          role: true,
          permission: true,
          created_at: true,
          updated_at: true,
          rest_api_permissions: {
            select: {
              id: true,
              permission_string: true,
              description: true
            }
          },
          rest_api_roles: {
            select: {
              id: true,
              name: true,
              description: true,
              created_at: true,
              updated_at: true
            }
          }
        }
      })
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((result) => {
          res.status(404).json(result);
        });
    } else {
      await prisma.rest_api_role_permissions.findMany({
        where: {
          role: {
            equals: parseInt(req.params.roleId),
          },
          permission: {
            equals: parseInt(req.params.permissionId),
          }
        }
      })
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((result) => {
          res.status(404).json(result);
        });
    }
  });

  //Update a rest_api_role_permission
  app.put('/api/rest_api_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.rest_api_role_permissions.updateMany({
      where: {
        role: {
          equals: parseInt(req.params.roleId),
        },
        permission: {
          equals: parseInt(req.params.permissionId),
        }
      },
      data: req.body
    })
      .then((result) => {
        res.status(202).json(result);
      })
      .catch((result) => {
        res.status(500).json(result);
      });
  });

  //Remove a rest_api_role_permission
  app.delete('/api/rest_api_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    await prisma.rest_api_role_permissions.deleteMany({
      where: {
        role: {
          equals: parseInt(req.params.roleId),
        },
        permission: {
          equals: parseInt(req.params.permissionId),
        }
      },
    })
      .then((result) => {
        res.status(204).send({});
      })
      .catch((result) => {
        res.status(404).send("Nothing to delete !");
      });
  });

  // Create a rest_api_role
  app.post('/api/rest_api_role_permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { role, permission } = req.body;

    if (!(role && permission)) {
      res.status(400).send("All input is required");
    }

    await prisma.rest_api_role_permissions.findFirst({
      where: {
        role: parseInt(role),
        permission: parseInt(permission)
      },
    })
      .then(async (result) => {
        if (result) {
          return res.status(409).send("Role Permission mapping aready exist !");
        }

        let rp = {
          role: parseInt(role),
          permission: parseInt(permission),
          created_at: currentDate,
          updated_at: currentDate
        };

        await prisma.rest_api_role_permissions.create({ data: rp })
          .then((result) => {
            res.status(202).send(result);
          })
          .catch((result) => {
            res.status(500).json("Error");
          });
      })
      .catch((result) => {
        res.status(404).json(result);
      });
  });
};