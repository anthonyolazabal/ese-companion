FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app and dependencies (Java for ESEHelper to generate passwords)
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install default-jre
COPY . .

RUN npm ci
RUN npm run build-client

EXPOSE 3001
CMD [ "npm", "start" ]