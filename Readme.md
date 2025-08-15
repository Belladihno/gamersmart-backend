# Gamersmart - Gaming Store API

A comprehensive gaming store backend API built with Node.js, Express, and MongoDB. Features user management, game catalog, shopping cart, order processing, payment integration, and review system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for image uploads)
- Gmail OAuth2 credentials (for email service)
- Flutterwave account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamersmart-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Required Environment Variables**
   ```env
   # Database
   MONGO_URL=mongodb://localhost:27017/gamersmart

   # JWT
   JWT_SECRET=your-jwt-secret
   JWT_ACCESS_TOKEN_EXPIRES_IN=7d
   TOKEN_SECRET=your-token-secret
   AUTH_COOKIE_MAX_AGE=604800000

   # Cloudinary
   CLOUD_NAME=your-cloudinary-name
   CLOUD_API_KEY=your-cloudinary-key
   CLOUD_API_SECRET=your-cloudinary-secret

   # Gmail OAuth2
   GMAIL_CLIENT_ID=your-gmail-client-id
   GMAIL_CLIENT_SECRET=your-gmail-client-secret
   GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
   GMAIL_USER_EMAIL=your-gmail-email

   # HMAC Secrets
   HMAC_VERIFICATION_CODE_SECRET=your-verification-secret
   HMAC_FORGOT_PASSWORD_SECRET=your-forgot-password-secret

   # Flutterwave
   FLUTTER_TEST_SECRET_KEY=your-flutterwave-secret
   FLUTTER_TEST_PUBLIC_KEY=your-flutterwave-public-key
   FLUTTER_TEST_ENCRYPTION_KEY=your-flutterwave-encryption-key
   FLW_WEBHOOK_SECRET_HASH=your-webhook-secret
   WEBHOOK_FRONTEND_URL=http://localhost:3000

   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

- **Detailed Documentation**: [docs/API.md](docs/API.md)
- **Swagger UI**: Import `swagger.yaml` into Swagger Editor
- **Base URL**: `http://localhost:5000/api` (development)

## 🏗️ Project Structure

```
src/
├── config/           # Database and service configurations
├── controllers/      # Route handlers
├── middlewares/      # Authentication, validation, error handling
├── models/          # MongoDB schemas
├── routers/         # Route definitions
├── services/        # External service integrations
└── utils/           # Helper functions and utilities
```

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (User/Admin)
- Email verification system
- Password reset functionality

### 🎮 Game Management
- CRUD operations with image upload
- Advanced search and filtering
- Slug-based URLs
- Stock management
- Discount pricing

### 🛒 Shopping Experience
- Shopping cart management
- Order processing
- Payment integration (Flutterwave)
- Order tracking

### ⭐ Community Features
- Game reviews and ratings
- User profiles
- Review moderation

## 🔧 API Endpoints Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `/api/auth/*` | Registration, login, verification |
| Users | `/api/user/*` | Profile management |
| Games | `/api/games/*` | Game catalog CRUD |
| Cart | `/api/cart/*` | Shopping cart operations |
| Orders | `/api/order/*` | Order management |
| Payments | `/api/payment/*` | Payment processing |
| Reviews | `/api/review/*` | Game reviews system |

## 🚦 Quick API Examples

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","username":"johndoe","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

### Games
```bash
# Get all games
curl http://localhost:5000/api/games

# Search games
curl "http://localhost:5000/api/games?search=zelda&price[gte]=50"
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with Joi
- CORS protection
- Rate limiting capabilities
- Secure file upload handling

## 🧪 Testing

```bash
# Run tests (if available)
npm test

# Manual testing with provided endpoints
# See docs/API.md for detailed examples
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connection
- [ ] Set up HTTPS
- [ ] Configure CORS for your domain
- [ ] Set secure cookie flags
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For questions or support:
- Create an issue in the repository
- Email: abimbolaomisakin678@gmail.com

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Node.js, Express, and MongoDB**