import { NextResponse } from "next/server";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";

export async function POST() {
  const authRepository = new NextAuthRepository();
  await authRepository.signOut();

  return NextResponse.json({ ok: true }, { status: 200 });
}
