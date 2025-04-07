
// This file contains mock data for wanted individuals
// In a real application, this would likely come from a backend API

export interface WantedIndividual {
  id: string;
  name: string;
  age: string;
  height: string;
  weight: string;
  photoUrl: string;
  charges: string;
  dangerLevel: 'Low' | 'Medium' | 'High';
  lastKnownLocation: string;
  caseNumber: string;
  description?: string;
}

// Initial data
let wantedIndividualsData: WantedIndividual[] = [
  {
    id: '1',
    name: 'John Doe',
    age: '35',
    height: '6\'2"',
    weight: '190 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=300&auto=format&fit=crop',
    charges: 'Armed Robbery, Assault with a Deadly Weapon',
    dangerLevel: 'High',
    lastKnownLocation: 'Downtown Metro Area',
    caseNumber: 'CR-2023-00145',
    description: 'Suspect in multiple armed robberies of convenience stores. Known to be armed and dangerous.'
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: '28',
    height: '5\'7"',
    weight: '135 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    charges: 'Grand Theft Auto, Identity Fraud',
    dangerLevel: 'Medium',
    lastKnownLocation: 'Eastside Shopping District',
    caseNumber: 'CR-2023-00187',
    description: 'Wanted for a series of luxury vehicle thefts and identity fraud cases across multiple counties.'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    age: '42',
    height: '5\'10"',
    weight: '210 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    charges: 'Drug Trafficking, Money Laundering',
    dangerLevel: 'Medium',
    lastKnownLocation: 'Harbor District',
    caseNumber: 'CR-2023-00219',
    description: 'Suspected of operating a drug distribution network. May be traveling with associates.'
  },
  {
    id: '4',
    name: 'Michael Williams',
    age: '31',
    height: '6\'0"',
    weight: '180 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    charges: 'Burglary, Possession of Stolen Property',
    dangerLevel: 'Low',
    lastKnownLocation: 'North Suburbs',
    caseNumber: 'CR-2023-00254',
    description: 'Suspected in a series of residential burglaries targeting unoccupied homes.'
  },
  {
    id: '5',
    name: 'Sarah Davis',
    age: '26',
    height: '5\'5"',
    weight: '120 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
    charges: 'Fraud, Embezzlement',
    dangerLevel: 'Low',
    lastKnownLocation: 'Financial District',
    caseNumber: 'CR-2023-00278',
    description: 'Wanted for corporate embezzlement and financial fraud schemes.'
  },
  {
    id: '6',
    name: 'David Brown',
    age: '38',
    height: '5\'11"',
    weight: '195 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    charges: 'Assault, Criminal Threats',
    dangerLevel: 'High',
    lastKnownLocation: 'West End Neighborhood',
    caseNumber: 'CR-2023-00312',
    description: 'Has a history of violence and should not be approached by the public.'
  }
];

// Getter for the wanted individuals data
export const getWantedIndividuals = (): WantedIndividual[] => {
  return [...wantedIndividualsData];
};

// Setter for the wanted individuals data
export const updateWantedIndividuals = (newData: WantedIndividual[]): void => {
  wantedIndividualsData = [...newData];
};

// Function to add a new wanted individual
export const addWantedIndividual = (individual: WantedIndividual): void => {
  wantedIndividualsData = [...wantedIndividualsData, individual];
};

// Function to update an existing wanted individual
export const updateWantedIndividual = (individual: WantedIndividual): void => {
  wantedIndividualsData = wantedIndividualsData.map(item => 
    item.id === individual.id ? individual : item
  );
};

// Function to delete a wanted individual
export const deleteWantedIndividual = (id: string): void => {
  wantedIndividualsData = wantedIndividualsData.filter(individual => individual.id !== id);
};

// Export the current data for backward compatibility
export const wantedIndividuals = getWantedIndividuals();
