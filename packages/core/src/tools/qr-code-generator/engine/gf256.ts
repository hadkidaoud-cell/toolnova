const GF256_EXP: number[] = new Array(512);
const GF256_LOG: number[] = new Array(256);

(function initGaloisField(): void {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255]!;
  }
})();

export function gf256Mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[GF256_LOG[a]! + GF256_LOG[b]!]!;
}

export function gf256Pow(a: number, power: number): number {
  if (power === 0) return 1;
  if (a === 0) return 0;
  return GF256_EXP[(GF256_LOG[a]! * power) % 255]!;
}

export function generateECBytes(dataBytes: number[], ecCount: number): number[] {
  const gen = generateGeneratorPoly(ecCount);
  const result = new Array(ecCount).fill(0);

  for (let i = 0; i < dataBytes.length; i++) {
    const coef = dataBytes[i]! ^ result[0]!;
    result.shift();
    result.push(0);
    for (let j = 0; j < ecCount; j++) {
      result[j] = result[j]! ^ gf256Mul(gen[j + 1]!, coef);
    }
  }

  return result;
}

function generateGeneratorPoly(degree: number): number[] {
  let gen = [1];
  for (let i = 0; i < degree; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    const root = GF256_EXP[i]!;
    for (let j = 0; j < gen.length; j++) {
      newGen[j] = newGen[j]! ^ gen[j]!;
      newGen[j + 1] = newGen[j + 1]! ^ gf256Mul(gen[j]!, root);
    }
    gen = newGen;
  }
  return gen;
}
