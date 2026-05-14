import * as dotenv from "dotenv";

dotenv.config({ path: ".env", debug: true });

const host = process.env.PSQL_SERVER;
const database = process.env.PSQL_DATABASE;
const port = +process.env.PSQL_PORT;
const user = process.env.PSQL_USER;
const password = process.env.PSQL_PASSWORD;

export const passwordConfig = {
  host,
  user,
  database,
  password,
  port,
  ssl: true,
};

export const API_DOMAIN = process.env.API_DOMAIN;
export const API_KEY = process.env.API_KEY;
