import { cpf } from 'cpf-cnpj-validator';

export function extractCpfDigits(value) {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

export function isValidCpf(value) {
  const onlyDigits = extractCpfDigits(value);
  if (!onlyDigits) return false;
  return cpf.isValid(onlyDigits);
}

export function ensureIsoDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;

  const [y, m, d] = str.split('-').map(Number);

  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) {
    return null;
  }
  return str;
}