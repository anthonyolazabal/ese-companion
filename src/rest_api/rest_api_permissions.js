const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;

module.exports = function (app) {
  //Get rest_api_permissions
  app.get('/api/rest_api_permissions', auth, async (req, res) => {
    await prisma.rest_api_permissions.findMany()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((result) => {
        res.status(404).json(result);
      });
  });

  //Get a rest_api_permission
  app.get('/api/rest_api_permission/:permissionId', auth, async (req, res) => {
    await prisma.rest_api_permissions.findUnique({
      where: {
        id: parseInt(req.params.permissionId),
      },
    })
      .then((result) => {
        res.status(200).send(result);
      }).catch((result) => {
        res.status(404).send({});
      });
  });

  //Update a rest_api_permission
  app.put('/api/rest_api_permission/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.rest_api_permissions.update({
      where: {
        id: parseInt(req.params.permissionId),
      },
      data: req.body
    })
      .then((result) => {
        res.status(204).send({});
      }).catch((result) => {
        res.status(500).send("Internal Error");
      });
  });

  //Remove a rest_api_permission
  app.delete('/api/rest_api_permission/:permissionId', auth, async (req, res) => {
    await prisma.rest_api_permissions.delete({
      where: {
        id: parseInt(req.params.permissionId),
      },
    })
      .then((result) => {
        res.status(204).send({});
      }).catch((result) => {
        res.status(404).send("Nothing to delete !");
      });
  });

  // Create a rest_api_permission
  app.post('/api/rest_api_permission', auth, async (req, res) => {
    let currentDate = new Date();
    let nextId = 0;
    const { permission_string, description } = req.body;

    if (!(permission_string)) {
      res.status(400).send("All input is required");
    }

    await prisma.rest_api_permissions.findMany({
      take: 1,
      orderBy: {
        id: "desc",
      },
    })
      .then((result) => {
        nextId = result[0].id + 1;
      });

    let p = {
      id: nextId,
      permission_string: permission_string,
      description: description,
      created_at: currentDate,
      updated_at: currentDate
    };

    await prisma.rest_api_permissions.create({ data: p })
      .then((result) => {
        res.status(202).send(result);
      })
      .catch((result) => {
        res.status(500).json("Error");
      });
  });
};