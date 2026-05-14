# Docker Setup Guide - Church Management System

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (comes with Docker Desktop)

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up --build
```

This will start:
- **MySQL Database** (port 3306)
- **Redis Cache** (port 6379)
- **API Gateway** (port 3001)
- **All Microservices** (ports 3002-3007)
- **Frontend (Next.js)** (port 3000)

### 2. Verify Services Are Running

All services should be healthy and accessible at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- Individual services: http://localhost:3002-3007
- MySQL: localhost:3306
- Redis: localhost:6379

## Service Details

### MySQL Database
- **Container**: church-mysql
- **Port**: 3306
- **Database**: church_management
- **User**: church_admin
- **Password**: church_password_123
- **Data Volume**: mysql-data (persistent)

### Redis Cache
- **Container**: church-redis
- **Port**: 6379
- **Data Volume**: redis-data (persistent)

### API Gateway
- **Port**: 3001
- **Depends on**: MySQL, Redis, all microservices
- **Healthcheck**: Enabled

### Microservices
All services depend on MySQL and Redis:
- Member Service (3002)
- Attendance Service (3003)
- Financial Service (3004)
- Event Service (3005)
- Communication Service (3006)
- Reporting Service (3007)

### Frontend
- **Port**: 3000
- **Framework**: Next.js
- **Depends on**: API Gateway
- **Build**: Multi-stage build (builder + production)

## Common Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Data
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mysql
docker-compose logs -f redis
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

### Access Containers
```bash
# MySQL CLI
docker exec -it church-mysql mysql -u church_admin -p church_management

# Redis CLI
docker exec -it church-redis redis-cli

# Service bash
docker exec -it <service-name> sh
```

## Environment Configuration

### Backend (.env)
Located at `backend/.env`
- Database credentials
- Redis configuration
- Service URLs
- JWT secrets
- API keys
- Email/SMS configuration

### Frontend (.env.local)
Located at `frontend/.env.local`
- API URL: `http://localhost:3001`

## Troubleshooting

### MySQL Connection Issues
```bash
# Check MySQL status
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Wait for healthy status before starting other services
```

### Redis Connection Issues
```bash
# Test Redis connection
docker exec church-redis redis-cli ping
```

### Port Already in Use
If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:3001"  # Change left number to different port
```

### Services Not Starting
1. Check Docker Desktop is running
2. Run `docker-compose down -v` to clean up
3. Run `docker-compose up --build` again

## Database Management

### Create Database Backup
```bash
docker exec church-mysql mysqldump -u church_admin -p church_management > backup.sql
```

### Restore Database
```bash
docker exec -i church-mysql mysql -u church_admin -p church_management < backup.sql
```

## Performance Notes

- MySQL is configured with UTF-8MB4 character set for full emoji/unicode support
- Redis is used for caching to meet performance KPIs
- All services have health checks for production readiness
- Volume persistence ensures data survives container restarts

## Production Deployment

For production:
1. Update `.env` with strong passwords and secure keys
2. Use environment variables for sensitive data
3. Configure proper networking and security groups
4. Set `NODE_ENV=production`
5. Use managed database services (AWS RDS, Google Cloud SQL, etc.)
6. Use managed Redis (AWS ElastiCache, etc.)

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Documentation](https://hub.docker.com/_/mysql)
- [Redis Docker Documentation](https://hub.docker.com/_/redis)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment/docker)

