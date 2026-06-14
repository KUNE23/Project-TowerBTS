import bcrypt from "bcrypt";

const saltRounds = 12;

export const hashPassword = (password) => bcrypt.hash(password, saltRounds);

export const comparePassword = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);
