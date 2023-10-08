# Introduction 
This project provide an API for the HiveMQ Enterprise Security Extension.
It aims to ease the use of the database.

# Build Docker Image
docker build -t ese-api --platform linux/amd64 .
(Platform is specified when other CPU than AMD64 are used like ARM)

# Run Docker image
docker run --env=TOKEN_KEY=@JwTT0k3nK3y!!!@JwTT0k3nK3y!!! --env=DATABASE_URL=postgresql://hivemq:hivemq@192.168.69.230:5432/hivemq-ese-dev?schema=public -p 3301:3001 -d ese-api:latest

Two important environnement variables are needed :
1. DATABASE_URL which give the connection string to the database (Using Prisma format)
2. TOKEN_KEY any token with multiple characters that will we used by the API to create JWT tokens

