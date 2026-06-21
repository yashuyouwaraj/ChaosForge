const buildCapacityPlanningInstruction = () => `
Analyze current infrastructure capacity.

Predict:

CPU pressure

Memory pressure

Traffic scaling

Potential bottlenecks

Scaling recommendations

Return JSON.
`;

module.exports = {
  buildCapacityPlanningInstruction,
};
