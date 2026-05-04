// stages:[{durationSec,rate}]
// return array of { rate, durationSec }

const normalizeStages = (stages = []) => {
  if (!Array.isArray(stages) || stages.length === 0) {
    return [];
  }

  return stages
    .filter((s) => s && s.durationSec > 0 && s.rate >= 0)
    .map((s) => ({
      durationSec: Number(s.durationSec),
      rate: Number(s.rate),
    }));
};

// simple ramp helper (optional): generate linear ramp
const buildRamp = ({startRate = 0, endRate = 100, durationSec = 30, steps = 6})=>{
    const stepDur = Math.max(1, Math.floor(durationSec / steps))
    const delta = (endRate - startRate) / steps

    const stages = []
    for(let i=0 ; i<steps; i++){
        const rate = Math.max(0, Math.round(startRate + delta *(i+1)))
        stages.push({durationSec: stepDur, rate})
    }

    return stages
}

module.exports = {
  normalizeStages,
  buildRamp
};
