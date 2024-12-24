import pool from "../config/database";

export class AuthService {
  async storeRefreshToken(userId: number, token: string, expiresAt: Date) {
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );
  }

  async recordLoginAttempt(email: string, ipAddress: string) {
    await pool.query(
      "INSERT INTO login_attempts (email, ip_address) VALUES ($1, $2)",
      [email, ipAddress]
    );
  }
}
