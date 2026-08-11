# Roamigo Backend API Endpoints Documentation

This document describes all API endpoints available in the **Roamigo** backend service.

## General Information

- **Base URL**: `http://localhost:5000/api/v1`
- **Content Type**: `application/json` for all request/response bodies.
- **Authentication**: Authentication is handled via HTTP-only cookies (`accessToken` and `refreshToken`). Standard API routing also validates cookies. For non-browser clients, tokens can also be parsed/provided as needed.
- **Global Rate Limiting**: Enabled globally to protect against abuse.
- **Winston HTTP Logging**: Enabled for tracking all request paths, statuses, and client details.

---

## Table of Contents

1. [Authentication (`/auth`)](#1-authentication-auth)
2. [User Actions (`/users`)](#2-user-actions-users)
3. [Properties & Search (`/properties`)](#3-properties--search-properties)
4. [Bookings (`/bookings`)](#4-bookings-bookings)
5. [Payments & Webhooks (`/payments`)](#5-payments--webhooks-payments)
6. [Reviews & Feedback (`/reviews`)](#6-reviews--feedback-reviews)
7. [Wishlist (`/wishlist`)](#7-wishlist-wishlist)
8. [Provider Portal (`/provider`)](#8-provider-portal-provider)
9. [Admin Operations (`/admin`)](#9-admin-operations-admin)
10. [Health & System Public Endpoints](#10-health--system-public-endpoints)

---

## 1. Authentication (`/auth`)

**Base Path**: `/api/v1/auth`

### 1.1 Register User
- **Method**: `POST`
- **Route**: `/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210",
    "password": "securePassword123",
    "role": "USER" // Optional: "USER" (default) or "PROVIDER"
  }
  ```
- **Response (`201 Created`)**:
  - Sets HTTP-only cookies: `accessToken` (15 mins) and `refreshToken` (7 days).
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "65c3b9efd1...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+919876543210",
        "role": "USER",
        "status": "ACTIVE"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 1.2 Login User
- **Method**: `POST`
- **Route**: `/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (`200 OK`)**:
  - Sets HTTP-only cookies: `accessToken` (15 mins) and `refreshToken` (7 days).
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "65c3b9efd1...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "USER"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 1.3 Logout User
- **Method**: `POST`
- **Route**: `/logout`
- **Auth**: Public
- **Request Body**: (Optional)
  ```json
  {
    "refreshToken": "optional_token_value_if_not_in_cookie"
  }
  ```
- **Response (`200 OK`)**:
  - Clears `accessToken` and `refreshToken` cookies from browser.
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": {}
  }
  ```

### 1.4 Refresh Token
- **Method**: `POST`
- **Route**: `/refresh`
- **Auth**: Public
- **Request Body**: (Optional)
  ```json
  {
    "refreshToken": "optional_token_value_if_not_in_cookie"
  }
  ```
- **Response (`200 OK`)**:
  - Updates cookies: `accessToken` (15 mins) and `refreshToken` (7 days).
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
  ```

### 1.5 Forgot Password
- **Method**: `POST`
- **Route**: `/forgot-password`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Password reset instructions generated",
    "data": {
      "resetToken": "db7b8f9e01a2..." // Returned for local testing and dev flow
    }
  }
  ```

### 1.6 Reset Password
- **Method**: `POST`
- **Route**: `/reset-password/:token`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "password": "newSecurePassword456"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Password reset successful. You can now log in with your new password.",
    "data": {}
  }
  ```

### 1.7 Current Logged-in User Context
- **Method**: `GET`
- **Route**: `/me`
- **Auth**: Authenticated User
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Me user retrieved",
    "data": {
      "user": {
        "_id": "65c3b9efd1...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+919876543210",
        "role": "USER",
        "status": "ACTIVE"
      }
    }
  }
  ```

---

## 2. User Actions (`/users`)

**Base Path**: `/api/v1/users`
**Auth**: Authenticated User (Requires standard validation headers/cookies)

### 2.1 Update Personal Profile
- **Method**: `PATCH` / `GET` (as fallback)
- **Route**: `/me`
- **Request Body (`PATCH`)**:
  ```json
  {
    "name": "Jane updated name",
    "phone": "+919999988888",
    "avatar": "https://images.unsplash.com/photo-example"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User profile updated successfully",
    "data": {
      "user": {
        "_id": "65c3b9efd1...",
        "name": "Jane updated name",
        "email": "jane@example.com",
        "phone": "+919999988888",
        "avatar": "https://images.unsplash.com/photo-example"
      }
    }
  }
  ```

### 2.2 Get User Bookings
- **Method**: `GET`
- **Route**: `/me/bookings`
- **Response (`200 OK`)**:
  - Retrieves bookings list where customer is the logged-in user, sorted descending by creation time, populated with `propertyId` and `providerId`.

### 2.3 Get User Wishlist
- **Method**: `GET`
- **Route**: `/me/wishlist`
- **Response (`200 OK`)**:
  - Retrieves wishlist array populated with `propertyId`, sorted descending by creation time.

### 2.4 Get User Reviews
- **Method**: `GET`
- **Route**: `/me/reviews`
- **Response (`200 OK`)**:
  - Retrieves reviews submitted by the user, populated with `propertyId`, sorted descending.

### 2.5 Get User Notifications
- **Method**: `GET`
- **Route**: `/me/notifications`
- **Response (`200 OK`)**:
  - Retrieves alert and notification logs, sorted descending.

---

## 3. Properties & Search (`/properties`)

**Base Path**: `/api/v1/properties`
**Auth**: Public (Read-only endpoints)

### 3.1 Get Properties (With filters and pagination)
- **Method**: `GET`
- **Route**: `/`
- **Query Parameters**:
  - `city` (string): Search text in address (case-insensitive)
  - `cityId` (string): MongoDB ID of the City
  - `collectionId` (string): Filter by travel collection/category
  - `checkIn` (ISO Date string): Start date of filter check (returns properties not booked/blocked)
  - `checkOut` (ISO Date string): End date of filter check
  - `guests` (number): Minimum guest occupancy required
  - `bedrooms` (number): Minimum bedrooms
  - `bathrooms` (number): Minimum bathrooms
  - `minPrice` (number): Minimum price per night
  - `maxPrice` (number): Maximum price per night
  - `amenities` (comma-separated): Filter for all specified amenities (e.g. `wifi,pool`)
  - `propertyType` (string): Filter by type (e.g. `villa`, `apartment`)
  - `rating` (number): Minimum average rating
  - `featured` (boolean): `true` or `false`
  - `sortBy` (string): Field to sort by (default: `createdAt`)
  - `sortOrder` (string): `asc` or `desc` (default: `desc`)
  - `page` (number): Current page (default: `1`)
  - `limit` (number): Results per page (default: `20`)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Properties retrieved successfully",
    "data": [
      {
        "_id": "65ab37482f...",
        "title": "Stunning Beachside Villa",
        "slug": "stunning-beachside-villa-7832",
        "pricePerNight": 9500,
        "rating": 4.8,
        "images": ["url1", "url2"],
        "cityId": { "_id": "65a12", "name": "Alibaug" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
  ```

### 3.2 Get Featured Listings
- **Method**: `GET`
- **Route**: `/featured`
- **Response (`200 OK`)**:
  - Returns up to 6 properties where `featured` is `true` and status is `PUBLISHED`.

### 3.3 Get Trending Listings
- **Method**: `GET`
- **Route**: `/trending`
- **Response (`200 OK`)**:
  - Returns up to 6 properties sorted by rating and review count.

### 3.4 Get Property Details by Slug
- **Method**: `GET`
- **Route**: `/:slug`
- **Response (`200 OK`)**:
  - Populates detailed city, collection, and provider details. Requires property to be `PUBLISHED`.

### 3.5 Get Property Availability Calendar
- **Method**: `GET`
- **Route**: `/:id/availability`
- **Query Parameters**:
  - `start` (ISO Date string): Optional start boundary
  - `end` (ISO Date string): Optional end boundary
- **Response (`200 OK`)**:
  - Returns list of blocked/reserved date slots for the property.

### 3.6 Get Property Reviews
- **Method**: `GET`
- **Route**: `/:id/reviews`
- **Response (`200 OK`)**:
  - Returns a list of reviews submitted for this property, populated with customer names and profile avatars.

---

## 4. Bookings (`/bookings`)

**Base Path**: `/api/v1/bookings`
**Auth**: Authenticated User

### 4.1 Get Pricing Quote
- **Method**: `POST`
- **Route**: `/quote`
- **Request Body**:
  ```json
  {
    "propertyId": "65ab37482f...",
    "checkIn": "2026-09-10",
    "checkOut": "2026-09-15",
    "guests": 2,
    "addOns": ["65ab89d3a1..."] // Optional: Array of add-on IDs
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Pricing quote calculated successfully",
    "data": {
      "quote": {
        "basePrice": 47500,
        "addOnsTotal": 2000,
        "platformFee": 1200,
        "tax": 8946,
        "totalPrice": 59646,
        "nights": 5
      }
    }
  }
  ```

### 4.2 Initialize Booking (Create)
- **Method**: `POST`
- **Route**: `/`
- **Request Body**:
  ```json
  {
    "propertyId": "65ab37482f...",
    "checkIn": "2026-09-10",
    "checkOut": "2026-09-15",
    "guests": 2,
    "addOns": ["65ab89d3a1..."]
  }
  ```
- **Response (`201 Created`)**:
  - Initializes booking with status `PENDING_PAYMENT`.
  ```json
  {
    "success": true,
    "message": "Booking initialized successfully. Complete payment to confirm.",
    "data": {
      "booking": {
        "_id": "65d8a9bc12...",
        "customerId": "65c3b9efd1...",
        "propertyId": "65ab37482f...",
        "checkIn": "2026-09-10T00:00:00.000Z",
        "checkOut": "2026-09-15T00:00:00.000Z",
        "guests": 2,
        "totalAmount": 59646,
        "status": "PENDING_PAYMENT"
      }
    }
  }
  ```

### 4.3 Get My Bookings
- **Method**: `GET`
- **Route**: `/`
- **Response (`200 OK`)**:
  - Regular users see their own bookings. Admins see all bookings in the system.

### 4.4 Get Booking Details by ID
- **Method**: `GET`
- **Route**: `/:id`
- **Response (`200 OK`)**:
  - Authorized access only for the customer, property provider, or admin.

### 4.5 Cancel Booking
- **Method**: `POST`
- **Route**: `/:id/cancel`
- **Response (`200 OK`)**:
  - Cancels the booking and releases the availability dates.
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "booking": {
        "_id": "65d8a9bc12...",
        "status": "CANCELLED"
      }
    }
  }
  ```

---

## 5. Payments & Webhooks (`/payments`)

**Base Path**: `/api/v1/payments`

### 5.1 Razorpay Webhook Callback
- **Method**: `POST`
- **Route**: `/webhook`
- **Auth**: Public
- **Headers**:
  - `x-razorpay-signature`: Signature header computed by Razorpay for validation.
- **Request Body**: Incoming webhook events payload from Razorpay.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Webhook processed successfully"
  }
  ```

### 5.2 Create Gateway Order
- **Method**: `POST`
- **Route**: `/create-order`
- **Auth**: Authenticated User
- **Request Body**:
  ```json
  {
    "bookingId": "65d8a9bc12..."
  }
  ```
- **Response (`200 OK`)**:
  - Creates order details in Razorpay.
  ```json
  {
    "success": true,
    "message": "Gateway order created successfully",
    "data": {
      "gatewayOrderId": "order_Hj78s92n3d...",
      "amount": 5964600, // in paise
      "currency": "INR",
      "bookingId": "65d8a9bc12..."
    }
  }
  ```

### 5.3 Verify Signature & Confirm Booking
- **Method**: `POST`
- **Route**: `/verify`
- **Auth**: Authenticated User
- **Request Body**:
  ```json
  {
    "orderId": "order_Hj78s92n3d...",
    "paymentId": "pay_Hj79k28d9s...",
    "signature": "razorpay_signature_hex_value"
  }
  ```
- **Response (`200 OK`)**:
  - Confirms payment, transitions booking status to `CONFIRMED`, and locks availability calendar.
  ```json
  {
    "success": true,
    "message": "Payment verified and booking confirmed successfully",
    "data": {
      "payment": {
        "_id": "65e238cb...",
        "paymentId": "pay_Hj79k28d9s...",
        "status": "COMPLETED"
      },
      "booking": {
        "_id": "65d8a9bc12...",
        "status": "CONFIRMED"
      }
    }
  }
  ```

### 5.4 Get Payment Details by ID
- **Method**: `GET`
- **Route**: `/:id`
- **Auth**: Authenticated User (Accessible only by the paying customer or admin)
- **Response (`200 OK`)**:
  - Returns detailed transaction record.

---

## 6. Reviews & Feedback (`/reviews`)

**Base Path**: `/api/v1/reviews`
**Auth**: Authenticated User

### 6.1 Create Review for Property
- **Method**: `POST`
- **Route**: `/properties/:propertyId/reviews`
- **Eligibility**: User must have a past stay (`CONFIRMED`/`COMPLETED` booking with check-out date in the past) and hasn't reviewed it yet.
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Had an incredible weekend getaway! The space was spotless and location was perfect.",
    "ratingsCategory": {
      "cleanliness": 5,
      "accuracy": 5,
      "communication": 5,
      "location": 5,
      "checkIn": 5,
      "value": 5
    }
  }
  ```
- **Response (`201 Created`)**:
  - Automatically recalculates average rating and review counts on the Property model.
  ```json
  {
    "success": true,
    "message": "Review submitted successfully",
    "data": {
      "review": {
        "_id": "65e9ab812...",
        "propertyId": "65ab37482f...",
        "rating": 5,
        "comment": "Had an incredible..."
      }
    }
  }
  ```

### 6.2 Update Review
- **Method**: `PATCH`
- **Route**: `/:id`
- **Auth**: Authenticated User (Only review creator can edit)
- **Request Body**: (All parameters optional)
  ```json
  {
    "rating": 4,
    "comment": "Updated comment: checkout process was a bit slow.",
    "ratingsCategory": {
      "checkIn": 3
    }
  }
  ```
- **Response (`200 OK`)**:
  - Recalculates averages on the parent Property.

### 6.3 Delete Review
- **Method**: `DELETE`
- **Route**: `/:id`
- **Auth**: Authenticated User (Review creator or admin)
- **Response (`200 OK`)**:
  - Removes review and recalculates averages on the parent Property.

---

## 7. Wishlist (`/wishlist`)

**Base Path**: `/api/v1/wishlist`
**Auth**: Authenticated User

### 7.1 Get My Wishlist
- **Method**: `GET`
- **Route**: `/`
- **Response (`200 OK`)**:
  - Returns list of property documents saved in user's wishlist, populated with their city info.

### 7.2 Add Property to Wishlist
- **Method**: `POST`
- **Route**: `/:propertyId`
- **Response (`201 Created` or `200 OK` if already saved)**:
  ```json
  {
    "success": true,
    "message": "Property added to wishlist successfully",
    "data": {
      "wishlist": {
        "_id": "65f8a9bc12...",
        "customerId": "65c3b9efd1...",
        "propertyId": "65ab37482f..."
      }
    }
  }
  ```

### 7.3 Remove Property from Wishlist
- **Method**: `DELETE`
- **Route**: `/:propertyId`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Property removed from wishlist successfully",
    "data": {}
  }
  ```

---

## 8. Provider Portal (`/provider`)

**Base Path**: `/api/v1/provider`
**Auth**: Authenticated User with **`PROVIDER`** Role

### 8.1 Get Provider Profile details
- **Method**: `GET`
- **Route**: `/profile`
- **Response (`200 OK`)**:
  - Retrieves host bio settings, business names, and bank payout settings.

### 8.2 Update Provider Profile details
- **Method**: `PATCH`
- **Route**: `/profile`
- **Request Body**:
  ```json
  {
    "bio": "Boutique villa operator in Western India.",
    "businessName": "Escape Getaways Inc.",
    "payoutDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "000401293029",
      "ifscCode": "ICIC0000004",
      "accountHolderName": "Jane Host"
    }
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Provider profile updated successfully",
    "data": {
      "provider": {
        "_id": "65d8a012...",
        "businessName": "Escape Getaways Inc.",
        "approvalStatus": "APPROVED"
      }
    }
  }
  ```

### 8.3 Get Bookings on Host Properties
- **Method**: `GET`
- **Route**: `/bookings`
- **Response (`200 OK`)**:
  - Returns bookings for all listings owned by this host.

### 8.4 Get Earnings & Revenue Stats
- **Method**: `GET`
- **Route**: `/revenue`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Provider revenue statistics retrieved successfully",
    "data": {
      "stats": {
        "totalRevenue": 145000, // host earnings sum
        "platformCommissions": 18000,
        "totalBookingsAmount": 163000,
        "count": 4
      }
    }
  }
  ```

### 8.5 Get Payout Log ledgers
- **Method**: `GET`
- **Route**: `/payouts`
- **Response (`200 OK`)**:
  - Returns ledger logs, payouts, and payout status (e.g. `PENDING`, `PROCESSED`).

### 8.6 Get Guest Reviews on Host Properties
- **Method**: `GET`
- **Route**: `/reviews`
- **Response (`200 OK`)**:
  - Retrieves all reviews submitted across this host's properties.

### 8.7 List Provider Properties
- **Method**: `GET`
- **Route**: `/properties`
- **Response (`200 OK`)**:
  - Lists properties owned by the host (including drafts and under-review items).

### 8.8 Create Property Draft
- **Method**: `POST`
- **Route**: `/properties`
- **Request Body**:
  ```json
  {
    "title": "Modern Hillside Cottage",
    "description": "Charming cottage nestled in Mahabaleshwar hills.",
    "pricePerNight": 6500,
    "guestsMax": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "address": "Row House 3, Valley View Rd",
    "city": "Mahabaleshwar",
    "state": "Maharashtra",
    "country": "India",
    "images": ["url-image1", "url-image2"],
    "amenities": ["Wi-Fi", "Fireplace", "Kitchen"],
    "propertyType": "COTTAGE",
    "coordinates": {
      "lat": 17.9308,
      "lng": 73.6477
    }
  }
  ```
- **Response (`201 Created`)**:
  - Returns property document with status `DRAFT`.

### 8.9 Get Provider Property Detail by ID
- **Method**: `GET`
- **Route**: `/properties/:id`
- **Response (`200 OK`)**:
  - Ownership checked (must belong to this provider).

### 8.10 Update Property Listing
- **Method**: `PATCH`
- **Route**: `/properties/:id`
- **Request Body**: Fields to update.
- **Response (`200 OK`)**:
  - Note: If setting status to `PUBLISHED`, the backend forces status to `PENDING_APPROVAL` for admin review.

### 8.11 Delete / Archive Listing
- **Method**: `DELETE`
- **Route**: `/properties/:id`
- **Response (`200 OK`)**:
  - Shifts property status to `ARCHIVED` (to retain booking history logs).

### 8.12 Publish Property Listing (Submit for review)
- **Method**: `PATCH`
- **Route**: `/properties/:id/publish`
- **Response (`200 OK`)**:
  - Updates property status to `PENDING_APPROVAL`.

---

## 9. Admin Operations (`/admin`)

**Base Path**: `/api/v1/admin`
**Auth**: Authenticated User with **`ADMIN`** Role

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/users` | Get lists of all registered users in the platform |
| **GET** | `/users/:id` | Get individual user profile details |
| **PATCH**| `/users/:id/status` | Suspend or reactivate user (body: `{"status": "ACTIVE" \| "SUSPENDED"}`) |
| **GET** | `/providers` | List all providers |
| **GET** | `/providers/:id` | Get individual provider info |
| **PATCH**| `/providers/:id/approve` | Approve host account status |
| **PATCH**| `/providers/:id/reject` | Reject host account status |
| **PATCH**| `/providers/:id/suspend` | Suspend host account status |
| **GET** | `/properties` | List all properties across all providers |
| **PATCH**| `/properties/:id/approve` | Approve property listing (makes status `PUBLISHED`) |
| **PATCH**| `/properties/:id/reject` | Reject property listing |
| **PATCH**| `/properties/:id/suspend` | Suspend property listing |
| **GET** | `/bookings` | List all system bookings |
| **GET** | `/bookings/:id` | View any booking details |
| **GET** | `/payments` | List all payment transaction records |
| **GET** | `/refunds` | View refund ledgers |
| **GET** | `/payouts` | View payout items for hosts |
| **PATCH**| `/payouts/:id/process` | Mark payout ledger status as `PROCESSED` |

---

## 10. Health & System Public Endpoints

**Base Path**: `/api/v1`
**Auth**: Public

### 10.1 System Health Status
- **Method**: `GET`
- **Route**: `/health`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Health status retrieved successfully",
    "data": {
      "status": "UP",
      "uptime": 2341.22,
      "dependencies": {
        "database": "UP",
        "redis": "UP"
      }
    }
  }
  ```

### 10.2 Get Blogs
- **Method**: `GET`
- **Route**: `/blogs`
- **Response (`200 OK`)**:
  - Returns list of blogs sorted by creation time descending.

### 10.3 Get FAQs
- **Method**: `GET`
- **Route**: `/faqs`
- **Response (`200 OK`)**:
  - Returns list of FAQs sorted by creation time ascending.
