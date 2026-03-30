const auth = require("../middleware/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require("../helpers/cryptoHelper").encryptPassword;
const generateSaltBase64 = require("../helpers/cryptoHelper").generateSaltBase64;

module.exports = function (app) {
  //Get global statistics
  app.get('/api/global', auth, async (req, res) => {
    let analytics = []
    let mqtt_labels = []
    let mqtt_data = []

    await prisma.users.count()
      .then((result) => {
        mqtt_labels.push('Users')
        mqtt_data.push(result)
      });

    await prisma.roles.count()
      .then((result) => {
        mqtt_labels.push('Roles')
        mqtt_data.push(result)
      });

    await prisma.permissions.count()
      .then((result) => {
        mqtt_labels.push('Permissions')
        mqtt_data.push(result)
      });

    analytics.push({ mqtt_labels: mqtt_labels })
    analytics.push({ mqtt_data: mqtt_data })

    let cc_labels = []
    let cc_data = []
    await prisma.cc_users.count()
      .then((result) => {
        cc_labels.push('CC Users')
        cc_data.push(result)
      });

    await prisma.cc_roles.count()
      .then((result) => {
        cc_labels.push('CC Roles')
        cc_data.push(result)
      });

    await prisma.cc_permissions.count()
      .then((result) => {
        cc_labels.push('CC Permissions')
        cc_data.push(result)
      });

    analytics.push({ cc_labels: cc_labels })
    analytics.push({ cc_data: cc_data })

    let rest_api_labels = []
    let rest_api_data = []
    await prisma.rest_api_users.count()
      .then((result) => {
        rest_api_labels.push('Rest Api Users')
        rest_api_data.push(result)
      });

    await prisma.rest_api_roles.count()
      .then((result) => {
        rest_api_labels.push('Rest Api Roles')
        rest_api_data.push(result)
      });

    await prisma.rest_api_permissions.count()
      .then((result) => {
        rest_api_labels.push('Rest Api Permissions')
        rest_api_data.push(result)
      });

    analytics.push({ rest_api_labels: rest_api_labels })
    analytics.push({ rest_api_data: rest_api_data })

    await prisma.user_roles.count()
      .then((result) => {
        analytics.push({ user_roles: result })
      });

    await prisma.user_permissions.count()
      .then((result) => {
        analytics.push({ user_permissions: result })
      });

    await prisma.cc_user_roles.count()
      .then((result) => {
        analytics.push({ cc_user_roles: result })
      });

    await prisma.cc_user_permissions.count()
      .then((result) => {
        analytics.push({ cc_user_permissions: result })
      });

    await prisma.rest_api_user_roles.count()
      .then((result) => {
        analytics.push({ rest_api_user_roles: result })
      });

    await prisma.rest_api_user_permissions.count()
      .then((result) => {
        analytics.push({ rest_api_user_permissions: result })
      });
    res.status(200).send(analytics)
  });
};