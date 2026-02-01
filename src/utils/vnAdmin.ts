const BASE = "https://provinces.open-api.vn/api";

export type Province = { code: number; name: string };
export type District = { code: number; name: string; province_code: number };
export type Ward = { code: number; name: string; district_code: number };

const nameCache = new Map<string, string>();
const listCache = new Map<string, any>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

// ===== name by code (for display on page) =====
export async function getProvinceName(code?: string | number | null) {
  if (!code) return "";
  const key = `p:${code}`;
  if (nameCache.has(key)) return nameCache.get(key)!;
  const p = await fetchJson<Province>(`${BASE}/p/${code}`);
  const name = p?.name ?? "";
  nameCache.set(key, name);
  return name;
}

export async function getDistrictName(code?: string | number | null) {
  if (!code) return "";
  const key = `d:${code}`;
  if (nameCache.has(key)) return nameCache.get(key)!;
  const d = await fetchJson<District>(`${BASE}/d/${code}`);
  const name = d?.name ?? "";
  nameCache.set(key, name);
  return name;
}

export async function getWardName(code?: string | number | null) {
  if (!code) return "";
  const key = `w:${code}`;
  if (nameCache.has(key)) return nameCache.get(key)!;
  const w = await fetchJson<Ward>(`${BASE}/w/${code}`);
  const name = w?.name ?? "";
  nameCache.set(key, name);
  return name;
}

// ===== lists for searching/select =====
export async function getAllProvinces(): Promise<Province[]> {
  const key = "all_provinces";
  if (listCache.has(key)) return listCache.get(key);
  const data = await fetchJson<Province[]>(`${BASE}/p/`);
  listCache.set(key, data);
  return data;
}

export async function getDistrictsByProvince(provinceCode: string) {
  const key = `districts:${provinceCode}`;
  if (listCache.has(key)) return listCache.get(key) as District[];

  // depth=2: province + districts
  const p = await fetchJson<{ districts: District[] }>(
    `${BASE}/p/${provinceCode}?depth=2`,
  );
  const districts = p?.districts ?? [];
  listCache.set(key, districts);
  return districts;
}

export async function getWardsByDistrict(districtCode: string) {
  const key = `wards:${districtCode}`;
  if (listCache.has(key)) return listCache.get(key) as Ward[];

  // depth=2: district + wards
  const d = await fetchJson<{ wards: Ward[] }>(
    `${BASE}/d/${districtCode}?depth=2`,
  );
  const wards = d?.wards ?? [];
  listCache.set(key, wards);
  return wards;
}
