const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;
const { generateHash } = require("../helpers/cryptoHelper");

module.exports = function (app) {
    //Get rest_api_users
    app.get('/api/rest_api_users', auth, async (req, res) => {
        await prisma.rest_api_users.findMany()
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((result) => {
                res.status(404).send([]);
            });
    });

    //Get a rest_api_users
    app.get('/api/rest_api_user/:userId', auth, async (req, res) => {
        if (req.query.extend == 'true') {
            await prisma.rest_api_users.findMany({
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
                    rest_api_user_permissions: {
                        select: {
                            rest_api_permissions: {
                                select: {
                                    id: true,
                                    permission_string: true,
                                    description: true,
                                    created_at: true,
                                    updated_at: true
                                }
                            }
                        }
                    },
                    rest_api_user_roles: {
                        select: {
                            rest_api_roles: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    rest_api_role_permissions: {
                                        select: {
                                            rest_api_permissions: {
                                                select: {
                                                    id: true,
                                                    permission_string: true,
                                                    description: true,
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
                .catch((result) => {
                    res.status(404).send("Nothing to delete !");
                });
        }
        else {
            await prisma.rest_api_users.findUnique({
                where: {
                    id: parseInt(req.params.userId),
                }
            })
                .then((result) => {
                    res.status(200).send(result);
                })
                .catch((result) => {
                    res.status(404).send("Nothing to delete !");
                });
        }
    });

    //Update a rest_api_user
    app.put('/api/rest_api_user/:userId', auth, async (req, res) => {
        req.body["updated_at"] = new Date();
        req.body["password"] = encryptPassword(req.body["password"], req.body["password_salt"], req.body["password_iterations"], req.body["algorithm"]);
        await prisma.rest_api_users.update({
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

    //Remove a rest_api_user
    app.delete('/api/rest_api_user/:userId', auth, async (req, res) => {
        await prisma.rest_api_users.delete({
            where: {
                id: parseInt(req.params.userId),
            },
        })
            .then((result) => {
                console.log(result)
                res.status(204).send();
            })
            .catch((result) => {
                res.status(404).send("Nothing to delete !");
            });
    });

    // Create a rest_api_user
    app.post('/api/rest_api_user', auth, async (req, res) => {
        let currentDate = new Date();
        const { username, password, algorithm } = req.body;

        if (!(username && password && algorithm)) {
            res.status(400).send("All input is required");
        }

        await prisma.rest_api_users.findFirst({
            where: {
                username: username,
            },
        }).then(async (result) => {
            if (result) {
                res.status(409).send("Username Already Exist !");
            }

            let u = {
                username: username,
                password: "",
                password_iterations: 100,
                password_salt: "",
                algorithm: "",
                created_at: currentDate,
                updated_at: currentDate
            };

            u.password_salt = generateSaltBase64();
            u.algorithm = algorithm;
            // u.password = encryptPassword(password, u.password_salt, u.password_iterations, u.algorithm);
            u.password = await generateHash(password, u.password_salt, u.password_iterations, u.algorithm);

            prisma.rest_api_users.create({ data: u }).then((result) => {
                res.status(202).send(result);
            })
                .catch((result) => {
                    res.status(500).json("Error");
                });
        });
    });
};