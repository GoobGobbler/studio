# services/ai-service/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock or pnpm-lock.yaml)
COPY package*.json ./
# If using yarn:
# COPY yarn.lock ./
# If using pnpm:
# COPY pnpm-lock.yaml ./

# Install app dependencies
RUN npm install --only=production
# If using yarn:
# RUN yarn install --production
# If using pnpm:
# RUN pnpm install --prod

# Bundle app source
COPY . .

# Build TypeScript code
RUN npm run build
# If using yarn:
# RUN yarn build
# If using pnpm:
# RUN pnpm build


# Expose the port the app runs on
EXPOSE 3003

# Define environment variable (can be overridden)
ENV NODE_ENV=production
ENV PORT=3003

# Command to run the application
CMD ["node", "dist/server.js"]
```