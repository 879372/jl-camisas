export const unmask = (value: string | undefined | null) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const formatCPF = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
};

export const formatCNPJ = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 14) v = v.slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
};

export const formatCpfCnpj = (value: string | undefined | null) => {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 11) {
    return formatCPF(cleanValue);
  }
  return formatCNPJ(cleanValue);
};

export const formatTelefone = (value: string | undefined | null) => {
  if (!value) return '';
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
  v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  return v;
};

export const formatCEP = (value: string | undefined | null) => {
  if (!value) return '';
  let v = value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  v = v.replace(/^(\d{5})(\d)/, '$1-$2');
  return v;
};

export const formatCurrency = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return '';
  const val = typeof value === 'number' ? value.toFixed(2) : value.replace(/\D/g, '');
  const numericValue = typeof value === 'number' ? value : Number(val) / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

export const parseCurrency = (value: string | undefined | null) => {
  if (!value) return 0;
  return Number(value.replace(/\D/g, '')) / 100;
};
