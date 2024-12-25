# Authentication API

This API provides endpoints for user registration, login, token refreshing, and logout, including JWT-based authentication with access and refresh tokens.

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for Node.js
- **PostgreSQL**: Relational database for storing user and token data
- **JWT (jsonwebtoken)**: For generating and verifying JSON Web Tokens
- **argon2**: For hashing passwords
- **TypeScript**: For static typing in JavaScript
- **dotenv**: For managing environment variables

## Base URL

- The base URL for all endpoints is assumed to be `http://yourapi.com/api`.

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
  - **Cookies**:
    - `refreshToken`: A secure, HTTP-only cookie containing the refresh token.
  - **Body**:
    ```json
    {
      "accessToken": "yourAccessToken"
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
- **Error (500)**:
  - **Body**:
    ```json
    {
      "message": "Error logging in"
    }
    ```

### POST /refresh

#### Description

Refreshes the access token using the refresh token.

#### Request

- **URL**: `/refresh`
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
      "accessToken": "newAccessToken"
    }
    ```
- **Error (401)**:
  - **Body**:
    ```json
    {
      "message": "Invalid or expired refresh token"
    }
    ```

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

## Notes

- The `register` endpoint creates a new user and stores their hashed password in the database.
- The `login` endpoint generates JWT access and refresh tokens upon successful authentication. The refresh token is stored in the database and sent as a cookie to the client.
- The `refresh` endpoint issues a new access token if the provided refresh token is valid.
- The `logout` endpoint invalidates the refresh token, effectively logging out the user.
- Ensure that the environment variables `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set for token generation.
- The `refreshToken` cookie is configured to be secure and HTTP-only, which helps protect it from being accessed by JavaScript in the browser.

This documentation assumes the existence of a service layer (`userService` and `authService`) that handles database interactions. Adjust the base URL and endpoint paths as necessary for your specific application setup.
