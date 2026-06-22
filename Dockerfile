# Use Node.js official image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package and install dependencies
COPY package.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port for Render
EXPOSE 10000

# Start the Node.js server
CMD ["npm", "start"]
