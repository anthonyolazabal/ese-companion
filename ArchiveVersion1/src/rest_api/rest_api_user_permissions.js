const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get rest_api_user_permissions
  app.get('/api/rest_api_user_permissions', auth, async (req, res) => {
    await prisma.rest_api_user_permissions.findMany()
      .then((result) => {
        res.status(200).json(result);
      });
  });

  //Get a rest_api_user_permission (by default no details about permissions associated : extend=true)
  app.get('/api/rest_api_user_permission/:userId/:permissionId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.rest_api_user_permissions.findMany({
        where: {
          user_id: {
            equals: parseInt(req.params.userId),
          },
          permission: {
            equals: parseInt(req.params.permissionId),
          }
        },
        select: {
          user_id: true,
          permission: true,
          created_at: true,
          updated_at: true,
          rest_api_users: {
            select: {
              id: true,
              username: true,
              password: true,
              password_iterations: true,
              password_salt: true,
              algorithm: true,
              created_at: true,
              updated_at: true
            }
          },
          rest_api_permissions: {
            select: {
              id: true,
              permission_string: true,
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
          res.status(404).json({});
        });
    } else {
      await prisma.rest_api_user_permissions.findMany({
        where: {
          permission: {
            equals: parseInt(req.params.permissionId),
          },
          user_id: {
            equals: parseInt(req.params.userId),
          }
        }
      })
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((result) => {
          res.status(404).json({});
        });
    }
  });

  //Update a rest_api_user_permission
  app.put('/api/rest_api_user_permission/:userId/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.rest_api_user_permissions.updateMany({
      where: {
        permission: {
          equals: parseInt(req.params.permissionId),
        },
        user_id: {
          equals: parseInt(req.params.userId),
        }
      },
      data: req.body
    }).then((result) => {
      res.status(202).json(result.count);
    }).catch((result) => {
      res.status(500).json("Internal error");
    });
  });

  //Remove a rest_api_user_permission
  app.delete('/api/rest_api_user_permission/:userId/:permissionId', auth, async (req, res) => {
    await prisma.rest_api_user_permissions.deleteMany({
      where: {
        permission: {
          equals: parseInt(req.params.permissionId),
        },
        user_id: {
          equals: parseInt(req.params.userId),
        }
      },
    })
      .then((result) => {
        res.status(204).send();
      })
      .catch((result) => {
        res.status(404).send("Nothing to delete !");
      });
  });

  // Create a rest_api_user_permission
  app.post('/api/rest_api_user_permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { permission, user_id } = req.body;

    if (!(user_id && permission)) {
      res.status(400).send("All input is required");
    }

    await prisma.rest_api_user_permissions.findFirst({
      where: {
        permission: parseInt(permission),
        user_id: parseInt(user_id)
      },
    })
      .then(async (result) => {
        if (result) {
          return res.status(409).send("User Role mapping aready exist !");
        }

        let up = {
          permission: parseInt(permission),
          user_id: parseInt(user_id),
          created_at: currentDate,
          updated_at: currentDate
        };

        await prisma.rest_api_user_permissions.create({ data: up })
          .then((result) => {
            res.status(202).send(result);
          })
          .catch((result) => {
            res.status(500).json("Error");
          });
      });
  });
};