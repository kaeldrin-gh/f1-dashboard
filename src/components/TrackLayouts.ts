// F1 Track Layouts - Simplified coordinates for visualization
export interface TrackPoint {
  x: number;
  y: number;
}

export interface TrackLayout {
  name: string;
  points: TrackPoint[];
  sectors: number[];
  width: number;
  height: number;
  startFinish: TrackPoint;
}

export const trackLayouts: Record<string, TrackLayout> = {
  // Monaco Grand Prix
  monaco: {
    name: "Monaco",
    width: 400,
    height: 250,
    startFinish: { x: 200, y: 50 },
    sectors: [25, 65, 100], // Percentage of track
    points: [
      { x: 200, y: 50 },   // Start/Finish
      { x: 250, y: 55 },   // Turn 1 (Sainte Devote)
      { x: 300, y: 70 },   // Massenet
      { x: 320, y: 90 },   // Casino
      { x: 330, y: 120 },  // Mirabeau
      { x: 320, y: 150 },  // Portier
      { x: 280, y: 170 },  // Tunnel
      { x: 220, y: 180 },  // Chicane
      { x: 160, y: 175 },  // Tabac
      { x: 100, y: 160 },  // Swimming Pool
      { x: 80, y: 130 },   // La Rascasse
      { x: 90, y: 100 },   // Anthony Noghes
      { x: 120, y: 80 },
      { x: 160, y: 60 },
      { x: 200, y: 50 }    // Back to start
    ]
  },

  // Silverstone
  silverstone: {
    name: "Silverstone",
    width: 400,
    height: 300,
    startFinish: { x: 200, y: 50 },
    sectors: [30, 70, 100],
    points: [
      { x: 200, y: 50 },   // Start/Finish
      { x: 250, y: 55 },   // Turn 1 (Abbey)
      { x: 300, y: 70 },   // Farm Curve
      { x: 340, y: 100 },  // Village
      { x: 350, y: 140 },  // The Loop
      { x: 330, y: 180 },  // Aintree
      { x: 300, y: 210 },  // Wellington Straight
      { x: 250, y: 230 },  // Brooklands
      { x: 200, y: 240 },  // Luffield
      { x: 150, y: 230 },  // Woodcote
      { x: 100, y: 210 },  // Copse
      { x: 70, y: 180 },   // Maggotts
      { x: 60, y: 140 },   // Becketts
      { x: 80, y: 100 },   // Chapel
      { x: 120, y: 70 },   // Hangar Straight
      { x: 200, y: 50 }    // Back to start
    ]
  },

  // Spa-Francorchamps
  spa: {
    name: "Spa-Francorchamps",
    width: 450,
    height: 280,
    startFinish: { x: 225, y: 140 },
    sectors: [25, 55, 100],
    points: [
      { x: 225, y: 140 },  // Start/Finish
      { x: 250, y: 145 },  // La Source
      { x: 300, y: 160 },  // Raidillon
      { x: 370, y: 180 },  // Kemmel Straight
      { x: 400, y: 200 },  // Bruxelles
      { x: 390, y: 230 },  // Speaker's Corner
      { x: 350, y: 250 },  // Pouhon
      { x: 300, y: 255 },  // Fagnes
      { x: 250, y: 250 },  // Stavelot
      { x: 200, y: 240 },  // Blanchimont
      { x: 150, y: 220 },  // Bus Stop Chicane
      { x: 120, y: 200 },
      { x: 100, y: 180 },
      { x: 90, y: 160 },
      { x: 100, y: 140 },
      { x: 150, y: 130 },
      { x: 200, y: 135 },
      { x: 225, y: 140 }   // Back to start
    ]
  },

  // Suzuka
  suzuka: {
    name: "Suzuka",
    width: 400,
    height: 350,
    startFinish: { x: 200, y: 50 },
    sectors: [35, 70, 100],
    points: [
      { x: 200, y: 50 },   // Start/Finish
      { x: 250, y: 60 },   // Turn 1
      { x: 300, y: 80 },   // Turn 2
      { x: 340, y: 120 },  // Dunlop
      { x: 350, y: 160 },  // Degner
      { x: 340, y: 200 },  // Hairpin
      { x: 300, y: 230 },  // Spoon Curve
      { x: 250, y: 250 },  // 130R
      { x: 200, y: 260 },  // Casio Triangle
      { x: 150, y: 250 },  // Chicane
      { x: 100, y: 230 },
      { x: 60, y: 200 },   // Bridge section
      { x: 50, y: 160 },
      { x: 60, y: 120 },   // S Curves
      { x: 100, y: 90 },
      { x: 150, y: 70 },
      { x: 200, y: 50 }    // Back to start
    ]
  },
  // Generic oval for unknown tracks
  default: {
    name: "Circuit",
    width: 350,
    height: 200,
    startFinish: { x: 275, y: 100 },
    sectors: [33, 66, 100],
    points: [
      { x: 275, y: 100 },  // Start/Finish
      { x: 300, y: 80 },
      { x: 320, y: 60 },
      { x: 330, y: 40 },
      { x: 320, y: 20 },
      { x: 300, y: 10 },
      { x: 200, y: 5 },
      { x: 100, y: 10 },
      { x: 80, y: 20 },
      { x: 70, y: 40 },
      { x: 80, y: 60 },
      { x: 100, y: 80 },
      { x: 150, y: 90 },
      { x: 200, y: 95 },
      { x: 275, y: 100 }
    ]
  },

  // Monza
  monza: {
    name: "Monza",
    width: 400,
    height: 300,
    startFinish: { x: 200, y: 50 },
    sectors: [30, 65, 100],
    points: [
      { x: 200, y: 50 },   // Start/Finish
      { x: 250, y: 55 },   // Turn 1 (Rettifilo)
      { x: 300, y: 70 },   // Turn 2
      { x: 350, y: 100 },  // Curva Grande
      { x: 360, y: 140 },  // Della Roggia
      { x: 340, y: 180 },  // Lesmo 1
      { x: 300, y: 200 },  // Lesmo 2
      { x: 250, y: 220 },  // Ascari
      { x: 200, y: 230 },  // Chicane
      { x: 150, y: 220 },  // Parabolica
      { x: 100, y: 200 },
      { x: 70, y: 170 },
      { x: 60, y: 130 },
      { x: 80, y: 90 },
      { x: 120, y: 70 },
      { x: 160, y: 55 },
      { x: 200, y: 50 }    // Back to start
    ]
  },

  // Interlagos
  interlagos: {
    name: "Interlagos",
    width: 420,
    height: 280,
    startFinish: { x: 210, y: 60 },
    sectors: [28, 65, 100],
    points: [
      { x: 210, y: 60 },   // Start/Finish
      { x: 260, y: 65 },   // Senna S
      { x: 300, y: 80 },   // Turn 2
      { x: 330, y: 110 },  // Turn 3
      { x: 340, y: 150 },  // Descida do Lago
      { x: 320, y: 190 },  // Ferradura
      { x: 280, y: 220 },  // Laranja
      { x: 230, y: 235 },  // Pinheirinho
      { x: 180, y: 240 },  // Bico de Pato
      { x: 130, y: 235 },  // Mergulho
      { x: 90, y: 210 },   // Junção
      { x: 70, y: 180 },   // Subida dos Boxes
      { x: 80, y: 140 },
      { x: 110, y: 110 },
      { x: 150, y: 85 },
      { x: 180, y: 70 },
      { x: 210, y: 60 }    // Back to start
    ]
  },

  // Hungaroring
  hungaroring: {
    name: "Hungaroring",
    width: 380,
    height: 260,
    startFinish: { x: 190, y: 50 },
    sectors: [32, 68, 100],
    points: [
      { x: 190, y: 50 },   // Start/Finish
      { x: 240, y: 55 },   // Turn 1
      { x: 280, y: 75 },   // Turn 2
      { x: 310, y: 100 },  // Turn 3
      { x: 320, y: 130 },  // Turn 4
      { x: 310, y: 160 },  // Turn 5
      { x: 280, y: 185 },  // Turn 6
      { x: 240, y: 200 },  // Turn 7
      { x: 200, y: 210 },  // Turn 8
      { x: 160, y: 205 },  // Turn 9
      { x: 120, y: 190 },  // Turn 10
      { x: 90, y: 170 },   // Turn 11
      { x: 70, y: 140 },   // Turn 12
      { x: 80, y: 110 },   // Turn 13
      { x: 100, y: 85 },   // Turn 14
      { x: 140, y: 65 },
      { x: 190, y: 50 }    // Back to start
    ]
  },

  // Circuit of the Americas (COTA)
  cota: {
    name: "Circuit of the Americas",
    width: 450,
    height: 320,
    startFinish: { x: 225, y: 60 },
    sectors: [25, 55, 100],
    points: [
      { x: 225, y: 60 },   // Start/Finish
      { x: 275, y: 65 },   // Turn 1 (steep climb)
      { x: 320, y: 80 },   // Turn 2-5 (esses)
      { x: 350, y: 110 },  // Turn 6-8
      { x: 370, y: 150 },  // Turn 9
      { x: 360, y: 190 },  // Turn 10
      { x: 330, y: 220 },  // Turn 11 (hairpin)
      { x: 290, y: 240 },  // Turn 12-14
      { x: 240, y: 250 },  // Turn 15
      { x: 190, y: 245 },  // Turn 16-18
      { x: 140, y: 230 },  // Turn 19
      { x: 100, y: 200 },  // Turn 20
      { x: 80, y: 160 },   // Back straight
      { x: 90, y: 120 },
      { x: 120, y: 90 },
      { x: 170, y: 70 },
      { x: 225, y: 60 }    // Back to start
    ]
  },

  // Red Bull Ring
  redbullring: {
    name: "Red Bull Ring",
    width: 350,
    height: 200,
    startFinish: { x: 175, y: 50 },
    sectors: [35, 70, 100],
    points: [
      { x: 175, y: 50 },   // Start/Finish
      { x: 220, y: 55 },   // Turn 1
      { x: 260, y: 70 },   // Turn 2
      { x: 290, y: 95 },   // Turn 3 (Remus)
      { x: 300, y: 125 },  // Turn 4 (Schlossgold)
      { x: 290, y: 150 },  // Turn 5-6
      { x: 260, y: 170 },  // Turn 7 (Rindt)
      { x: 220, y: 175 },  // Turn 8
      { x: 180, y: 170 },  // Turn 9 (Jochen Rindt)
      { x: 140, y: 155 },  // Turn 10
      { x: 110, y: 130 },  // Back straight
      { x: 100, y: 100 },
      { x: 110, y: 75 },
      { x: 140, y: 60 },
      { x: 175, y: 50 }    // Back to start
    ]
  }
};

