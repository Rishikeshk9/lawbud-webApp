import { getStates } from './location';

export const states = {
  AN: 'Andaman and Nicobar Islands',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CT: 'Chhattisgarh',
  DN: 'Dadra and Nagar Haveli',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JK: 'Jammu and Kashmir',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OR: 'Odisha',
  PY: 'Puducherry',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  TR: 'Tripura',
  UP: 'Uttar Pradesh',
  UT: 'Uttarakhand',
  WB: 'West Bengal',
};

export const districts = {
  MH: {
    'mumbai-city': 'Mumbai City',
    'mumbai-suburban': 'Mumbai Suburban',
    thane: 'Thane',
    pune: 'Pune',
    // Add more districts as needed
  },
  DL: {
    'central-delhi': 'Central Delhi',
    'east-delhi': 'East Delhi',
    'new-delhi': 'New Delhi',
    'north-delhi': 'North Delhi',
    'south-delhi': 'South Delhi',
    // Add more districts as needed
  },
  // Add more states and their districts as needed
};

export async function getStateName(stateId) {
  const states = await getStates();
  console.log(states);
  const state = states.find((state) => state.id === stateId);
  return state ? state.name : stateId;
}

export function getDistrictName(stateId, districtId) {
  return districts[stateId]?.[districtId] || districtId;
}
