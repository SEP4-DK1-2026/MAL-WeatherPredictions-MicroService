import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["./dist/"],
  moduleNameMapper: {
    "(.+)\\.js": "$1",
  },
};
export default config;
