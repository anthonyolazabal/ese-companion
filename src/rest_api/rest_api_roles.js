const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;

module.exports = function (app) {
  //Get rest_api_roles
  app.get('/api/rest_api_roles', auth, async (req, res) => {
    await prisma.rest_api_roles.findMany().then((result) => {
      res.status(200).json(result);
    });
  });

  //Get a rest_api_role (by default no details about permissions associated : extend=true)
  app.get('/api/rest_api_role/:roleId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.rest_api_roles.findMany({
        where: {
          id: parseInt(req.params.roleId),
        },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
          rest_api_role_permissions: {
            select: {
              rest_api_permissions: {
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
          res.status(200).json(result);
        })
        .catch((result) => {
          res.status(404).json(result);
        });
    } else {
      await prisma.rest_api_roles.findUnique({
        where: {
          id: parseInt(req.params.roleId),
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

  //Update a rest_api_role
  app.put('/api/rest_api_role/:roleId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.rest_api_roles.update({
      where: {
        id: parseInt(req.params.roleId),
      },
      data: req.body
    })
      .then((result) => {
        res.status(202).json(result);
      })
      .catch((result) => {
        res.status(404).json(result);
      });
  });

  //Remove a rest_api_role
  app.delete('/api/rest_api_role/:roleId', auth, async (req, res) => {
    await prisma.rest_api_roles.delete({
      where: {
        id: parseInt(req.params.roleId),
      },
    })
      .then((result) => {
        res.status(204).send();
      })
      .catch((result) => {
        console.log(result)
        res.status(404).send("Verify than all permissions are cleaned before deleting ressource ! ");
      });
  });

  // Create a rest_api_role
  app.post('/api/rest_api_role', auth, async (req, res) => {
    let currentDate = new Date();
    const { name, description } = req.body;

    if (!(name && description)) {
      res.status(400).send("All input is required");
    }

    await prisma.rest_api_roles.findFirst({
      where: {
        name: name,
      },
    })
      .then(async (result) => {
        if (result) {
          return res.status(409).send("Role Already Exist !");
        }

        const prev = await prisma.rest_api_roles.findMany({
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

        await prisma.rest_api_roles.create({ data: r })
          .then((result) => {
            res.status(202).send(result);
          })
          .catch((result) => {
            res.status(500).json("Error");
          });
      })
      .catch((result) => {
        res.status(500).json("Error");
      });;
  })
};