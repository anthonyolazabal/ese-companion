const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get role_permissions
  app.get('/api/role_permissions', auth, async (req, res) => {
    await prisma.role_permissions.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a role_permission (by default no details about permissions associated : extend=true)
  app.get('/api/role_permission/:roleId/:permissionId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.role_permissions.findMany({
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
          permissions: {
            select: {
              id: true,
              topic: true,
              publish_allowed: true,
              subscribe_allowed: true,
              qos_0_allowed: true,
              qos_1_allowed: true,
              qos_2_allowed: true,
              retained_msgs_allowed: true,
              shared_group: true,
              shared_sub_allowed: true,
              created_at: true,
              updated_at: true
            }
          },
          roles: {
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
      await prisma.role_permissions.findMany({
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

  //Update a role_permission
  app.put('/api/role_permission/:roleId/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.role_permissions.updateMany({
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

  //Remove a role_permission
  app.delete('/api/role_permission/:roleId/:permissionId', auth, async (req, res) => {
    await prisma.role_permissions.deleteMany({
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
        res.status(500).send(result);
      });
  });

  // Create a role_permission
  app.post('/api/role_permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { role, permission } = req.body;

    if (!(role && permission)) {
      res.status(400).send("All input is required");
    }

    await prisma.role_permissions.findFirst({
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

        const role_permission = await prisma.role_permissions.create({ data: rp })
          .then((result) => {
            res.status(201).send(result);
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