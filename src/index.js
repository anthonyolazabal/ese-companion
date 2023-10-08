// importing the dependencies
require("dotenv").config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const encryptPassword = require("./helpers/cryptoHelper").encryptPassword;
const { generateHash } = require("./helpers/cryptoHelper");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// defining the Express app
const app = express();

// Adding Helmet to enhance your Rest API's security
app.use(helmet());

app.use(helmet.hidePoweredBy());

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "*"],
      "style-src": null,
    },
  })
);

// Sets "Cross-Origin-Opener-Policy: same-origin"
app.use(helmet({ crossOriginOpenerPolicy: true }));

// Sets "Cross-Origin-Opener-Policy: same-origin-allow-popups"
app.use(helmet({ crossOriginOpenerPolicy: { policy: "same-origin" } }));

// Sets "Cross-Origin-Resource-Policy: same-origin"
app.use(helmet({ crossOriginResourcePolicy: true }));

// Sets "Cross-Origin-Resource-Policy: same-site"
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" } }));
// Using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// Enabling CORS for all requests
app.use(cors({
  origin: '*'
}));

// Adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(express.static('public'));

// Defining the root endpoint
app.get('/api', auth, (req, res) => {
  res.send("Welcome on ESE API 🐝 !");
});

// Login
//Above lines are to force redirection to login forms in case of refresh on the page.
app.get("/login", (req, res) => {
  return res.redirect('/');
})

app.post("/api/login", async (req, res) => {
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send("All user input is required");
    }

    prisma.rest_api_users.findUnique({
      where: {
        username: username,
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
        rest_api_user_roles: {
          select: {
            rest_api_roles: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    }).then(async (result) => {
      let hasRole = false
      if (result) {
        result.rest_api_user_roles.forEach(role => {
          if (role.rest_api_roles.name == "eseapi_admin") {
            hasRole = true;
          }
        });

        // let testPassword = encryptPassword(password, result.password_salt, result.password_iterations, result.algorithm);
        let testPassword = await generateHash(password, result.password_salt, result.password_iterations, result.algorithm);

        // Create token
        if (testPassword.trim().toString() == result.password.trim().toString() && hasRole) {
          const token = jwt.sign(
            { user_id: result.id, username },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );

          result.token = token;
          res.status(200).json(result);
        } else {
          res.status(401).send("Invalid credentials or role not assigned");
        };
      } else {
        res.status(401).send("Invalid credentials");
      }
    }).catch((error) => {
      res.status(500).send(error);
    });

  } catch (err) {
    res.status(500).send(err);
  }
});

//// Analytics ////
require('./analytics/analytics')(app);

//// MQTT Users ////
require('./mqtt/mqtt_users')(app);

//// MQTT User Role ////
require('./mqtt/mqtt_user_roles')(app);

//// MQTT Roles ////
require('./mqtt/mqtt_roles')(app);

//// MQTT Role Permissions ////
require('./mqtt/mqtt_role_permissions')(app);

//// MQTT Permissions ////
require('./mqtt/mqtt_permissions')(app);

//// MQTT User Permission ////
require('./mqtt/mqtt_user_permissions')(app);

//// MQTT Statistics ////
require('./mqtt/mqtt_statistics')(app);

//// CC Users ////
require('./cc/cc_users')(app);

//// CC User Role ////
require('./cc/cc_user_roles')(app);

//// CC User Permission ////
require('./cc/cc_user_permissions')(app);

//// CC Roles ////
require('./cc/cc_roles')(app);

//// CC Role Permissions ////
require('./cc/cc_role_permissions')(app);

//// CC Permissions ////
require('./cc/cc_permissions')(app);

//// CC Statistics ////
require('./cc/cc_statistics')(app);

//// REST API Users ////
require('./rest_api/rest_api_users')(app);

//// REST API User Role ////
require('./rest_api/rest_api_user_roles')(app);

//// REST API User Permission ////
require('./rest_api/rest_api_user_permissions')(app);

//// REST API Roles ////
require('./rest_api/rest_api_roles')(app);

//// REST API Role Permissions ////
require('./rest_api/rest_api_role_permissions')(app);

//// REST API Permissions ////
require('./rest_api/rest_api_permissions')(app);

//// REST API Statistics ////
require('./rest_api/rest_api_statistics')(app);

// Start HTTPS Server 
https.createServer({
  key: fs.readFileSync('./certificates/server.key'),
  cert: fs.readFileSync('./certificates/server.cert')
}, app).listen(4001)

// Start HTTP server
app.listen(3001, () => {
  console.log('ESE Editor Api listening on port 3001');
});