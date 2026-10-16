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
  "可": 1,
  "*": 0
});

for (const grade of ["*", "＊", "　* "]) {
  const withFailure = calculateProfessionalGpa([
    { title: "共通教育の落単", credits: "2", grade },
    { title: "【専門教育科目】" },
    { title: "合格科目", credits: "2", grade: "秀" },
    { title: "落単科目", credits: "2", grade },
    ...["N", "※", "K", "／", "W", "Ｗ", "履修中止", ""].map((excludedGrade) => (
      { title: "除外科目", credits: "2", grade: excludedGrade }
    )),
    { title: "＊＊＊ 以上 ＊＊＊" },
    { title: "範囲外の落単", credits: "2", grade }
  ]);
  assert.equal(withFailure.gpa, 2);
  assert.equal(withFailure.totalCredits, 4);
  assert.equal(withFailure.totalWeightedPoints, 8);
  assert.equal(withFailure.courseCount, 2);
  assert.equal(withFailure.gradeCounts["*"], 1);
  assert.equal(withFailure.courses[1].points, 0);
  assert.equal(withFailure.courses[1].weightedPoints, 0);
}

const onlyFailure = calculateProfessionalGpa([
  { title: "【専門教育科目】" },
  { title: "落単科目", credits: "2", grade: "*" }
]);
assert.equal(onlyFailure.gpa, 0);
assert.equal(onlyFailure.totalCredits, 2);
assert.equal(onlyFailure.courseCount, 1);

console.log("gpa-core tests passed");
