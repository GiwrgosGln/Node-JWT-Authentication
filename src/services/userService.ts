import pool from "../config/database";
import { IUser } from "../types/user";

export class UserService {
  async findByEmail(email: string) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0];
  }

  async create(userData: IUser) {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [userData.email, userData.password]
    );
    return rows[0];
  }
}
