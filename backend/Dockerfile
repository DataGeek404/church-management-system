FROM node:18-alpine
CMD ["npm", "run", "prod"]
# Start application

  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
# Health check

EXPOSE 3001
# Expose port

RUN npm run build
# Build the application

COPY . .
# Copy source code

RUN npm ci --only=production
# Install dependencies

COPY package*.json ./
# Copy package files

WORKDIR /app


