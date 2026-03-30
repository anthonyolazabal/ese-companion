const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get cc_permissions
  app.get('/api/cc_permissions', auth, async (req, res) => {
    await prisma.cc_permissions.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a cc_permission
  app.get('/api/cc_permission/:permissionId', auth, async (req, res) => {
    await prisma.cc_permissions.findUnique({
      where: {
        id: parseInt(req.params.permissionId),
      },
    })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Update a cc_permission
  app.put('/api/cc_permission/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.cc_permissions.updateMany({
      where: {
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

  //Remove a cc_permission
  app.delete('/api/cc_permission/:permissionId', auth, async (req, res) => {
    await prisma.cc_permissions.delete({
      where: {
        id: parseInt(req.params.permissionId),
      },
    })
      .then((result) => {
        res.status(204).send(result);
      })
      .catch((result) => {
        res.status(404).send(result);
      });
  });

  // Create a cc_permission
  app.post('/api/cc_permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { permission_string, description } = req.body;

    if (!(permission_string)) {
      res.status(400).send("All input is required");
    }

    const prev = await prisma.cc_permissions.findMany({
      take: 1,
      orderBy: {
        id: "desc",
      },
    });
    let nextId = prev[0].id + 1;

    let p = {
      id: nextId,
      permission_string: permission_string,
      description: description,
      created_at: currentDate,
      updated_at: currentDate
    };

    await prisma.cc_permissions.create({ data: p })
      .then((result) => {
        res.status(204).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });
};