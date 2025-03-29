# Stage 1: Build the app
FROM node:latest AS build-app
WORKDIR /app
COPY app/package.json ./package.json
RUN npm install
COPY app/ ./
RUN npm run build

# Stage 2: Prepare the API
FROM node:latest AS build-api
WORKDIR /api
COPY api/package.json ./package.json
RUN npm install
COPY api/ ./

# Stage 3: Run both app and API
FROM node:latest
WORKDIR /workspace

# Copy the built app and API
COPY --from=build-app /app ./app
COPY --from=build-api /api ./api

# Expose ports
EXPOSE 3000
EXPOSE 5000

# Start both the app and the API
CMD ["sh", "-c", "cd app && npm run start & cd api && npm run start"]