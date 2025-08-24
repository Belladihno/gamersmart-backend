# GameSmart API

A comprehensive gaming e-commerce API that provides endpoints for user authentication, game management, shopping cart functionality, order processing, payments, and reviews.

## Features

- User authentication and authorization with JWT tokens
- Game catalog management with search, filter, and pagination
- Shopping cart functionality with real-time inventory management
- Order processing and management
- Payment integration with Flutterwave
- User reviews and ratings system
- Email notifications via SendGrid
- Image upload via Cloudinary

## Base URL

**Development:** `http://localhost:5000`
**Production:** `https://github.com/Belladihno/gamersmart-backend.git`

## API Version

**Current Version:** v1.0.0

## Content Type

All requests should include:
```
Content-Type: application/json
```

## Authentication

This API uses JWT (JSON Web Token) for authentication. After successful login, include the token in all protected routes:

### Header Format:
```
Authorization: Bearer <your-jwt-token>
```

### Token Management:
- Access tokens expire based on JWT_ACCESS_TOKEN_EXPIRES_IN environment variable
- You'll receive a 401 Unauthorized status when the token expires
- Re-authenticate to get a new token
- Tokens are automatically set in HTTP-only cookies for web clients

### Account Verification:
- New accounts require email verification before accessing protected features
- Use `/api/auth/send-verification-code` and `/api/auth/verify-verification-code`
- Some endpoints require verified accounts (marked with 🔐 in documentation)

## Rate Limiting

- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 5 minutes per IP
- Rate limit headers are included in responses

## Common Error Codes

### Success Codes
- **200 OK** - Request successful
- **201 Created** - Resource created successfully  
- **204 No Content** - Resource deleted successfully

### Client Error Codes
- **400 Bad Request** - Invalid request data or validation errors
- **401 Unauthorized** - Missing, invalid, or expired authentication token
- **403 Forbidden** - Insufficient permissions or unverified account required
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists (duplicate email, username, etc.)
- **429 Too Many Requests** - Rate limit exceeded

### Server Error Codes
- **500 Internal Server Error** - Unexpected server error

## Response Format

### Success Response Structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Structure:
```json
{
  "status": "fail", // or "error" for server errors (5xx)
  "message": "Detailed error description"
}
```

### Paginated Response Structure:
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "results": 10,
  "currentPage": 1,
  "totalPages": 5,
  "data": [
    // Array of items
  ]
}
```

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User authentication  
- `POST /logout` - 🔒 User logout
- `PATCH /send-verification-code` - 🔒 Send email verification code
- `PATCH /verify-verification-code` - 🔒 Verify email code
- `PATCH /send-forgot-password-code` - Send password reset code
- `PATCH /verify-forgot-password-code` - Reset password with code

### User Management (`/api/user`)
- `GET /get-profile` - 🔒 Get user profile
- `PUT /update-profile` - 🔒 Update user profile
- `PATCH /update-password` - 🔒 Change password

### Games (`/api/games`)
- `GET /` - Get all games (with filtering, search, pagination)
- `GET /:id` - Get game by ID
- `GET /slug/:slug` - Get game by slug
- `POST /` - 🔒 Create new game (admin/owner)
- `PUT /:id` - 🔒 Update game (admin/owner)  
- `DELETE /:id` - 🔒 Delete game (admin/owner)

### Shopping Cart (`/api/cart`)
- `GET /` - 🔒 Get user's cart
- `POST /add` - 🔒 Add item to cart
- `PUT /update/:id` - 🔒 Update cart item quantity
- `DELETE /remove/:id` - 🔒 Remove item from cart
- `DELETE /clear` - 🔒 Clear entire cart

### Orders (`/api/order`)
- `GET /` - 🔒🔐 Get user's orders
- `GET /:id` - 🔒🔐 Get specific order
- `POST /` - 🔒🔐 Create order from cart
- `PUT /:id` - 🔒🔐 Cancel order

### Payments (`/api/payment`)
- `POST /initialize` - 🔒🔐 Initialize payment with Flutterwave
- `GET /callback` - 🔒🔐 Payment verification callback
- `GET /history` - 🔒🔐 Get payment history
- `POST /webhook` - Flutterwave webhook (public)

### Reviews (`/api/review`)
- `GET /:id` - Get all reviews for a game
- `POST /:id` - 🔒🔐 Create review for game
- `PUT /:id` - 🔒🔐 Update user's review
- `DELETE /:id` - 🔒🔐 Delete user's review

**Legend:**
- 🔒 Authentication required
- 🔐 Email verification required

## Query Parameters

### Filtering & Search
- `search` - Search in game names and descriptions
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (e.g., "name", "-createdAt", "price")
- `fields` - Select specific fields (e.g., "name,price,image")

### Advanced Filtering Examples
- `price[gte]=100` - Games with price >= 100
- `price[lte]=500` - Games with price <= 500
- `availability=available` - Only available games
- `discount[gt]=0` - Games with discounts

## File Upload

### Image Upload Requirements
- **Supported formats:** JPEG, PNG, WebP
- **Maximum file size:** 5MB
- **Field name:** `image`
- **Content-Type:** `multipart/form-data`

## Payment Integration

### Supported Methods
- Credit/Debit Cards
- Bank Transfer

### Payment Flow
1. Create order from cart
2. Initialize payment with order ID
3. Redirect user to Flutterwave checkout
4. Handle payment callback
5. Verify payment status
6. Update order and inventory

## Data Validation Rules

### User Registration
- **firstname/lastname:** Min 3 characters
- **username:** Min 3 characters, unique, lowercase
- **email:** Valid email format (.com, .net domains), unique
- **password:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character

### Game Creation
- **name:** Required, max 50 characters, unique
- **shortDescription:** Required, max 100 characters
- **price:** Required, positive number
- **discount:** Optional, 0-100
- **stock.quantity:** Min 0, max 100 (if not unlimited)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- SendGrid account  
- Flutterwave account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Belladihno/gamersmart-backend.git
cd gamersmart-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server
NODE_ENV=development
PORT=5000

# Database  
MONGO_URL=mongodb://localhost:27017/gamersmart

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES_IN=7d
AUTH_COOKIE_MAX_AGE=604800000

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@gamersmart.com
SENDGRID_FROM_NAME=Gamersmart

# Image Upload (Cloudinary)
CLOUD_NAME=your-cloud-name  
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# Payment (Flutterwave)
FLUTTER_TEST_SECRET_KEY=your-test-secret-key
FLUTTER_TEST_PUBLIC_KEY=your-test-public-key
FLW_WEBHOOK_SECRET_HASH=your-webhook-hash

# Security
HMAC_VERIFICATION_CODE_SECRET=your-hmac-secret
HMAC_FORGOT_PASSWORD_SECRET=your-forgot-password-secret

# Frontend
WEBHOOK_FRONTEND_URL=https://gamersmart-api.onrender.com/
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation & Testing

- **Swagger UI:** `http://localhost:5000/api-docs`
- **Health Check:** `http://localhost:5000/api/status`
- **Test Endpoint:** `http://localhost:5000/test`

