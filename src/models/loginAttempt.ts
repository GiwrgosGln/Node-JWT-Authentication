import pool from "../config/database";

export class LoginAttempt {
  static async record(email: string, ipAddress: string) {
    await pool.query(
      "INSERT INTO login_attempts (email, ip_address) VALUES ($1, $2)",
      [email, ipAddress]
    );
  }
}
