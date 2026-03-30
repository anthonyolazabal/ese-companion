const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;
const { generateHash } = require("../helpers/cryptoHelper");

module.exports = function (app) {
  app.get('/api/users', auth, async (req, res) => {
    await prisma.users.findMany()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  //Get a user
  app.get('/api/user/:userId', auth, async (req, res) => {
    if (req.query.extend == 'true') {
      await prisma.users.findMany({
        where: {
          id: parseInt(req.params.userId),
        },
        select: {
          id: true,
          username: true,
          password: true,
          password_iterations: true,
          password_salt: true,
          algorithm: true,
          created_at: true,
          updated_at: true,
          user_permissions: {
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
          },
          user_roles: {
            select: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  description: true,
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
              }
            }
          }
        }
      })
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((error) => {
          console.log(error)
          res.status(500).send(error);
        });
    } else {
      await prisma.users.findUnique({
        where: {
          id: parseInt(req.params.userId),
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

  //Update a user 
  app.put('/api/user/:userId', auth, async (req, res) => {
    req.body["updated_at"] = new Date();
    req.body["password"] = encryptPassword(req.body["password"], req.body["password_salt"], req.body["password_iterations"], req.body["algorithm"]);
    await prisma.users.updateMany({
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

  //Remove a user
  app.delete('/api/user/:userId', auth, async (req, res) => {
    await prisma.users.delete({
      where: {
        id: parseInt(req.params.userId),
      },
    })
      .then((result) => {
        res.status(204).send(result);
      })
      .catch((result) => {
        res.status(500).send(result);
      });
  });

  // Create a user
  app.post('/api/user', auth, async (req, res) => {
    let currentDate = new Date();
    const { username, password, algorithm, password_iterations } = req.body;

    if (!(username && password && algorithm && password_iterations)) {
      res.status(400).send("All input is required");
    }

    await prisma.users.findFirst({
      where: {
        username: username,
      },
    })
      .then(async (result) => {
        if (result) {
          res.status(409).send("Username Already Exist !");
        }
        let u = {
          username: username,
          password: "",
          password_iterations: 0,
          password_salt: "",
          algorithm: "",
          created_at: currentDate,
          updated_at: currentDate
        };

        u.password_salt = generateSaltBase64();
        u.algorithm = (typeof algorithm === 'undefined') ? "SHA512" : algorithm;
        u.password_iterations = (typeof password_iterations === 'undefined') ? 100 : password_iterations;

        // u.password = encryptPassword(password, u.password_salt, u.password_iterations, u.algorithm);
        u.password = await generateHash(password, u.password_salt, u.password_iterations, u.algorithm);

        await prisma.users.create({ data: u })
          .then((result) => {
            res.status(201).send(result);
          })
          .catch((result) => {
            res.status(500).send(result);
          });
      })
      .catch((error) => {
        res.status(500).send("Error creating user !");
      });
  });
};