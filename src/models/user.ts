export interface IUser {
  email: string;
  password: string;
}

import pool from "../config/database";

export class User implements IUser {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static async create(userData: IUser): Promise<User> {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [userData.email, userData.password]
    );
    return rows[0];
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0];
  }
}
