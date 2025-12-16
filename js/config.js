// Configuration for the birthday invitation website

const CONFIG = {
  // Balloon settings
  balloons: {
    count: 15,
    colors: ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA'],
    minSize: 40,
    maxSize: 80,
    speed: {
      min: 0.5,
      max: 2
    }
  },
  
  // Card 3D tilt settings
  card: {
    maxTilt: 15, // Maximum tilt angle in degrees
    perspective: 1200,
    scale: 1.05, // Scale on hover
    shadowIntensity: 0.3,
    // Mobile-specific settings
    mobileMaxTilt: 10, // Reduced tilt for mobile
    mobilePerspective: 800, // Reduced perspective for mobile
    mobileScale: 1.02 // Reduced scale for mobile
  }
};

