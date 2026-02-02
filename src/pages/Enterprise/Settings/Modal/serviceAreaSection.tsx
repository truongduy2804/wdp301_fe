import React, { memo, useMemo } from "react";
import { X } from "lucide-react";

type Option = { value: string; label: string; subLabel?: string };

type MultiSearchSelectProps = {
  values: string[];
  onToggle: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
};

type Props = {
  // selections
  selectedProvinces: string[];
  selectedDistricts: string[];
  selectedWards: string[];

  // maps
  provinceNameById: Record<string, string>;
  districtNameById: Record<string, string>;
  wardNameById: Record<string, string>;
  districtProvinceById: Record<string, string>;
  wardDistrictById: Record<string, string>;

  // options + toggles
  provinceOptions: Option[];
  districtOptions: Option[];
  wardOptions: Option[];
  toggleProvince: (id: string) => void;
  toggleDistrict: (id: string) => void;
  toggleWard: (id: string) => void;

  // remove cascade (khuyến nghị)
  removeProvinceCascade: (pid: string) => void;
  removeDistrictCascade: (did: string) => void;
  removeWard: (wid: string) => void;

  submitting?: boolean;
  error?: string;
  MultiSearchSelect: React.ComponentType<MultiSearchSelectProps>;
};

type ProvinceNode = {
  pid: string;
  pName: string;
  districts: { did: string; dName: string }[];
  wards: { wid: string; wName: string; did?: string; dName?: string }[];
};

function Chip({
  children,
  onRemove,
  variant,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  variant: "province" | "district" | "ward";
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl ring-1 px-3 py-1.5 text-xs font-semibold";
  const styles =
    variant === "province"
      ? "inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
      : variant === "district"
        ? "inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
        : "inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100";

  return (
    <span className={`${base} ${styles}`}>
      <span className="truncate max-w-[220px]">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className={`grid h-5 w-5 place-items-center rounded-full ${
          variant === "province" ? "hover:bg-blue-100" : "hover:bg-blue-100"
        } active:scale-95`}
        aria-label="Xóa"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

const ServiceAreaSection = memo(function ServiceAreaSection({
  selectedProvinces,
  selectedDistricts,
  selectedWards,
  provinceNameById,
  districtNameById,
  wardNameById,
  districtProvinceById,
  wardDistrictById,
  provinceOptions,
  districtOptions,
  wardOptions,
  toggleProvince,
  toggleDistrict,
  toggleWard,
  removeProvinceCascade,
  removeDistrictCascade,
  removeWard,
  submitting,
  error,
  MultiSearchSelect,
}: Props) {
  const tree = useMemo<ProvinceNode[]>(() => {
    const pSet = new Set<string>(selectedProvinces.map(String));

    // ensure province from selected districts/wards also included (an toàn)
    for (const did0 of selectedDistricts) {
      const did = String(did0);
      const pid = districtProvinceById[did];
      if (pid) pSet.add(String(pid));
    }
    for (const wid0 of selectedWards) {
      const wid = String(wid0);
      const did = wardDistrictById[wid];
      const pid = did ? districtProvinceById[String(did)] : null;
      if (pid) pSet.add(String(pid));
    }

    const nodes: ProvinceNode[] = Array.from(pSet).map((pid) => {
      const pName = provinceNameById[pid] || pid;

      const districts = selectedDistricts
        .map(String)
        .filter((did) => districtProvinceById[did] === pid)
        .map((did) => ({ did, dName: districtNameById[did] || did }))
        .sort((a, b) => a.dName.localeCompare(b.dName, "vi"));

      const wards = selectedWards
        .map(String)
        .map((wid) => {
          const wName = wardNameById[wid] || wid;
          const did = wardDistrictById[wid];
          const pid2 = did ? districtProvinceById[String(did)] : null;
          if (pid2 !== pid) return null;
          const dName = did ? districtNameById[String(did)] || String(did) : "";
          return { wid, wName, did: did ? String(did) : undefined, dName };
        })
        .filter(Boolean) as ProvinceNode["wards"];

      wards.sort((a, b) => a.wName.localeCompare(b.wName, "vi"));

      return { pid, pName, districts, wards };
    });

    nodes.sort((a, b) => a.pName.localeCompare(b.pName, "vi"));
    return nodes;
  }, [
    selectedProvinces,
    selectedDistricts,
    selectedWards,
    provinceNameById,
    districtNameById,
    wardNameById,
    districtProvinceById,
    wardDistrictById,
  ]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-black">📍</span>
        </div>
        Khu vực phục vụ
      </h3>

      {/*  TAG LỚN CHUNG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Khu vực đã chọn
        </div>

        <div className="max-h-[150px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
          {tree.length === 0 ? (
            <div className="text-sm text-slate-400 py-6 text-center">
              Chưa chọn khu vực
            </div>
          ) : (
            tree.map((node) => (
              <div
                key={node.pid}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {/* province chip big */}
                  <Chip
                    variant="province"
                    onRemove={() => removeProvinceCascade(node.pid)}
                  >
                    {node.pName}
                  </Chip>

                  {/* districts (no repeat province name) */}
                  {node.districts.map((d) => (
                    <Chip
                      key={d.did}
                      variant="district"
                      onRemove={() => removeDistrictCascade(d.did)}
                    >
                      {d.dName}
                    </Chip>
                  ))}

                  {/* wards: show ward only, meta by district */}
                  {node.wards.map((w) => (
                    <span
                      key={w.wid}
                      className="inline-flex items-center gap-2"
                    >
                      <Chip variant="ward" onRemove={() => removeWard(w.wid)}>
                        {w.wName}
                      </Chip>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Selects: chỉ để chọn, không show chip lặp */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Chọn Tỉnh/Thành
          </div>
          <MultiSearchSelect
            values={selectedProvinces}
            onToggle={toggleProvince}
            options={provinceOptions}
            placeholder="Chọn Tỉnh/Thành (có thể chọn nhiều)"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Chọn Quận/Huyện
          </div>
          <MultiSearchSelect
            values={selectedDistricts}
            onToggle={toggleDistrict}
            options={districtOptions}
            placeholder={
              selectedProvinces.length
                ? "Chọn Quận/Huyện (có thể chọn nhiều)"
                : "Chọn Tỉnh/Thành trước"
            }
            disabled={submitting || selectedProvinces.length === 0}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Chọn Phường/Xã
          </div>
          <MultiSearchSelect
            values={selectedWards}
            onToggle={toggleWard}
            options={wardOptions}
            placeholder={
              selectedDistricts.length
                ? "Chọn Phường/Xã (có thể chọn nhiều)"
                : "Chọn Quận/Huyện trước"
            }
            disabled={submitting || selectedDistricts.length === 0}
          />
        </div>
      </div>

      {error ? (
        <div className="mt-3 text-xs font-medium text-rose-600">{error}</div>
      ) : null}
    </section>
  );
});

export default ServiceAreaSection;
