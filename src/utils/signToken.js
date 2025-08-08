import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const signToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

export default signToken;
