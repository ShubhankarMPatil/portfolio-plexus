import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

export function generateHeight(x, z, scale = 0.1, amplitude = 3) {
  return noise2D(x * scale, z * scale) * amplitude;
}
