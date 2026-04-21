import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "langpilot",
  password: "1",
  port: 5432,
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export default pool;
