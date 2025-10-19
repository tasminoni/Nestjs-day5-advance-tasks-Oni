# NestJS Day 5 - Advanced MongoDB Implementation

This project implements advanced NestJS features with MongoDB integration, including query filters, pagination, validation, soft deletes, bulk operations, and comprehensive error handling.

## 🚀 Features Implemented

### ✅ 1. Query Filters
- **GET /users**: Search by name/email (case-insensitive)
- Age filtering with `minAge` and `maxAge`
- Soft delete filtering with `isDeleted` parameter

### ✅ 2. Pagination & Sort
- `page`, `pageSize`, `sortBy`, `sortOrder` parameters
- Response includes meta: `{ total, page, pageSize, totalPages }`

### ✅ 3. DTO & Validation
- Create/Update DTOs with `@IsEmail`, `@Length`, `@Min/@Max`, `@IsOptional`
- Global ValidationPipe: `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`

### ✅ 4. Unique Index
- Email unique constraint at schema level + MongoDB index
- Duplicate email returns 409 Conflict status

### ✅ 5. Soft-Delete Consistency
- Default queries filter `isDeleted: false`
- Soft delete with `deletedAt` timestamp
- Restore endpoint: `PUT /users/:id/restore`

### ✅ 6. Lean & Projection
- `.lean()` queries for better performance
- Default projection hides `__v`, `isDeleted`, `deletedAt`
- Option to override projection when needed

### ✅ 7. Response Wrapper
- `TransformInterceptor`: `{ success, message, data, meta? }`
- `LoggingInterceptor`: logs method, URL, status, duration

### ✅ 8. Bulk Create
- `POST /users/bulk`: Create multiple users
- Skips duplicate emails
- Returns `{ insertedCount, skipped: [{email, reason}] }`

### ✅ 9. Global Error Filter
- MongoDB E11000 → 409 Conflict
- CastError/ObjectId → 400 Bad Request
- Default errors → 500 Internal Server Error

### ✅ 10. Swagger Documentation
- Complete API documentation at `/docs`
- DTO and route decorations
- Title and version from package.json

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Make sure MongoDB is running on localhost:27017
```

3. **Environment Variables:**
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nestjs-day5
```

4. **Start the application:**
```bash
npm run start:dev
```

The application will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs

## 🧪 Testing All Features

### 1. Query Filters Testing

#### Search by Name/Email (Case-insensitive)
```bash
# Search by name
curl "http://localhost:3000/users?search=john"

# Search by email
curl "http://localhost:3000/users?search=john@example.com"

# Case-insensitive search
curl "http://localhost:3000/users?search=JOHN"
```

#### Age Filtering
```bash
# Minimum age
curl "http://localhost:3000/users?minAge=25"

# Maximum age
curl "http://localhost:3000/users?maxAge=65"

# Age range
curl "http://localhost:3000/users?minAge=25&maxAge=65"
```

#### Soft Delete Filtering
```bash
# Active users only (default)
curl "http://localhost:3000/users"

# Include deleted users
curl "http://localhost:3000/users?isDeleted=true"

# Only deleted users
curl "http://localhost:3000/users?isDeleted=true"
```

### 2. Pagination & Sort Testing

```bash
# Basic pagination
curl "http://localhost:3000/users?page=1&pageSize=5"

# Sort by name ascending
curl "http://localhost:3000/users?sortBy=name&sortOrder=asc"

# Sort by age descending
curl "http://localhost:3000/users?sortBy=age&sortOrder=desc"

# Combined filters with pagination
curl "http://localhost:3000/users?search=john&minAge=25&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc"
```

### 3. DTO & Validation Testing

#### Create User (Valid)
```bash
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 25
  }'
```

#### Create User (Invalid - Validation Errors)
```bash
# Missing required fields
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John"
  }'

# Invalid email format
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "age": 25
  }'

# Age out of range
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 200
  }'
```

### 4. Unique Index Testing

```bash
# Create first user
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  }'

# Try to create user with same email (should return 409)
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

### 5. Soft Delete Testing

```bash
# Create a user first
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "age": 30
  }'

# Get user ID from response, then soft delete
curl -X DELETE "http://localhost:3000/users/USER_ID"

# Try to get the user (should return 404)
curl "http://localhost:3000/users/USER_ID"

# Check deleted users
curl "http://localhost:3000/users?isDeleted=true"

# Restore the user
curl -X PATCH "http://localhost:3000/users/USER_ID/restore"

# Get the user again (should work now)
curl "http://localhost:3000/users/USER_ID"
```

### 6. Update User Testing

```bash
# Update user (replace USER_ID with actual ID)
curl -X PATCH "http://localhost:3000/users/USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "age": 35
  }'

# Update with email (should work if email is unique)
curl -X PATCH "http://localhost:3000/users/USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

### 7. Bulk Create Testing

```bash
# Bulk create with mixed valid/invalid emails
curl -X POST "http://localhost:3000/users/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {
        "name": "User 1",
        "email": "user1@example.com",
        "age": 25
      },
      {
        "name": "User 2",
        "email": "user2@example.com",
        "age": 30
      },
      {
        "name": "User 3",
        "email": "john@example.com",
        "age": 35
      }
    ]
  }'
```

### 8. Error Handling Testing

```bash
# Invalid ObjectId (should return 400)
curl "http://localhost:3000/users/invalid-id"

# Non-existent user (should return 404)
curl "http://localhost:3000/users/507f1f77bcf86cd799439011"

# Invalid data type in query
curl "http://localhost:3000/users?minAge=invalid"
```

### 9. Response Format Testing

All responses follow this format:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 10. Swagger Documentation Testing

1. Open http://localhost:3000/docs in your browser
2. Explore all endpoints
3. Test endpoints directly from Swagger UI
4. Check request/response schemas

## 📊 Database Indexes

The application creates the following indexes for optimal performance:

1. **Unique Index**: `{ email: 1 }`
2. **Compound Index**: `{ isDeleted: 1, _id: 1 }`

## 🔧 Project Structure

```
src/
├── dto/                    # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── query-user.dto.ts
│   └── bulk-create-user.dto.ts
├── filters/                # Exception Filters
│   └── mongo-exception.filter.ts
├── interceptors/           # Global Interceptors
│   ├── transform.interceptor.ts
│   └── logging.interceptor.ts
├── interfaces/             # Type Definitions
│   └── api-response.interface.ts
├── schemas/                # MongoDB Schemas
│   └── user.schema.ts
├── users/                  # Users Module
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts
└── main.ts
```

## 🚀 Performance Features

- **Lean Queries**: Uses `.lean()` for better performance
- **Projection**: Hides unnecessary fields by default
- **Indexes**: Optimized database queries
- **Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error mapping

## 📝 Logging

The application logs all requests with:
- HTTP method
- URL
- Status code
- Response time

Example log output:
```
[LoggingInterceptor] GET /users 200 45ms
[LoggingInterceptor] POST /users 201 123ms
```

## 🔍 Monitoring

Check the console logs for:
- Request/response logging
- Error handling
- Database connection status
- Application startup messages

## 🛠️ Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

## 📋 TODO / Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add database seeding
- [ ] Implement caching
- [ ] Add more comprehensive tests
- [ ] Add health checks
- [ ] Implement API versioning