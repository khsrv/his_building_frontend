import { NextResponse } from "next/server";
import { createGetCurrentUserUseCase } from "@/modules/auth/application/use-cases/get-current-user.use-case";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";

export async function GET() {
  const getCurrentUser = createGetCurrentUserUseCase(new NextAuthRepository());
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: user }, { status: 200 });
}
