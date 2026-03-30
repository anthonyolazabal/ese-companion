const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function (app) {
  //Get permissions
  app.get('/api/permissions', auth, async (req, res) => {
    await prisma.permissions.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a permission
  app.get('/api/permission/:permissionId', auth, async (req, res) => {
    await prisma.permissions.findUnique({
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

  //Update a permission
  app.put('/api/permission/:permissionId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    await prisma.permissions.updateMany({
      where: {
        id: parseInt(req.params.permissionId),
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

  //Remove a permission
  app.delete('/api/permission/:permissionId', auth, async (req, res) => {
    await prisma.permissions.delete({
      where: {
        id: parseInt(req.params.permissionId),
      },
    })
      .then((result) => {
        res.status(204).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  // Create a permission
  app.post('/api/permission', auth, async (req, res) => {
    let currentDate = new Date();
    const { topic, publish_allowed, subscribe_allowed, qos_0_allowed, qos_1_allowed, qos_2_allowed, retained_msgs_allowed, shared_sub_allowed, shared_group } = req.body;

    if (!(topic)) {
      res.status(400).send("All input is required");
    }

    const prev = await prisma.permissions.findMany({
      take: 1,
      orderBy: {
        id: "desc",
      },
    });
    let nextId = prev[0].id + 1;

    let p = {
      id: nextId,
      topic: topic,
      publish_allowed: publish_allowed,
      subscribe_allowed: subscribe_allowed,
      qos_0_allowed: qos_0_allowed,
      qos_1_allowed: qos_1_allowed,
      qos_2_allowed: qos_2_allowed,
      retained_msgs_allowed: retained_msgs_allowed,
      shared_sub_allowed: shared_sub_allowed,
      shared_group: shared_group,
      created_at: currentDate,
      updated_at: currentDate
    };

    await prisma.permissions.create({ data: p })
      .then((result) => {
        res.status(202).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });
};