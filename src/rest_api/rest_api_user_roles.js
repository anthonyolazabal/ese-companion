const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get rest_api_user_roles
  app.get('/api/rest_api_user_roles', auth, async (req, res) => {
    await prisma.rest_api_user_roles.findMany()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((result) => {
        res.status(200).json(result);
      });
  });

  //Get a rest_api_user_role (by default no details about permissions associated : extend=true)
  app.get('/api/rest_api_user_role/:userId/:roleId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.rest_api_user_roles.findMany({
        where: {
          user_id: {
            equals: parseInt(req.params.userId),
          },
          role_id: {
            equals: parseInt(req.params.roleId),
          }
        },
        select: {
          role_id: true,
          user_id: true,
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
          res.status(200).json(result);
        });
    } else {
      await prisma.rest_api_user_roles.findMany({
        where: {
          role_id: {
            equals: parseInt(req.params.roleId),
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
          res.status(200).json(result);
        });
    }
  });

  //Update a rest_api_user_role
  app.put('/api/rest_api_user_role/:userId/:roleId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.rest_api_user_roles.updateMany({
      where: {
        role_id: {
          equals: parseInt(req.params.roleId),
        },
        user_id: {
          equals: parseInt(req.params.userId),
        }
      },
      data: req.body
    })
      .then((result) => {
        res.status(202).json(result);
      })
      .catch((result) => {
        res.status(500).json("Internal error");
      });
  });

  //Remove a rest_api_user_role
  app.delete('/api/rest_api_user_role/:userId/:roleId', auth, async (req, res) => {
    const result = await prisma.rest_api_user_roles.deleteMany({
      where: {
        role_id: {
          equals: parseInt(req.params.roleId),
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
        res.status(500).send("Internal error");
      });
  });

  // Create a rest_api_user_role
  app.post('/api/rest_api_user_role', auth, async (req, res) => {
    let currentDate = new Date();
    const { role_id, user_id } = req.body;

    if (!(role_id && user_id)) {
      res.status(400).send("All input is required");
    }

    await prisma.rest_api_user_roles.findFirst({
      where: {
        role_id: parseInt(role_id),
        user_id: parseInt(user_id)
      },
    }).then(async (result) => {
      if (result) {
        return res.status(409).send("User Role mapping aready exist !");
      }
      let ur = {
        role_id: parseInt(role_id),
        user_id: parseInt(user_id),
        created_at: currentDate,
        updated_at: currentDate
      };

      await prisma.rest_api_user_roles.create({ data: ur })
        .then((result) => {
          res.status(202).send(result);
        })
        .catch((result) => {
          res.status(500).json("Error");
        });
    });
  });
};