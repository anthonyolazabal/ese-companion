# ESE Companion
## Introduction 
This project was born out of a simple need: to have an API to manipulate the database of the [HiveMQ Enterprise broker](https://www.hivemq.com/products/hivemq-self-managed/) [Enterprise Security Extension](https://www.hivemq.com/extension/enterprise-security-extension/). The UI provided is the chery on the cake.

The project is release has Open Source and is currently still in development. It is fully working but there is still work in progress, see Roadmap for more details.

![Home](./images/home.png)

## Account interactions
The database is split in three sections, MQTT, Control Panel and Rest Api. Each section allow to control the authentication and authorization on a specific part of the enterprise broker.

UI for accounts : 
List
![Accounts](./images/accounts.png)

Account details
![Account Details](./images/account_details.png)

UI for roles :
List
![Roles](./images/roles.png)

Account details
![Role details](./images/role_details.png)

UI for permissions :
List
![Permissions](./images/permissions.png)

## Project structure
The project host the API and the UI. 
```
├── src
│   ├── ... (all API related files)
├── prisma
│   ├── ... (all Prisma related files)
├── public
│   ├── ... (UI packed files)
├── ui
│   ├── ... (all UI related files)
└── 
```

The ui folder include all the frontend project that can be run alone by adding in the 'main.ts' the following code to connect to a backend API. 
```
// Local dev instance
app.use(axios, {
    baseUrl: 'http://localhost:3001',
})
```

## Technologies
The API is built with NodeJS and include some third parties components to facilitate the development and the compatibility with multiple database engines.
- [Prisma ORM](https://www.prisma.io/)
- [Helmet](https://helmetjs.github.io/) to protect the API
- [Cors](https://expressjs.com/en/resources/middleware/cors.html) to handle Cross Origin

The UI is built with :
- [Vite](https://vitejs.dev/) 
- [VueJS](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/en/)

## UI Routing 
The UI is generating routes dynamically based on the name of the page. 

## Working with Prisma
Initialize prisma
```
npx prisma generate
```

Import DB Schema (need to have a valid connection string in the DATABASE_URL environment variable).
```
npx prisma db pull
```

Sync dev to DB (need to have a valid connection string in the DATABASE_URL environment variable).
```
npx prisma migrate dev
```

Based on the database needed, the good prisma schema as to be used (renamed): 
- schema.prisma.mysql
- schema.prisma.postgres

## Database compatibility
Thanks to Prisma, we can connect to several types of database engine with the same code. Here is the status of tests and validations carried out on the various engines compatible with the security extension.
[Full list of supported version](https://docs.hivemq.com/ese/4.20/enterprise-security-extension/ese#sql-db-versions)

| DB            | Tested | Validated |                                               Connection string format                                               | 
|---------------|:------:|:---------:|:--------------------------------------------------------------------------------------------------------------------:|
| PostgreSQL    |  YES   |    YES    |                        postgresql://username:password@server:port/database_name?schema=public                        |
| MariaDB       |   YES   |    YES     |             mysql://USER:PASSWORD@HOST:PORT/DATABASE                                                                                                         |
| MySQL         |   YES   |    YES     |                                       mysql://USER:PASSWORD@HOST:PORT/DATABASE                                       |
| SQL Server    |   NO   |    NO     |                   sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true                   |
| Azure SQL     |   NO   |    NO     |                   sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true                   |
| Amazon Aurora |   NO   |    NO     |                                       mysql://USER:PASSWORD@HOST:PORT/DATABASE                                       |

[More details on configuring Prisma connection string](https://www.prisma.io/docs/concepts/database-connectors)


## Database preparation
The schema of the Enterprise Security Extension remain untouched. The authentication on the API and the UI is done with the accounts that are in the resp_api_users table. 
To be able to access the user needs to have the eseapi_admin role assigned which has himself the eseapiadmin permission.

For more information on the structure of the database, please refer to the official documentation : [Link](https://docs.hivemq.com/ese/4.20/enterprise-security-extension/ese-intro)

To create all the needed entries in the database, just execute the following commands on top of the database (also available in Prisma folder > updateDb.sql).
By default the user created is **eseapiadmin** with the password **supersecurepassword**.
```
-- Create special permission in ESE DB for additionnal API
insert into rest_api_permissions (permission_string, description)
values ('HIVEMQ_ESEAPI_ADMIN', 'special rest_api_permission, that allows access to ESE API');

-- Create special role in ESE DB for additionnal API
insert into rest_api_roles (name, description)
values ('eseapi_admin', 'has the HIVEMQ_ESEAPI_ADMIN permission');

-- Map role and permission
insert into rest_api_role_permissions (role, permission)
select rest_api_roles.id, rest_api_permissions.id
from rest_api_roles,
     rest_api_permissions
where rest_api_roles.name = 'eseapi_admin'
  AND rest_api_permissions.permission_string = 'HIVEMQ_ESEAPI_ADMIN';

-- Create the first user with eseapi admin permission
insert into rest_api_users (username, password, password_iterations, password_salt, algorithm)
values ('eseapiadmin', 'nOgr9xVnkt51Lr68KS/rAKm/LqxAt8oEki7vCerRod3qDbyMFfDBGT8obnkw+AGygxCQDWdaA2sQnXXoAbVK6Q==', 100, 'wxw+3diCV4bWXQHb6LLniA==', 'SHA512');

-- Map user to eseapi_admin role
INSERT INTO rest_api_user_roles (user_id, role_id)
select rest_api_users.id, rest_api_roles.id
from rest_api_users,
     rest_api_roles
where rest_api_users.username = 'eseapiadmin'
  AND rest_api_roles.name = 'eseapi_admin'
;
```

## Build Docker Image
```
docker build -t ese-companion-dbflavor --platform linux/amd64 .
```
(Platform is specified when other CPU than AMD64 are used like ARM)

## Run Docker image

At the moment two DB flavors are available (later on SQL Server is in the roadmap) :
- [PostgreSQL version](https://hub.docker.com/repository/docker/anthonyolazabal/ese-companion-postgresql/general) 
- [MySQL version](https://hub.docker.com/repository/docker/anthonyolazabal/ese-companion-mysql/general)

```
docker run --env=TOKEN_KEY=@JwTT0k3nK3y!!!@JwTT0k3nK3y!!! --env=DATABASE_URL=postgresql://hivemq:hivemq@192.168.69.230:5432/hivemq-ese-dev?schema=public -p 3301:3001 -d ese-companion-dbflavor:latest
```

Two important environment variables are needed :
1. DATABASE_URL which give the connection string to the database (Using Prisma format)
```
DATABASE_URL="postgresql://username:password@server:port/database_name?schema=public"
```
2. TOKEN_KEY any token with multiple characters that will we used by the API to create JWT tokens
```
TOKEN_KEY="@lsirfgjoirnkk!!"
```

## Run the API and UI locally on a server
If you prefer to run the API and the UI on a server, you will need to have :
- NodeJS 18 or more (Docker image is actually running with NodeJS 20)
- Npm 
- Java Runtime

Local execution has been tested on MacOS and Linux, this should also works under Windows.

Once you have the prerequisites, you can clone the repository, install dependencies and build the local instance.
(Be sure to have you local environment variables to point to the database or at least a .env file otherwise the prisma generation will not work)
```
git clone https://github.com/anthonyolazabal/ese-companion.git
npm install
npx prisma generate
npm run build-app
```
This will build the UI and embedded it with the API.

## Access ports
If you plan to use the tool on your computer with Doccker, you will be able to access it with localhost on port 3001 without any problem on the web browser. 
If you plan to access it remotly, you have two options : 
- Use the self signed certificate in the container and access port 4001 (You will need to approve the untrusted certificate)
- Use a reverse proxy solution to manage the HTTPS access and offload it to HTTP on the container. (Client (HTTPS) --> (HTTPS) PROXY (HTTP) --> (HTTP) Container)

Mostly all the new web browsers are preventing API access on HTTP (unsecure) this is why you need to access it with HTTPS.

## Interact with ESE Companion API
Before being able to interact with the API, you first need to get a valid JWT Token by calling the /login endpoint.

After getting the token, just pass it to any API call via the x-access-token header. Here is a sample call :
````
curl --location 'http://localhost:3001/api/users' \
--header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImVzZWFwaWFkbWluIiwiaWF0IjoxNjk1MDMxMjA0LCJleHAiOjE2OTUwMzg0MDR9.VoZWjjmIhgf0kkyb-XjqLyl_UCUxFth7EpCNsQACu2g'
````
A postman collection is available in the postman folder.

## Roadmap
- UI : Transition all pages from options to compositions
- API : Add OpenApi description
- API : Add force delete on delete methods (actually, before being able to delete an entry, you need to delete all relations to other tables before. Example, you want to delete a user, you need first to clean role and permissions assignments)

## Collaboration
If you'd like to help with development, you can contribute by working on bugs and feature requests. You can't commit to the main branch, you have to pull a branch (identify the branch in relation to the bug/feature request you're working on). The merge will then take place on the main branch, with a code review.

## Open a bug 
To declare a bug, use the GitHub Issue tracking and fill the template with all the informations needed to reproduce it.
[Here is the link](https://github.com/anthonyolazabal/ese-companion/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=)

## Open a feature request
To ask for a new feature, use the GitHub Issue tracking and fill the template for the feature request with all the informations needed.
[Here is the link](https://github.com/anthonyolazabal/ese-companion/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=)


