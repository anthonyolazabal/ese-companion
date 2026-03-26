const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get cc_role_permissions
  app.get('/api/cc_role_permissions', auth, async (req, res) => {
    await prisma.cc_role_permissions.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a cc_role_permission (by default no details about permissions associated : extend=true)
  app.get('/api/cc_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      cc_role_permission = await prisma.cc_role_permissions.findMany({
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
          cc_permissions: {
            select: {
              id: true,
              permission_string: true,
              description: true
            }
          },
          cc_roles: {
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
          res.status(200).send(result);
        })
        .catch((result) => {
          res.status(500).send(result);
        });
    } else {
      await prisma.cc_role_permissions.findMany({
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
          res.status(200).send(result);
        })
        .catch((result) => {
          res.status(500).send(result);
        });
    }
  });

  //Update a cc_role_permission
  app.put('/api/cc_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.cc_role_permissions.updateMany({
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
        res.status(202).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Remove a cc_role_permission
  app.delete('/api/cc_role_permission/:roleId/:permissionId', auth, async (req, res) => {
    await prisma.cc_role_permissions.deleteMany({
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
        res.status(202).send(result);
      })
      .catch((result) => {
        res.status(404).send(result);
      });
  });

  // Create a cc_role_permission
  app.post('/api/cc_role_permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { role, permission } = req.body;

    if (!(role && permission)) {
      res.status(400).send("All input is required");
    }

    await prisma.cc_role_permissions.findFirst({
      where: {
        role: parseInt(role),
        permission: parseInt(permission)
      },
    })
      .then(async (result) => {
        if (result) {
          res.status(409).send("Role Permission mapping aready exist !");
        }

        let rp = {
          role: parseInt(role),
          permission: parseInt(permission),
          created_at: currentDate,
          updated_at: currentDate
        };

        await prisma.cc_role_permissions.create({ data: rp })
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((result) => {
            res.status(500).send(result);
          });
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });
};