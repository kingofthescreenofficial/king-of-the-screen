function simulate(curveLogic) {
  let p = 1;
  let t = 1;
  let kings = 1;
  while(kings < 100) {
    p = curveLogic(p);
    t += p;
    kings++;
  }
  return {price: p, total: t, kings};
}

const res1 = simulate((p) => {
  if (p < 10) return p + 1;
  if (p < 100) return p + 5;
  if (p < 1000) return Math.round(p * 1.25);
  return Math.round(p * 1.15);
});

const res2 = simulate((p) => {
  if (p < 10) return p + 2;
  if (p < 100) return p + 10;
  if (p < 500) return Math.round(p * 1.20);
  return Math.round(p * 1.18);
});

console.log("Curve 1:", res1);
console.log("Curve 2:", res2);
