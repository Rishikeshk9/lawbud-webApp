import statesAndDistricts from '@/app/data/states-and-districts.json';

export function getStates(stateId) {
  return statesAndDistricts.states.map((state, index) => ({
    id: index.toString(),
    name: state.state,
  }));
}

export function getDistricts(stateId, districtId) {
  const stateData = statesAndDistricts.states[parseInt(stateId)];
  if (!stateData) return [];

  return stateData.districts.map((district, index) => ({
    id: index.toString(),
    name: district,
  }));
}
