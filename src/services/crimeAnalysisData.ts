
// Crime type descriptions for AI analysis
export const crimeDescriptions = {
  "abuse": (
    "The detected video may involve abuse-related actions.\n" +
    "Abuse can be verbal, emotional, or physical.\n" +
    "It often includes intentional harm inflicted on a victim.\n" +
    "The victim may display distress or defensive behavior.\n" +
    "There might be aggressive body language or shouting.\n" +
    "Such scenes usually lack mutual consent or context of play.\n" +
    "These actions are violations of basic human rights.\n" +
    "It is important to report such behavior to authorities.\n" +
    "Detection helps in early intervention and protection.\n" +
    "Please verify with human oversight for further action."
  ),
  "assault": (
    "Assault involves a physical attack or aggressive encounter.\n" +
    "This may include punching, kicking, or pushing actions.\n" +
    "The victim may be seen retreating or being overpowered.\n" +
    "There is usually a visible conflict or threat present.\n" +
    "Such behavior is dangerous and potentially life-threatening.\n" +
    "Immediate attention from security or authorities is critical.\n" +
    "Assault detection can help prevent further escalation.\n" +
    "The video may include violent gestures or weapons.\n" +
    "Please proceed with care while reviewing such footage.\n" +
    "Confirm with experts before initiating legal steps."
  ),
  "arson": (
    "This video likely captures an incident of arson.\n" +
    "Arson is the criminal act of intentionally setting fire.\n" +
    "You may see flames, smoke, or ignition devices.\n" +
    "Often, it targets property like buildings or vehicles.\n" +
    "Arson can lead to massive destruction and danger to life.\n" +
    "There might be a rapid spread of fire visible.\n" +
    "Suspects may appear to flee the scene post-ignition.\n" +
    "These cases require immediate fire and law response.\n" +
    "Check for signs of accelerants or premeditated setup.\n" +
    "This detection must be validated with caution."
  ),
  "arrest": (
    "The scene likely depicts a law enforcement arrest.\n" +
    "An arrest involves restraining a suspect or individual.\n" +
    "You may see officers using handcuffs or other tools.\n" +
    "The individual may be cooperating or resisting.\n" +
    "It could be in public or private settings.\n" +
    "Often, the suspect is guided or pushed into a vehicle.\n" +
    "The presence of uniforms or badges may be evident.\n" +
    "These scenarios may follow legal procedures.\n" +
    "Misidentification is possible — confirm context.\n" +
    "Verify with official reports before assuming guilt."
  )
};

// Helper functions for crime analysis
export const getCrimeDescriptionByType = (crimeType: string): string => {
  const normalizedType = crimeType.toLowerCase();
  return crimeDescriptions[normalizedType as keyof typeof crimeDescriptions] || 
    "No detailed description available for this incident type.";
};

export const getCrimeTypeColor = (crimeType: string): string => {
  switch (crimeType.toLowerCase()) {
    case 'abuse':
      return 'bg-orange-100 text-orange-800';
    case 'assault':
      return 'bg-red-100 text-red-800';
    case 'arson':
      return 'bg-amber-100 text-amber-800';
    case 'arrest':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Define crime severity levels
export const getCrimeSeverity = (crimeType: string): number => {
  switch (crimeType.toLowerCase()) {
    case 'assault':
      return 5; // High severity
    case 'arson':
      return 4;
    case 'abuse':
      return 3;
    case 'arrest':
      return 2; // Lower severity (could be legitimate action)
    default:
      return 1;
  }
};

// Get recommended actions based on crime type
export const getRecommendedActions = (crimeType: string): string[] => {
  const baseActions = [
    "Report to local authorities",
    "Document all evidence carefully"
  ];
  
  switch (crimeType.toLowerCase()) {
    case 'assault':
      return [
        ...baseActions,
        "Contact medical assistance if injuries are visible",
        "Identify witnesses if possible",
        "Request urgent police response"
      ];
    case 'arson':
      return [
        ...baseActions,
        "Contact fire department immediately",
        "Evacuate the area",
        "Note any suspicious individuals near the scene"
      ];
    case 'abuse':
      return [
        ...baseActions,
        "Connect victim with support resources",
        "Ensure victim safety",
        "Document pattern of behavior if recurring"
      ];
    case 'arrest':
      return [
        ...baseActions,
        "Verify if proper procedures were followed",
        "Note officer identification if visible",
        "Document time and location details"
      ];
    default:
      return baseActions;
  }
};
