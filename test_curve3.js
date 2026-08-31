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

for(let rate = 1.05; rate <= 1.20; rate += 0.01) {
    let res = simulate((p) => {
        if (p < 10) return p + 1;
        if (p < 100) return p + 5;
        return Math.round(p * rate);
    });
    console.log(`Rate ${rate.toFixed(2)}: Total = $${res.total.toLocaleString()} (Final Price: $${res.price.toLocaleString()})`);
}
