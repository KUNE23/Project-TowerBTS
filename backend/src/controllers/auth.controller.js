import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
};

export const register = asyncHandler(async (req, res) => {
  const { password, ...payload } = req.body;
  const existing = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });

  if (existing) {
    throw new AppError("Email sudah digunakan", 409);
  }

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: await hashPassword(password),
    },
    select: userSelect,
  });

  sendSuccess(res, "Register berhasil", user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
    select: {
      ...userSelect,
      password: true,
    },
  });

  if (!user || !(await comparePassword(req.body.password, user.password))) {
    throw new AppError("Email atau password salah", 401);
  }

  const { password, ...safeUser } = user;
  const token = signToken({ id: safeUser.id, role: safeUser.role });

  sendSuccess(res, "Login berhasil", { token, user: safeUser });
});

export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, "Profile berhasil diambil", req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
    select: userSelect,
  });

  sendSuccess(res, "Profile berhasil diperbarui", user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user || !(await comparePassword(req.body.oldPassword, user.password))) {
    throw new AppError("Password lama salah", 400);
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await hashPassword(req.body.newPassword) },
    select: { id: true },
  });

  sendSuccess(res, "Password berhasil diperbarui");
});
