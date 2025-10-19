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

