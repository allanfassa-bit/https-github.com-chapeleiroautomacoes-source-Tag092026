/**
 * Utilitário de Identificação Numérica e Romana para Placas & Adesivos ALF Automação
 * Converte números das placas (ex: empresa08, placa 04, 15) em algarismos romanos discretos
 * e formata etiquetas sutis para impressão na margem esquerda das placas físicas.
 */

/**
 * Converte um número inteiro (1 a 3999) para algarismos romanos (I, II, III, IV, ..., XL, etc.)
 * Usa cálculo matemático direto (O(1)) sem loops infinitos.
 */
export function toRomanNumeral(num: number): string {
  if (isNaN(num) || num <= 0 || num > 3999) return '';
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  let n = Math.floor(num);
  for (const [value, letter] of romanMap) {
    const count = Math.floor(n / value);
    if (count > 0) {
      result += letter.repeat(count);
      n %= value;
    }
  }
  return result;
}

/**
 * Converte algarismos romanos de volta para número inteiro (ex: "VIII" -> 8, "IV" -> 4)
 */
export function fromRomanNumeral(romanStr: string): number | null {
  if (!romanStr || typeof romanStr !== 'string') return null;
  const clean = romanStr.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(clean)) return null;

  const charMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const current = charMap[clean[i]];
    const next = charMap[clean[i + 1]];
    if (next && next > current) {
      total += next - current;
      i++;
    } else {
      total += current;
    }
  }
  return total > 0 ? total : null;
}

export interface PlateIdentification {
  num: number | null;
  numStr: string;
  roman: string;
  displayTag: string;
  subtleBadge: string;
  leftEdgeTag: string;
}

/**
 * Extrai o número da placa e gera o selo discreto em algarismos romanos
 * para que o adesivo/placa tenha a identificação no canto esquerdo
 * sem que o cliente perceba uma contagem sequencial óbvia.
 * Ex:
 *  "empresa08" -> { num: 8, roman: "VIII", displayTag: "Nº VIII", subtleBadge: "VIII (08)", leftEdgeTag: "Nº VIII" }
 *  "empresa04" -> { num: 4, roman: "IV", displayTag: "Nº IV", subtleBadge: "IV (04)", leftEdgeTag: "Nº IV" }
 *  "empresa40" -> { num: 40, roman: "XL", displayTag: "Nº XL", subtleBadge: "XL (40)", leftEdgeTag: "Nº XL" }
 */
export function getPlateIdentification(
  idOrName: string = '',
  secondaryStr: string = '',
  indexFallback?: number
): PlateIdentification {
  const combined = [String(idOrName || '').trim(), String(secondaryStr || '').trim()];

  // 1. Tenta extrair número arábico do primeiro ou segundo campo (apenas números de placa válidos 1 a 3999)
  for (const text of combined) {
    if (!text) continue;
    // Prioriza padrões específicos de placa (ex: empresa08, placa 04, tag12, #05)
    const specificMatch = text.match(/(?:empresa|placa|tag|lote|totem|adesivo|#)\s*(\d{1,4})/i) || text.match(/\b\d{1,3}\b/);
    const match = specificMatch || text.match(/\d{1,4}/);
    if (match) {
      const parsedMatch = specificMatch ? match[1] || match[0] : match[0];
      const num = parseInt(parsedMatch, 10);
      if (!isNaN(num) && num > 0 && num <= 3999) {
        const roman = toRomanNumeral(num);
        const numStr = String(num).padStart(2, '0');
        return {
          num,
          numStr,
          roman,
          displayTag: roman ? `Nº ${roman}` : `Nº ${numStr}`,
          subtleBadge: roman ? `${roman} (${numStr})` : `#${numStr}`,
          leftEdgeTag: roman ? `Nº ${roman}` : `#${numStr}`,
        };
      }
    }
  }

  // 2. Tenta extrair número romano já existente no texto (ex: "PLACA IV")
  for (const text of combined) {
    if (!text) continue;
    const romanMatch = text.match(/\b([IVXLCDM]{1,8})\b/i);
    if (romanMatch) {
      const roman = romanMatch[1].toUpperCase();
      const num = fromRomanNumeral(roman);
      const numStr = num ? String(num).padStart(2, '0') : '';
      return {
        num,
        numStr,
        roman,
        displayTag: `Nº ${roman}`,
        subtleBadge: numStr ? `${roman} (${numStr})` : roman,
        leftEdgeTag: `Nº ${roman}`,
      };
    }
  }

  // 3. Fallback se fornecido índice (ex: item 1, 2, 3...)
  if (typeof indexFallback === 'number' && indexFallback > 0) {
    const roman = toRomanNumeral(indexFallback);
    const numStr = String(indexFallback).padStart(2, '0');
    return {
      num: indexFallback,
      numStr,
      roman,
      displayTag: roman ? `Nº ${roman}` : `Nº ${numStr}`,
      subtleBadge: roman ? `${roman} (${numStr})` : `#${numStr}`,
      leftEdgeTag: roman ? `Nº ${roman}` : `#${numStr}`,
    };
  }

  return {
    num: null,
    numStr: '',
    roman: '',
    displayTag: '',
    subtleBadge: '',
    leftEdgeTag: '',
  };
}
