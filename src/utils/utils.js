const lerp = (x, v0, v1) => v0 + x * (v1 - v0);

const clamp = (v, min = 0, max = 1) => Math.max(Math.min(v, max), min);

const wrap = (v, min, max) =>
  min + ((((v - min) % (max - min)) + (max - min)) % (max - min));

const smoothStep = (v0, v1, x) => {
  if (x < v0) return v0;
  if (x > v1) return v1;
  return v0 + (v1 - v0) * (x ** 2 * (3 - 2 * x));
};

const smoothStepInv = (v0, v1, x) => {
  if (x < v0) return 0;
  if (x > v1) return 1;
  return v0 + (v1 - v0) * x * (2 * x ** 2 - 3 * x + 2);
};

const smootherstep = (v0, v1, x) => {
  if (x < v0) return v0;
  if (x > v1) return v1;
  return v0 + (v1 - v0) * (x ** 3 * (x * (x * 6 - 15) + 10));
};

const rsmul = (x, a) => {
  if (a == 0 || x == 0) return 0;
  return (a * x) / (2 * a * x - a - x + 1);
};

const curvefit3 = (x, min, middle, max) =>
  lerp(rsmul(x, (middle - min) / (max - min)), min, max);

export {
  lerp,
  clamp,
  wrap,
  smoothStep,
  smoothStepInv,
  smootherstep,
  rsmul,
  curvefit3,
};
