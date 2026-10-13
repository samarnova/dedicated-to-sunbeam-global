export default async function run(page, ui) {
  const clouds = await page.evaluate(() => {
    const b = getComputedStyle(document.body, '::before');
    const a = getComputedStyle(document.body, '::after');
    return {
      before: { anim: b.animationName, dur: b.animationDuration, repeat: b.animationIterationCount, pos: b.backgroundPositionX },
      after: { anim: a.animationName, dur: a.animationDuration, repeat: a.animationIterationCount },
    };
  });

  // Watch the cloud layer's background-position over time: does it travel one way?
  const samples = [];
  for (let i = 0; i < 4; i += 1) {
    samples.push(await page.evaluate(() =>
      getComputedStyle(document.body, '::before').backgroundPositionX
    ));
    await page.waitForTimeout(700);
  }

  return { clouds, samples };
}