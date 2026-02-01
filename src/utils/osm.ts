export async function reverseGeocodeOSM(lat: number, lng: number) {
  // Lưu ý: Nominatim có policy rate-limit, nên debounce khi gọi
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "vi",
    },
  });
  if (!res.ok) throw new Error("Reverse geocode failed");
  const json = await res.json();
  return (json?.display_name as string) || "";
}
