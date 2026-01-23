// src/lib/mockAuthApi.ts
export type MockRole = "ADMIN" | "ENTERPRISE" | "COLLECTOR" | "CITIZEN";

export type MockUser = {
  id: string;
  fullname: string;
  email: string;
  role: MockRole;
  avatarUrl?: string;
};

const LS_TOKEN = "econet_access_token";
const LS_USER = "econet_user";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function safeJsonParse<T>(val: string | null): T | null {
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function mockFetchSession(): Promise<{
  accessToken: string | null;
  user: MockUser | null;
}> {
  await sleep(400);
  const accessToken = localStorage.getItem(LS_TOKEN);
  const user = safeJsonParse<MockUser>(localStorage.getItem(LS_USER));
  if (!accessToken || !user) return { accessToken: null, user: null };
  return { accessToken, user };
}

export async function mockLoginCitizen(): Promise<{
  accessToken: string;
  user: MockUser;
}> {
  await sleep(450);

  const accessToken = `demo_token_${Date.now()}`;
  const user: MockUser = {
    id: `u_${Date.now()}`,
    fullname: "Võ Thảo My",
    email: "citizen@example.com",
    role: "CITIZEN",
    avatarUrl: "",
  };

  localStorage.setItem(LS_TOKEN, accessToken);
  localStorage.setItem(LS_USER, JSON.stringify(user));
  return { accessToken, user };
}

export async function mockLogout(): Promise<void> {
  await sleep(250);
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
}

export async function mockUpgradeToEnterprise(): Promise<MockUser> {
  await sleep(550);

  const user = safeJsonParse<MockUser>(localStorage.getItem(LS_USER));
  if (!user) throw new Error("NOT_LOGGED_IN");

  const upgraded: MockUser = {
    ...user,
    role: "ENTERPRISE",
    // demo đổi tên nếu muốn
    fullname: user.fullname || "Tài khoản Doanh nghiệp",
  };

  localStorage.setItem(LS_USER, JSON.stringify(upgraded));
  return upgraded;
}
