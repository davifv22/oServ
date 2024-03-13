# Use the official Node.js 18 image as base
FROM node:20 as builder

# Set the working directory
WORKDIR /usr/src/app

# Install the Angular CLI
RUN npm install -g @angular/cli

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install node 20

# Copy the rest of the application files
COPY . .

# Build the application
RUN ng build

# Use a lighter image for the final stage
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the previous stage into the nginx web server
COPY --from=builder /usr/src/app/dist/oServ /usr/share/nginx/html/dist/oServ

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
