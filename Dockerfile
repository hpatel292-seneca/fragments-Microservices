#############################################################################################################################
# Stage 0: Install the base dependecies
FROM node:20-alpine@sha256:55004633597a2e059ca930a7cca9785b94125eb9442a1e31a6a4707dacfa348b AS dependencies

# explicit path - Copy the package.json and package-lock.json files into /app.
COPY package*.json /app/

# Use /app as our working directory
WORKDIR /app

# Install node dependencies defined in package-lock.json (For production)
RUN npm ci --production

##############################################################################################################################
# Stage 1: Copy required files and Deploy
FROM node:20-alpine@sha256:55004633597a2e059ca930a7cca9785b94125eb9442a1e31a6a4707dacfa348b AS build

LABEL maintainer="Harshil Patel <hpatel292@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color

#set node environment to production
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

#Copy the generated dependencies (node_modules/)
COPY --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Install curl for healthcheck
RUN apk update && apk add --no-cache curl=8.9.0-r0

# Switch user to node
# USER node

# Start the container by running our server
# fix the warning given by Halolint "warning: Use arguments JSON notation for CMD and ENTRYPOINT arguments"
CMD ["npm", "start"]


# We run our service on port 8080
EXPOSE 8080

# Add a healthcheck layer (Querying healthcheck route '/')
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
