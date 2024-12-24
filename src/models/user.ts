export interface IUser {
  email: string;
  password: string;
}

export class User implements IUser {
  email: string;
  password: string;
  private static users: IUser[] = []; // In-memory storage

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static async create(userData: IUser): Promise<User> {
    const user = new User(userData.email, userData.password);
    this.users.push(user);
    return user;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
