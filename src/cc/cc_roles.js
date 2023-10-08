const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;

module.exports = function (app) {
  //Get cc_roles
  app.get('/api/cc_roles', auth, async (req, res) => {
    await prisma.cc_roles.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a cc_role
  app.get('/api/cc_role/:roleId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.cc_roles.findMany({
        where: {
          id: parseInt(req.params.roleId),
        },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
          cc_role_permissions: {
            select: {
              cc_permissions: {
                select: {
                  id: true,
                  permission_string: true,
                  description: true
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
      await prisma.cc_roles.findUnique({
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

  // Update a cc_role
  app.put('/api/cc_role/:userId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.cc_roles.updateMany({
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

  //Remove a cc_role
  app.delete('/api/cc_role/:roleId', auth, async (req, res) => {
    await prisma.cc_roles.delete({
      where: {
        id: parseInt(req.params.roleId),
      },
    })
      .then((result) => {
        res.status(204).send({});
      })
      .catch((result) => {
        res.status(404).send("Nothing to delete !");
      });
  });

  // Create a cc_roles
  app.post('/api/cc_role', auth, async (req, res) => {
    let currentDate = new Date();
    const { name, description } = req.body;

    if (!(name && description)) {
      res.status(400).send("All input is required");
    }

    await prisma.cc_roles.findFirst({
      where: {
        name: name,
      },
    })
      .then(async (result) => {
        if (result) {
          res.status(409).send("Role Already Exist !");
        }
        const prev = await prisma.cc_roles.findMany({
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

        await prisma.cc_roles.create({ data: r })
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