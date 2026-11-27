/**
 * Negara + landmark original. Tiket dibeli di Shop; biaya terbang dari config.
 */

export interface TravelCountry {
  id: string;
  nameKey: string;
  landmarkId: string;
  landmarkNameKey: string;
  descriptionKey: string;
}

export const TRAVEL_COUNTRIES: TravelCountry[] = [
  {
    id: 'nusantara',
    nameKey: 'country.nusantara',
    landmarkId: 'nusantara',
    landmarkNameKey: 'travel.landmark.nusantara',
    descriptionKey: 'travel.desc.nusantara',
  },
  {
    id: 'belanda',
    nameKey: 'country.belanda',
    landmarkId: 'belanda',
    landmarkNameKey: 'travel.landmark.belanda',
    descriptionKey: 'travel.desc.belanda',
  },
  {
    id: 'jepang',
    nameKey: 'country.jepang',
    landmarkId: 'jepang',
    landmarkNameKey: 'travel.landmark.jepang',
    descriptionKey: 'travel.desc.jepang',
  },
  {
    id: 'korea',
    nameKey: 'country.korea',
    landmarkId: 'korea',
    landmarkNameKey: 'travel.landmark.korea',
    descriptionKey: 'travel.desc.korea',
  },
  {
    id: 'prancis',
    nameKey: 'country.prancis',
    landmarkId: 'prancis',
    landmarkNameKey: 'travel.landmark.prancis',
    descriptionKey: 'travel.desc.prancis',
  },
];

export function findTravelCountry(id: string): TravelCountry | undefined {
  return TRAVEL_COUNTRIES.find((country) => country.id === id);
}
