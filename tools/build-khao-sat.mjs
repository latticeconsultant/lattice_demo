// Sinh dữ liệu nghiệp vụ cho trang khảo sát từ trang mô phỏng.
// Mô phỏng (mophong/index.html) là nguồn duy nhất; khảo sát không giữ bản chép tay.
//
//   node tools/build-khao-sat.mjs
//
// Ghi ra:
//   khao-sat/nv.js      phần khách xem miễn phí: tên khối, tên nghiệp vụ, chỗ hay vướng
//   khao-sat/day-du.js  dòng đầu (const DAY_DU = …): mức AI, việc người giữ, nơi ghi nhận
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const goc = fileURLToPath(new URL("..", import.meta.url));
const html = readFileSync(goc + "mophong/index.html", "utf8");

// Đoạn mã chứa bộ dữ liệu ba loại hình: từ khai báo DS tới trước useDS().
const dau = html.indexOf("const DS={};"), cuoi = html.indexOf("function useDS(");
if (dau < 0 || cuoi < 0) throw new Error("Không tìm thấy bộ dữ liệu DS trong mophong/index.html");
const ma = html.slice(dau, cuoi) + "\nglobalThis.__DS = DS;";

// Đoạn mã có vài dòng chạy ngay khi nạp (hẹn giờ, theo dõi cỡ màn hình); cho chạy rỗng.
const hop = { setInterval: () => 0, window: {}, document: { getElementById: () => null }, model: "tmhh" };
vm.createContext(hop);
vm.runInContext(ma, hop);
const DS = hop.__DS;

const nv = { KHOI_KS: {}, NV_KS: {} }, dayDu = {};
for (const [mo, d] of Object.entries(DS)) {
  nv.KHOI_KS[mo] = d.KHOI.map(k => [k.id, k.n]);
  nv.NV_KS[mo] = d.NV.map(n => ({ id: n.id, ten: n.s || n.n, khoi: n.k, vuong: n.x, cho: d.ROLE[n.to] }));
  dayDu[mo] = Object.fromEntries(d.NV.map(n => [n.id, {
    ten: n.n, ai: n.ai, rec: Math.max(...n.ai.map(t => t[1])), giu: n.keep, sys: n.sys, x: n.x,
    to: d.ROLE[n.to], o: d.ROLE[n.o]
  }]));
}

const tieuDe = "/* Sinh tự động bởi tools/build-khao-sat.mjs từ mophong/index.html — đừng sửa tay. */\n";
writeFileSync(goc + "khao-sat/nv.js", tieuDe +
  "const KHOI_KS = " + JSON.stringify(nv.KHOI_KS) + ";\n" +
  "const NV_KS = " + JSON.stringify(nv.NV_KS) + ";\n");

const fDD = goc + "khao-sat/day-du.js", cu = readFileSync(fDD, "utf8").split("\n");
if (!cu[0].startsWith("const DAY_DU = ")) throw new Error("Dòng đầu khao-sat/day-du.js phải là const DAY_DU = …");
cu[0] = "const DAY_DU = " + JSON.stringify(dayDu) + ";";
writeFileSync(fDD, cu.join("\n"));

for (const mo of Object.keys(DS)) console.log(mo, nv.NV_KS[mo].length, "nghiệp vụ,", nv.KHOI_KS[mo].length, "khối");
