const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;

module.exports = function (app) {
  //Get roles
  app.get('/api/roles', auth, async (req, res) => {
    await prisma.roles.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a role
  app.get('/api/role/:roleId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.roles.findMany({
        where: {
          id: parseInt(req.params.roleId),
        },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
          role_permissions: {
            select: {
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
              }
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
      await prisma.roles.findUnique({
        where: {
          id: parseInt(req.params.roleId),
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

  //Update a role
  app.put('/api/role/:userId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.roles.updateMany({
      where: {
        id: parseInt(req.params.userId),
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

  //Remove a role
  app.delete('/api/role/:roleId', auth, async (req, res) => {
    await prisma.roles.delete({
      where: {
        id: parseInt(req.params.roleId),
      },
    })
      .then((result) => {
        res.status(204).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  // Create a role
  app.post('/api/role', auth, async (req, res) => {
    let currentDate = new Date();
    const { name, description } = req.body;

    if (!(name && description)) {
      res.status(400).send("All input is required");
    }

    await prisma.roles.findFirst({
      where: {
        name: name,
      },
    })
      .then(async (result) => {
        if (result) {
          res.status(409).send("Role Already Exist !");
        }
        const prev = await prisma.roles.findMany({
          take: 1,
          orderBy: {
            id: "desc",
          },
        });
        let nextId = prev[0].id + 1;

        let r = {
          id: nextId,
          name: name,
          description: description,
          created_at: currentDate,
          updated_at: currentDate
        };

        await prisma.roles.create({ data: r })
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