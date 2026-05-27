export interface SpecCheckResult {
  ok: boolean;
  missingInCode: string[];
  missingInSpec: string[];
  totalSpec: number;
  totalCode: number;
}

export class SpecChecker {
  compare(specEndpoints: string[], codeEndpoints: string[]): SpecCheckResult {
    const spec = new Set(specEndpoints);
    const code = new Set(codeEndpoints);
    const missingInCode = [...spec].filter(e => !code.has(e)).sort();
    const missingInSpec = [...code].filter(e => !spec.has(e)).sort();
    return {
      ok: missingInCode.length === 0 && missingInSpec.length === 0,
      missingInCode,
      missingInSpec,
      totalSpec: spec.size,
      totalCode: code.size
    };
  }

  static format(result: SpecCheckResult): string {
    if (result.ok) {
      return `✓ spec:check OK — ${result.totalSpec} endpoints alineados entre spec y código.`;
    }
    const lines: string[] = [];
    lines.push('✗ SPEC DRIFT DETECTADO');
    lines.push(`  Spec declara ${result.totalSpec} endpoints; código implementa ${result.totalCode}.`);
    if (result.missingInCode.length > 0) {
      lines.push('');
      lines.push(`  En spec pero NO en código (${result.missingInCode.length}):`);
      for (const e of result.missingInCode) lines.push(`    - ${e}`);
    }
    if (result.missingInSpec.length > 0) {
      lines.push('');
      lines.push(`  En código pero NO en spec (${result.missingInSpec.length}):`);
      for (const e of result.missingInSpec) lines.push(`    - ${e}`);
    }
    lines.push('');
    lines.push('  Sincroniza contracts/api-core.yaml con la implementación (o viceversa).');
    return lines.join('\n');
  }
}
