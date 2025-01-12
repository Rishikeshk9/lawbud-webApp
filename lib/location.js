export async function getStates() {
  try {
    const response = await fetch(
      'https://cdn-api.co-vin.in/api/v2/admin/location/states'
    );
    const data = await response.json();
    return data.states.map((state) => ({
      id: state.state_id,
      name: state.state_name,
    }));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

export async function getDistricts(stateId) {
  try {
    const response = await fetch(
      `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`
    );
    const data = await response.json();
    return data.districts.map((district) => ({
      id: district.district_id,
      name: district.district_name,
    }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}