// Map session names to track layouts
export const getTrackLayout = (sessionName?: string): TrackLayout => {
  if (!sessionName) return trackLayouts.default;
  
  const name = sessionName.toLowerCase();
  
  if (name.includes('monaco')) return trackLayouts.monaco;
  if (name.includes('silverstone') || name.includes('british')) return trackLayouts.silverstone;
  if (name.includes('spa') || name.includes('belgian')) return trackLayouts.spa;
  if (name.includes('suzuka') || name.includes('japanese')) return trackLayouts.suzuka;
  if (name.includes('monza') || name.includes('italian')) return trackLayouts.monza;
  if (name.includes('interlagos') || name.includes('brazilian') || name.includes('brazil')) return trackLayouts.interlagos;
  if (name.includes('hungaroring') || name.includes('hungarian') || name.includes('hungary')) return trackLayouts.hungaroring;
  if (name.includes('cota') || name.includes('austin') || name.includes('united states')) return trackLayouts.cota;
  if (name.includes('red bull ring') || name.includes('austria') || name.includes('spielberg')) return trackLayouts.redbullring;
  
  return trackLayouts.default;
};

// Convert track percentage to track coordinates
export const getTrackPosition = (track: TrackLayout, percentage: number): TrackPoint => {
  const points = track.points;
  const totalPoints = points.length - 1; // Subtract 1 since last point = first point
  
  // Convert percentage to point index
  const index = (percentage / 100) * totalPoints;
  const baseIndex = Math.floor(index);
  const fraction = index - baseIndex;
  
  // Interpolate between points
  const point1 = points[baseIndex];
  const point2 = points[(baseIndex + 1) % points.length];
  
  return {
    x: point1.x + (point2.x - point1.x) * fraction,
    y: point1.y + (point2.y - point1.y) * fraction
  };
};
