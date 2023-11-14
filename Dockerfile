FROM node:20

WORKDIR /usr/src/app

# Install app and dependencies (Java for ESEHelper to generate passwords)
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install default-jre
RUN apt-get clean

# Copy sources
COPY . .

# Build the source inside docker (this ensure the compatibility inside the docker image when you work for example on ARM (M2))
RUN npm ci
RUN npm run build-client
RUN npm cache clean --force
RUN npm cache verify

EXPOSE 3001
EXPOSE 4001
CMD [ "npm", "start" ]