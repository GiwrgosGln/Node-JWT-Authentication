import pool from "../config/database";

export class AuthService {
  async storeRefreshToken(userId: number, token: string, expiresAt: Date) {
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );
  }

  async findRefreshToken(token: string) {
    const { rows } = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    return rows[0];
  }
}
