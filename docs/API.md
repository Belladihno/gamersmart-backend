# Gamersmart API - Detailed Documentation

## Table of Contents

- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [Data Models](#data-models)
- [Middleware](#middleware)
- [Services](#services)
- [Utilities](#utilities)
- [Security Features](#security-features)
- [API Usage Examples](#api-usage-examples)
- [Database Considerations](#database-considerations)
- [Testing Guide](#testing-guide)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. Register with `/auth/signup`
2. Verify email with verification code
3. Login with `/auth/login` to receive JWT token
4. Include token in subsequent requests

## Error Responses

All error responses follow this format:

```json
{
  "status": "fail|error",
  "message": "Error description"
}
```

### HTTP Status Codes

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **429** - Too Many Requests
- **500** - Internal Server Error

## Data Models

### User Model

```javascript
{
  firstname: String (required, min: 3)
  lastname: String (required, min: 3)
  username: String (required, unique, min: 3)
  email: String (required, unique)
  role: String (enum: ['user', 'admin'], default: 'user')
  password: String (required, hashed)
  verified: Boolean (default: false)
  verificationCode: String (select: false)
  verificationCodeValidation: Number (select: false)
  forgotPasswordCode: String (select: false)
  forgotPasswordCodeValidation: Number (select: false)
  passwordChangedAt: Date (select: false)
  phoneNumber: String (nullable)
  active: Boolean (default: true, select: false)
  address: Array of shipping/billing addresses
}
```

### Game Model

```javascript
{
  name: String (required, trim)
  user: ObjectId (required, ref: 'User')
  slug: String (unique, lowercase, auto-generated)
  description: String
  shortDescription: String (required)
  price: Number (required)
  discount: Number (default: 0, 0-100%)
  releaseDate: Date (required)
  image: String (required, Cloudinary URL)
  images: Array of strings (additional images)
  availability: String (enum: ['available', 'pre-order', 'out-of-stock'])
  stock: {
    quantity: Number (min: 0, default: 0)
    unlimited: Boolean (default: true)
  }
  isActive: Boolean (default: true)
  reviews: {
    count: Number (default: 0)
    averageRating: Number (0-5, default: 0)
  }
}
```

### Virtual Fields

- `discountPrice`: Calculated price after discount
- `fullName`: User's full name (firstname + lastname)

### Cart Model

```javascript
{
  user: ObjectId (required, ref: 'User')
  totalAmount: Number (default: 0, min: 0)
  status: String (enum: ['active', 'checkout', 'completed', 'abandoned'])
  totalItems: Number (default: 0, min: 0)
}
```

### Order Model

```javascript
{
  user: ObjectId (ref: 'User')
  orderNumber: String (unique, required, auto-generated)
  items: Array of order items
  totalAmount: Number (required, min: 0)
  totalItems: Number (required, min: 1)
  status: String (enum: ['pending', 'processing', 'completed', 'cancelled'])
  shippingAddress: Object (required)
  paymentMethod: String (enum: ['card', 'paypal', 'bank_transfer', 'flutterwave'])
  paymentStatus: String (enum: ['pending', 'paid', 'failed'])
}
```

## Middleware

### Authentication Middleware (`protect.js`)

- **protect**: Verifies JWT token and authenticates user
- **restrictTo**: Role-based authorization
- **adminOnly**: Admin-only access
- **checkOwnership**: Resource ownership verification

### File Upload Middleware (`upload.js`)

- Multer configuration for image uploads
- 5MB file size limit
- Image format validation
- Memory storage for Cloudinary integration

### Error Handling Middleware (`errorHandler.js`)

- Global error handling
- Development vs Production error responses
- MongoDB error handling (CastError, ValidationError, DuplicateKey)
- JWT error handling

### Validation Middleware (`validator.js`)

- Joi schema validation
- Password strength requirements
- Email format validation
- MongoDB ObjectId validation
- Custom validation messages

## Services

### Email Service (`emailService.js`)

Gmail OAuth2 integration for sending emails:

- HTML/text email support
- Verification code sending
- Password reset emails
- Transporter creation with OAuth2

### Image Service (`imageService.js`)

Cloudinary integration for image management:

- Image upload with base64 conversion
- Image deletion
- Folder organization
- Automatic optimization

### Flutterwave Service (`flutterwaveService.js`)

Payment processing integration:

- Payment initialization
- Transaction verification
- Webhook handling
- Transaction reference generation

## Utilities

### API Features (`apiFeatures.js`)

Query enhancement utilities:

- **Search**: Text search across multiple fields
- **Filter**: Advanced filtering with comparison operators (gte, gt, lte, lt)
- **Sort**: Multi-field sorting
- **Field Selection**: Limit returned fields
- **Pagination**: Page-based result limiting

### Helpers (`helpers.js`)

Common utility functions:

- **updateCartTotals**: Calculate cart totals
- **getCartWithItems**: Aggregate cart with items
- **createSlug**: Generate URL-friendly slugs
- **generateUniqueSlug**: Ensure slug uniqueness

### Hashing (`hashing.js`)

Security utilities:

- **doHash**: Password hashing with bcrypt
- **doHashValidation**: Password verification
- **hmacProcess**: HMAC generation for verification codes

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### JWT Security

- Secure token generation
- Token expiration handling
- Password change invalidation
- HTTP-only cookies in production

### Data Validation

- Input sanitization with Joi
- Schema validation for all endpoints
- MongoDB injection prevention
- XSS protection through validation

## API Usage Examples

### Authentication Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123!"
  }'

# 2. Send verification code
curl -X PATCH http://localhost:5000/api/auth/send-verification-code \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# 3. Verify email
curl -X PATCH http://localhost:5000/api/auth/verify-verification-code \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "emailCode": 123456}'

# 4. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123!"}'
```

### Game Management

```bash
# Get all games with advanced filtering
curl "http://localhost:5000/api/games?search=zelda&price[gte]=50&price[lte]=100&sort=-createdAt&page=1&limit=10&fields=name,price,image"

# Get game by slug
curl http://localhost:5000/api/games/slug/the-legend-of-zelda

# Create game with image
curl -X POST http://localhost:5000/api/games \
  -H "Authorization: Bearer <token>" \
  -F "name=The Legend of Zelda" \
  -F "shortDescription=Epic adventure game" \
  -F "description=A legendary adventure awaits..." \
  -F "price=59.99" \
  -F "discount=10" \
  -F "releaseDate=2023-12-01" \
  -F 'stock={"quantity":100,"unlimited":false}' \
  -F "image=@game-cover.jpg"

# Update game
curl -X PUT http://localhost:5000/api/games/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -F "name=Updated Game Name" \
  -F "price=49.99"
```

### Shopping Cart Operations

```bash
# Get cart
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <token>"

# Add item to cart
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"gameId": "507f1f77bcf86cd799439011", "quantity": 2}'

# Update cart item quantity
curl -X PUT http://localhost:5000/api/cart/update/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Remove item from cart
curl -X DELETE http://localhost:5000/api/cart/remove/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"

# Clear entire cart
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Bearer <token>"
```

### Order Management

```bash
# Create order from cart
curl -X POST http://localhost:5000/api/order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001",
      "country": "NG"
    },
    "paymentMethod": "card"
}'

# Get user orders
curl -X GET "http://localhost:5000/api/order?page=1&limit=10&sort=-createdAt" \
  -H "Authorization: Bearer <token>"

# Get specific order
curl -X GET http://localhost:5000/api/order/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>"

# Cancel order
curl -X PUT http://localhost:5000/api/order/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>"
```

### Payment Processing

```bash
# Initialize payment
curl -X POST http://localhost:5000/api/payment/initialize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "507f1f77bcf86cd799439013"}'

# Get payment history
curl -X GET http://localhost:5000/api/payment/history \
  -H "Authorization: Bearer <token>"
```

### Review System

```bash
# Get reviews for a game
curl -X GET "http://localhost:5000/api/review/507f1f77bcf86cd799439011?page=1&limit=10&sort=-createdAt" \
  -H "Authorization: Bearer <token>"

# Create review
curl -X POST http://localhost:5000/api/review/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Amazing game! Highly recommended.", "rating": 5}'

# Update review
curl -X PUT http://localhost:5000/api/review/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated review content", "rating": 4}'

# Delete review
curl -X DELETE http://localhost:5000/api/review/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer <token>"
```

### User Profile Management

```bash
# Get profile
curl -X GET http://localhost:5000/api/user/get-profile \
  -H "Authorization: Bearer <token>"

# Update profile
curl -X PUT http://localhost:5000/api/user/update-profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstname": "Jane", "lastname": "Smith", "username": "janesmith"}'

# Update password
curl -X PATCH http://localhost:5000/api/user/update-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "Password123!",
    "newPassword": "NewPassword456!",
    "confirmPassword": "NewPassword456!"
  }'
```

## Testing Guide

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] User login and JWT token handling
- [ ] Password reset functionality
- [ ] Game CRUD operations with image upload
- [ ] Cart operations (add, update, remove, clear)
- [ ] Order creation and status management
- [ ] Payment initialization and verification
- [ ] Review system (create, update, delete)
- [ ] Search and filtering functionality
- [ ] Pagination across all endpoints
- [ ] Error handling and validation
- [ ] Authentication middleware
- [ ] Role-based authorization
- [ ] File upload limits and validation

### Test Environment Setup

```bash
# Clone and install
git clone <repository>
cd gamersmart-api
npm install

# Set up test environment variables
cp .env.example .env.test
# Configure test database and services

# Run development server
npm run dev
```

### Testing Tools Recommendations

- **Postman**: For API testing with collections
- **Thunder Client**: VS Code extension for API testing
- **Jest**: For unit and integration tests (if implementing)
- **MongoDB Compass**: For database inspection

## Performance Optimization

### Query Optimization

- Use proper MongoDB indexes
- Implement field selection to limit data transfer
- Use pagination for large result sets
- Cache frequently accessed data

### Image Optimization

- Cloudinary automatic optimization
- Appropriate image formats and sizes
- CDN delivery for fast loading

### Connection Management

- MongoDB connection pooling
- Proper connection handling
- Connection timeout configuration

## Deployment Best Practices

### Environment Configuration

- Set `NODE_ENV=production`
- Use environment-specific configuration
- Secure database connections
- Configure proper CORS origins

### Security Configuration

- Use HTTPS in production
- Set secure cookie flags
- Configure rate limiting
- Input validation and sanitization
- Regular security updates

### Monitoring and Logging

- Implement proper logging
- Monitor API performance
- Track error rates
- Set up health checks

---

This documentation provides comprehensive coverage of the Gamersmart API functionality, implementation details, and usage examples. For the interactive API specification, refer to the `swagger.yaml` file.
