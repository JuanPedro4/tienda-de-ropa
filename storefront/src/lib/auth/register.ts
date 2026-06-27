"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export async function registerUser(input: RegisterInput) {
  const parsed = RegisterSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    throw new Error("Ya existe una cuenta con este correo electrónico");
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
    },
  });
}
