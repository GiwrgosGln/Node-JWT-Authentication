# Authentication API

This API provides endpoints for user registration, login, token refreshing, and logout, including JWT-based authentication with access and refresh tokens. The API supports both web applications (using HTTP-only cookies) and mobile applications (using response body tokens).

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for Node.js
- **PostgreSQL**: Relational database for storing user and token data
- **JWT (jsonwebtoken)**: For generating and verifying JSON Web Tokens
- **Zod**: Type-safe input validation
- **argon2**: For hashing passwords
- **TypeScript**: For static typing in JavaScript
- **dotenv**: For managing environment variables

## Token Delivery Methods

The API supports two token delivery methods simultaneously:

1. **HTTP-only Cookies** (Web Applications):

   - Secure token storage in browser
   - Protection against XSS attacks
   - Automatic token handling

2. **Response Body** (Mobile Applications):
   - Direct token access for native storage
   - Flexibility for mobile token management
   - Manual token handling in requests

## Input Validation

The API uses Zod for request validation with the following rules:

### Email Validation

- Must be a valid email format (example@domain.com)
- Minimum 3 characters
- Maximum 255 characters

### Password Validation

- Minimum 6 characters
- Maximum 100 characters
- Must contain at least:
  - One uppercase letter
  - One lowercase letter
  - One number

### Validation Responses

If validation fails, the API returns a 400 status code with detailed error messages:

````json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.password",
      "message": "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number"
    }
  ]
}



## Endpoints

### POST /register

#### Description

Registers a new user with the provided email and password.

#### Request

- **URL**: `/register`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body Parameters**:
  - `email` (string, required): The email address of the user.
  - `password` (string, required): The password for the user account.

#### Response

- **Success (201)**:
  - **Body**:
    ```json
    {
      "message": "User created successfully"
    }
    ```
- **Error (400)**:
  - **Body**:
    ```json
    {
      "message": "User already exists"
    }
    ```
- **Error (500)**:
  - **Body**:
    ```json
    {
      "message": "Error creating user"
    }
    ```

### POST /login

#### Description

Logs in a user with the provided email and password, generating access and refresh tokens.

#### Request

- **URL**: `/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body Parameters**:
  - `email` (string, required): The email address of the user.
  - `password` (string, required): The password for the user account.

#### Response

- **Success (200)**:
  - **Cookies** (Web Clients):
    - `refreshToken`: HTTP-only cookie containing refresh token
    - `accessToken`: HTTP-only cookie containing access token
  - **Body** (Mobile Clients):
    ```json
    {
      "accessToken": "yourAccessToken",
      "refreshToken": "yourRefreshToken",
      "expiresIn": 900,
      "refreshExpiresIn": 604800
    }
    ```
- **Error (400)**:
  - **Body**:
    ```json
    {
      "message": "User not found"
    }
    ```
  - **Body**:
    ```json
    {
      "message": "Invalid password"
    }
    ```

### POST /refresh

#### Description

Refreshes the access token using the refresh token. Implements token rotation for security.

#### Request

- **URL**: `/refresh`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Cookies** (Web Clients):
  - `refreshToken`: The refresh token stored as HTTP-only cookie
- **Body** (Mobile Clients):
  ```json
  {
    "refreshToken": "yourRefreshToken"
  }
````

### POST /logout

#### Description

Logs out the user by invalidating the refresh token.

#### Request

- **URL**: `/logout`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Cookies**:
  - `refreshToken`: The refresh token stored as an HTTP-only cookie.

#### Response

- **Success (200)**:
  - **Body**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
