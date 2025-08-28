// src/lib/auth.ts
import { getPool } from "@/utils/db";
import bcrypt from "bcrypt";

export async function verifyLogin(email: string, password: string) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", email)
      .query("SELECT TOP 1 * FROM users WHERE email = @email");

    const user = result.recordset[0];
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    // Fix PHP $2y$ → $2b$
    const fixedHash = user.passwordHash.startsWith("$2y$")
      ? user.passwordHash.replace("$2y$", "$2b$")
      : user.passwordHash;

    const isPasswordValid = await bcrypt.compare(password, fixedHash);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    return { success: true, role: user.roleId || "user" };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Internal server error" };
  }
}
