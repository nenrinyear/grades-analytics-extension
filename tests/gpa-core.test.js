const assert = require("node:assert/strict");
const { calculateProfessionalGpa, parseCredits } = require("../src/gpa-core");

const rows = [
  { title: "【共通教育科目】", credits: "", grade: "" },
  { title: "心理学の世界", credits: "2", grade: "良" },
  { title: "【専門教育科目】", credits: "", grade: "" },
  { title: "プログラミング演習A", credits: "2", grade: "秀" },
  { title: "コンピュータのための数学", credits: "2", grade: "※" },
  { title: "コンピュータ概論", credits: "2", grade: "優" },
  { title: "情報理工学実験Ａ・Ｂ", credits: "4", grade: "優" },
  { title: "情報セキュリティ基礎", credits: "# 2", grade: "秀" },
  { title: "線形代数Ⅰ", credits: "2", grade: "可" },
  { title: "データ解析の基礎", credits: "2", grade: "Ｗ" },
  { title: "＊＊＊  以上  ＊＊＊", credits: "", grade: "" }
];

assert.equal(parseCredits("# 2"), 2);
assert.equal(parseCredits(" 4 "), 4);
assert.equal(parseCredits(""), 0);

const result = calculateProfessionalGpa(rows);

assert.equal(result.courseCount, 5);
assert.equal(result.totalCredits, 12);
assert.equal(result.totalWeightedPoints, 36);
assert.equal(result.gpa, 36 / 12);
assert.deepEqual(result.gradeCounts, {
  "秀": 2,
  "優": 2,
  "良": 0,
  "可": 1
});

console.log("gpa-core tests passed");
