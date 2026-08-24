export function summarizeTrivyReport(report) {
  const counts = {
    vulnerabilities: 0,
    misconfigurations: 0,
    secrets: 0,
    high: 0,
    critical: 0,
  };
  for (const result of report?.Results ?? []) {
    for (const finding of result.Vulnerabilities ?? []) {
      counts.vulnerabilities += 1;
      const severity = String(finding.Severity ?? "").toUpperCase();
      if (severity === "HIGH") counts.high += 1;
      if (severity === "CRITICAL") counts.critical += 1;
    }
    for (const finding of result.Misconfigurations ?? []) {
      counts.misconfigurations += 1;
      const severity = String(finding.Severity ?? "").toUpperCase();
      if (severity === "HIGH") counts.high += 1;
      if (severity === "CRITICAL") counts.critical += 1;
    }
    for (const finding of result.Secrets ?? []) {
      counts.secrets += 1;
      const severity = String(finding.Severity ?? "").toUpperCase();
      if (severity === "HIGH") counts.high += 1;
      if (severity === "CRITICAL") counts.critical += 1;
    }
  }
  return { ...counts, findings: counts.vulnerabilities + counts.misconfigurations + counts.secrets };
}