## Detailed API Examples

### Authentication Flow

#### Register User
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "MyPassword123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "sign up successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "_id": "64f7...",
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "verified": false
  }
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "MyPassword123!"
}
```

#### Send Verification Code
```bash
PATCH /api/auth/send-verification-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify Email
```bash
PATCH /api/auth/verify-verification-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com",
  "emailCode": "123456"
}
```

### Game Management

#### Get All Games
```bash
GET /api/games?page=1&limit=10&sort=-createdAt&search=action
```

#### Create Game (Multipart Form)
```bash
POST /api/games
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [file]
name: "Call of Duty: Modern Warfare"
shortDescription: "Intense first-person shooter"
description: "Full game description..."
price: 59.99
discount: 10
releaseDate: "2024-01-15"
stock: {"quantity": 100, "unlimited": false}
```

### Shopping Cart

#### Add to Cart
```bash
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "64f7a1b2c3d4e5f6789012ab",
  "quantity": 2
}
```

#### Get Cart
```bash
GET /api/cart
Authorization: Bearer <token>
```

### Order & Payment

#### Create Order
```bash
POST /api/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos State",
    "zipCode": "100001",
    "country": "NG"
  },
  "paymentMethod": "card"
}
```

#### Initialize Payment
```bash
POST /api/payment/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "64f7a1b2c3d4e5f6789012ab"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentUrl": "https://checkout.flutterwave.com/...",
    "reference": "tx_1697...",
    "paymentId": "64f7..."
  }
}
```

### Reviews

#### Create Review
```bash
POST /api/review/64f7a1b2c3d4e5f6789012ab
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great game! Highly recommended.",
  "rating": 5
}
```

## Error Handling Examples

### Validation Error (400)
```json
{
  "status": "fail",
  "message": "firstname must contain at least 3 characters"
}
```

### Authentication Error (401)
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```

### Verification Required (401)
```json
{
  "status": "fail", 
  "message": "You must be verified to access this resource"
}
```

### Permission Error (403)
```json
{
  "status": "fail",
  "message": "You do not have permission to access this resource"
}
```

### Rate Limit Error (429)
```json
{
  "error": "Too many requests, please try again later."
}
```

### Resource Not Found (404)
```json
{
  "status": "fail",
  "message": "Game not found"
}
```

### Duplicate Resource (409)
```json
{
  "status": "fail",
  "message": "User with this email already exists"
}
```

## Security Features

- **Helmet.js** for security headers
- **CORS** configuration with origin restrictions
- **Rate limiting** to prevent abuse
- **Input validation** with Joi schemas
- **Password hashing** with bcrypt (12 rounds)
- **JWT token authentication** with HTTP-only cookies
- **HMAC** for sensitive operations (verification codes)
- **File upload restrictions** (type, size limits)
- **Request size limits** (10MB maximum)
- **MongoDB injection protection**

## Architecture

- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with HTTP-only cookies
- **File Storage:** Cloudinary
- **Email Service:** SendGrid
- **Payment Gateway:** Flutterwave
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Morgan
- **Compression:** Gzip compression enabled

## Project Structure

```
gamersmart-backend/
├── src/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── gameController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── protect.js
│   │   ├── upload.js
│   │   └── validator.js
│   ├── models/
│   │   ├── cartItemModel.js
│   │   ├── cartModel.js
│   │   ├── gameModel.js
│   │   ├── orderModel.js
│   │   ├── paymentModel.js
│   │   ├── reviewModel.js
│   │   └── userModel.js
│   ├── routers/
│   │   ├── authRoute.js
│   │   ├── cartRoute.js
│   │   ├── gameRoute.js
│   │   ├── orderRoute.js
│   │   ├── paymentRoute.js
│   │   ├── reviewRoute.js
│   │   └── userRoute.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── flutterwaveService.js
│   │   └── imageService.js
│   └── utils/
│       ├── apiFeatures.js
│       ├── appError.js
│       ├── catchAsync.js
│       ├── hashing.js
│       ├── helpers.js
│       └── signToken.js
├── swagger.js
├── server.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For API support or questions:
- Create an issue in the repository
- Contact the development team
- Check the Swagger documentation at `/api-docs`

## Changelog

### v1.0.0
- Initial release
- Complete authentication system
- Game management with image upload
- Shopping cart functionality
- Order processing
- Payment integration with Flutterwave
- Review system
- Email notifications