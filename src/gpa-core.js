(function attachGpaCore(root, factory) {
  const core = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = core;
  }

  root.KsuGpaCore = core;
})(typeof globalThis !== "undefined" ? globalThis : window, function createGpaCore() {
  const GRADE_POINTS = Object.freeze({
    "秀": 4,
    "優": 3,
    "良": 2,
    "可": 1
  });

  function normalizeText(value) {
    return String(value || "").replace(/\u3000/g, " ").trim();
  }

  function parseCredits(value) {
    const normalized = normalizeText(value).replace(/#/g, "");
    const match = normalized.match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  function isProfessionalEducationHeader(title) {
    return normalizeText(title).includes("【専門教育科目】");
  }

  function isEndMarker(title) {
    const text = normalizeText(title);
    return text.includes("＊＊＊") || text.includes("***") || text.includes("以上");
  }

  function calculateProfessionalGpa(rows) {
    let inProfessionalSection = false;
    const courses = [];
    const gradeCounts = {
      "秀": 0,
      "優": 0,
      "良": 0,
      "可": 0
    };

    for (const row of rows) {
      const title = normalizeText(row.title);

      if (isProfessionalEducationHeader(title)) {
        inProfessionalSection = true;
        continue;
      }

      if (!inProfessionalSection) {
        continue;
      }

      if (isEndMarker(title)) {
        break;
      }

      const grade = normalizeText(row.grade);
      if (!(grade in GRADE_POINTS)) {
        continue;
      }

      const credits = parseCredits(row.credits);
      if (!credits) {
        continue;
      }

      const points = GRADE_POINTS[grade];
      gradeCounts[grade] += 1;
      courses.push({
        title,
        credits,
        grade,
        points,
        weightedPoints: credits * points
      });
    }

    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalWeightedPoints = courses.reduce((sum, course) => sum + course.weightedPoints, 0);
    const gpa = totalCredits ? totalWeightedPoints / totalCredits : null;

    return {
      gpa,
      totalCredits,
      totalWeightedPoints,
      courseCount: courses.length,
      gradeCounts,
      courses
    };
  }

  return {
    GRADE_POINTS,
    parseCredits,
    calculateProfessionalGpa
  };
});
