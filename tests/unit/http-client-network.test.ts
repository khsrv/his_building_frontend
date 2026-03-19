import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "@/shared/lib/http/http-client";

const { tokenStorageMock } = vi.hoisted(() => ({
  tokenStorageMock: {
    getAccessToken: vi.fn<() => string | null>(),
    setAccessToken: vi.fn<(token: string, expiresAt: string) => void>(),
    clearAccessToken: vi.fn<() => void>(),
    isAccessTokenExpired: vi.fn<() => boolean>(),
    clearAll: vi.fn<() => void>(),
  },
}));

vi.mock("@/shared/lib/http/token-storage", () => ({
  tokenStorage: tokenStorageMock,
}));

function makeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("http-client network handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStorageMock.getAccessToken.mockReturnValue("access-token");
    tokenStorageMock.isAccessTokenExpired.mockReturnValue(false);
  });

  it("maps fetch failures to AppError NETWORK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(httpRequest("/api/v1/test", { skipAuth: true })).rejects.toMatchObject({
      code: "NETWORK",
    });
  });

  it("does not clear tokens when refresh fails due network outage", async () => {
    tokenStorageMock.isAccessTokenExpired.mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(httpRequest("/api/v1/accounts")).rejects.toMatchObject({
      code: "NETWORK",
    });
    expect(tokenStorageMock.clearAll).not.toHaveBeenCalled();
  });

  it("clears tokens only when refresh returns unauthorized", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeResponse(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(makeResponse(401, { message: "Session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpRequest("/api/v1/accounts")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(tokenStorageMock.clearAll).toHaveBeenCalledTimes(1);
  });

  it("does not clear tokens when refresh fails because of network after 401", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeResponse(401, { message: "Unauthorized" }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpRequest("/api/v1/accounts")).rejects.toMatchObject({
      code: "NETWORK",
    });
    expect(tokenStorageMock.clearAll).not.toHaveBeenCalled();
  });
});
