import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["./dist/"],
};
export default config;
