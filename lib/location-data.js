import statesAndDistricts from '@/app/data/states-and-districts.json';

export function getStates(stateId) {
  const states = statesAndDistricts.states.map((state, index) => ({
    id: index.toString(),
    name: state.state,
  }));
  console.log(states[parseInt(stateId)]);
  return states[parseInt(stateId)]?.name;
}

export function getDistricts(stateId, districtId) {
  const states = statesAndDistricts.states.map((state, index) => ({
    id: index.toString(),
    districts: state.districts,
  }));
  const district = states[parseInt(stateId)].districts[parseInt(districtId)];
  if (!district) return [];

  return district;
}
