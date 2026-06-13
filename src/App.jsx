import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
  LineChart, Line, Cell, ReferenceLine, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

// ============ BRAND ============
const BHA = {
  blue: "#0057B8",
  blueLight: "#3DBEFF",       // brighter, more electric cyan-blue (was #4A9EFF)
  blueDark: "#003D7A",
  blueGlow: "rgba(61, 190, 255, 0.5)",
  white: "#FFFFFF"
};
const SCOUTS = {
  green: "#1FD43E",
  greenDark: "#0C5C24",
  greenGlow: "rgba(31, 212, 62, 0.5)"
};
// Cyberpunk accent palette — used for glow, highlight, and key UI accents
const CYBER = {
  magenta: "#FF2BD6",         // hot magenta — for star players, key highlights
  cyan: "#00F5FF",            // electric cyan — for active state pulses
  hotpink: "#FF4DA6",         // hot pink — secondary accent
  amber: "#FFB800",           // warm amber (replacing yellow for warmer glow)
  neonGreen: "#39FF74",       // neon green — successful-action / final-action glow
  magentaGlow: "rgba(255, 43, 214, 0.5)",
  cyanGlow: "rgba(0, 245, 255, 0.5)"
};

// ============ SQUAD DATA (real names, plausible 2025-26 stats with position-specific KPIs) ============
// keyStats contains both the 4 "table" stats and the full extended season set per position.
// Schema by position:
//   GK:  cs, savePct, distPct, sweeper, saves, goalsConc, penSaves, highClaims, crossesClaimed, shotsFaced, minPerGoalConc
//   DEF: tackles, ints, clr, aer, tklWonPct, blocks, fouls, yellows, duelsPct, recoveries, progCarries, passPct
//   MID: passPct, progPass, recov, distKm, keyPasses, throughBalls, chCreated, tackles, ints, ballCarries, yellows, fouls
//   FWD: goals, sot, drib, convPct, xG, xA, bigChMissed, shotAcc, assists, minPerGoal, offsides, foulsWon
const squad = [
  // Goalkeepers
  { num: 1,  pos: "GK",  name: "B. Verbruggen",     nation: "NED", apps: 35, g: 0,  a: 0, cs: 11, starter: true,
    keyStats: { cs: 11, savePct: 71, distPct: 78, sweeper: 1.2,
                saves: 105, goalsConc: 49, penSaves: 1, highClaims: 1.2, crossesClaimed: 0.8, shotsFaced: 148, minPerGoalConc: 64 } },
  { num: 23, pos: "GK",  name: "J. Steele",          nation: "ENG", apps: 5,  g: 0,  a: 0, cs: 1,
    keyStats: { cs: 1,  savePct: 68, distPct: 72, sweeper: 0.8,
                saves: 14, goalsConc: 7, penSaves: 0, highClaims: 0.9, crossesClaimed: 0.6, shotsFaced: 22, minPerGoalConc: 64 } },
  { num: 38, pos: "GK",  name: "T. McGill",          nation: "CAN", apps: 1,  g: 0,  a: 0, cs: 0,
    keyStats: { cs: 0,  savePct: 65, distPct: 70, sweeper: 0.5,
                saves: 3, goalsConc: 2, penSaves: 0, highClaims: 0.5, crossesClaimed: 0.3, shotsFaced: 6, minPerGoalConc: 45 } },
  // Defenders
  { num: 5,  pos: "CB",  name: "L. Dunk",            nation: "ENG", apps: 32, g: 1,  a: 5, starter: true, captain: true,
    keyStats: { tackles: 2.4, ints: 2.1, clr: 3.8, aer: 72,
                tklWonPct: 71, blocks: 1.4, fouls: 1.1, yellows: 5, duelsPct: 65, recoveries: 5.8, progCarries: 1.6, passPct: 89 } },
  { num: 6,  pos: "CB",  name: "J. van Hecke",       nation: "NED", apps: 30, g: 0,  a: 2, starter: true,
    keyStats: { tackles: 2.6, ints: 1.9, clr: 3.5, aer: 68,
                tklWonPct: 68, blocks: 1.1, fouls: 0.9, yellows: 4, duelsPct: 62, recoveries: 5.2, progCarries: 2.2, passPct: 87 } },
  { num: 21, pos: "CB",  name: "O. Boscagli",        nation: "FRA", apps: 17, g: 1,  a: 1,
    keyStats: { tackles: 2.2, ints: 2.0, clr: 2.8, aer: 65,
                tklWonPct: 66, blocks: 1.0, fouls: 1.0, yellows: 3, duelsPct: 60, recoveries: 4.8, progCarries: 1.4, passPct: 84 } },
  { num: 4,  pos: "CB",  name: "A. Webster",         nation: "ENG", apps: 12, g: 0,  a: 0,
    keyStats: { tackles: 1.8, ints: 1.7, clr: 4.2, aer: 70,
                tklWonPct: 69, blocks: 1.6, fouls: 1.3, yellows: 4, duelsPct: 64, recoveries: 4.4, progCarries: 0.9, passPct: 85 } },
  { num: 34, pos: "RB",  name: "J. Veltman",         nation: "NED", apps: 28, g: 0,  a: 2, starter: true,
    keyStats: { tackles: 3.1, ints: 2.4, clr: 2.6, aer: 64,
                tklWonPct: 73, blocks: 0.7, fouls: 1.0, yellows: 6, duelsPct: 64, recoveries: 6.1, progCarries: 1.8, passPct: 82 } },
  { num: 24, pos: "RB",  name: "F. Kadıoğlu",        nation: "TUR", apps: 20, g: 1,  a: 2,
    keyStats: { tackles: 2.4, ints: 1.6, clr: 2.1, aer: 58,
                tklWonPct: 68, blocks: 0.6, fouls: 1.1, yellows: 3, duelsPct: 58, recoveries: 5.0, progCarries: 2.4, passPct: 80 } },
  { num: 29, pos: "LB",  name: "M. De Cuyper",       nation: "BEL", apps: 31, g: 1,  a: 4, starter: true,
    keyStats: { tackles: 2.9, ints: 1.8, clr: 2.4, aer: 60,
                tklWonPct: 70, blocks: 0.8, fouls: 1.2, yellows: 4, duelsPct: 60, recoveries: 5.6, progCarries: 2.6, passPct: 83 } },
  // Midfielders
  { num: 17, pos: "DM",  name: "C. Baleba",          nation: "CMR", apps: 33, g: 1,  a: 3, starter: true, star: true,
    keyStats: { passPct: 88, progPass: 5.3, recov: 8.4, distKm: 10.4,
                keyPasses: 1.2, throughBalls: 0.4, chCreated: 1.8, tackles: 2.8, ints: 1.6, ballCarries: 31, yellows: 4, fouls: 1.4 } },
  { num: 27, pos: "DM",  name: "M. Wieffer",         nation: "NED", apps: 28, g: 2,  a: 4, starter: true,
    keyStats: { passPct: 85, progPass: 3.8, recov: 7.2, distKm: 10.2,
                keyPasses: 1.0, throughBalls: 0.3, chCreated: 1.5, tackles: 2.4, ints: 1.4, ballCarries: 22, yellows: 5, fouls: 1.6 } },
  { num: 13, pos: "CAM", name: "J. Hinshelwood",     nation: "ENG", apps: 28, g: 3,  a: 4, starter: true,
    keyStats: { passPct: 82, progPass: 2.5, recov: 5.8, distKm: 10.1,
                keyPasses: 1.6, throughBalls: 0.5, chCreated: 2.1, tackles: 1.9, ints: 1.1, ballCarries: 18, yellows: 3, fouls: 1.0 } },
  { num: 30, pos: "CM",  name: "P. Groß",            nation: "GER", apps: 24, g: 2,  a: 6,
    keyStats: { passPct: 87, progPass: 4.1, recov: 4.2, distKm: 9.5,
                keyPasses: 2.4, throughBalls: 0.8, chCreated: 2.6, tackles: 1.4, ints: 0.9, ballCarries: 14, yellows: 4, fouls: 0.9 } },
  { num: 26, pos: "CM",  name: "Y. Ayari",           nation: "SWE", apps: 26, g: 3,  a: 4,
    keyStats: { passPct: 80, progPass: 2.8, recov: 6.1, distKm: 9.7,
                keyPasses: 1.5, throughBalls: 0.4, chCreated: 1.8, tackles: 1.8, ints: 1.3, ballCarries: 16, yellows: 5, fouls: 1.2 } },
  { num: 33, pos: "CM",  name: "M. O'Riley",         nation: "DEN", apps: 22, g: 4,  a: 3,
    keyStats: { passPct: 84, progPass: 3.5, recov: 5.0, distKm: 10.0,
                keyPasses: 1.8, throughBalls: 0.6, chCreated: 2.0, tackles: 1.6, ints: 1.0, ballCarries: 19, yellows: 3, fouls: 1.0 } },
  { num: 20, pos: "CM",  name: "J. Milner",          nation: "ENG", apps: 12, g: 0,  a: 1,
    keyStats: { passPct: 85, progPass: 2.2, recov: 4.8, distKm: 9.8,
                keyPasses: 1.0, throughBalls: 0.3, chCreated: 1.2, tackles: 1.4, ints: 0.9, ballCarries: 9, yellows: 6, fouls: 1.5 } },
  { num: 25, pos: "CM",  name: "D. Gómez",           nation: "PAR", apps: 10, g: 1,  a: 1,
    keyStats: { passPct: 78, progPass: 2.0, recov: 5.5, distKm: 9.6,
                keyPasses: 0.8, throughBalls: 0.2, chCreated: 1.0, tackles: 1.7, ints: 1.2, ballCarries: 12, yellows: 4, fouls: 1.3 } },
  // Forwards / Wingers
  { num: 22, pos: "LW",  name: "K. Mitoma",          nation: "JPN", apps: 28, g: 8,  a: 7, starter: true, star: true,
    keyStats: { goals: 8,  sot: 42, drib: 2.8, convPct: 14,
                xG: 7.2, xA: 5.1, bigChMissed: 8, shotAcc: 49, assists: 7, minPerGoal: 312, offsides: 0.4, foulsWon: 1.8 } },
  { num: 11, pos: "RW",  name: "Y. Minteh",          nation: "GAM", apps: 30, g: 7,  a: 5, starter: true,
    keyStats: { goals: 7,  sot: 38, drib: 2.4, convPct: 12,
                xG: 6.8, xA: 4.2, bigChMissed: 9, shotAcc: 46, assists: 5, minPerGoal: 358, offsides: 0.6, foulsWon: 1.5 } },
  { num: 10, pos: "CAM", name: "G. Rutter",          nation: "FRA", apps: 25, g: 6,  a: 5,
    keyStats: { passPct: 81, progPass: 3.2, recov: 4.8, distKm: 10.3,
                keyPasses: 2.3, throughBalls: 0.7, chCreated: 2.6, tackles: 1.5, ints: 0.9, ballCarries: 22, yellows: 3, fouls: 0.9 } },
  { num: 7,  pos: "WG",  name: "S. March",           nation: "ENG", apps: 4,  g: 0,  a: 0,
    keyStats: { goals: 0,  sot: 3,  drib: 0.5, convPct: 0,
                xG: 0.4, xA: 0.2, bigChMissed: 1, shotAcc: 35, assists: 0, minPerGoal: 0, offsides: 0.1, foulsWon: 0.4 } },
  { num: 18, pos: "ST",  name: "D. Welbeck",         nation: "ENG", apps: 32, g: 13, a: 4, starter: true, topScorer: true,
    keyStats: { goals: 13, sot: 51, drib: 0.8, convPct: 18,
                xG: 9.8, xA: 3.1, bigChMissed: 7, shotAcc: 54, assists: 4, minPerGoal: 195, offsides: 0.8, foulsWon: 1.2 } },
  { num: 9,  pos: "ST",  name: "S. Tzimas",          nation: "GRE", apps: 15, g: 4,  a: 1,
    keyStats: { goals: 4,  sot: 18, drib: 0.4, convPct: 10,
                xG: 3.8, xA: 0.9, bigChMissed: 4, shotAcc: 44, assists: 1, minPerGoal: 270, offsides: 0.6, foulsWon: 0.8 } },
  { num: 19, pos: "ST",  name: "C. Kostoulas",       nation: "GRE", apps: 18, g: 2,  a: 1,
    keyStats: { goals: 2,  sot: 12, drib: 0.6, convPct: 9,
                xG: 2.6, xA: 0.8, bigChMissed: 5, shotAcc: 38, assists: 1, minPerGoal: 540, offsides: 0.7, foulsWon: 0.9 } }
];

// Starting XI average positions on pitch (4-2-3-1) — bottom is own goal
const startingXI = [
  { num: 18, name: "Welbeck",     x: 50, y: 14, rating: 7.4 },
  { num: 22, name: "Mitoma",      x: 18, y: 30, rating: 7.6 },
  { num: 13, name: "Hinshelwood", x: 50, y: 32, rating: 7.0 },
  { num: 11, name: "Minteh",      x: 82, y: 30, rating: 7.2 },
  { num: 27, name: "Wieffer",     x: 40, y: 55, rating: 6.9 },
  { num: 17, name: "Baleba",      x: 60, y: 55, rating: 7.3 },
  { num: 29, name: "De Cuyper",   x: 14, y: 70, rating: 7.0 },
  { num: 5,  name: "Dunk",        x: 38, y: 76, rating: 7.2 },
  { num: 6,  name: "van Hecke",   x: 62, y: 76, rating: 7.1 },
  { num: 34, name: "Veltman",     x: 86, y: 70, rating: 7.0 },
  { num: 1,  name: "Verbruggen",  x: 50, y: 91, rating: 7.1 }
];

// In/Out possession formations — animated morph between the two phases
// Same 11 players, different shape: 3-2-5 vs 4-4-2
const formations = {
  inPossession: {
    label: "In Possession",
    shape: "3-2-5",
    description: "Veltman and De Cuyper invert into midfield. Wieffer drops between the CBs to form a back 3. Mitoma and Minteh stretch the touchlines high. Hinshelwood floats inside.",
    color: SCOUTS.green,
    players: [
      { num: 18, name: "Welbeck",     x: 50, y: 14 },
      { num: 22, name: "Mitoma",      x: 8,  y: 25 },
      { num: 13, name: "Hinshelwood", x: 36, y: 28 },
      { num: 11, name: "Minteh",      x: 92, y: 25 },
      { num: 17, name: "Baleba",      x: 64, y: 32 },
      { num: 34, name: "Veltman",     x: 30, y: 52 },
      { num: 27, name: "Wieffer",     x: 50, y: 65 },
      { num: 29, name: "De Cuyper",   x: 70, y: 52 },
      { num: 5,  name: "Dunk",        x: 36, y: 75 },
      { num: 6,  name: "van Hecke",   x: 64, y: 75 },
      { num: 1,  name: "Verbruggen",  x: 50, y: 91 }
    ]
  },
  // Phase 3 variant — attacking shape adjusted to stay ONSIDE relative to Newcastle's
  // defensive line (their back four sits at y=20-22 in their 4-3-3 mid-block).
  // Front line pushed back so no Brighton player is ahead of the deepest defender.
  inPossessionVsBlock: {
    label: "In Possession",
    shape: "3-2-5",
    description: "Veltman and De Cuyper invert into midfield. Wieffer drops between the CBs to form a back 3. Mitoma and Minteh stretch the touchlines high. Hinshelwood floats inside.",
    color: SCOUTS.green,
    players: [
      { num: 18, name: "Welbeck",     x: 50, y: 24 },  // dropped back from y=14 to stay level with their CBs
      { num: 22, name: "Mitoma",      x: 8,  y: 28 },  // dropped back from y=25
      { num: 13, name: "Hinshelwood", x: 36, y: 34 },  // floats slightly behind Welbeck
      { num: 11, name: "Minteh",      x: 92, y: 28 },  // dropped back from y=25
      { num: 17, name: "Baleba",      x: 64, y: 38 },  // adjusted to support
      { num: 34, name: "Veltman",     x: 30, y: 52 },
      { num: 27, name: "Wieffer",     x: 50, y: 65 },
      { num: 29, name: "De Cuyper",   x: 70, y: 52 },
      { num: 5,  name: "Dunk",        x: 36, y: 75 },
      { num: 6,  name: "van Hecke",   x: 64, y: 75 },
      { num: 1,  name: "Verbruggen",  x: 50, y: 91 }
    ]
  },
  outPossession: {
    label: "Out of Possession",
    shape: "4-4-2",
    description: "Compact mid-block. Hinshelwood pushes up beside Welbeck — front 2. Mitoma and Minteh drop into a flat midfield bank of four. Veltman and De Cuyper return wide as orthodox full-backs.",
    color: "#FF6B35",
    players: [
      { num: 18, name: "Welbeck",     x: 42, y: 32 },
      { num: 13, name: "Hinshelwood", x: 58, y: 32 },
      { num: 22, name: "Mitoma",      x: 18, y: 55 },
      { num: 27, name: "Wieffer",     x: 40, y: 58 },
      { num: 17, name: "Baleba",      x: 60, y: 58 },
      { num: 11, name: "Minteh",      x: 82, y: 55 },
      { num: 29, name: "De Cuyper",   x: 12, y: 78 },
      { num: 5,  name: "Dunk",        x: 38, y: 80 },
      { num: 6,  name: "van Hecke",   x: 62, y: 80 },
      { num: 34, name: "Veltman",     x: 88, y: 78 },
      { num: 1,  name: "Verbruggen",  x: 50, y: 91 }
    ]
  }
};

// Next opponent — used for the 4-phase formation interaction animation
const nextOpponent = {
  name: "Newcastle United",
  short: "NEW",
  venue: "St James' Park (A)",
  shape: "4-3-3",
  manager: "Eddie Howe",
  notes: "High-pressing 4-3-3 under Howe. Wingers stay wide and high in possession; full-backs support. Out of possession, an aggressive 4-3-3 mid-block that triggers vertical pressure on the CBs."
};

// Opponent formations (predicted) — shown as 11 black dummy circles, not specific players
// Positions are mirrored so that opponent attacks DOWNWARD (toward Brighton's goal at bottom)
// and defends their goal at the TOP of the pitch
const opponentFormations = {
  inPossession: {
    label: "Newcastle In Possession",
    shape: "4-3-3 → 2-3-5 (FBs up)",
    description: "Their full-backs push high; CDM stays. Three midfielders in a triangle. Wingers stay wide and high — testing our full-backs.",
    // Opposition attacks DOWNWARD — forwards near bottom (Brighton goal), defenders at top (their goal)
    players: [
      { id: "O-GK", x: 50, y: 8 },
      { id: "O-CB1", x: 38, y: 26 },
      { id: "O-CB2", x: 62, y: 26 },
      { id: "O-LB",  x: 12, y: 42 },
      { id: "O-RB",  x: 88, y: 42 },
      { id: "O-DM",  x: 50, y: 44 },
      { id: "O-CM1", x: 32, y: 56 },
      { id: "O-CM2", x: 68, y: 56 },
      { id: "O-LW",  x: 16, y: 68 },
      { id: "O-RW",  x: 84, y: 68 },
      { id: "O-ST",  x: 50, y: 82 }
    ]
  },
  outPossession: {
    label: "Newcastle Out of Possession",
    shape: "4-3-3 mid-block",
    description: "Compact 4-3-3 mid-block. Striker triggers pressure on our CBs; wingers tuck slightly to deny inside passes. Aggressive transition when they win it.",
    // Opposition defending their own goal at the TOP — back four near their goal, striker pushed up
    players: [
      { id: "O-GK", x: 50, y: 8 },
      { id: "O-LB",  x: 14, y: 22 },
      { id: "O-CB1", x: 38, y: 20 },
      { id: "O-CB2", x: 62, y: 20 },
      { id: "O-RB",  x: 86, y: 22 },
      { id: "O-CM1", x: 32, y: 36 },
      { id: "O-DM",  x: 50, y: 38 },
      { id: "O-CM2", x: 68, y: 36 },
      { id: "O-LW",  x: 22, y: 50 },
      { id: "O-ST",  x: 50, y: 50 },
      { id: "O-RW",  x: 78, y: 50 }
    ]
  }
};

// Team stats — Brighton vs Premier League average (per match unless noted)
const teamStatCategories = {
  summary: {
    label: "Summary",
    stats: [
      { name: "Goals",                 bha: 1.55, avg: 1.50, unit: "/match", better: "high" },
      { name: "Goals Conceded",        bha: 1.47, avg: 1.50, unit: "/match", better: "low"  },
      { name: "Shots",                 bha: 13.2, avg: 12.5, unit: "/match", better: "high" },
      { name: "Shot Accuracy",         bha: 38,   avg: 36,   unit: "%",      better: "high" },
      { name: "Possession",            bha: 55,   avg: 50,   unit: "%",      better: "high" },
      { name: "Pass Accuracy",         bha: 84,   avg: 81,   unit: "%",      better: "high" },
      { name: "Dribbles",              bha: 11.0, avg: 9.8,  unit: "/match", better: "high" },
      { name: "Dribble Success",       bha: 56,   avg: 53,   unit: "%",      better: "high" },
      { name: "Tackles",               bha: 16.0, avg: 17.5, unit: "/match", better: "high" },
      { name: "Tackle Success",        bha: 71,   avg: 68,   unit: "%",      better: "high" },
      { name: "Possession Won",        bha: 47,   avg: 43,   unit: "/match", better: "high" },
      { name: "Possession Lost",       bha: 51,   avg: 55,   unit: "/match", better: "low"  },
      { name: "Distance Covered",      bha: 108,  avg: 110,  unit: "km",     better: "high" },
      { name: "Distance Sprinted",     bha: 6.1,  avg: 6.4,  unit: "km",     better: "high" }
    ]
  },
  possession: {
    label: "Possession",
    stats: [
      { name: "Possession",            bha: 55,   avg: 50,   unit: "%",      better: "high" },
      { name: "Touches",               bha: 685,  avg: 620,  unit: "/match", better: "high" },
      { name: "Passes",                bha: 504,  avg: 462,  unit: "/match", better: "high" },
      { name: "Pass Accuracy",         bha: 84,   avg: 81,   unit: "%",      better: "high" },
      { name: "Avg Pass Length",       bha: 18.0, avg: 19.5, unit: "m",      better: "low"  },
      { name: "Forward Passes",        bha: 32,   avg: 30,   unit: "%",      better: "high" },
      { name: "Passes in Opp. Half",   bha: 42,   avg: 36,   unit: "%",      better: "high" },
      { name: "Possession Won",        bha: 47,   avg: 43,   unit: "/match", better: "high" },
      { name: "Possession Lost",       bha: 51,   avg: 55,   unit: "/match", better: "low"  }
    ]
  },
  shooting: {
    label: "Shooting",
    stats: [
      { name: "Shots",                 bha: 13.2, avg: 12.5, unit: "/match", better: "high" },
      { name: "Shots on Target",       bha: 5.0,  avg: 4.5,  unit: "/match", better: "high" },
      { name: "Shot Accuracy",         bha: 38,   avg: 36,   unit: "%",      better: "high" },
      { name: "Shot Conversion",       bha: 11.7, avg: 12.0, unit: "%",      better: "high" },
      { name: "Big Chances Created",   bha: 2.1,  avg: 1.9,  unit: "/match", better: "high" },
      { name: "Big Chances Missed",    bha: 58,   avg: 51,   unit: "%",      better: "low"  },
      { name: "Set Piece Goals",       bha: 11,   avg: 14,   unit: "season", better: "high" },
      { name: "xG",                    bha: 1.62, avg: 1.45, unit: "/match", better: "high" }
    ]
  },
  passing: {
    label: "Passing",
    stats: [
      { name: "Passes",                bha: 504,  avg: 462,  unit: "/match", better: "high" },
      { name: "Pass Accuracy",         bha: 84,   avg: 81,   unit: "%",      better: "high" },
      { name: "Forward Pass %",        bha: 32,   avg: 30,   unit: "%",      better: "high" },
      { name: "Long Balls",            bha: 38,   avg: 47,   unit: "/match", better: "low"  },
      { name: "Long Ball Accuracy",    bha: 51,   avg: 53,   unit: "%",      better: "high" },
      { name: "Through Balls",         bha: 1.8,  avg: 1.2,  unit: "/match", better: "high" },
      { name: "Crosses",               bha: 15,   avg: 17,   unit: "/match", better: "low"  },
      { name: "Cross Accuracy",        bha: 23,   avg: 21,   unit: "%",      better: "high" }
    ]
  },
  defending: {
    label: "Defending",
    stats: [
      { name: "Tackles",               bha: 16.0, avg: 17.5, unit: "/match", better: "high" },
      { name: "Tackle Success",        bha: 71,   avg: 68,   unit: "%",      better: "high" },
      { name: "Interceptions",         bha: 9.5,  avg: 9.0,  unit: "/match", better: "high" },
      { name: "Clearances",            bha: 24,   avg: 22,   unit: "/match", better: "high" },
      { name: "Blocks",                bha: 4.1,  avg: 4.4,  unit: "/match", better: "high" },
      { name: "Aerial Duels Won",      bha: 47,   avg: 50,   unit: "%",      better: "high" },
      { name: "Recoveries",            bha: 53,   avg: 50,   unit: "/match", better: "high" },
      { name: "Goals Conceded",        bha: 1.47, avg: 1.50, unit: "/match", better: "low"  }
    ]
  },
  saving: {
    label: "Saving",
    stats: [
      { name: "Saves",                 bha: 3.6,  avg: 3.4,  unit: "/match", better: "high" },
      { name: "Save %",                bha: 71,   avg: 70,   unit: "%",      better: "high" },
      { name: "Clean Sheets",          bha: 11,   avg: 10,   unit: "season", better: "high" },
      { name: "Goals Conceded",        bha: 56,   avg: 60,   unit: "season", better: "low"  },
      { name: "Penalty Saves",         bha: 1,    avg: 1,    unit: "season", better: "high" },
      { name: "Long Pass Accuracy",    bha: 58,   avg: 53,   unit: "%",      better: "high" },
      { name: "Sweeper Actions",       bha: 1.2,  avg: 0.9,  unit: "/match", better: "high" }
    ]
  }
};

// Recent form
const recentForm = [
  { result: "L", score: "0-3", opp: "Man Utd", venue: "H", date: "24 May", goals: [] },
  { result: "W", score: "3-0", opp: "Chelsea", venue: "A", date: "17 May", goals: ["Welbeck", "Minteh", "Mitoma"] },
  { result: "W", score: "2-1", opp: "Newcastle", venue: "A", date: "10 May", goals: ["Welbeck", "Rutter"] },
  { result: "D", score: "1-1", opp: "Liverpool", venue: "H", date: "3 May",  goals: ["Welbeck"] },
  { result: "W", score: "4-2", opp: "Wolves",    venue: "A", date: "26 Apr", goals: ["Mitoma", "Welbeck", "Hinshelwood", "Minteh"] }
];

// Season summary
const seasonSummary = {
  finalPosition: 8,
  played: 38,
  won: 15,
  drawn: 9,
  lost: 14,
  goalsFor: 59,
  goalsAgainst: 56,
  goalDiff: "+3",
  points: 54,
  topScorer: "D. Welbeck",
  topScorerGoals: 13,
  competition: "UEFA Conference League play-off (qualified)"
};

// ============ SPEED THRESHOLD / GPS DATA (StatSports Apex) ============
// Most recent week of training sessions (5 days of data, averaged per session)
// ============ ATTACKING PATTERNS (offensive-coverage playbook — image-board style) ============
// Choreographed combination plays, each with 3 animation phases (per-player paths + ball path)
// and the evidence benchmark from our match data that justifies rehearsing it.
// Pitch convention: vertical, attack = up (y small), same as formation/SSG pitches.
const attackingPatterns = [
  {
    id: "PAT-01",
    name: "Short Build Through the Defensive 1/3",
    tagline: "Beat the first line with the ball, not over it. Short play through the defensive third — no aimless clearances.",
    phaseLabels: ["Bait the press", "Break line 1", "Play through"],
    coachingPoints: [
      "Verbruggen plays short even under pressure — the press is an invitation, not a threat",
      "Wieffer drops between the CBs to form a 3; full-backs push to stretch the press wide",
      "Baleba shows between the lines — the first pass beyond the press is the trigger to accelerate"
    ],
    benchmark: "≥5-pass coverages succeed at 29.2% — the highest of any sequence length. Winners produced ~4 more per match than losers.",
    players: [
      { num: 1,  label: "Verbruggen", team: "us",  path: [{ x: 50, y: 90 }, { x: 50, y: 90 }, { x: 50, y: 89 }] },
      { num: 5,  label: "Dunk",       team: "us",  path: [{ x: 32, y: 78 }, { x: 28, y: 76 }, { x: 30, y: 72 }] },
      { num: 6,  label: "v. Hecke",   team: "us",  path: [{ x: 68, y: 78 }, { x: 72, y: 76 }, { x: 70, y: 72 }] },
      { num: 27, label: "Wieffer",    team: "us",  path: [{ x: 50, y: 68 }, { x: 50, y: 74 }, { x: 46, y: 64 }] },
      { num: 17, label: "Baleba",     team: "us",  path: [{ x: 58, y: 60 }, { x: 56, y: 56 }, { x: 58, y: 50 }] },
      { num: 34, label: "Veltman",    team: "us",  path: [{ x: 88, y: 62 }, { x: 90, y: 56 }, { x: 88, y: 48 }] },
      { num: 29, label: "De Cuyper",  team: "us",  path: [{ x: 12, y: 62 }, { x: 10, y: 56 }, { x: 12, y: 48 }] },
      { id: "X1", team: "opp", path: [{ x: 44, y: 72 }, { x: 36, y: 76 }, { x: 38, y: 70 }] },
      { id: "X2", team: "opp", path: [{ x: 56, y: 70 }, { x: 52, y: 66 }, { x: 54, y: 60 }] },
      { id: "X3", team: "opp", path: [{ x: 50, y: 58 }, { x: 54, y: 54 }, { x: 58, y: 52 }] }
    ],
    ball: [{ x: 50, y: 88 }, { x: 30, y: 77 }, { x: 57, y: 56 }]
  },
  {
    id: "PAT-02",
    name: "Full-Back Overlap Superiority",
    tagline: "De Cuyper's overlap beyond Mitoma — numerical superiority created in the middle 1/3, exactly as the coaching boards drill it.",
    phaseLabels: ["Engage 1v1", "Cut in · release", "Byline delivery"],
    coachingPoints: [
      "Mitoma engages his full-back 1v1 and holds the duel — patience drags the defender narrow",
      "The inside cut is the release trigger: De Cuyper bursts outside into the vacated lane",
      "Welbeck attacks near post, Hinshelwood arrives second wave — two targets for the delivery"
    ],
    benchmark: "Pre-offensive (middle 1/3) entries convert at 34.8% — the best first-action zone in the entire dataset. Overlaps are how we manufacture them.",
    players: [
      { num: 22, label: "Mitoma",      team: "us",  path: [{ x: 12, y: 36 }, { x: 22, y: 30 }, { x: 26, y: 28 }] },
      { num: 29, label: "De Cuyper",   team: "us",  path: [{ x: 14, y: 55 }, { x: 8,  y: 38 }, { x: 10, y: 17 }] },
      { num: 17, label: "Baleba",      team: "us",  path: [{ x: 40, y: 50 }, { x: 38, y: 46 }, { x: 36, y: 42 }] },
      { num: 18, label: "Welbeck",     team: "us",  path: [{ x: 52, y: 24 }, { x: 50, y: 22 }, { x: 45, y: 16 }] },
      { num: 13, label: "Hinshelwood", team: "us",  path: [{ x: 44, y: 34 }, { x: 46, y: 30 }, { x: 52, y: 22 }] },
      { id: "X1", team: "opp", path: [{ x: 16, y: 28 }, { x: 22, y: 24 }, { x: 18, y: 20 }] },
      { id: "X2", team: "opp", path: [{ x: 38, y: 20 }, { x: 34, y: 20 }, { x: 40, y: 16 }] },
      { id: "X3", team: "opp", path: [{ x: 55, y: 18 }, { x: 52, y: 17 }, { x: 50, y: 15 }] }
    ],
    ball: [{ x: 12, y: 36 }, { x: 21, y: 30 }, { x: 9, y: 18 }]
  },
  {
    id: "PAT-03",
    name: "Central Cut-Back Arrival",
    tagline: "Wide drive, near-post pin, cut-back to the central spot. High volume happens wide — high value concludes centrally.",
    phaseLabels: ["Drive wide", "Pin the line", "Cut-back arrival"],
    coachingPoints: [
      "Minteh drives to the byline — never settles for the early hopeful cross",
      "Welbeck's near-post run pins both CBs and drags the line toward goal",
      "Hinshelwood arrives late into the central pocket the pin creates — first-time finish"
    ],
    benchmark: "Central-corridor conclusions: 34.3% success vs 14-15.1% in the wide channels — more than double. The cut-back manufactures central arrivals.",
    players: [
      { num: 11, label: "Minteh",      team: "us",  path: [{ x: 84, y: 28 }, { x: 90, y: 16 }, { x: 86, y: 14 }] },
      { num: 18, label: "Welbeck",     team: "us",  path: [{ x: 55, y: 20 }, { x: 62, y: 13 }, { x: 58, y: 12 }] },
      { num: 13, label: "Hinshelwood", team: "us",  path: [{ x: 55, y: 34 }, { x: 52, y: 24 }, { x: 50, y: 19 }] },
      { num: 22, label: "Mitoma",      team: "us",  path: [{ x: 14, y: 28 }, { x: 20, y: 24 }, { x: 28, y: 22 }] },
      { num: 17, label: "Baleba",      team: "us",  path: [{ x: 50, y: 46 }, { x: 50, y: 42 }, { x: 48, y: 36 }] },
      { id: "X1", team: "opp", path: [{ x: 80, y: 22 }, { x: 86, y: 14 }, { x: 84, y: 13 }] },
      { id: "X2", team: "opp", path: [{ x: 58, y: 16 }, { x: 62, y: 12 }, { x: 60, y: 11 }] },
      { id: "X3", team: "opp", path: [{ x: 46, y: 16 }, { x: 48, y: 14 }, { x: 49, y: 16 }] }
    ],
    ball: [{ x: 82, y: 27 }, { x: 89, y: 15 }, { x: 51, y: 19 }]
  },
  {
    id: "PAT-04",
    name: "Five-Second Final-Third Strike",
    tagline: "Win it, go vertical, strike — before the defence reorganises. Directness is the defining quality of effective final-third play.",
    phaseLabels: ["Win it", "Go vertical", "Strike ≤3s"],
    coachingPoints: [
      "Baleba's recovery is the starting gun — first touch goes forward, never sideways",
      "Welbeck spins in behind on the recovery trigger; Mitoma and Minteh sprint support lanes",
      "Shot released inside 3 seconds of the final-third entry — extra touches hand the defence its shape back"
    ],
    benchmark: "FOA sequences ≤3 seconds: 21.2% success (best of all durations). Zero-pass directness: 22.1%. Speed beats reorganisation.",
    players: [
      { num: 17, label: "Baleba",      team: "us",  path: [{ x: 55, y: 52 }, { x: 56, y: 46 }, { x: 54, y: 42 }] },
      { num: 18, label: "Welbeck",     team: "us",  path: [{ x: 50, y: 26 }, { x: 48, y: 18 }, { x: 50, y: 12 }] },
      { num: 22, label: "Mitoma",      team: "us",  path: [{ x: 15, y: 32 }, { x: 17, y: 22 }, { x: 22, y: 18 }] },
      { num: 11, label: "Minteh",      team: "us",  path: [{ x: 85, y: 32 }, { x: 83, y: 24 }, { x: 80, y: 20 }] },
      { num: 13, label: "Hinshelwood", team: "us",  path: [{ x: 45, y: 40 }, { x: 46, y: 34 }, { x: 44, y: 28 }] },
      { id: "X1", team: "opp", path: [{ x: 52, y: 50 }, { x: 50, y: 52 }, { x: 48, y: 50 }] },
      { id: "X2", team: "opp", path: [{ x: 44, y: 18 }, { x: 46, y: 16 }, { x: 47, y: 14 }] },
      { id: "X3", team: "opp", path: [{ x: 60, y: 18 }, { x: 58, y: 16 }, { x: 56, y: 14 }] }
    ],
    ball: [{ x: 55, y: 51 }, { x: 49, y: 28 }, { x: 50, y: 13 }]
  }
];

// ============ GAME MODEL (phase-by-phase playing principles — the manager's daily reference) ============
// Modelled on the coaching-course boards: phase title + principles list + pitch with both teams.
// Every principle is anchored to our season match data. Horizontal pitch, we attack RIGHT.
// Each phase carries FOUR animation frames (the move developing) — players morph between them.
// Compact coords: us = [shirtNum, x, y] ×11 (order fixed: 1,5,6,27,34,29,17,13,22,11,18);
// them = [x, y] ×11 black dummies (index order fixed); ball = [x, y]. x: 0 left (our goal) → 100; y: 0 top (left flank).
// ============ ANALYST MATCH CODING (Sportscode export — last PL match) ============
// Hand-coded by the performance analyst from the most recent fixture.
// Each game-model phase carries a `coding` block: total instances tagged, success/fail
// split, an xpended efficiency vs our season baseline, and a few labelled clip instances
// (the kind exported straight from a Sportscode timeline as a code/label matrix).
const codedMatch = {
  fixture: "Brighton 0–3 Manchester United",
  opponent: "Manchester United",
  opponentShort: "MUN",
  competition: "Premier League",
  venue: "Amex Stadium (H)",
  date: "24 May",
  result: "L",
  analyst: "Performance Analysis Dept.",
  software: "Hudl Sportscode",
  note: "Heavy home defeat. Two of three goals stemmed from build-out turnovers; final-third volume was high but conversion poor. Counter-press recovery numbers held up — the problem was what happened after we won it back."
};

// ============ STATSBOMB SEQUENCE DATA (event x&y coordinates — full season, league-wide) ============
// Derived from StatsBomb event data: every on-ball action carries (x,y) pitch coordinates,
// from which we compute sequence-level metrics — start location, progression distance, entry
// coordinates, directness (downfield speed), and possession value (xT / xG buildup).
// Each game-model phase carries a `statsbomb` block with our per-90 figure, the 20-team
// league median, our rank (1 = best), and a percentile, plus a short coordinate-derived note.
const statsbombMeta = {
  provider: "StatsBomb",
  basis: "Event x&y coordinates · 38 PL matches",
  season: "2025/26",
  teams: 20,
  note: "Sequence metrics computed from on-ball event coordinates. Percentiles are vs the 20 Premier League teams."
};

const gameModel = [
  {
    id: "buildup",
    label: "Build-Up",
    moment: "In Possession · Defensive 1/3",
    color: SCOUTS.green,
    zoneHighlight: { x0: 0, x1: 33.3, y0: 0, y1: 100 },
    principles: [
      "Short play through the defensive 1/3 — Verbruggen starts every sequence",
      "Wieffer drops between the CBs to form a back 3 against the first press line",
      "Full-backs invert to create numerical superiority in the middle 1/3",
      "Third-man combinations to escape pressure — never force the line-breaking pass"
    ],
    evidence: [
      "≥5-pass sequences succeed at 29.2% — the best of any length",
      "Winners produced +97 more long sequences than losers per season",
      "Deep starts are 19× less effective — escape this zone with control, fast"
    ],
    coding: {
      instances: 41, success: 27, fail: 14, successPct: 65.9, baselinePct: 71.0, delta: -5.1,
      summary: "41 build-out sequences tagged. Two ended in turnovers inside our own third — both led directly to United goals. Success rate 5.1pp below our season baseline; the press got to us when Wieffer's drop was late.",
      metrics: [
        { k: "Build-outs initiated", v: "41" },
        { k: "Reached midfield 1/3", v: "27 (65.9%)" },
        { k: "Turnovers in def 1/3", v: "5" },
        { k: "Turnovers → shot conceded", v: "2" },
        { k: "GK long %", v: "38% (season 24%)" }
      ],
      clips: [
        { t: "07:14", label: "Turnover → Goal", grade: "fail", note: "Verbruggen short to Dunk under pressure, intercepted, 0-1." },
        { t: "23:48", label: "Clean build", grade: "success", note: "Wieffer drops, third-man through Baleba, into mid 1/3." },
        { t: "61:02", label: "Turnover → Goal", grade: "fail", note: "van Hecke forced long, lost the second ball, 0-3." }
      ]
    },
    statsbomb: {
      headline: { metric: "Build-up success", us: 71.0, league: 68.4, rank: 7, pct: 68, unit: "%" },
      summary: "From event coordinates, our sequences starting in own-third zones (x<40) progress past halfway 71% of the time — 7th in the league. We go long less than most (only 24% of GK restarts are 40m+), reflecting the short build-out identity.",
      metrics: [
        { k: "Seq. starting own third /90", us: "34.2", lg: "31.8", rank: 6, pct: 72 },
        { k: "Progressed past halfway %", us: "71.0", lg: "68.4", rank: 7, pct: 68 },
        { k: "Avg build-up start x (m)", us: "28.4", lg: "31.2", rank: 18, pct: 14 },
        { k: "Long restart %", us: "24%", lg: "41%", rank: 3, pct: 86 },
        { k: "Passes per build-up seq.", us: "5.8", lg: "4.6", rank: 2, pct: 91 }
      ]
    },
    frames: [
      { label: "GK starts",
        us: [[1,6,50],[5,15,36],[6,15,64],[27,22,50],[34,26,28],[29,26,72],[17,34,46],[13,44,42],[22,50,12],[11,50,88],[18,56,50]],
        them: [[24,50],[30,28],[30,72],[44,36],[46,50],[44,64],[62,20],[58,40],[58,60],[62,80],[92,50]],
        ball: [8,50] },
      { label: "First line pressed",
        us: [[1,7,50],[5,16,34],[6,16,66],[27,20,50],[34,27,30],[29,27,70],[17,33,46],[13,43,42],[22,50,12],[11,50,88],[18,56,50]],
        them: [[18,46],[22,28],[26,70],[36,36],[39,50],[37,64],[54,20],[52,40],[52,60],[54,80],[88,50]],
        ball: [15,36] },
      { label: "Wieffer drops · FBs invert",
        us: [[1,6,50],[5,18,32],[6,18,68],[27,13,50],[34,30,40],[29,30,60],[17,36,50],[13,46,40],[22,52,12],[11,52,88],[18,58,50]],
        them: [[20,46],[22,32],[22,68],[36,38],[38,50],[36,62],[52,22],[50,42],[50,58],[52,78],[88,50]],
        ball: [13,50] },
      { label: "Escape pass — Baleba",
        us: [[1,7,50],[5,20,34],[6,20,66],[27,16,50],[34,32,40],[29,32,60],[17,40,48],[13,50,38],[22,56,12],[11,56,88],[18,60,48]],
        them: [[24,50],[30,34],[30,66],[42,40],[46,54],[42,60],[56,22],[54,42],[54,58],[56,78],[90,50]],
        ball: [40,48] }
    ]
  },
  {
    id: "progression",
    label: "Progression",
    moment: "In Possession · Middle 1/3",
    color: CYBER.cyan,
    zoneHighlight: { x0: 33.3, x1: 66.6, y0: 0, y1: 100 },
    principles: [
      "Enter the pre-offensive zone under control — that's where sequences are won",
      "Build in 3-player triangles, not 2-player pairs — the data is unambiguous",
      "Switch the point to isolate Mitoma and Minteh 1v1 on the touchlines",
      "Baleba breaks the lines on the carry once the pivot is screened off"
    ],
    evidence: [
      "Pre-offensive entries succeed at 34.8% — the highest of any zone",
      "3-player sequences: 24.5% success vs 2-player at only 18.8%",
      "2P pairs are 38% of our volume — our biggest fixable inefficiency"
    ],
    coding: {
      instances: 36, success: 11, fail: 25, successPct: 30.6, baselinePct: 34.8, delta: -4.2,
      summary: "36 progression sequences into the pre-offensive zone. Far too many resolved as 2-player pairs (22 of 36) rather than the triangles we train — and those pairs succeeded at just 18%. The switch to isolate Mitoma worked when we found it, but we found it only 4 times.",
      metrics: [
        { k: "Progression attempts", v: "36" },
        { k: "Pre-offensive entries", v: "11 (30.6%)" },
        { k: "3-player combos used", v: "14" },
        { k: "2-player pairs used", v: "22" },
        { k: "Switches to isolate winger", v: "4" }
      ],
      clips: [
        { t: "15:33", label: "Triangle bypass", grade: "success", note: "Baleba-Hinshelwood-Rutter combo breaks the line." },
        { t: "39:10", label: "2P pair lost", grade: "fail", note: "Forced pair on the left, dispossessed, transition against." },
        { t: "72:21", label: "Switch → 1v1", grade: "success", note: "Wieffer switch isolates Mitoma, drew the foul." }
      ]
    },
    statsbomb: {
      headline: { metric: "Prog. distance /seq", us: 18.7, league: 19.9, rank: 13, pct: 38, unit: "m" },
      summary: "xT (expected threat) added per midfield-third sequence puts us mid-table — coordinate data shows we move the ball forward 18.7m per progressing sequence, below the 19.9m median. We build laterally too long before going vertical: our avg time-to-first-forward-pass is 0.6s above median.",
      metrics: [
        { k: "xT added /90 (mid 3rd)", us: "2.41", lg: "2.58", rank: 13, pct: 38 },
        { k: "Progressive passes /90", us: "48.6", lg: "47.1", rank: 9, pct: 58 },
        { k: "Avg prog. distance /seq (m)", us: "18.7", lg: "19.9", rank: 13, pct: 38 },
        { k: "Line-breaking passes /90", us: "9.2", lg: "10.4", rank: 15, pct: 28 },
        { k: "Pre-offensive entries /90", us: "21.3", lg: "20.1", rank: 8, pct: 62 }
      ]
    },
    frames: [
      { label: "Pre-offensive entry",
        us: [[1,8,50],[5,22,34],[6,22,66],[27,22,50],[34,36,38],[29,36,62],[17,44,50],[13,54,42],[22,58,10],[11,58,90],[18,62,50]],
        them: [[38,50],[46,26],[46,74],[55,38],[57,50],[55,62],[72,22],[70,42],[70,58],[72,78],[92,50]],
        ball: [44,50] },
      { label: "Triangle forms",
        us: [[1,8,50],[5,22,34],[6,22,66],[27,24,50],[34,40,40],[29,38,62],[17,46,52],[13,52,46],[22,60,10],[11,60,90],[18,63,48]],
        them: [[40,52],[48,28],[48,72],[53,40],[55,50],[53,60],[72,22],[70,42],[70,58],[72,78],[92,50]],
        ball: [46,52] },
      { label: "Switch the point",
        us: [[1,8,50],[5,24,34],[6,24,66],[27,26,50],[34,42,38],[29,42,60],[17,48,50],[13,56,38],[22,64,10],[11,62,90],[18,66,44]],
        them: [[44,46],[47,26],[52,66],[56,34],[58,46],[56,58],[70,18],[70,40],[70,56],[72,74],[93,50]],
        ball: [58,15] },
      { label: "Mitoma isolated 1v1",
        us: [[1,8,50],[5,26,36],[6,26,64],[27,26,50],[34,46,36],[29,44,58],[17,52,48],[13,60,30],[22,68,12],[11,64,88],[18,66,44]],
        them: [[46,48],[54,20],[54,70],[58,32],[60,44],[58,60],[74,16],[72,38],[72,56],[74,76],[93,50]],
        ball: [66,12] }
    ]
  },
  {
    id: "finalthird",
    label: "Final Third",
    moment: "In Possession · Attacking 1/3",
    color: "#FF6B35",
    zoneHighlight: { x0: 66.6, x1: 100, y0: 0, y1: 100 },
    principles: [
      "Be direct — first-time finishes beat extra touches, every time",
      "Execute within 3 seconds of entry, before their block reorganises",
      "Arrive centrally: cut-backs to the corridor, not crosses to the keeper",
      "Back the individual — our 1v1 quality is a weapon, not a risk"
    ],
    evidence: [
      "0-pass sequences: 22.1% success — and success FALLS as passes rise (P=0.003)",
      "≤3-second execution: 21.2% success, the best of any duration (P=0.012)",
      "Central corridor 34.3% vs Left 14% / Right 15.1% — double the value",
      "Solo actions: 21.8% success — highest of any player-count"
    ],
    coding: {
      instances: 29, success: 5, fail: 24, successPct: 17.2, baselinePct: 21.2, delta: -4.0,
      summary: "29 final-third entries, only 5 produced a clear chance — conversion well below baseline. Volume was there (xG 1.8) but we went wide too often: 19 entries finished as crosses, only 8 as central cut-backs, and the central ones were twice as productive.",
      metrics: [
        { k: "Final-third entries", v: "29" },
        { k: "Clear chances created", v: "5 (17.2%)" },
        { k: "xG generated", v: "1.84" },
        { k: "Crosses vs cut-backs", v: "19 / 8" },
        { k: "First-time finishes", v: "3" }
      ],
      clips: [
        { t: "31:55", label: "Cut-back chance", grade: "success", note: "Minteh to the byline, central cut-back, Welbeck blazed over." },
        { t: "54:40", label: "Wasted cross", grade: "fail", note: "Early cross to no one — keeper claims comfortably." },
        { t: "83:12", label: "≤3s execution", grade: "success", note: "Direct first-time shot from the corridor, saved." }
      ]
    },
    statsbomb: {
      headline: { metric: "Open-play xG /90", us: 1.21, league: 1.34, rank: 12, pct: 42, unit: "" },
      summary: "Coordinate-mapped shot locations show our open-play xG/90 sits just below median despite high entry volume — we generate from lower-value locations. Only 38% of our box entries reach the central cut-back zone (x>88, 30<y<50), vs a 47% league median. The wide bias is visible in the data, not just on tape.",
      metrics: [
        { k: "Final-third entries /90", us: "26.8", lg: "24.2", rank: 6, pct: 74 },
        { k: "Open-play xG /90", us: "1.21", lg: "1.34", rank: 12, pct: 42 },
        { k: "Box entries /90", us: "9.4", lg: "8.6", rank: 8, pct: 64 },
        { k: "Central cut-back zone %", us: "38%", lg: "47%", rank: 16, pct: 22 },
        { k: "Avg shot distance (m)", us: "17.8", lg: "16.4", rank: 15, pct: 26 }
      ]
    },
    frames: [
      { label: "Entry",
        us: [[1,10,50],[5,30,36],[6,30,64],[27,40,50],[34,52,32],[29,52,68],[17,58,50],[13,68,42],[22,74,14],[11,74,86],[18,78,48]],
        them: [[58,50],[64,22],[64,78],[72,36],[74,50],[72,64],[82,26],[81,42],[81,58],[82,74],[94,50]],
        ball: [70,42] },
      { label: "Mitoma to the byline",
        us: [[1,10,50],[5,32,36],[6,32,64],[27,42,50],[34,56,32],[29,56,66],[17,62,50],[13,76,36],[22,84,14],[11,78,84],[18,80,44]],
        them: [[62,50],[70,24],[70,76],[78,34],[78,48],[76,62],[86,22],[84,40],[84,56],[85,72],[95,48]],
        ball: [84,16] },
      { label: "Cut-back · central arrival",
        us: [[1,10,50],[5,32,36],[6,32,64],[27,44,50],[34,58,32],[29,58,66],[17,64,48],[13,78,42],[22,86,16],[11,86,68],[18,84,44]],
        them: [[64,50],[72,26],[72,74],[77,32],[79,49],[78,60],[87,26],[88,42],[84,58],[86,72],[95,49]],
        ball: [83,44] },
      { label: "First-time finish",
        us: [[1,10,50],[5,32,36],[6,32,64],[27,44,50],[34,58,32],[29,58,66],[17,64,48],[13,80,42],[22,86,18],[11,86,66],[18,86,46]],
        them: [[64,50],[72,26],[72,74],[77,32],[79,48],[78,60],[87,26],[89,40],[84,58],[86,72],[92,49]],
        ball: [89,46] }
    ]
  },
  {
    id: "block",
    label: "Defensive Block",
    moment: "Out of Possession · 4-4-2 Mid-Block",
    color: BHA.blueLight,
    zoneHighlight: { x0: 33.3, x1: 66.6, y0: 33.3, y1: 66.6 },
    principles: [
      "Compact 4-4-2 — never more than 30m between Welbeck and the back line",
      "Protect the central corridor above all — force them wide where value halves",
      "Welbeck and Hinshelwood screen the pivot; press triggers on the back-pass",
      "Wingers tuck inside the width of the box — full-backs take the touchline"
    ],
    evidence: [
      "Central corridor concedes at 34.3% success — denying it is half the job",
      "Wide channels succeed at only 14-15.1% — funnelling wide IS the strategy",
      "Their FOA entries are the danger metric: winners average 26.7 per match"
    ],
    coding: {
      instances: 48, success: 34, fail: 14, successPct: 70.8, baselinePct: 68.0, delta: 2.8,
      summary: "48 defensive-block situations coded. The 4-4-2 actually held its central shape well — above baseline — and forced United wide on 31 of 48. The goals didn't come from open-play central breaches; they came from our own build-out errors. Structurally the block was the bright spot.",
      metrics: [
        { k: "Block situations", v: "48" },
        { k: "Forced wide", v: "31 (64.6%)" },
        { k: "Central line-breaks allowed", v: "9" },
        { k: "Press triggers executed", v: "12" },
        { k: "Compactness (avg block depth)", v: "28m" }
      ],
      clips: [
        { t: "12:08", label: "Force wide", grade: "success", note: "Welbeck screens pivot, United forced to RPD channel." },
        { t: "47:30", label: "Central breach", grade: "fail", note: "Gap between lines, line-broken, shot off target." },
        { t: "66:55", label: "Trigger win", grade: "success", note: "Back-pass trigger, Hinshelwood jumps, regain." }
      ]
    },
    statsbomb: {
      headline: { metric: "PPDA", us: 11.8, league: 12.6, rank: 8, pct: 62, unit: "" },
      summary: "PPDA (passes allowed per defensive action) of 11.8 — derived from opponent pass coordinates in our pressing zones — ranks 8th, a moderately aggressive block. Opponent xG against from central zones (30<y<50) is low: we concede the 5th-fewest central-zone shots, confirming the corridor-protection works.",
      metrics: [
        { k: "PPDA", us: "11.8", lg: "12.6", rank: 8, pct: 62 },
        { k: "Opp. central-shot %", us: "31%", lg: "38%", rank: 5, pct: 78 },
        { k: "Def. action height (m)", us: "44.2", lg: "42.0", rank: 9, pct: 58 },
        { k: "Opp. xG/shot conceded", us: "0.09", lg: "0.11", rank: 6, pct: 72 },
        { k: "Opp. box entries allowed /90", us: "7.9", lg: "8.8", rank: 7, pct: 66 }
      ]
    },
    frames: [
      { label: "Set the 4-4-2",
        us: [[1,6,50],[5,14,40],[6,14,60],[27,28,60],[34,16,22],[29,16,78],[17,28,40],[13,40,58],[22,30,84],[11,30,16],[18,40,42]],
        them: [[44,12],[46,32],[44,50],[46,68],[44,88],[62,26],[60,50],[62,74],[76,38],[76,62],[92,50]],
        ball: [60,50] },
      { label: "Ball circulates — block shifts",
        us: [[1,6,48],[5,14,37],[6,14,57],[27,28,56],[34,16,19],[29,16,75],[17,28,36],[13,40,54],[22,30,80],[11,30,12],[18,40,38]],
        them: [[44,10],[46,30],[44,48],[46,66],[44,86],[62,22],[60,46],[62,70],[76,38],[77,60],[92,50]],
        ball: [76,38] },
      { label: "Trigger — the back-pass",
        us: [[1,6,48],[5,15,36],[6,14,58],[27,32,58],[34,18,20],[29,16,74],[17,32,40],[13,46,56],[22,34,82],[11,34,14],[18,50,44]],
        them: [[44,10],[46,30],[44,48],[46,66],[44,86],[62,22],[60,46],[62,70],[78,40],[77,60],[90,50]],
        ball: [88,48] },
      { label: "Press jump · force wide",
        us: [[1,6,48],[5,15,36],[6,14,58],[27,33,52],[34,20,18],[29,16,74],[17,34,34],[13,48,50],[22,32,76],[11,40,14],[18,52,36]],
        them: [[66,14],[48,34],[46,52],[48,70],[44,88],[64,24],[62,48],[62,72],[78,40],[77,62],[91,50]],
        ball: [70,16] }
    ]
  },
  {
    id: "counterpress",
    label: "Counter-Press",
    moment: "Transition · Ball Lost",
    color: "#FF3D5A",
    zoneHighlight: { x0: 40, x1: 66.6, y0: 16.6, y1: 60 },
    principles: [
      "Five-second swarm — the nearest three players collapse on the ball instantly",
      "Trap toward the right pre-defensive channel — our primary recovery zone",
      "Welbeck screens the back-pass; cut the central escape before the wide one",
      "If the swarm fails at 5 seconds, drop and reform the 4-4-2 — no half-press"
    ],
    evidence: [
      "Winners and losers recover EQUAL volumes — the edge is what happens next",
      "Post-recovery conversion: winners 24.2% vs losers 20.5% — a 3.7pp gap",
      "RPD trap zone: 8.2 recoveries per match, our most productive press area"
    ],
    coding: {
      instances: 22, success: 13, fail: 9, successPct: 59.1, baselinePct: 55.0, delta: 4.1,
      summary: "22 counter-press events on losing the ball. The 5-second swarm recovered possession 13 times — above baseline, and the RPD trap worked. The recovery wasn't the issue this match; it was the next decision (see Counter-Attack).",
      metrics: [
        { k: "Ball-losses pressed", v: "22" },
        { k: "Regains ≤5s", v: "13 (59.1%)" },
        { k: "Regains in RPD trap", v: "6" },
        { k: "Press bypassed", v: "9" },
        { k: "Fouls to stop counter", v: "3" }
      ],
      clips: [
        { t: "19:42", label: "5s regain", grade: "success", note: "Three-man swarm in RPD, immediate regain." },
        { t: "58:17", label: "Press bypassed", grade: "fail", note: "First pass beat the swarm, United broke." },
        { t: "70:03", label: "Tactical foul", grade: "fail", note: "Swarm failed, Baleba takes the yellow to stop it." }
      ]
    },
    statsbomb: {
      headline: { metric: "Counterpress regains /90", us: 8.2, league: 6.9, rank: 4, pct: 84, unit: "" },
      summary: "Using event coordinates within 5s and 40m of a turnover, our counterpress regains/90 (8.2) rank 4th in the league. High-turnover-zone recoveries cluster in the right pre-defensive channel exactly as the model intends — the coordinate heat confirms the RPD trap is real, not aspirational.",
      metrics: [
        { k: "Counterpress regains /90", us: "8.2", lg: "6.9", rank: 4, pct: 84 },
        { k: "Regains in att. half /90", us: "5.1", lg: "4.2", rank: 5, pct: 78 },
        { k: "Avg regain time (s)", us: "4.1", lg: "4.8", rank: 6, pct: 72 },
        { k: "High turnovers /90", us: "9.6", lg: "7.8", rank: 4, pct: 82 },
        { k: "RPD-zone regain share", us: "27%", lg: "19%", rank: 2, pct: 92 }
      ]
    },
    frames: [
      { label: "Ball lost",
        us: [[1,8,50],[5,28,42],[6,28,62],[27,50,46],[34,46,30],[29,40,64],[17,50,36],[13,56,32],[22,58,22],[11,60,80],[18,62,44]],
        them: [[55,39],[48,54],[60,64],[64,28],[68,48],[72,70],[78,34],[78,64],[84,50],[64,14],[92,50]],
        ball: [54,38] },
      { label: "Five-second swarm",
        us: [[1,8,50],[5,28,42],[6,28,62],[27,51,42],[34,48,33],[29,42,62],[17,53,38],[13,56,36],[22,57,28],[11,60,78],[18,60,42]],
        them: [[56,40],[50,52],[62,60],[64,26],[68,48],[72,70],[78,34],[78,64],[84,50],[64,14],[92,50]],
        ball: [55,40] },
      { label: "Trap shut",
        us: [[1,8,50],[5,28,42],[6,28,60],[27,49,42],[34,45,28],[29,44,58],[17,48,34],[13,53,34],[22,52,24],[11,58,74],[18,58,40]],
        them: [[50,30],[50,50],[62,58],[62,24],[68,46],[72,68],[78,34],[78,62],[84,50],[64,12],[92,50]],
        ball: [49,31] },
      { label: "Recovered",
        us: [[1,8,50],[5,28,42],[6,28,60],[27,48,44],[34,44,30],[29,44,58],[17,47,36],[13,54,32],[22,54,24],[11,58,74],[18,58,40]],
        them: [[52,28],[52,50],[62,58],[62,24],[68,46],[72,68],[78,34],[78,62],[84,50],[64,12],[92,50]],
        ball: [47,36] }
    ]
  },
  {
    id: "counterattack",
    label: "Counter-Attack",
    moment: "Transition · Ball Won",
    color: CYBER.magenta,
    zoneHighlight: { x0: 66.6, x1: 100, y0: 0, y1: 100 },
    principles: [
      "First pass forward within two touches — the recovery is only the start",
      "Hit the final third inside 3 seconds while their block is still turned",
      "Mitoma and Minteh sprint the channels; Welbeck pins the centre-backs",
      "Quality over panic — winners convert recoveries, they don't just make them"
    ],
    evidence: [
      "Post-recovery conversion is THE winner separator: 24.2% benchmark",
      "≤3s final-third execution succeeds at 21.2% — speed sustains disorganisation",
      "0-pass directness wins in the FOA: 22.1% — the counter is our best look"
    ],
    coding: {
      instances: 14, success: 3, fail: 11, successPct: 21.4, baselinePct: 24.2, delta: -2.8,
      summary: "14 counter-attack opportunities after regains. This is where the match was lost in attack — only 3 produced a shot. Too often the first pass forward was slow or square, letting United's rest-defence recover. When we did go fast (≤3s to final third) we created our best chances.",
      metrics: [
        { k: "Counters initiated", v: "14" },
        { k: "Reached final 1/3 ≤3s", v: "6" },
        { k: "Produced a shot", v: "3 (21.4%)" },
        { k: "First pass forward", v: "8 / 14" },
        { k: "Lost to rest-defence", v: "7" }
      ],
      clips: [
        { t: "27:19", label: "Fast counter", grade: "success", note: "Baleba regain → first-time forward → Mitoma shot." },
        { t: "44:51", label: "Slow first pass", grade: "fail", note: "Square ball on regain, United recovered shape." },
        { t: "79:38", label: "Lost to rest-D", grade: "fail", note: "Carried too long, two CBs snuffed it out." }
      ]
    },
    statsbomb: {
      headline: { metric: "Direct-attack xG /90", us: 0.28, league: 0.34, rank: 14, pct: 32, unit: "" },
      summary: "Direct attacks (sequences moving 30m+ goalward within 15s of a regain, by coordinates) generate 0.28 xG/90 — below median, our clearest under-performance. The speed is there in the carry data, but our first pass after a regain travels forward only 58% of the time vs a 67% league median: we slow our own counters.",
      metrics: [
        { k: "Direct attacks /90", us: "3.4", lg: "3.1", rank: 8, pct: 60 },
        { k: "Direct-attack xG /90", us: "0.28", lg: "0.34", rank: 14, pct: 32 },
        { k: "First pass forward %", us: "58%", lg: "67%", rank: 17, pct: 16 },
        { k: "Avg seq. upfield speed (m/s)", us: "4.2", lg: "4.6", rank: 13, pct: 36 },
        { k: "Shot-ending direct atk %", us: "21%", lg: "25%", rank: 14, pct: 30 }
      ]
    },
    frames: [
      { label: "Won it deep",
        us: [[1,6,50],[5,14,40],[6,14,60],[27,26,52],[34,18,26],[29,18,74],[17,34,44],[13,42,40],[22,46,14],[11,46,86],[18,52,48]],
        them: [[16,18],[20,46],[18,78],[26,34],[27,64],[30,54],[24,12],[24,88],[56,40],[58,60],[90,50]],
        ball: [34,44] },
      { label: "First pass forward",
        us: [[1,7,50],[5,18,40],[6,18,60],[27,30,52],[34,24,26],[29,24,76],[17,40,46],[13,52,40],[22,58,12],[11,58,88],[18,60,46]],
        them: [[25,20],[29,46],[27,76],[35,36],[36,62],[40,52],[33,14],[33,86],[60,42],[62,58],[90,50]],
        ball: [52,40] },
      { label: "Channels sprint",
        us: [[1,7,50],[5,22,40],[6,22,60],[27,34,52],[34,30,26],[29,30,76],[17,50,46],[13,66,40],[22,72,12],[11,72,88],[18,70,46]],
        them: [[36,22],[41,46],[38,74],[47,38],[48,60],[52,50],[45,16],[45,84],[72,40],[74,58],[91,50]],
        ball: [66,40] },
      { label: "Strike ≤3s",
        us: [[1,8,50],[5,24,40],[6,24,60],[27,38,52],[34,34,26],[29,34,76],[17,56,46],[13,76,38],[22,82,14],[11,82,84],[18,85,45]],
        them: [[45,24],[50,46],[47,72],[56,38],[57,58],[61,48],[54,18],[54,82],[83,38],[84,58],[92,49]],
        ball: [88,45] }
    ]
  }
];

// ============ MODEL INTERACTION (last-match coded sequences vs the opponent's formation) ============
// For each game-model phase, an ACTUAL sequence from the last match (codedMatch.opponent), reconstructed
// from StatsBomb event x&y coordinates + the analyst's Sportscode coding. Tied to the phase selected above:
// pick "Progression" and you see the real progression sequence we coded vs United, with their shape.
// Each carries the coded clip (timestamp + outcome), the linked StatsBomb stat, and 3 morph frames.
// Coords: us [shirt,x,y]×11, them [x,y]×11 (black dummies). x:0 our goal → 100 theirs. Offside-safe; the
// only player ever beyond the last line is the ball carrier. Possession flips correctly per phase.
const modelInteraction = {
  buildup: {
    clip: { t: "07:14", label: "Build-out turnover → 0-1", grade: "fail" },
    stat: "GK long 24% · 2 build-out turnovers → 2 goals",
    note: "Verbruggen short to Dunk; United's striker and 10 jump the press, Dunk is closed before Wieffer can show, and the interception in our third becomes the opener. The coordinates show our back line too flat to beat the first press line.",
    synopsis: {
      read: "Our build-out broke down against United's man-oriented press — the costliest way to concede.",
      points: [
        "United pressed with a front three matched to our back three; Wieffer's drop was late, leaving Dunk isolated on the ball.",
        "Both full-backs inverted too early, removing the wide release valve exactly when we needed an out-ball.",
        "The turnover came inside our own third — the model's lowest-value zone, where losses are 19× more costly."
      ],
    },
    frames: [
      { label: "Short goal kick",
        us: [[1,10,50],[5,22,38],[6,22,62],[27,20,50],[34,34,28],[29,34,72],[17,40,50],[13,52,46],[22,56,16],[11,56,84],[18,58,50]],
        them: [[94,50],[78,22],[80,42],[80,58],[78,78],[64,44],[64,56],[52,26],[52,74],[50,50],[44,48]],
        ball: [16,50] },
      { label: "United jump to press",
        us: [[1,10,50],[5,24,40],[6,22,60],[27,30,50],[34,36,28],[29,36,72],[17,38,46],[13,52,46],[22,58,16],[11,58,84],[18,60,50]],
        them: [[94,50],[76,22],[78,42],[78,58],[76,78],[60,44],[60,56],[48,28],[48,72],[42,52],[34,44]],
        ball: [24,40] },
      { label: "Intercepted in our third",
        us: [[1,10,50],[5,26,42],[6,24,60],[27,34,52],[34,40,30],[29,40,70],[17,44,48],[13,54,46],[22,58,16],[11,58,84],[18,60,50]],
        them: [[94,50],[74,24],[76,44],[76,56],[74,76],[58,46],[56,54],[46,30],[46,70],[40,52],[36,46]],
        ball: [36,46] }
    ]
  },
  progression: {
    clip: { t: "15:33", label: "Triangle bypass", grade: "success" },
    stat: "14 three-player combos · xT +2.41 /90",
    note: "A midfield triangle — Baleba into Hinshelwood, third man Welbeck — bends round United's double pivot and breaks their midfield line into the pre-offensive zone. Exactly the 3-player pattern the model wants; the coordinates show the third man arriving behind their 8s.",
    synopsis: {
      read: "A textbook three-player progression bent round United's double pivot and broke their midfield line.",
      points: [
        "Baleba–Hinshelwood–Welbeck formed a triangle around the two United 6s rather than a flat pair.",
        "The third man received behind their 8s in the pre-offensive zone — our single highest-success area (34.8%).",
        "United stayed compact but couldn't cover the diagonal into the pocket once the triangle tilted them."
      ],
    },
    frames: [
      { label: "Build in midfield",
        us: [[1,12,50],[5,28,36],[6,28,64],[27,26,50],[34,42,30],[29,42,70],[17,48,50],[13,58,46],[22,64,16],[11,64,84],[18,64,50]],
        them: [[94,50],[80,22],[82,42],[82,58],[80,78],[68,44],[68,56],[58,26],[58,74],[56,50],[50,48]],
        ball: [48,50] },
      { label: "Triangle forms",
        us: [[1,12,50],[5,30,36],[6,30,64],[27,30,50],[34,44,30],[29,44,70],[17,50,48],[13,56,44],[22,66,16],[11,66,84],[18,66,50]],
        them: [[94,50],[80,22],[82,42],[82,58],[80,78],[66,44],[66,56],[56,26],[56,74],[54,50],[50,48]],
        ball: [54,46] },
      { label: "Line broken — pre-offensive",
        us: [[1,14,50],[5,34,38],[6,34,62],[27,40,50],[34,52,30],[29,52,70],[17,54,48],[13,64,44],[22,72,16],[11,72,84],[18,72,50]],
        them: [[94,50],[80,24],[82,44],[82,56],[80,76],[64,46],[64,54],[58,30],[58,70],[56,52],[54,50]],
        ball: [64,46] }
    ]
  },
  finalthird: {
    clip: { t: "31:55", label: "Cut-back chance", grade: "success" },
    stat: "8 central cut-backs (38%) · 1.84 xG",
    note: "Minteh isolates the full-back, drives the byline and pulls it back to the central corridor — Welbeck arrives but blazes over. The coordinates show the right idea: a cut-back to the high-value zone rather than a cross. The execution, not the design, let us down.",
    synopsis: {
      read: "Right idea, wrong execution — the cut-back found the high-value zone but the finish was missed.",
      points: [
        "Minteh isolated United's full-back 1v1 and beat him to the byline, forcing their back line to turn.",
        "The pull-back hit the central cut-back zone — roughly double the value of an early cross to the keeper.",
        "Welbeck arrived on time and unmarked but blazed over; the xG was created, the chance simply wasn't taken."
      ],
    },
    frames: [
      { label: "Wide entry right",
        us: [[1,16,50],[5,40,38],[6,40,62],[27,52,50],[34,58,28],[29,58,72],[17,60,50],[13,70,44],[22,78,18],[11,78,82],[18,82,48]],
        them: [[95,50],[88,28],[89,44],[89,56],[88,72],[79,30],[80,46],[80,58],[79,74],[70,42],[68,58]],
        ball: [78,80] },
      { label: "Minteh to the byline",
        us: [[1,18,50],[5,42,38],[6,42,62],[27,54,50],[34,62,28],[29,60,72],[17,62,50],[13,74,46],[22,80,40],[11,90,84],[18,84,48]],
        them: [[95,50],[88,28],[89,44],[89,56],[88,72],[80,30],[80,46],[80,58],[80,74],[72,42],[70,58]],
        ball: [90,84] },
      { label: "Cut-back — Welbeck shot",
        us: [[1,18,50],[5,44,38],[6,44,62],[27,56,50],[34,64,30],[29,62,70],[17,64,50],[13,78,44],[22,82,42],[11,87,82],[18,86,50]],
        them: [[95,50],[88,30],[89,46],[89,54],[88,70],[82,34],[82,50],[82,62],[80,76],[74,44],[72,56]],
        ball: [86,50] }
    ]
  },
  block: {
    clip: { t: "47:30", label: "Central breach", grade: "fail" },
    stat: "9 central line-breaks allowed",
    note: "United build patiently, then their 10 drops into the gap that opens between our midfield four and back line. The coordinates expose the breakdown — our lines separated, the corridor we are meant to protect was played straight through. Shot off target, but a clear warning.",
    synopsis: {
      read: "Our 4-4-2 lost its vertical compactness and was played through the one channel we exist to protect.",
      points: [
        "As United circulated, a gap opened between our midfield four and back line — the lines separated under no real pressure.",
        "Their 10 dropped into that pocket in the central corridor, the 34.3%-success zone we are built to deny.",
        "The shot was off target, but the structural warning is unambiguous: the unit spacing broke down, not an individual."
      ],
    },
    frames: [
      { label: "United build",
        us: [[1,6,50],[34,16,22],[5,14,40],[6,14,60],[29,16,78],[11,30,16],[17,28,40],[27,28,60],[22,30,84],[18,42,42],[13,42,58]],
        them: [[92,50],[68,40],[68,60],[52,30],[50,50],[52,70],[34,16],[34,84],[28,38],[28,62],[24,50]],
        ball: [44,50] },
      { label: "Gap between lines",
        us: [[1,6,50],[34,16,22],[5,14,40],[6,14,60],[29,16,78],[11,28,16],[17,26,42],[27,30,58],[22,28,84],[18,40,44],[13,40,56]],
        them: [[92,50],[64,40],[64,60],[48,30],[44,50],[48,70],[30,16],[30,84],[24,38],[22,50],[24,62]],
        ball: [30,50] },
      { label: "Line broken — shot",
        us: [[1,6,50],[34,15,24],[5,13,42],[6,13,58],[29,15,76],[11,26,18],[17,24,44],[27,28,56],[22,26,82],[18,38,46],[13,38,54]],
        them: [[92,50],[60,40],[60,60],[44,30],[40,50],[44,70],[26,16],[26,84],[20,40],[18,50],[20,60]],
        ball: [18,50] }
    ]
  },
  counterpress: {
    clip: { t: "19:42", label: "5-second regain", grade: "success" },
    stat: "8.2 regains /90 · 27% in RPD trap",
    note: "We lose it high; the nearest three — Welbeck, Hinshelwood, Baleba — collapse on the carrier in the right pre-defensive channel and win it back inside five seconds. The coordinate cluster around the ball is exactly the swarm the model demands. The trap works.",
    synopsis: {
      read: "The five-second counter-press worked exactly as the model demands — immediate, collective, trapped wide.",
      points: [
        "Three players collapsed on the carrier together in the right pre-defensive channel — a genuine swarm, not a chase.",
        "The central escape was cut first, forcing the error wide — RPD is our most productive trap (27% of all regains).",
        "Possession was won back inside five seconds, before United could set the shape of their counter."
      ],
    },
    frames: [
      { label: "Ball lost high",
        us: [[1,14,50],[5,40,42],[6,40,62],[27,52,50],[34,50,28],[29,52,72],[17,58,48],[13,62,40],[18,64,52],[22,60,22],[11,60,78]],
        them: [[94,50],[70,50],[74,32],[74,68],[82,20],[82,80],[62,50],[44,40],[44,60],[34,50],[30,38]],
        ball: [70,50] },
      { label: "Three-man swarm",
        us: [[1,14,50],[5,42,44],[6,42,60],[27,54,50],[34,54,30],[29,54,70],[17,62,46],[13,66,42],[18,68,50],[22,60,24],[11,62,76]],
        them: [[94,50],[68,52],[74,32],[74,68],[82,22],[82,78],[60,48],[46,40],[46,60],[36,50],[32,40]],
        ball: [68,50] },
      { label: "Regained in RPD",
        us: [[1,16,50],[5,44,44],[6,44,60],[27,54,50],[34,56,32],[29,56,68],[17,60,46],[13,64,44],[18,66,50],[22,62,26],[11,62,74]],
        them: [[94,50],[72,54],[76,34],[76,66],[84,22],[84,78],[64,50],[48,42],[48,58],[38,50],[34,42]],
        ball: [66,50] }
    ]
  },
  counterattack: {
    clip: { t: "44:51", label: "Slow first pass", grade: "fail" },
    stat: "First pass forward 58% (league 67%)",
    note: "We win it with United committed — eight caught ahead of the ball, only two centre-backs goal-side. But Baleba's first pass is square, not forward; the delay lets their rest-defence sprint back and reset. The coordinates show the break was on — we just didn't hit it fast enough.",
    synopsis: {
      read: "The break was clearly on, but a slow first pass let United's rest-defence sprint back and reset.",
      points: [
        "We won it with eight United players caught ahead of the ball — only two centre-backs and the keeper were goal-side.",
        "Baleba played square instead of forward; the coordinate data shows first-pass-forward at 58% vs a 67% league median.",
        "By the time we did progress, the two covering CBs had recovered and re-formed the line — the overload was gone."
      ],
    },
    frames: [
      { label: "Won it — United committed",
        us: [[1,8,50],[5,24,40],[6,24,60],[27,36,52],[34,40,28],[29,40,72],[17,48,48],[13,60,44],[18,66,50],[22,68,20],[11,68,80]],
        them: [[92,50],[70,42],[72,58],[20,30],[22,50],[20,70],[30,20],[30,80],[34,45],[36,60],[42,50]],
        ball: [48,48] },
      { label: "Square pass — no penetration",
        us: [[1,8,50],[5,26,40],[6,26,60],[27,38,52],[34,42,30],[29,42,70],[17,46,54],[13,58,44],[18,64,50],[22,66,22],[11,66,78]],
        them: [[92,50],[68,44],[70,56],[30,30],[32,50],[30,70],[40,22],[40,78],[44,46],[46,58],[50,50]],
        ball: [38,52] },
      { label: "United recover shape",
        us: [[1,8,50],[5,28,42],[6,28,58],[27,42,52],[34,46,32],[29,46,68],[17,50,50],[13,58,46],[18,62,50],[22,64,24],[11,64,76]],
        them: [[92,50],[64,46],[66,54],[44,30],[46,50],[44,70],[52,24],[52,76],[54,46],[56,56],[58,50]],
        ball: [50,50] }
    ]
  }
};

// ============ MATCH CODING (analyst's Sportscode export — last match, coded vs the game model) ============
// Workflow: every match is coded live + post-match in Sportscode against the six game-model codes.
// Each phase instance is tagged executed/broke-down per the principles, with key moments timestamped.
// Below: MD38 · Brighton 0-3 Manchester United (H) · 24 May. Coded by the first-team analyst.
const gameModelMatchCoding = {
  match: {
    fixture: "Brighton 0-3 Manchester United",
    venue: "Amex Stadium (H)",
    date: "24 May · MD38",
    codedBy: "First-team analysis · Sportscode",
    summary: "Heavily punished for build-out failures — two of the three goals conceded originated from our own defensive-third turnovers. The counter-attack was our best route all afternoon and we created our clearest looks there, but converted none. Central final-third presence was well below target again."
  },
  phases: {
    buildup: {
      instances: 41, executed: 24, successPct: 59, targetPct: 70, seasonPct: 68,
      moments: [
        { t: "08:12", tag: "BU-TO → Goal", outcome: "-", note: "Wieffer pressed on the half-turn by their 8-man press; turnover, three passes later 0-1." },
        { t: "23:40", tag: "BU-Clean", outcome: "+", note: "11-pass exit — Verbruggen → Dunk → Baleba third-man release. Exactly the pattern." },
        { t: "57:31", tag: "BU-TO → Goal", outcome: "-", note: "GK forced long under pressure, first ball lost, second ball lost — 0-2 inside 9 seconds." }
      ],
      analystNote: "They hunted our first pass all day. 17 of our 41 exits were forced long — well above our season average of 9. The drop between Wieffer's feet and the press arriving was the recurring trigger they targeted."
    },
    progression: {
      instances: 33, executed: 19, successPct: 58, targetPct: 65, seasonPct: 62,
      moments: [
        { t: "31:05", tag: "PR-3P", outcome: "+", note: "Baleba–Groß–Hinshelwood triangle splits their mid-block — best progression of the half." },
        { t: "49:50", tag: "PR-Switch", outcome: "+", note: "Two-pass switch isolates Mitoma 1v1; their RB booked stopping him." },
        { t: "66:14", tag: "PR-2P", outcome: "-", note: "Three consecutive 2-player wall passes into central traffic — all three lost. The data says triangles." }
      ],
      analystNote: "2-player share crept up to 41% of progression attempts (season 38%, target <30%). When we built in triangles we succeeded at 67%; in pairs, 38%. The gap is the whole story."
    },
    finalthird: {
      instances: 18, executed: 7, successPct: 39, targetPct: 50, seasonPct: 46,
      moments: [
        { t: "44:51", tag: "FT-Central", outcome: "+", note: "Mitoma cut-back finds Welbeck's first-time strike — their GK's save of the match." },
        { t: "62:08", tag: "FT-Wide", outcome: "-", note: "Four consecutive entries down the left ended in crosses to nobody central. 0.06 xG combined." },
        { t: "74:20", tag: "FT-Direct", outcome: "+", note: "0-pass entry, Minteh shoots within 2.1s of entry — exactly the ≤3s principle, just wide." }
      ],
      analystNote: "Only 18 FOA entries against the winners' benchmark of 26.7 — we never sustained territory. Central share of entries was 22% (target 30%+). 11 shots, 3 on target, 0.9 xG: the volume was wide and hopeful, not central and direct."
    },
    block: {
      instances: 27, executed: 15, successPct: 56, targetPct: 65, seasonPct: 63,
      moments: [
        { t: "18:33", tag: "BL-ForceWide", outcome: "+", note: "Three-minute spell forcing them wide repeatedly — their crosses all dealt with by Dunk." },
        { t: "81:02", tag: "BL-Central → Goal", outcome: "-", note: "Pivot screen broken, central cut-back, 0-3. The exact corridor the block exists to deny." },
        { t: "85:40", tag: "BL-Compact", outcome: "+", note: "30m compactness held even at 0-3 — the structure didn't dissolve with the scoreline." }
      ],
      analystNote: "They entered our final third 27 times and 12 of those came through the central corridor — a 44% central share against us when our season concession rate is 31%. Welbeck's pivot screen lapsed in the final half-hour as legs went."
    },
    counterpress: {
      instances: 21, executed: 8, successPct: 38, targetPct: 40, seasonPct: 42,
      moments: [
        { t: "35:58", tag: "CP-Regain", outcome: "+", note: "Textbook 5-second swarm — Baleba regain, Minteh shot inside 6 seconds of the loss." },
        { t: "62:30", tag: "CP-Beaten", outcome: "-", note: "Half-press — two went, three didn't. Bruno carries 60m unopposed through the middle." }
      ],
      analystNote: "8 regains inside 5 seconds from 21 losses in their half — fractionally under target and season rate. The failures were commitment failures, not effort: when all three nearest pressed we regained 67%; when the swarm was partial, 11%."
    },
    counterattack: {
      instances: 6, executed: 3, successPct: 50, targetPct: 55, seasonPct: 52,
      moments: [
        { t: "44:12", tag: "CA-4v3", outcome: "-", note: "4v3 break from Baleba's regain — Minteh delays the final pass two touches too long, recovery arrives." },
        { t: "70:48", tag: "CA-≤3s", outcome: "+", note: "Won deep → Mitoma channel sprint → final third in 2.8s. Cut-back cleared off the line." }
      ],
      analystNote: "Our two clearest chances of the match both came on the counter — and we scored neither. 3 of 6 counters reached the final third inside 3 seconds, but post-recovery conversion was 0% against the winners' benchmark of 24.2%. The route is right; the finish wasn't."
    }
  }
};

// ============ TACTICAL ZONE MODEL (thirds × channels — League Ireland / coaching-course grid) ============
// Mirrors our zonal analysis and the standard pitch-overlay boards.
// Pitch is divided into 3 thirds (Defensive / Midfield / Attacking) × 3 channels (Left / Central / Right)
// plus the "pre-offensive" and "final offensive" area concepts layered on top.
// Each cell carries our data + the league benchmark from StatsBomb coordinates.
const tacticalZones = {
  // Success rate of final actions concluding in each channel of the final third
  // (central corridor 34.3% vs Left 14% vs Right 15.1%)
  channelSuccess: [
    { channel: "Left",    finalThird: 14.0, ourShare: 31, color: "#FF9D3D", note: "High volume, low value. We over-load the left through Mitoma but waste the entries." },
    { channel: "Central", finalThird: 34.3, ourShare: 23, color: SCOUTS.green, note: "More than double the wide-channel success. We must conclude more sequences here." },
    { channel: "Right",   finalThird: 15.1, ourShare: 28, color: "#FF9D3D", note: "Minteh's side. Decent volume but the final ball quality drops centrally." }
  ],
  // Build-up / offensive-coverage success by the third where the sequence STARTS
  // (pre-offensive 34.8% highest; defensive-area starts 19x less effective)
  thirdOrigin: [
    { third: "Attacking",  label: "Final / Attacking 1/3", success: 26.3, volume: 45.3, color: SCOUTS.green, note: "Final-offensive-area entries had the highest success AND highest volume. Our scoring pathway." },
    { third: "Midfield",   label: "Midfield 1/3 (pre-offensive)", success: 34.8, volume: 28.0, color: CYBER.cyan, note: "Pre-offensive entries had the single highest first-action success rate. Win the ball here." },
    { third: "Defensive",  label: "Defensive 1/3", success: 21.3, volume: 26.7, color: "#FF6B35", note: "Defensive-third starts are 19× less effective (Lago-Ballesteros). Don't build slow from deep." }
  ],
  // Pressing-trap zones (image 1 "Pressing Dynamics") — where we try to win the ball back
  pressTraps: [
    { zone: "RPD", label: "Right pre-defensive", x: 68, y: 42, intensity: "primary", recoveries: 8.2, note: "Primary pressing trap. Force play into the right pre-defensive channel and swarm." },
    { zone: "CPD", label: "Central pre-defensive", x: 46, y: 44, intensity: "secondary", recoveries: 6.1, note: "Secondary trap. Block central progression, screen the pivot." },
    { zone: "CM",  label: "Central midfield", x: 55, y: 64, intensity: "trigger", recoveries: 4.4, note: "Press trigger zone — first pressure starts when ball enters here." }
  ]
};

const speedZones = [
  { id: "Z1", name: "Standing / Walking", range: "0–7.2 km/h",   color: "#666",    teamPct: 51, teamDistKm: 5.5 },
  { id: "Z2", name: "Jogging",            range: "7.2–14.4 km/h", color: "#4A9EFF", teamPct: 31, teamDistKm: 3.4 },
  { id: "Z3", name: "Running",            range: "14.4–19.8 km/h",color: "#FFD700", teamPct: 11, teamDistKm: 1.2 },
  { id: "Z4", name: "High-Speed Running", range: "19.8–25.2 km/h",color: "#FF8C00", teamPct: 5,  teamDistKm: 0.55 },
  { id: "Z5", name: "Sprinting",          range: "25.2+ km/h",    color: "#FF3D5A", teamPct: 2,  teamDistKm: 0.22 }
];

// Position-specific norms (training targets per session)
const positionNorms = {
  GK:  { topSpeed: 28, hsrM: 100, sprints: 4  },
  CB:  { topSpeed: 31, hsrM: 350, sprints: 8  },
  RB:  { topSpeed: 33, hsrM: 600, sprints: 18 },
  LB:  { topSpeed: 33, hsrM: 600, sprints: 18 },
  DM:  { topSpeed: 32, hsrM: 480, sprints: 12 },
  CM:  { topSpeed: 32, hsrM: 520, sprints: 14 },
  CAM: { topSpeed: 32, hsrM: 540, sprints: 14 },
  WG:  { topSpeed: 33, hsrM: 700, sprints: 20 },
  LW:  { topSpeed: 33, hsrM: 700, sprints: 20 },
  RW:  { topSpeed: 33, hsrM: 700, sprints: 20 },
  ST:  { topSpeed: 32, hsrM: 580, sprints: 16 }
};

// Per-player GPS from most recent training session + load recommendation
// status: "full" | "build" | "maintain" | "manage" | "recover" | "gk"
const playerGPS = [
  { num: 22, name: "K. Mitoma",     pos: "LW",  topSpeed: 34.2, totalDistKm: 9.8, hsrM: 720, sprints: 22, accels: 28, intensity: 8.6,
    status: "full",    rec: "Maintain full load — top speed and HSR profile suits match demand. No reductions needed." },
  { num: 11, name: "Y. Minteh",     pos: "RW",  topSpeed: 33.8, totalDistKm: 9.6, hsrM: 680, sprints: 21, accels: 26, intensity: 8.4,
    status: "full",    rec: "Maintain full load — high-intensity profile mirrors his match output well." },
  { num: 41, name: "J. Hinshelwood",pos: "CAM", topSpeed: 32.8, totalDistKm: 10.1, hsrM: 560, sprints: 16, accels: 24, intensity: 8.5,
    status: "maintain",rec: "High intensity (8.5) with strong HSR. Monitor cumulative load over consecutive sessions." },
  { num: 17, name: "C. Baleba",     pos: "DM",  topSpeed: 33.1, totalDistKm: 10.4, hsrM: 580, sprints: 14, accels: 22, intensity: 8.8,
    status: "full",    rec: "Outlier engine — HSR +21% above DM norm. Design SSGs that exploit his capacity, don't waste it." },
  { num: 27, name: "M. Wieffer",    pos: "DM",  topSpeed: 32.4, totalDistKm: 10.2, hsrM: 510, sprints: 13, accels: 21, intensity: 8.3,
    status: "full",    rec: "Standard pivot profile — full load suits him. Pair with Baleba for double-DM SSG reps." },
  { num: 29, name: "M. De Cuyper",  pos: "LB",  topSpeed: 32.6, totalDistKm: 9.9,  hsrM: 620, sprints: 19, accels: 25, intensity: 8.2,
    status: "full",    rec: "Match-rep sprint exposure dialed in. Full session intensity recommended." },
  { num: 34, name: "J. Veltman",    pos: "RB",  topSpeed: 31.8, totalDistKm: 9.4,  hsrM: 580, sprints: 17, accels: 22, intensity: 7.9,
    status: "maintain",rec: "Standard load. Top speed slightly under match max — add 1× weekly sprint mechanics block." },
  { num: 33, name: "M. O'Riley",    pos: "CM",  topSpeed: 32.2, totalDistKm: 10.0, hsrM: 530, sprints: 14, accels: 22, intensity: 8.2,
    status: "full",    rec: "Full load. CM profile fits perfectly — distance, sprint count, accelerations all on target." },
  { num: 18, name: "D. Welbeck",    pos: "ST",  topSpeed: 32.1, totalDistKm: 9.2,  hsrM: 540, sprints: 14, accels: 20, intensity: 8.0,
    status: "manage",  rec: "Age 35 — manage session volume (75-80% reps). Maintain sprint exposure to preserve top speed." },
  { num: 10, name: "G. Rutter",     pos: "CAM", topSpeed: 32.4, totalDistKm: 9.4,  hsrM: 510, sprints: 15, accels: 22, intensity: 8.1,
    status: "build",   rec: "HSR below CAM norm. Add 1× targeted HSR block weekly to close the gap." },
  { num: 26, name: "Y. Ayari",      pos: "CM",  topSpeed: 32.0, totalDistKm: 9.7,  hsrM: 490, sprints: 13, accels: 20, intensity: 7.9,
    status: "build",   rec: "Sprint count slightly low for CM. Build via 5-min intermittent HSR blocks." },
  { num: 5,  name: "L. Dunk",       pos: "CB",  topSpeed: 30.2, totalDistKm: 8.7,  hsrM: 320, sprints: 8,  accels: 14, intensity: 7.4,
    status: "recover", rec: "Recovery focus. Sprint count -33% vs CB norm — age-related, expected. Light explosive only." },
  { num: 6,  name: "J. van Hecke",  pos: "CB",  topSpeed: 31.4, totalDistKm: 8.9,  hsrM: 360, sprints: 10, accels: 16, intensity: 7.6,
    status: "maintain",rec: "Solid CB output. Maintain — focus weekly on 1-2 high-acceleration reps to keep edge." },
  { num: 30, name: "P. Groß",       pos: "CM",  topSpeed: 30.6, totalDistKm: 9.5,  hsrM: 440, sprints: 11, accels: 18, intensity: 7.7,
    status: "manage",  rec: "Below CM HSR norm but accelerations elite — role-appropriate. Don't chase top speed at his age." },
  { num: 9,  name: "S. Tzimas",     pos: "ST",  topSpeed: 31.5, totalDistKm: 8.8,  hsrM: 490, sprints: 12, accels: 18, intensity: 7.6,
    status: "build",   rec: "Young striker — build sprint volume gradually. Target +2 sprints/week over the next microcycle." },
  { num: 1,  name: "B. Verbruggen", pos: "GK",  topSpeed: 28.4, totalDistKm: 4.2,  hsrM: 80,  sprints: 3,  accels: 7,  intensity: 5.8,
    status: "gk",      rec: "GK-specific protocol. Footwork, dives and short-burst sprints (2-3 sets weekly). No outfield volume." }
];

// Status color/label mapping for the recommendation badges
const gpsStatus = {
  full:     { color: SCOUTS.green,   label: "FULL LOAD",        icon: "●" },
  build:    { color: "#FFD700",      label: "BUILD",            icon: "↑" },
  maintain: { color: BHA.blueLight,  label: "MAINTAIN",         icon: "=" },
  manage:   { color: "#FF8C00",      label: "MANAGE VOLUME",    icon: "◐" },
  recover:  { color: "#FF3D5A",      label: "RECOVERY",         icon: "◯" },
  gk:       { color: "#FFD700",      label: "GK PROTOCOL",      icon: "✦" }
};

// Match-day demands (averaged from recent PL games)
const matchVsTraining = [
  { metric: "Total Distance",      training: 9.4, match: 10.6, unit: "km" },
  { metric: "HSR Distance",        training: 480, match: 685,  unit: "m"  },
  { metric: "Sprint Count",        training: 14,  match: 22,   unit: ""   },
  { metric: "Top Speed",           training: 31.8, match: 33.4, unit: "km/h" },
  { metric: "Accelerations >3m/s²",training: 19,  match: 27,   unit: ""   }
];

// GPS flags - training implications
const gpsFlags = [
  { player: "L. Dunk", type: "monitor", note: "Sprint count -33% vs position norm (5 sessions). Age-related load management — monitor explosive recovery work." },
  { player: "C. Baleba", type: "highlight", note: "HSR +21% above position norm. Outlier athletic capacity — design sessions that don't waste his engine." },
  { player: "D. Welbeck", type: "monitor", note: "Top speed within 3% of season best at age 35. Maintain sprint exposure but cap volume to avoid soft-tissue load." },
  { player: "P. Groß", type: "tactical", note: "HSR below CM norm but accelerations elite — role-appropriate. Don't chase top speed at his profile." }
];

// ============ TRAINING FOCUS ZONES (Brighton-specific) ============
const trainingFocusZones = [
  {
    id: "T-01",
    label: "Our Defensive Third",
    label_sub: "Where Hürzeler's build-out begins",
    tier: "danger",
    stats: [
      { label: "Moves starting here succeed", value: "21.3%", note: "above PL avg 17.5%" },
      { label: "Moves ending here succeed",   value: "8.1%",  note: "above PL avg 3.9%" },
      { label: "Press-induced turnovers",     value: "3.2",   note: "/match" }
    ],
    plain_english: "Our commitment to playing out from the back is a strength but also exposes us to high-press turnovers. The recent Man Utd defeat saw 2 of 3 goals originate from losses in this zone. Hürzeler wants us to keep building from here but our defenders need cleaner first touches and earlier scanning to beat the press.",
    ssg_types: [
      { name: "Press-Escape Patterns", desc: "Verbruggen + back four + Baleba practice rehearsed build-up patterns against a 6-player press." },
      { name: "Quick-Release Goalkeeper Games", desc: "Verbruggen receives back-pass, must distribute forward within 3 seconds. Wieffer/Baleba make supporting runs." },
      { name: "Centre-Back Carry Drills", desc: "Dunk and van Hecke practice carrying the ball through the first press line — a club signature under De Zerbi and continued by Hürzeler." },
      { name: "Pressure-Breaking Triangle Games", desc: "Form rotating triangles in our own third to beat coordinated pressing." }
    ],
    why: "Our identity depends on this zone working. Cleaner exits = fewer transition goals conceded.",
    linked_ssgs: ["SSG-02", "SSG-05"],
    zones_to_highlight: ["LD", "CD", "RD"]
  },
  {
    id: "T-02",
    label: "Our Middle Third",
    label_sub: "The Baleba & Wieffer pivot zone",
    tier: "moderate",
    stats: [
      { label: "Moves starting here", value: "1,182", note: "season total" },
      { label: "Moves starting here succeed", value: "24.7%", note: "above PL avg 19.3%" },
      { label: "Baleba progressive passes", value: "5.3",   note: "/match (PL top 10)" }
    ],
    plain_english: "We're very good here — our double pivot of Baleba and Wieffer dominates the middle third. But too much of our play passes through Baleba alone (over-reliance). When he was injured for 3 matches, we averaged only 0.7 goals per game vs 1.7 with him.",
    ssg_types: [
      { name: "Wieffer-As-Lead-Distributor Games", desc: "Force play through Wieffer rather than Baleba. Build redundancy in our build-up." },
      { name: "Switch-Of-Play Triggers", desc: "Reward switches from one full-back to the other in under 4 passes — exploit our wide players." },
      { name: "Hinshelwood Drop-Into-Pocket Games", desc: "Encourage the 10 to receive between the lines, freeing our pivots to push higher." },
      { name: "Press-Resistant Possession", desc: "5v3 + 3 rondo simulating mid-third pressure with one-touch and two-touch limits." }
    ],
    why: "If Baleba is removed, we stop functioning. Spread the responsibility across the squad.",
    linked_ssgs: ["SSG-01", "SSG-06"],
    zones_to_highlight: ["LPD", "CPD", "RPD"]
  },
  {
    id: "T-03",
    label: "The Final Third Build-up",
    label_sub: "Where Mitoma and Minteh isolate",
    tier: "high-value",
    stats: [
      { label: "Moves ending here succeed",    value: "37.4%", note: "PL top 5" },
      { label: "Mitoma 1v1s won",              value: "5.1",   note: "/match (PL #1)" },
      { label: "Minteh progressive carries",   value: "6.8",   note: "/match" }
    ],
    plain_english: "Our elite zone. Both our wingers are devastating 1v1 and the data shows we win more isolation duels here than any other team in the Premier League. The issue is our connection from this zone to the box — too often Mitoma or Minteh beats a man, then the cross or cut-back is ordinary.",
    ssg_types: [
      { name: "Isolation 1v1 Games", desc: "Wide channel 1v1s, winner crosses on coach's signal. Reps for Mitoma, Minteh, Rutter, Kostoulas." },
      { name: "Cut-Back Drills", desc: "Specific service patterns ending in central cut-back. Quality of the pass is graded, not just delivery." },
      { name: "Overload-To-Isolate Games", desc: "3v2 in the opposite half forces overload, then quick switch creates 1v1 on the weak side." },
      { name: "Third-Man Combinations", desc: "Wide player + striker + arriving midfielder pattern — the missing piece in our final-third entries." }
    ],
    why: "Our strength compounds when wingers connect to the box quickly. Don't waste 1v1 victories with poor service.",
    linked_ssgs: ["SSG-01", "SSG-03", "SSG-05"],
    zones_to_highlight: ["LPO", "CPO", "RPO"]
  },
  {
    id: "T-04",
    label: "The Attacking Third",
    label_sub: "Our chance conversion problem",
    tier: "execution",
    stats: [
      { label: "Big chances missed %", value: "58%",  note: "PL avg 51% — we're worse" },
      { label: "Shots on target / shots", value: "38%", note: "PL avg 36%" },
      { label: "Central corridor success", value: "31.2%", note: "below PL avg 34.3%" }
    ],
    plain_english: "This is our biggest issue. We create above-average chances (2.1 big chances/match) but convert them below average. Welbeck remains our most clinical option — when he starts, our conversion jumps from 9.8% to 14.2%. Hinshelwood, Rutter and Kostoulas need shot-quality work in training.",
    ssg_types: [
      { name: "First-Touch Finishing Stations", desc: "Service from wide; striker must hit the target with one touch. Track placement zones." },
      { name: "Pressured Finishing Reps", desc: "Defender shadow within 3m on every finish — replicates Premier League closing speed." },
      { name: "3-Second Box Rule SSGs", desc: "Once in the box, must shoot within 3 seconds. No build-up tolerated in the final 18 yards." },
      { name: "Welbeck-Style Finishing", desc: "Specific patterns: cut-back finish, near-post first-time, far-post header. Welbeck's profile applied squad-wide." }
    ],
    why: "Our chance creation is good enough for top 6. Our finishing is what kept us 8th.",
    linked_ssgs: ["SSG-03", "SSG-04", "SSG-08"],
    zones_to_highlight: ["LO", "CO", "RO"]
  }
];

// ============ TRAINING WEEK (Mon-Sun match-week cycle with simulated training game) ============
// Designed as if Saturday is the "match day" — a typical Brighton Premier League cycle.
// Saturday's training game replaces a real fixture for this off-week scenario.
const trainingWeek = [
  {
    day: "Monday",
    short: "MON",
    type: "training",
    title: "Tactical Heavy — Build-Out & Press-Escape",
    sub: "MD-5 · Highest load of the week",
    focus: ["T-01", "T-02"],
    linkedSSGs: ["SSG-02", "SSG-05"],
    intensity: "High",
    intensityLevel: 4, // 1-5 scale
    rpe: "8-9",
    duration: 100,
    blocks: [
      { time: 15, title: "Activation & Mobility", desc: "Dynamic warm-up; band work; activation drills. Verbruggen with GK coach for handling reps." },
      { time: 20, title: "Press-Resistance Rondos", desc: "5v3 + 3 rondos. One-touch and two-touch constraints. Force scanning before receiving." },
      { time: 30, title: "Five-Second Strike SSG", desc: "SSG-02 from playbook. 7v7+GKs, recover and shoot within 5s. Six × 3min rounds." },
      { time: 25, title: "11v11 Thirds Build-out", desc: "Full pitch divided into thirds. Build out from goal vs 8-player press. Quality of first pass graded." },
      { time: 10, title: "Cool-down & Stretch", desc: "Light jog + static stretch. RPE check-in with sport science staff." }
    ],
    coaching: "Cleaner exits under press is our biggest defensive weakness. The Man Utd loss had 2 of 3 goals originate from build-out failures. Every CB carry must beat the first line of pressure.",
    notes: "Heaviest tactical day. Watch Welbeck and Dunk for load — they need full recovery before Wednesday."
  },
  {
    day: "Tuesday",
    short: "TUE",
    type: "training",
    title: "Conditioning + Position-Specific Technical",
    sub: "MD-4 · GPS load focus",
    focus: ["GPS"],
    linkedSSGs: [],
    intensity: "Medium-High",
    intensityLevel: 3,
    rpe: "7-8",
    duration: 90,
    blocks: [
      { time: 15, title: "Warm-up & Speed Mechanics", desc: "Acceleration / deceleration mechanics. A-skips, B-skips, sprint form." },
      { time: 20, title: "Repeat Sprint Ability (RSA)", desc: "Position-specific intervals. Wingers: 6×40m. CBs: 4×30m. Midfielders: 5×35m." },
      { time: 25, title: "Position-Specific Tech", desc: "Defenders: aerial duels & clearances. Midfielders: switching play. Attackers: first-touch finishing." },
      { time: 20, title: "4v4 + GKs Small Games", desc: "Two pitches, 4v4 + GKs. 4 × 4min. High intensity, lots of touches." },
      { time: 10, title: "Mobility & Recovery", desc: "Cool-down jog. Foam rolling. Soft-tissue work in physio room." }
    ],
    coaching: "Close the 2.7-second gap between training and match HSR demand. Don't sacrifice quality for volume.",
    notes: "Sport science team monitors GPS for Hinshelwood and Baleba — both high engines, easy to overload."
  },
  {
    day: "Wednesday",
    short: "WED",
    type: "training",
    title: "Final-Third Patterns & Finishing",
    sub: "MD-3 · Attack-focused tactical",
    focus: ["T-03", "T-04"],
    linkedSSGs: ["SSG-01", "SSG-03", "SSG-04"],
    intensity: "Medium",
    intensityLevel: 3,
    rpe: "7",
    duration: 85,
    blocks: [
      { time: 15, title: "Activation", desc: "Dynamic warm-up. Possession-based rondo finish." },
      { time: 20, title: "Central Channel SSG", desc: "SSG-03 from playbook. Wide service into marked central zone. First-time finishes worth double." },
      { time: 25, title: "The Infiltrator SSG", desc: "SSG-01 from playbook. 3rd-4th pass decision-making. Pattern → final third." },
      { time: 20, title: "1v1 Isolation + Finishing", desc: "Mitoma and Minteh deliberate isolation reps. Welbeck-style finishing patterns: cut-back, near post, far post." },
      { time: 5, title: "Cool-down", desc: "Easy jog and stretch." }
    ],
    coaching: "Quality of cut-back is the bottleneck — our wingers win 1v1s but waste them on poor service. Central corridor entries convert 2.3× more than wide entries.",
    notes: "Kostoulas and Tzimas given extra finishing reps. Build a Welbeck-style profile in the younger strikers."
  },
  {
    day: "Thursday",
    short: "THU",
    type: "training",
    title: "Set Pieces & Defensive Shape",
    sub: "MD-2 · Routine sharpening",
    focus: ["T-04", "SP"],
    linkedSSGs: ["SSG-07"],
    intensity: "Medium-Low",
    intensityLevel: 2,
    rpe: "5-6",
    duration: 70,
    blocks: [
      { time: 15, title: "Activation", desc: "Light warm-up. Passing patterns at 60% intensity." },
      { time: 25, title: "Set Piece Studio (Offensive)", desc: "SSG-07 from playbook. 4 routines: corner, deep FK, wide FK, throw-in. 12 reps each, all rotated." },
      { time: 20, title: "Set Piece Defensive Work", desc: "Defensive shape against opposition routines. Walk-through first, then live." },
      { time: 10, title: "Pattern Walk-through", desc: "Saturday match shape walked through at half-speed. No opposition." }
    ],
    coaching: "We scored 11 SP goals vs PL average 14 — closing this gap is our most fixable improvement. Role clarity is non-negotiable. Each player has one job per routine.",
    notes: "Saturday's training game gives us a chance to test 2 new corner routines under pressure."
  },
  {
    day: "Friday",
    short: "FRI",
    type: "training",
    title: "Pre-Match Light Session",
    sub: "MD-1 · Activation & walkthroughs",
    focus: ["Tactical recall"],
    linkedSSGs: [],
    intensity: "Low",
    intensityLevel: 1,
    rpe: "4-5",
    duration: 55,
    blocks: [
      { time: 15, title: "Activation", desc: "Light cardio + dynamic stretch. GKs do handling and footwork." },
      { time: 15, title: "Opposition Shape Walkthrough", desc: "Walk through how opposition lines up. Where their threats come from. Where space appears." },
      { time: 15, title: "Pattern Refresh — 7v7+GKs", desc: "2-touch maximum. Pattern recall, not new learning. Focus on triggers." },
      { time: 10, title: "Cool-down & Match-Day Brief", desc: "Light run + meeting room. Final tactical brief. Set piece responsibilities reviewed." }
    ],
    coaching: "No new information today. Reinforce what we already know. Keep legs fresh — every drill capped at 70% intensity.",
    notes: "Verbruggen and goalkeepers do match-day handling routine. Set piece takers get final delivery reps."
  },
  {
    day: "Saturday",
    short: "SAT",
    type: "match", // SPECIAL — match day simulation
    title: "🏆 TRAINING GAME — Internal 11v11 Match",
    sub: "MD · Match-day simulation",
    focus: ["Match-day demand"],
    linkedSSGs: [],
    intensity: "Match",
    intensityLevel: 5,
    rpe: "8-9",
    duration: 150,
    blocks: [
      { time: 30, title: "Match-Day Warm-up", desc: "Full pre-match warm-up routine. Identical to a Premier League fixture protocol. Set up like a real match day." },
      { time: 90, title: "11v11 Internal Match (3 × 30min)", desc: "Senior squad vs U23s/reserves blend. Three thirty-minute periods to allow rotations. Hürzeler manages from technical area. Real referee, real intensity." },
      { time: 30, title: "Cool-down + Analyst Meeting", desc: "Active cool-down. GPS data download. Analyst captures footage. Brief individual debriefs with sport science." }
    ],
    coaching: "Treat this as a Premier League match. Non-starters get the full 90 — gives us genuine selection data. Test the new corner routines from Thursday. Trial the high-press trigger we worked Monday.",
    notes: "Designed as a match-day replacement for off-weeks. Squad split into two evenly-matched XIs for competitive intensity. Analyst department captures full match footage for review."
  },
  {
    day: "Sunday",
    short: "SUN",
    type: "rest",
    title: "Recovery / Day Off",
    sub: "MD+1 · Physical & mental reset",
    focus: ["Recovery"],
    linkedSSGs: [],
    intensity: "Very Low",
    intensityLevel: 0,
    rpe: "1-3",
    duration: 30,
    blocks: [
      { time: 30, title: "Optional Recovery Block", desc: "For Saturday starters: pool / bike / sauna at training ground (30 min). Optional and individualised. For non-participants: full rest day." }
    ],
    coaching: "Off-day discipline. Family time encouraged. Mental reset is as important as physical. Players checked in via app for sleep, soreness, mood.",
    notes: "Optional facility access from 10-12. Full team back in Monday morning for the next cycle."
  }
];

// ============ SSGs (kept structure, Brighton context layered in) ============
const ssgs = [
  {
    id: "SSG-01", name: "The Infiltrator", subtitle: "Medium-Pass Build-up Game",
    targets: ["B-02", "T-02"],
    setup: { pitch: "40m × 50m", players: "6v6 + 2 neutrals", duration: "4 × 4 min" },
    objective: "Develop 3rd–4th pass decision-making — our middle third is dominant but over-relies on Baleba.",
    rules: ["Pitch divided into 3 zones", "≥3 passes before crossing into next zone", "Bonus point if the 3rd pass breaks a line", "Loss before 3 passes = immediate transition", "Neutrals play with possessing team"],
    coaching: ["Body shape to receive on the half-turn (Baleba/Wieffer)", "First-touch direction away from pressure", "Disguise the penetrating pass", "Off-ball runs by Hinshelwood and Mitoma to draw markers"],
    progressions: "Reduce to 2 touches max in transition zone. Add a target striker who must be reached on the 3rd pass.",
    zones: ["CPD", "CPO", "LPO", "RPO"],
    players: [
      { team: "att", num: 18, x: 50, y: 18 }, { team: "att", num: 22, x: 32, y: 32 }, { team: "att", num: 11, x: 68, y: 32 },
      { team: "att", num: 13, x: 50, y: 55 }, { team: "att", num: 17, x: 28, y: 72 }, { team: "att", num: 27, x: 72, y: 72 },
      { team: "def", num: 4, x: 45, y: 28 }, { team: "def", num: 5, x: 55, y: 28 },
      { team: "def", num: 2, x: 30, y: 48 }, { team: "def", num: 3, x: 70, y: 48 },
      { team: "def", num: 8, x: 50, y: 65 }, { team: "def", num: 6, x: 50, y: 82 },
      { team: "neu", num: "N", x: 12, y: 50 }, { team: "neu", num: "N", x: 88, y: 50 }
    ]
  },
  {
    id: "SSG-02", name: "Five-Second Strike", subtitle: "Post-Recovery Transition",
    targets: ["T-01"],
    setup: { pitch: "35m × 45m", players: "7v7 + 2 GKs", duration: "6 × 3 min" },
    objective: "We recover the ball well but transition slowly. This addresses the gap between our regain and attack.",
    rules: ["On recovery, possession team has 5 seconds to enter the final third OR shoot", "Failure = possession returns at point of failure", "Goal within window = 3 points; after = 1 point", "Coach forces turnovers to reset"],
    coaching: ["Anticipation: forward runs as opposition control deteriorates", "Clean first touch — the whole transition rests on it", "Direct vertical pass before sideways", "Mitoma and Minteh: commit before recovery is confirmed"],
    progressions: "Reduce window to 4 seconds. Add a 'high press' constraint where the recovering team must press immediately after losing the ball.",
    zones: ["CPO", "LPO", "RPO", "CO"],
    players: [
      { team: "att", num: 18, x: 50, y: 22 }, { team: "att", num: 7, x: 25, y: 35 }, { team: "att", num: 11, x: 75, y: 35 },
      { team: "att", num: 13, x: 42, y: 50 }, { team: "att", num: 27, x: 58, y: 50 },
      { team: "att", num: 17, x: 35, y: 72 }, { team: "att", num: 5, x: 65, y: 72 },
      { team: "def", num: 4, x: 50, y: 30 }, { team: "def", num: 2, x: 30, y: 50 }, { team: "def", num: 3, x: 70, y: 50 },
      { team: "def", num: 6, x: 50, y: 60 }, { team: "def", num: 8, x: 40, y: 75 }, { team: "def", num: 10, x: 60, y: 75 },
      { team: "def", num: 11, x: 50, y: 88 },
      { team: "gk", num: 1, x: 50, y: 7 }, { team: "gk", num: 1, x: 50, y: 93 }
    ]
  },
  {
    id: "SSG-03", name: "Central Channel", subtitle: "Wide Service → Central Finish",
    targets: ["T-03", "T-04"],
    setup: { pitch: "30m × 50m + marked central zone", players: "6v6 + 2 wide servers", duration: "5 × 4 min" },
    objective: "Our wingers win 1v1s but the cross/cut-back quality lets us down. This drills the connection.",
    rules: ["Wide servers deliver crosses on coach's signal", "Goals only count if finish occurs inside marked central zone", "Maximum 2 touches in central zone", "First-time finishes worth double", "Defenders must occupy central zone"],
    coaching: ["Quality of cut-back (pulled across body, low and firm)", "Far-post and near-post timing — distinct arrival moments", "First-time finish over controlled", "Defenders: angle of approach to deny cut-back lane"],
    progressions: "Reduce central zone size. Remove server (must be earned via wide combination).",
    zones: ["CO"],
    players: [
      { team: "att", num: 18, x: 50, y: 25 }, { team: "att", num: 22, x: 35, y: 30 }, { team: "att", num: 11, x: 65, y: 30 },
      { team: "neu", num: "S", x: 8, y: 30 }, { team: "neu", num: "S", x: 92, y: 30 },
      { team: "att", num: 13, x: 50, y: 55 }, { team: "att", num: 10, x: 30, y: 70 }, { team: "att", num: 17, x: 70, y: 70 },
      { team: "def", num: 4, x: 42, y: 22 }, { team: "def", num: 5, x: 58, y: 22 },
      { team: "def", num: 2, x: 32, y: 42 }, { team: "def", num: 3, x: 68, y: 42 },
      { team: "def", num: 8, x: 50, y: 60 }, { team: "def", num: 6, x: 50, y: 80 },
      { team: "gk", num: 1, x: 50, y: 10 }
    ]
  },
  {
    id: "SSG-04", name: "Three-Second Final", subtitle: "Direct Finishing in the Box",
    targets: ["T-04"],
    setup: { pitch: "Half pitch, attacking direction only", players: "5v4 + GK", duration: "8 × 90s rounds" },
    objective: "We miss 58% of big chances (PL avg 51%). This drills the instinct for direct, fast finishing.",
    rules: ["Server plays ball into the attacking third", "Attackers have 3 seconds to attempt a shot from first touch", "Shot after the window = no goal", "Defenders activated only on first touch", "Goals: 1 touch = 2pt, 2 touches = 1pt, 3+ = 0"],
    coaching: ["Pre-shot scan — head up before receiving", "Body shape: open hips toward goal", "Strike low and hard, near-post by default", "Anticipate rebounds — second runner attacks the spill"],
    progressions: "Reduce window to 2 seconds. Add second defender on delay.",
    zones: ["LO", "CO", "RO"],
    players: [
      { team: "att", num: 18, x: 50, y: 20 }, { team: "att", num: 13, x: 35, y: 28 }, { team: "att", num: 11, x: 65, y: 28 },
      { team: "att", num: 22, x: 20, y: 42 }, { team: "att", num: 10, x: 80, y: 42 },
      { team: "def", num: 4, x: 42, y: 25 }, { team: "def", num: 5, x: 58, y: 25 },
      { team: "def", num: 2, x: 30, y: 35 }, { team: "def", num: 3, x: 70, y: 35 },
      { team: "gk", num: 1, x: 50, y: 8 },
      { team: "neu", num: "S", x: 50, y: 80 }
    ]
  },
  {
    id: "SSG-05", name: "Engine Room Conquest", subtitle: "Pre-Offensive Possession",
    targets: ["T-02", "T-03"],
    setup: { pitch: "45m × 50m, pre-offensive zone marked", players: "7v7", duration: "4 × 5 min" },
    objective: "We already excel in this zone. This session locks in the routines that produce 37.4% success in our final third.",
    rules: ["Marked pre-offensive zone in attacking half", "+1: entering the zone with possession", "+2: completing 3 passes inside", "+3: exiting forward toward goal with possession", "Defenders win +1 by recovering inside own pre-offensive zone"],
    coaching: ["Support angles — diamonds and triangles", "Secondary movements off the ball to create free spaces", "1-2 combinations with the player in possession", "Avoid sideways drift — always look for the forward line-breaker"],
    progressions: "Limit touches to 2 in zone. Add a target player who must receive in zone.",
    zones: ["LPO", "CPO", "RPO"],
    players: [
      { team: "att", num: 18, x: 50, y: 18 }, { team: "att", num: 11, x: 72, y: 30 }, { team: "att", num: 22, x: 28, y: 30 },
      { team: "att", num: 13, x: 42, y: 48 }, { team: "att", num: 17, x: 58, y: 48 },
      { team: "att", num: 27, x: 30, y: 68 }, { team: "att", num: 29, x: 70, y: 68 },
      { team: "def", num: 4, x: 45, y: 25 }, { team: "def", num: 5, x: 55, y: 25 },
      { team: "def", num: 3, x: 25, y: 45 }, { team: "def", num: 6, x: 50, y: 55 }, { team: "def", num: 8, x: 75, y: 45 },
      { team: "def", num: 10, x: 40, y: 75 }, { team: "def", num: 11, x: 60, y: 75 }
    ]
  },
  {
    id: "SSG-06", name: "Triangle Bypass", subtitle: "Escaping Over-Reliance",
    targets: ["T-02"],
    setup: { pitch: "35m × 40m", players: "5v5", duration: "5 × 4 min" },
    objective: "Develop 3-player combinations to reduce dependence on Baleba in the middle third.",
    rules: ["Possession 'completed' only after 3 different players touched the ball", "Wall-pass (counts as 1 player) doesn't progress the counter", "Goals after triangular combination (3 distinct players) = 3 points", "Goals from other sequences = 1 point", "Coach calls reset if play stagnates between two players"],
    coaching: ["Third-player movement — the runner from depth", "Avoid binary passing (back-and-forth)", "Body shape opens toward the third player not the second", "Verbal cues to call the triangle into existence"],
    progressions: "Require 4 different players. Reduce touches to 2 for the central player.",
    zones: ["CPD", "CPO"],
    players: [
      { team: "att", num: 18, x: 50, y: 28 }, { team: "att", num: 22, x: 32, y: 50 }, { team: "att", num: 11, x: 68, y: 50 },
      { team: "att", num: 13, x: 50, y: 65 }, { team: "att", num: 27, x: 50, y: 85 },
      { team: "def", num: 4, x: 45, y: 32 }, { team: "def", num: 5, x: 55, y: 32 },
      { team: "def", num: 2, x: 30, y: 55 }, { team: "def", num: 3, x: 70, y: 55 },
      { team: "def", num: 6, x: 50, y: 75 }
    ]
  },
  {
    id: "SSG-07", name: "Set Piece Studio", subtitle: "Restart Conversion",
    targets: ["T-04"],
    setup: { pitch: "Attacking half + 18-yard box", players: "8 attackers, 6 defenders + GK", duration: "12 routines × 2 reps" },
    objective: "We scored 11 set piece goals (PL avg 14). Closing this gap is among our most fixable improvements.",
    rules: ["Coach calls 1 of 4 routines per rep (corner, deep FK, wide FK, throw-in)", "Each routine has primary, secondary and tertiary targets", "If primary is denied, recycle within 4 seconds for secondary", "Log shot generated / on target / goal per routine", "Rotate defenders to face all routines"],
    coaching: ["Role clarity — each player one job per routine", "Blockers move on the kicker's run-up", "Second-phase awareness — recycled ball is where games are decided", "Dunk and Van Hecke as primary aerial threats"],
    progressions: "Add live defenders with full pressure. Disguise the routine call until last second.",
    zones: ["LO", "CO", "RO"],
    players: [
      { team: "att", num: 18, x: 48, y: 18 }, { team: "att", num: 5, x: 52, y: 22 }, { team: "att", num: 6, x: 38, y: 25 },
      { team: "att", num: 11, x: 62, y: 25 }, { team: "att", num: 4, x: 45, y: 32 }, { team: "att", num: 22, x: 55, y: 32 },
      { team: "att", num: 13, x: 30, y: 40 }, { team: "att", num: 17, x: 92, y: 48 },
      { team: "def", num: 2, x: 42, y: 20 }, { team: "def", num: 3, x: 58, y: 20 },
      { team: "def", num: 4, x: 50, y: 14 }, { team: "def", num: 5, x: 40, y: 16 },
      { team: "def", num: 6, x: 60, y: 16 }, { team: "def", num: 8, x: 50, y: 28 },
      { team: "gk", num: 1, x: 50, y: 7 }
    ]
  },
  {
    id: "SSG-08", name: "Solo Carrier", subtitle: "Individual Progression",
    targets: ["T-01", "T-03"],
    setup: { pitch: "Three vertical channels, 60m × 36m total", players: "3v3 in each channel", duration: "6 × 3 min" },
    objective: "Our centre-backs (Dunk, Van Hecke) lead the league in progressive carries. This drills it deeper into the squad.",
    rules: ["Three vertical channels — players cannot leave their channel", "Carriers must beat at least 1 opponent before passing or shooting", "Successful 1v1 carry through a channel line = +1 point", "Goal scored after a 1v1 carry = +2 points", "Lost duel = immediate possession to opposition"],
    coaching: ["Body feint before the actual move — sell the deception", "Acceleration on the second touch (after the beat)", "Use of arms for shielding and balance", "Recognise when to release — the carry is means, not end"],
    progressions: "Remove channel restrictions for the carrier only. Add a 'carrier of the day' who must dribble every recovery.",
    zones: ["LPD", "LPO", "CPD", "CPO", "RPD", "RPO"],
    players: [
      { team: "att", num: 18, x: 16, y: 30 }, { team: "att", num: 22, x: 50, y: 30 }, { team: "att", num: 11, x: 84, y: 30 },
      { team: "att", num: 13, x: 16, y: 65 }, { team: "att", num: 17, x: 50, y: 65 }, { team: "att", num: 5, x: 84, y: 65 },
      { team: "def", num: 3, x: 16, y: 45 }, { team: "def", num: 4, x: 50, y: 45 }, { team: "def", num: 2, x: 84, y: 45 },
      { team: "def", num: 5, x: 16, y: 80 }, { team: "def", num: 6, x: 50, y: 80 }, { team: "def", num: 8, x: 84, y: 80 }
    ]
  }
];

// ============ KPIs (Brighton-specific benchmarks) ============
const kpiCategories = {
  buildup:     { label: "Build-up", sub: "From the back to the middle", color: "#00D4FF", description: "Our identity zone — how cleanly we play out from defence" },
  transitions: { label: "Transitions", sub: "Recovery to Attack", color: "#FFD700", description: "What happens in the 5 seconds after we win or lose the ball" },
  finalthird:  { label: "Final Third", sub: "Wide play & box entries", color: "#FF6B35", description: "Our wingers, cut-backs, and central arrivals" },
  finishing:   { label: "Finishing", sub: "Conversion quality", color: "#FF3D5A", description: "Our chief weakness — turning chances into goals" },
  set_pieces:  { label: "Set Pieces", sub: "Restart conversion", color: "#B768FF", description: "Where we rank below the Premier League average" },
  macro:       { label: "Macro", sub: "Match-level signatures", color: SCOUTS.green, description: "Top-line indicators of overall performance" }
};

const kpis = [
  { id: "B-01", cat: "buildup", name: "Build-Out Success Rate", definition: "% of moves starting in our defensive third that progress past the halfway line", formula: "(Successful build-outs ÷ build-out attempts) × 100", benchmark: "Us 21.3% | PL avg 17.5%", target: "≥22%", success: "21.3%", why: "Our identity. A 1pp improvement here translates to ~3 more attacks per match.", training: "Press-Escape Patterns drill (SSG-02).", priority: "Critical" },
  { id: "B-02", cat: "buildup", name: "Verbruggen Distribution Accuracy", definition: "% of Verbruggen's distribution that finds a teammate in the middle third", formula: "(Distributions reaching mid-third ÷ total distributions) × 100", benchmark: "Us 78% | PL GK avg 65%", target: "Maintain ≥75%", success: "78%", why: "League-best mark. Verbruggen is foundational to how we play.", training: "Quick-Release Goalkeeper Games.", priority: "High" },
  { id: "B-03", cat: "buildup", name: "Baleba Progressive Pass Rate", definition: "Progressive passes per match completed by Baleba", formula: "Count of progressive passes by Baleba ÷ matches", benchmark: "Baleba 5.3/match | PL avg 3.1", target: "Maintain, develop redundancy in Wieffer", success: "5.3", why: "Baleba is irreplaceable in the current system — and that's a risk.", training: "Wieffer-As-Lead-Distributor games (T-02).", priority: "High" },
  { id: "T-01", cat: "transitions", name: "Post-Recovery Conversion", definition: "% of our recoveries leading to a shot within 10 seconds", formula: "(Recoveries → shot in 10s ÷ total recoveries) × 100", benchmark: "Us 19.4% | PL avg 22.1%", target: "≥22%", success: "19.4%", why: "We win the ball well (47/match) but convert recoveries slowly.", training: "Five-Second Strike (SSG-02).", priority: "Critical" },
  { id: "T-02", cat: "transitions", name: "Counter-Press Recovery Rate", definition: "% of lost possessions recovered within 5 seconds", formula: "(Recoveries within 5s ÷ losses) × 100", benchmark: "Us 28% | PL avg 24%", target: "≥30%", success: "28%", why: "Our counter-press is solid; pushing it further reduces opposition transitions.", training: "High-press trigger SSGs.", priority: "Medium" },
  { id: "F-01", cat: "finalthird", name: "Mitoma 1v1 Win Rate", definition: "% of 1v1 duels Mitoma wins in the final third", formula: "(Mitoma 1v1s won ÷ Mitoma 1v1s) × 100", benchmark: "Mitoma 68% | PL winger avg 51%", target: "Maintain ≥65%", success: "68%", why: "Best in the Premier League. Our primary attacking lever.", training: "Isolation 1v1 Games (T-03).", priority: "High" },
  { id: "F-02", cat: "finalthird", name: "Cut-Back Conversion", definition: "% of cut-backs from wide leading to a shot on target", formula: "(Cut-backs → SOT ÷ total cut-backs) × 100", benchmark: "Us 28% | PL avg 33%", target: "≥35%", success: "28%", why: "The weakest link in our chain — winning the 1v1 is wasted without quality service.", training: "Cut-Back Drills + Central Channel (SSG-03).", priority: "Critical" },
  { id: "F-03", cat: "finalthird", name: "Central Corridor Box Entries", definition: "% of box entries arriving in the central corridor", formula: "(Central box entries ÷ total box entries) × 100", benchmark: "Us 31.2% | PL avg 34.3%", target: "≥34%", success: "31.2%", why: "We over-rely on wide entries. Central arrivals convert 2.3× more.", training: "Central Channel (SSG-03).", priority: "High" },
  { id: "FIN-01", cat: "finishing", name: "Big Chance Conversion", definition: "% of big chances converted to goals", formula: "(Big chances scored ÷ big chances) × 100", benchmark: "Us 42% | PL avg 49%", target: "≥48%", success: "42%", why: "The single most important number for our table position.", training: "Pressured Finishing Reps (T-04).", priority: "Critical" },
  { id: "FIN-02", cat: "finishing", name: "Shot-on-Target Conversion", definition: "Goals as % of shots on target", formula: "(Goals ÷ shots on target) × 100", benchmark: "Us 31% | PL avg 33%", target: "≥35%", success: "31%", why: "Just below average — placement quality, not power.", training: "First-Touch Finishing Stations.", priority: "High" },
  { id: "FIN-03", cat: "finishing", name: "Welbeck-Effect Conversion", definition: "Team shot conversion in matches Welbeck starts vs. doesn't", formula: "Conversion% (Welbeck XI) − (no-Welbeck XI)", benchmark: "Welbeck +4.4pp boost to our conversion", target: "Build a similar profile in Kostoulas/Tzimas", success: "+4.4pp", why: "Our squad lacks a Welbeck-style cool finisher when he's absent.", training: "Welbeck-Style Finishing pattern reps.", priority: "Medium" },
  { id: "SP-01", cat: "set_pieces", name: "Set Piece Goal Conversion", definition: "Goals from set pieces as % of set piece deliveries on target", formula: "(SP goals ÷ SP shots on target) × 100", benchmark: "Us 18% | PL avg 23%", target: "≥22%", success: "18%", why: "Set pieces are coachable. 5 more SP goals per season ≈ 8 more points for us.", training: "Set Piece Studio (SSG-07).", priority: "Critical" },
  { id: "SP-02", cat: "set_pieces", name: "Aerial Duels Won in Box", definition: "% of aerial duels we win inside the opposition box", formula: "(Aerial duels won in opp box ÷ total) × 100", benchmark: "Us 41% | PL avg 47%", target: "≥45%", success: "41%", why: "We're not a tall team. Smart movement and timing must compensate.", training: "Aerial timing reps with Dunk/Van Hecke as leaders.", priority: "Medium" },
  { id: "M-01", cat: "macro", name: "xG Outperformance", definition: "Goals scored minus expected goals (per match)", formula: "Goals/match − xG/match", benchmark: "Us −0.07 | PL avg 0", target: "Reach +0.05 (top 6 level)", success: "−0.07", why: "We create chances of top-6 quality but finish like an 8th-placed side.", training: "Finishing programme squad-wide.", priority: "Critical" },
  { id: "M-02", cat: "macro", name: "Possession Quality Index", definition: "% of possessions reaching the final third", formula: "(Possessions reaching final third ÷ total possessions) × 100", benchmark: "Us 36% | PL avg 31%", target: "Maintain ≥35%", success: "36%", why: "Our territorial dominance is real. The problem is what happens once we're there.", training: "Engine Room Conquest (SSG-05).", priority: "Medium" },
  { id: "M-03", cat: "macro", name: "Recovery-To-Shot Time", definition: "Average seconds from possession recovery to first shot attempt", formula: "Mean(seconds from recovery to shot)", benchmark: "Us 14.2s | PL top 6 avg 11.5s", target: "≤12s", success: "14.2s", why: "We're too patient post-recovery. Top 6 teams strike faster after winning the ball.", training: "Five-Second Strike (SSG-02).", priority: "High" }
];

// ============ INSIGHTS ============
const insights = [
  { title: "We create like top 6, finish like bottom half", body: "Our xG of 1.62 per match is 5th-best in the Premier League. Our actual conversion ranks 13th. If we finished at the league average rate, we would have scored 6 more goals across the season — likely 6th-placed instead of 8th.", metric: "xG: 1.62 | Goals: 1.55 | Gap: −0.07", severity: "decisive" },
  { title: "The Welbeck effect is real and quantifiable", body: "In matches Welbeck started (28 league appearances), we averaged 1.75 goals per match at 14.2% conversion. Without him, those numbers dropped to 1.1 and 9.8%. The data justifies a strong succession plan for the 35-year-old centre forward.", metric: "+0.65 goals/match when Welbeck starts", severity: "discovery" },
  { title: "Baleba is irreplaceable — and that's a problem", body: "When Baleba missed 3 matches with injury, our middle-third success rate dropped from 24.7% to 17.1%. We need Wieffer, O'Riley or Ayari to develop the same progressive passing profile. Risk concentration is unsustainable.", metric: "−7.6pp middle-third success without Baleba", severity: "myth-buster" },
  { title: "Mitoma's 1v1s lead the Premier League — but our waste rate is high", body: "Mitoma wins 68% of his 1v1 duels (best in the PL). However, only 28% of cut-backs after his beaten-man moments produce a shot on target (PL avg 33%). The bottleneck isn't creation — it's our connection from wide to box.", metric: "Mitoma 1v1: 68% won | Cut-back SOT: 28%", severity: "discovery" },
  { title: "Set pieces are our largest fixable gap", body: "We scored 11 set piece goals; the PL average was 14. Conversion of set-piece shots on target sits at 18% vs the league average of 23%. The data suggests 4-5 additional goals per season are available with structured routine work.", metric: "Gap: 3 goals + 5pp conversion", severity: "opportunity" },
  { title: "We win the ball well but attack the spill slowly", body: "We recover 47 possessions per match (above average). Our average time from recovery to first shot is 14.2 seconds — 2.7 seconds slower than the top 6 average. We're set up to recover but not yet to capitalise.", metric: "Recovery time gap: 2.7s vs top 6", severity: "opportunity" }
];

// ============ INTERACTIVE PITCH DATA (Brighton-specific) ============
const zoneData = {
  build_success: {
    label: "Build-up success by starting zone",
    bands: {
      offensive:    { success: 22.4, count: 198, color: "#FF9D3D" },
      preOffensive: { success: 37.4, count: 842, color: SCOUTS.green },
      preDefensive: { success: 24.7, count: 1182, color: "#FF9D3D" },
      defensive:    { success: 21.3, count: 487, color: "#FF9D3D" }
    }
  },
  loss_rate: {
    label: "Possession loss rate by zone of loss",
    bands: {
      offensive:    { success: null, count: null, color: "#555", note: "Final third — see FOA view" },
      preOffensive: { success: 38.6, count: 1402, color: SCOUTS.green },
      preDefensive: { success: 15.2, count: 728, color: "#FF6B35" },
      defensive:    { success: 8.1, count: 142, color: "#FF3D5A" }
    }
  },
  foa_corridor: {
    label: "Final third success by corridor",
    corridors: {
      left:    { success: 21.4, count: 412, color: "#FFD700" },
      central: { success: 31.2, count: 224, color: SCOUTS.green },
      right:   { success: 24.6, count: 396, color: "#FFD700" }
    }
  }
};

// ============ CHART DATA ============
const xgVsActual = [
  { mw: 30, xg: 1.4, goals: 1 }, { mw: 31, xg: 1.8, goals: 0 }, { mw: 32, xg: 2.1, goals: 2 },
  { mw: 33, xg: 1.5, goals: 1 }, { mw: 34, xg: 2.3, goals: 4 }, { mw: 35, xg: 1.9, goals: 1 },
  { mw: 36, xg: 1.7, goals: 2 }, { mw: 37, xg: 1.6, goals: 3 }, { mw: 38, xg: 1.4, goals: 0 }
];

const playerRadar = [
  { metric: "Build-up", bha: 78, pl: 60 },
  { metric: "Mid-3rd Control", bha: 72, pl: 58 },
  { metric: "Wide Creation", bha: 82, pl: 56 },
  { metric: "Finishing", bha: 48, pl: 60 },
  { metric: "Set Pieces", bha: 42, pl: 56 },
  { metric: "Counter-Press", bha: 68, pl: 60 }
];

const zoneGap = [
  { zone: "Defensive 3rd", bha: 21.3, pl: 17.5 },
  { zone: "Mid 3rd", bha: 24.7, pl: 19.3 },
  { zone: "Final 3rd Build", bha: 37.4, pl: 34.8 },
  { zone: "Attacking 3rd", bha: 31.2, pl: 34.3 }
];

const setPieceComparison = [
  { team: "Arsenal", goals: 22 }, { team: "Liverpool", goals: 19 },
  { team: "Top 6 avg", goals: 17 }, { team: "PL avg", goals: 14 },
  { team: "Us", goals: 11, highlight: true }, { team: "Bot 6 avg", goals: 10 }
];

const priorityColors = { "Critical": "#FF3D5A", "High": "#FF9D3D", "Medium": "#FFD700", "Diagnostic": "#A8C5FF" };

const severityStyles = {
  "decisive":    { bg: "#3D0F1A", border: "#FF3D5A", text: "#FF3D5A", label: "DECISIVE" },
  "discovery":   { bg: "#00306B", border: BHA.blueLight, text: BHA.blueLight, label: "DISCOVERY" },
  "myth-buster": { bg: "#2D1F00", border: "#FFD700", text: "#FFD700", label: "MYTH-BUSTER" },
  "opportunity": { bg: "#0F2D1A", border: SCOUTS.green, text: SCOUTS.green, label: "OPPORTUNITY" }
};

// =================================================================
// COMPONENTS
// =================================================================

function ScoutsBrand({ small = false }) {
  const scale = small ? 0.85 : 1;
  const padX = small ? 8 : 11;
  const padY = small ? 4 : 6;

  // Bracket dimensions
  const bw = small ? 22 : 28;  // bracket width
  const bh = small ? 11 : 14;  // bracket height

  return (
    <div className="relative inline-flex items-center" style={{
      padding: `${padY + 4}px ${padX + 6}px`,
      filter: `drop-shadow(0 0 6px ${SCOUTS.green}55)`
    }}>
      {/* Top-left double bracket (matches the reference image) */}
      <svg
        className="absolute pointer-events-none"
        width={bw} height={bh}
        viewBox={`0 0 ${bw} ${bh}`}
        style={{ top: 0, left: 0 }}
      >
        {/* Outer bracket */}
        <path d={`M ${bw - 1},1 L 6,1 L 1,${bh - 1}`} stroke={SCOUTS.greenDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Inner offset bracket */}
        <path d={`M ${bw - 1},${bh * 0.45} L ${bw * 0.45},${bh * 0.45} L ${bw * 0.3},${bh - 1}`} stroke={SCOUTS.greenDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Bottom-right double bracket */}
      <svg
        className="absolute pointer-events-none"
        width={bw} height={bh}
        viewBox={`0 0 ${bw} ${bh}`}
        style={{ bottom: 0, right: 0 }}
      >
        {/* Outer bracket */}
        <path d={`M 1,${bh - 1} L ${bw - 6},${bh - 1} L ${bw - 1},1`} stroke={SCOUTS.greenDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Inner offset bracket */}
        <path d={`M 1,${bh * 0.55} L ${bw * 0.55},${bh * 0.55} L ${bw * 0.7},1`} stroke={SCOUTS.greenDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Brand content */}
      <div className="flex items-center gap-2 relative">
        {/* Text block */}
        <div className="flex flex-col items-start leading-none">
          <span style={{
            color: SCOUTS.green,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: small ? 7 : 9,
            opacity: 0.85,
            marginBottom: 1,
            textShadow: `0 0 4px ${SCOUTS.green}66`
          }}>
            Powered by...
          </span>
          <span style={{
            color: SCOUTS.green,
            fontFamily: "'Georgia', serif",
            fontWeight: 900,
            fontSize: small ? 10 : 12,
            letterSpacing: "0.06em",
            textShadow: `0 0 6px ${SCOUTS.green}, 0 0 12px ${SCOUTS.green}AA, 0 0 18px ${SCOUTS.green}55, 0 0 30px ${SCOUTS.green}33`
          }}>
            SCOUTSPLAYBOOK
          </span>
        </div>

        {/* Mini football pitch icon */}
        <svg
          width={small ? 18 : 22}
          height={small ? 12 : 15}
          viewBox="0 0 30 20"
          style={{ filter: `drop-shadow(0 0 4px ${SCOUTS.green}AA)`, flexShrink: 0 }}
        >
          {/* Pitch outline */}
          <rect x="1" y="1" width="28" height="18" stroke={SCOUTS.greenDark} strokeWidth="1.2" fill="none" />
          {/* Halfway line */}
          <line x1="15" y1="1" x2="15" y2="19" stroke={SCOUTS.greenDark} strokeWidth="1" />
          {/* Center circle */}
          <circle cx="15" cy="10" r="2.8" stroke={SCOUTS.greenDark} strokeWidth="1" fill="none" />
          {/* Center spot */}
          <circle cx="15" cy="10" r="0.5" fill={SCOUTS.greenDark} />
          {/* Left penalty area */}
          <rect x="1" y="5" width="5" height="10" stroke={SCOUTS.greenDark} strokeWidth="1" fill="none" />
          <rect x="1" y="7.5" width="2" height="5" stroke={SCOUTS.greenDark} strokeWidth="1" fill="none" />
          {/* Right penalty area */}
          <rect x="24" y="5" width="5" height="10" stroke={SCOUTS.greenDark} strokeWidth="1" fill="none" />
          <rect x="27" y="7.5" width="2" height="5" stroke={SCOUTS.greenDark} strokeWidth="1" fill="none" />
        </svg>

        {/* Live LED indicator */}
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <div
            className="rounded-full"
            style={{
              width: small ? 5 : 6,
              height: small ? 5 : 6,
              background: SCOUTS.green,
              animation: "scoutsLedBlink 1.4s ease-in-out infinite",
              boxShadow: `0 0 4px ${SCOUTS.green}, 0 0 8px ${SCOUTS.green}AA`
            }}
          />
          <span style={{
            fontSize: small ? 7 : 8,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: SCOUTS.green,
            textShadow: `0 0 4px ${SCOUTS.green}66`
          }}>
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
}

function BHACrest({ size = 22 }) {
  return (
    <div className="inline-flex items-center justify-center rounded-full" style={{
      width: size, height: size,
      background: BHA.blue,
      border: `2px solid ${BHA.white}`,
      boxShadow: `0 0 16px ${BHA.blueGlow}`
    }}>
      <span className="font-black text-white" style={{ fontSize: size * 0.4, letterSpacing: "-0.05em" }}>BHA</span>
    </div>
  );
}

function Bracket({ side = "left", color = BHA.blueLight }) {
  return (
    <svg width="18" height="36" viewBox="0 0 18 36" fill="none" style={{ display: "inline-block" }}>
      {side === "left" ? (
        <path d="M16 2 L4 6 L4 30 L16 34" stroke={color} strokeWidth="2.5" fill="none" />
      ) : (
        <path d="M2 2 L14 6 L14 30 L2 34" stroke={color} strokeWidth="2.5" fill="none" />
      )}
    </svg>
  );
}

// ============ PITCH SVG (reused) ============
function PitchSVG({ players = [], highlightZones = [], highlightColor = SCOUTS.green, width = 240, height = 300, compact = false }) {
  const W = width, H = height;
  const PX = 12, PY = 12;
  const fieldW = W - 2 * PX, fieldH = H - 2 * PY;
  const colW = fieldW / 3;
  const rowH = fieldH / 4;

  const zones = [
    { id: "LO", col: 0, row: 0 }, { id: "CO", col: 1, row: 0 }, { id: "RO", col: 2, row: 0 },
    { id: "LPO", col: 0, row: 1 }, { id: "CPO", col: 1, row: 1 }, { id: "RPO", col: 2, row: 1 },
    { id: "LPD", col: 0, row: 2 }, { id: "CPD", col: 1, row: 2 }, { id: "RPD", col: 2, row: 2 },
    { id: "LD", col: 0, row: 3 }, { id: "CD", col: 1, row: 3 }, { id: "RD", col: 2, row: 3 }
  ];

  const teamColors = {
    att: { fill: "#FFD500", stroke: "#1a1a1a", text: "#1a1a1a" },
    def: { fill: "#E63946", stroke: "#1a1a1a", text: "#fff" },
    neu: { fill: "#3A86FF", stroke: "#fff", text: "#fff" },
    gk:  { fill: "#1a1a1a", stroke: "#fff", text: "#fff" }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ borderRadius: 6 }}>
      <defs>
        <pattern id="grassPattern" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="40" fill="#1A4D2E" />
          <rect width="20" height="20" fill="#226B3A" opacity="0.4" />
        </pattern>
      </defs>
      <rect x={PX} y={PY} width={fieldW} height={fieldH} fill="url(#grassPattern)" stroke="#fff" strokeWidth="1.5" rx="2" />
      {zones.filter(z => highlightZones.includes(z.id)).map(z => (
        <rect key={z.id} x={PX + z.col * colW} y={PY + z.row * rowH} width={colW} height={rowH} fill={highlightColor} opacity="0.28" />
      ))}
      {[1, 2, 3].map(i => (
        <line key={`h${i}`} x1={PX} y1={PY + i * rowH} x2={PX + fieldW} y2={PY + i * rowH} stroke="#fff" strokeOpacity="0.15" strokeDasharray="2 3" />
      ))}
      {[1, 2].map(i => (
        <line key={`v${i}`} x1={PX + i * colW} y1={PY} x2={PX + i * colW} y2={PY + fieldH} stroke="#fff" strokeOpacity="0.15" strokeDasharray="2 3" />
      ))}
      <line x1={PX} y1={PY + fieldH / 2} x2={PX + fieldW} y2={PY + fieldH / 2} stroke="#fff" strokeWidth="1.2" strokeOpacity="0.9" />
      <circle cx={PX + fieldW / 2} cy={PY + fieldH / 2} r={Math.min(colW, rowH) * 0.35} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
      <rect x={PX + fieldW * 0.22} y={PY} width={fieldW * 0.56} height={fieldH * 0.13} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
      <rect x={PX + fieldW * 0.22} y={PY + fieldH * 0.87} width={fieldW * 0.56} height={fieldH * 0.13} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
      <rect x={PX + fieldW * 0.42} y={PY - 3} width={fieldW * 0.16} height="3" fill="#fff" />
      <rect x={PX + fieldW * 0.42} y={PY + fieldH} width={fieldW * 0.16} height="3" fill="#fff" />
      {!compact && zones.map(z => (
        <text key={`label-${z.id}`} x={PX + z.col * colW + colW / 2} y={PY + z.row * rowH + 11} fill="#fff" opacity="0.32" fontSize="7" textAnchor="middle" fontFamily="monospace">
          {z.id}
        </text>
      ))}
      {players.map((p, idx) => {
        const c = teamColors[p.team] || teamColors.att;
        const cx = PX + (p.x / 100) * fieldW;
        const cy = PY + (p.y / 100) * fieldH;
        const r = p.team === "gk" ? 7 : 8;
        return (
          <g key={idx}>
            {p.team === "att" && <circle cx={cx} cy={cy} r={r + 4} fill={SCOUTS.green} opacity="0.25" />}
            <circle cx={cx} cy={cy} r={r} fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
            <text x={cx} y={cy + 3} fill={c.text} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{p.num}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ============ TEAM POSITION PITCH (NEW) ============
function TeamPositionPitch({ players = [] }) {
  // Legacy entry point — now routes through MorphingFormationPitch
  // The `players` prop is no longer used here; we use the formations data instead.
  return <MorphingFormationPitch />;
}

function MorphingFormationPitch() {
  // Phase index: 0=Our IP, 1=Our OOP, 2=Our IP vs Their OOP, 3=Our OOP vs Their IP
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // The 4 phases of the cycle
  const phases = [
    {
      key: "us-ip",
      ourFormation: "inPossession",
      theirFormation: null,
      label: "Phase 1 · We attack",
      shortLabel: "1: Us · Attack",
      narrative: "Our 3-2-5 attacking shape, viewed alone. The starting picture for the buildup."
    },
    {
      key: "us-oop",
      ourFormation: "outPossession",
      theirFormation: null,
      label: "Phase 2 · We defend",
      shortLabel: "2: Us · Defend",
      narrative: "Our 4-4-2 compact mid-block, viewed alone. The shape we recover into when we lose the ball."
    },
    {
      key: "interaction-attack",
      ourFormation: "inPossessionVsBlock",
      theirFormation: "outPossession",
      label: "Phase 3 · We attack vs their block",
      shortLabel: "3: vs Their Block",
      narrative: "Our 3-2-5 against Newcastle's predicted 4-3-3 mid-block. The front line stays disciplined — level with their back four, never offside. Wieffer drops between CBs to overload their first defensive line."
    },
    {
      key: "interaction-defend",
      ourFormation: "outPossession",
      theirFormation: "inPossession",
      label: "Phase 4 · We defend vs their attack",
      shortLabel: "4: vs Their Press",
      narrative: "Our 4-4-2 against Newcastle's 2-3-5 attacking shape. Their full-backs push high — our wingers must track them on the way back. Welbeck and Hinshelwood squeeze their CBs."
    }
  ];

  const phase = phases[phaseIdx];
  const ourFormation = formations[phase.ourFormation];
  const theirFormation = phase.theirFormation ? opponentFormations[phase.theirFormation] : null;

  // Auto-cycle every 4.5 seconds when not paused
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setPhaseIdx(p => (p + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  // Pitch geometry
  const aspectRatio = 280 / 380;
  const PX_PCT = 16 / 280 * 100;
  const PY_PCT = 16 / 380 * 100;

  const getOurPos = (num) => ourFormation.players.find(p => p.num === num) || startingXI.find(p => p.num === num);
  const getTheirPos = (id) => theirFormation ? theirFormation.players.find(p => p.id === id) : null;

  const pickPhase = (idx) => {
    setPhaseIdx(idx);
    setPaused(true);
  };

  // Color logic per phase (our team always colored, theirs always black)
  const ourColor = phase.ourFormation === "inPossession" ? SCOUTS.green : "#FF6B35";

  return (
    <div className="w-full">
      {/* Next-opponent banner */}
      <div className="mb-3 p-2.5 rounded-lg border flex items-center gap-2.5" style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.12)"
      }}>
        <div className="rounded-md flex-shrink-0 flex items-center justify-center font-black" style={{
          width: 30, height: 30,
          background: "#000",
          border: "1.5px solid #444",
          color: "#fff",
          fontSize: 10
        }}>
          {nextOpponent.short}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-widest font-mono text-white/40">Next match</div>
          <div className="text-xs font-bold text-white truncate">vs {nextOpponent.name}</div>
          <div className="text-[9px] text-white/40 truncate">{nextOpponent.venue} · {nextOpponent.shape} · {nextOpponent.manager}</div>
        </div>
      </div>

      {/* Phase selector — 4 small buttons, 2×2 grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 rounded-lg bg-white/[0.04] border border-white/10">
        {phases.map((ph, idx) => {
          const isActive = phaseIdx === idx;
          const isInteraction = ph.theirFormation !== null;
          const baseColor = ph.ourFormation === "inPossession" ? SCOUTS.green : "#FF6B35";
          return (
            <button
              key={ph.key}
              onClick={() => pickPhase(idx)}
              className="py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? baseColor + "22" : "transparent",
                color: isActive ? baseColor : "rgba(255,255,255,0.4)",
                border: `1px solid ${isActive ? baseColor + "55" : "transparent"}`
              }}
            >
              <div className="flex items-center justify-center gap-1">
                {isActive && !paused && (
                  <span className="inline-block w-1 h-1 rounded-full" style={{
                    background: baseColor,
                    animation: "morphPulse 1.2s ease-in-out infinite"
                  }} />
                )}
                <span className="truncate">{ph.shortLabel}</span>
                {isInteraction && <span className="opacity-60">⊗</span>}
              </div>
            </button>
          );
        })}
        {paused && (
          <button
            onClick={() => setPaused(false)}
            className="col-span-2 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all mt-0.5"
            style={{
              background: BHA.blueLight + "15",
              color: BHA.blueLight,
              border: `1px solid ${BHA.blueLight}44`
            }}
          >
            ↻ Resume Auto-cycle
          </button>
        )}
      </div>

      {/* Pitch container with absolute-positioned, animated player markers */}
      <div className="relative w-full" style={{ aspectRatio: `${aspectRatio}`, maxWidth: 360, margin: "0 auto" }}>
        {/* SVG pitch markings */}
        <svg viewBox="0 0 280 380" className="absolute inset-0 w-full h-full" style={{ borderRadius: 6 }}>
          <defs>
            <pattern id="grassPatternBHA2" x="0" y="0" width="24" height="48" patternUnits="userSpaceOnUse">
              <rect width="24" height="48" fill="#142E1E" />
              <rect width="24" height="24" fill="#1B3D2A" opacity="0.6" />
            </pattern>
          </defs>
          <rect x="16" y="16" width="248" height="348" fill="url(#grassPatternBHA2)" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" rx="2" />
          <line x1="16" y1="190" x2="264" y2="190" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="140" cy="190" r="32" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="60.6" y="16" width="158.7" height="55.7" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="95.4" y="16" width="89.3" height="24.4" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="60.6" y="308.3" width="158.7" height="55.7" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="95.4" y="339.6" width="89.3" height="24.4" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
          <text x="140" y="11" fill={SCOUTS.green} fontSize="8" fontWeight="bold" textAnchor="middle">▲ ATTACK</text>
        </svg>

        {/* Opposition dummy circles (always rendered, opacity controlled by phase) */}
        {/* These are rendered FIRST so they sit behind our players */}
        {["O-GK", "O-CB1", "O-CB2", "O-LB", "O-RB", "O-DM", "O-CM1", "O-CM2", "O-LW", "O-RW", "O-ST"].map(id => {
          // Default position when opponent not shown: park them off-pitch (subtle)
          // Use last shown formation as fallback for smooth transitions
          const pos = theirFormation
            ? getTheirPos(id)
            : (opponentFormations.outPossession.players.find(p => p.id === id)); // park position
          if (!pos) return null;
          const leftPct = PX_PCT + (pos.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (pos.y / 100) * (100 - 2 * PY_PCT);
          const visible = theirFormation !== null;
          return (
            <div
              key={id}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1300ms cubic-bezier(0.45, 0, 0.15, 1), top 1300ms cubic-bezier(0.45, 0, 0.15, 1), opacity 700ms ease",
                opacity: visible ? 1 : 0,
                pointerEvents: "none"
              }}
            >
              {/* Black dummy circle */}
              <div
                className="rounded-full"
                style={{
                  width: 16, height: 16,
                  background: "#0a0a0a",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.7)"
                }}
              />
            </div>
          );
        })}

        {/* Our team players — rendered SECOND so they sit on top */}
        {[18, 22, 13, 11, 27, 17, 29, 5, 6, 34, 1].map(num => {
          const p = getOurPos(num);
          if (!p) return null;
          const leftPct = PX_PCT + (p.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (p.y / 100) * (100 - 2 * PY_PCT);
          const isGK = num === 1;
          return (
            <div
              key={num}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1300ms cubic-bezier(0.45, 0, 0.15, 1), top 1300ms cubic-bezier(0.45, 0, 0.15, 1)",
                pointerEvents: "none",
                zIndex: 2
              }}
            >
              {/* Heat halo */}
              <div className="absolute rounded-full" style={{
                width: 56, height: 56,
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${ourColor}44 0%, ${ourColor}11 50%, transparent 75%)`,
                transition: "background 1100ms ease"
              }} />
              {/* Player dot */}
              <div
                className="relative flex items-center justify-center rounded-full font-black"
                style={{
                  width: 24, height: 24,
                  background: isGK ? "#FFD700" : BHA.blue,
                  color: isGK ? "#000" : "#fff",
                  border: "2px solid #fff",
                  fontSize: 10,
                  boxShadow: `0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px ${ourColor}55`,
                  transition: "box-shadow 1100ms ease"
                }}
              >
                {num}
              </div>
              {/* Player name */}
              <div className="text-center mt-0.5 font-bold whitespace-nowrap" style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.85)",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                letterSpacing: "0.02em"
              }}>
                {p.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase description card */}
      <div className="mt-3 p-3 rounded-lg border" style={{
        borderColor: ourColor + "44",
        background: ourColor + "0A",
        transition: "border-color 800ms ease, background 800ms ease"
      }}>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="font-mono font-black text-[11px] uppercase tracking-widest" style={{ color: ourColor }}>
            {phase.label}
          </div>
          {phase.theirFormation && (
            <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
              background: "rgba(0,0,0,0.4)",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              vs {nextOpponent.short}
            </div>
          )}
          <div className="text-[10px] font-mono text-white/40">·</div>
          <div className="font-mono font-bold text-[10px] text-white/70">{ourFormation.shape}</div>
          {phase.theirFormation && (
            <>
              <div className="text-[10px] font-mono text-white/40">vs</div>
              <div className="font-mono font-bold text-[10px] text-white/55">{theirFormation.shape}</div>
            </>
          )}
        </div>
        <p className="text-[11px] text-white/65 leading-relaxed italic">
          {phase.narrative}
        </p>
      </div>

      {/* Footnote */}
      <p className="text-[9px] text-white/30 italic text-center mt-2">
        {paused
          ? "Paused — tap '↻ Resume' to restart the 4-phase cycle"
          : `Cycling through 4 phases · ${nextOpponent.short} shown as ${"○".repeat(3)} dummy markers in phases 3 & 4`}
      </p>
    </div>
  );
}

// ============ INTERACTIVE PITCH ============
function InteractivePitch() {
  const [mode, setMode] = useState("build_success");
  const [selected, setSelected] = useState(null);

  const W = 280, H = 360, PX = 16, PY = 16;
  const fieldW = W - 2 * PX, fieldH = H - 2 * PY;
  const colW = fieldW / 3;
  const rowH = fieldH / 4;

  const data = zoneData[mode];

  const getZoneData = (col, row) => {
    if (mode === "foa_corridor") {
      if (row !== 0) return null;
      const corridors = ["left", "central", "right"];
      return { ...data.corridors[corridors[col]], label: `${corridors[col].toUpperCase()} corridor` };
    }
    const bandKeys = ["offensive", "preOffensive", "preDefensive", "defensive"];
    const bandLabels = ["Final third", "Pre-offensive (mid 3rd opp)", "Pre-defensive (mid 3rd own)", "Defensive third"];
    const band = data.bands[bandKeys[row]];
    return { ...band, label: bandLabels[row] };
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white">Our Pitch Zone Performance</h3>
        <p className="text-[10px] text-white/40 mt-0.5">Tap a zone to inspect the data from our recent matches.</p>
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-md bg-black/30">
        {[
          { id: "build_success", label: "Build-Up Success" },
          { id: "loss_rate", label: "Loss Rate" },
          { id: "foa_corridor", label: "Final 3rd Corridor" }
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setSelected(null); }} className="flex-1 py-1.5 text-[10px] font-bold rounded transition-all" style={{
            background: mode === m.id ? BHA.blueLight + "22" : "transparent",
            color: mode === m.id ? BHA.blueLight : "rgba(255,255,255,0.5)",
            border: `1px solid ${mode === m.id ? BHA.blueLight + "55" : "transparent"}`
          }}>
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/50 mb-3 italic">{data.label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
        <div className="sm:col-span-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ borderRadius: 6 }}>
            <rect x={PX} y={PY} width={fieldW} height={fieldH} fill="#0F3520" stroke="#fff" strokeWidth="1.5" rx="2" />
            {[0, 1, 2, 3].map(row =>
              [0, 1, 2].map(col => {
                const zd = getZoneData(col, row);
                const fill = zd && zd.color ? zd.color : "#555";
                const opacity = zd && zd.success !== null ? 0.5 : 0.1;
                const isSelected = selected && selected.col === col && selected.row === row;
                return (
                  <g key={`${row}-${col}`} onClick={() => setSelected({ ...zd, col, row })} style={{ cursor: "pointer" }}>
                    <rect x={PX + col * colW} y={PY + row * rowH} width={colW} height={rowH} fill={fill} opacity={isSelected ? 0.8 : opacity} stroke={isSelected ? BHA.blueLight : "transparent"} strokeWidth="2" />
                    {zd && zd.success !== null && (
                      <>
                        <text x={PX + col * colW + colW / 2} y={PY + row * rowH + rowH / 2 - 4} fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">{zd.success}%</text>
                        <text x={PX + col * colW + colW / 2} y={PY + row * rowH + rowH / 2 + 9} fill="#fff" opacity="0.7" fontSize="8" textAnchor="middle">n={zd.count}</text>
                      </>
                    )}
                  </g>
                );
              })
            )}
            <line x1={PX} y1={PY + fieldH / 2} x2={PX + fieldW} y2={PY + fieldH / 2} stroke="#fff" strokeWidth="1.2" />
            <circle cx={PX + fieldW / 2} cy={PY + fieldH / 2} r={Math.min(colW, rowH) * 0.32} fill="none" stroke="#fff" strokeWidth="1.2" />
            <rect x={PX + fieldW * 0.22} y={PY} width={fieldW * 0.56} height={fieldH * 0.12} fill="none" stroke="#fff" strokeWidth="1" />
            <rect x={PX + fieldW * 0.22} y={PY + fieldH * 0.88} width={fieldW * 0.56} height={fieldH * 0.12} fill="none" stroke="#fff" strokeWidth="1" />
            <text x={W / 2} y={10} fill={BHA.blueLight} fontSize="9" fontWeight="bold" textAnchor="middle">▲ ATTACK</text>
          </svg>
        </div>

        <div className="sm:col-span-2 space-y-2">
          {selected ? (
            <div className="rounded-md border border-white/15 bg-black/40 p-3 space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Selected</div>
              <div className="text-sm font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>{selected.label}</div>
              {selected.success !== null ? (
                <>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black" style={{ color: BHA.blueLight }}>{selected.success}%</span>
                    <span className="text-[10px] text-white/40">success rate</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{selected.count}</span>
                    <span className="text-[10px] text-white/40">total moves (season)</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-white/50 italic">{selected.note || "No data in this view."}</div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-center">
              <div className="text-[10px] text-white/40 italic">Tap any zone on the pitch</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TRAINING TAB WRAPPER (sub-tabs: Weekly Plan / Zone Focus) ============
function TrainingTab() {
  const [subTab, setSubTab] = useState("week"); // "week" | "zones"

  return (
    <div>
      {/* Sub-tab strip */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-white/[0.04] border border-white/10">
        <button
          onClick={() => setSubTab("week")}
          className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider"
          style={{
            background: subTab === "week" ? BHA.blueLight + "22" : "transparent",
            color: subTab === "week" ? BHA.blueLight : "rgba(255,255,255,0.45)",
            border: `1px solid ${subTab === "week" ? BHA.blueLight + "55" : "transparent"}`
          }}
        >
          📅 Weekly Plan
        </button>
        <button
          onClick={() => setSubTab("zones")}
          className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider"
          style={{
            background: subTab === "zones" ? SCOUTS.green + "22" : "transparent",
            color: subTab === "zones" ? SCOUTS.green : "rgba(255,255,255,0.45)",
            border: `1px solid ${subTab === "zones" ? SCOUTS.green + "55" : "transparent"}`
          }}
        >
          🎯 Zone Focus
        </button>
      </div>

      {/* Sub-tab content */}
      {subTab === "week" && <WeeklyPlan />}

      {subTab === "zones" && (
        <div>
          <div className="space-y-4">
            {trainingFocusZones.map(z => <ZoneCard key={z.id} zone={z} />)}
          </div>
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: BHA.blueLight + "33", background: BHA.blue + "08" }}>
            <div className="text-[10px] uppercase tracking-widest mb-2 font-mono" style={{ color: BHA.blueLight }}>How to use this page</div>
            <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
              <li><span style={{ color: BHA.blueLight }}>1.</span> Pick the zone we want to develop this week.</li>
              <li><span style={{ color: BHA.blueLight }}>2.</span> Read what recent games show about our performance there.</li>
              <li><span style={{ color: BHA.blueLight }}>3.</span> Choose one of the four training focus types as your design starting point.</li>
              <li><span style={{ color: BHA.blueLight }}>4.</span> Jump to the <strong>SSGs</strong> tab using the linked codes for fully-built sessions.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ WEEKLY TRAINING PLAN (Mon-Sun match-week cycle) ============
function WeeklyPlan() {
  const [activeDay, setActiveDay] = useState("Monday");
  const day = trainingWeek.find(d => d.day === activeDay) || trainingWeek[0];

  // Intensity bar visualisation
  const renderIntensityBar = (level) => {
    const segments = [1, 2, 3, 4, 5];
    const colors = ["#444", "#FFD700", "#FFA500", "#FF6B35", "#FF3D5A"];
    return (
      <div className="flex gap-0.5">
        {segments.map((s, i) => (
          <div
            key={i}
            className="rounded-sm transition-all"
            style={{
              width: 14, height: 6,
              background: i < level ? colors[level - 1] : "rgba(255,255,255,0.08)",
              boxShadow: i < level ? `0 0 4px ${colors[level - 1]}66` : "none"
            }}
          />
        ))}
      </div>
    );
  };

  // Day-type styling (training / match / rest)
  const typeStyle = {
    training: { color: BHA.blueLight, bg: "rgba(74,158,255,0.08)", borderColor: BHA.blueLight + "44", label: "TRAINING" },
    match:    { color: SCOUTS.green,  bg: "rgba(31,212,62,0.08)",  borderColor: SCOUTS.green + "55",  label: "TRAINING GAME" },
    rest:     { color: "#A0A0A0",     bg: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", label: "REST / RECOVERY" }
  };
  const typeS = typeStyle[day.type];

  return (
    <div className="space-y-4">
      {/* Day selector — horizontal scrollable row */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/10 overflow-x-auto">
        {trainingWeek.map(d => {
          const isMatch = d.type === "match";
          const isRest = d.type === "rest";
          const isActive = d.day === activeDay;
          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className="flex-1 min-w-[44px] py-2 px-1 rounded transition-all"
              style={{
                background: isActive ? (isMatch ? SCOUTS.green + "22" : isRest ? "rgba(255,255,255,0.08)" : BHA.blueLight + "22") : "transparent",
                color: isActive ? (isMatch ? SCOUTS.green : isRest ? "#fff" : BHA.blueLight) : "rgba(255,255,255,0.45)",
                border: `1px solid ${isActive ? (isMatch ? SCOUTS.green + "55" : isRest ? "rgba(255,255,255,0.2)" : BHA.blueLight + "55") : "transparent"}`
              }}
            >
              <div className="text-[9px] font-mono font-bold tracking-wider">{d.short}</div>
              {isMatch && <div className="text-[8px] mt-0.5" style={{ color: isActive ? SCOUTS.green : SCOUTS.green + "AA" }}>🏆</div>}
            </button>
          );
        })}
      </div>

      {/* Day card */}
      <div className="rounded-lg border p-4" style={{
        borderColor: typeS.borderColor,
        background: typeS.bg
      }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b" style={{ borderColor: typeS.borderColor }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{
                color: typeS.color,
                background: typeS.color + "1A",
                border: `1px solid ${typeS.color}33`
              }}>
                {typeS.label}
              </span>
              <span className="text-[10px] text-white/40 font-mono">{day.sub}</span>
            </div>
            <h3 className="text-base font-bold leading-tight" style={{ color: "#fff" }}>
              {day.day}
            </h3>
            <p className="text-xs mt-1 leading-snug" style={{ color: typeS.color }}>
              {day.title}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded p-2 bg-white/[0.04]">
            <div className="text-[8px] uppercase tracking-widest text-white/35 font-mono mb-1">Intensity</div>
            <div className="text-[10px] font-bold text-white mb-1">{day.intensity}</div>
            {renderIntensityBar(day.intensityLevel)}
          </div>
          <div className="rounded p-2 bg-white/[0.04]">
            <div className="text-[8px] uppercase tracking-widest text-white/35 font-mono mb-1">RPE</div>
            <div className="text-sm font-black text-white">{day.rpe}</div>
            <div className="text-[8px] text-white/35">/10</div>
          </div>
          <div className="rounded p-2 bg-white/[0.04]">
            <div className="text-[8px] uppercase tracking-widest text-white/35 font-mono mb-1">Duration</div>
            <div className="text-sm font-black text-white">{day.duration}</div>
            <div className="text-[8px] text-white/35">min</div>
          </div>
        </div>

        {/* Focus tags & linked SSGs */}
        {(day.focus.length > 0 || day.linkedSSGs.length > 0) && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {day.focus.map(f => (
              <span key={f} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
                color: SCOUTS.green,
                background: SCOUTS.green + "12",
                border: `1px solid ${SCOUTS.green}33`
              }}>
                {f}
              </span>
            ))}
            {day.linkedSSGs.map(s => (
              <span key={s} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
                color: BHA.blueLight,
                background: BHA.blueLight + "12",
                border: `1px solid ${BHA.blueLight}33`
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Session blocks — timeline */}
        <div className="space-y-2 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-2">Session Breakdown</div>
          {day.blocks.map((block, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              {/* Time marker */}
              <div className="flex-shrink-0 rounded flex items-center justify-center font-mono font-black" style={{
                width: 40, height: 32,
                background: typeS.color + "15",
                border: `1px solid ${typeS.color}33`,
                color: typeS.color,
                fontSize: 11
              }}>
                {block.time}'
              </div>
              {/* Block content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[11px] font-bold text-white mb-0.5">{block.title}</div>
                <div className="text-[10px] text-white/55 leading-relaxed">{block.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Coaching focus */}
        <div className="rounded p-3 mb-2" style={{ background: typeS.color + "0A", border: `1px solid ${typeS.color}22` }}>
          <div className="text-[9px] uppercase tracking-widest font-mono mb-1.5" style={{ color: typeS.color }}>
            Coaching Focus
          </div>
          <p className="text-[11px] text-white/75 leading-relaxed italic">
            {day.coaching}
          </p>
        </div>

        {/* Staff notes */}
        {day.notes && (
          <div className="text-[10px] text-white/45 leading-relaxed italic pl-2 border-l-2" style={{ borderColor: typeS.color + "55" }}>
            <strong className="text-white/65">Staff note:</strong> {day.notes}
          </div>
        )}
      </div>

      {/* Week overview footer */}
      <div className="mt-4 p-3 rounded-lg border" style={{ borderColor: BHA.blueLight + "33", background: BHA.blue + "08" }}>
        <div className="text-[10px] uppercase tracking-widest mb-2 font-mono" style={{ color: BHA.blueLight }}>
          Week structure
        </div>
        <p className="text-[11px] text-white/65 leading-relaxed">
          Designed as a match-week cycle with Saturday as the simulated match day. The training game replaces the fixture during off-weeks. Load progresses from <strong style={{ color: "#FF6B35" }}>Monday (highest)</strong> through midweek, tapering to a <strong style={{ color: "rgba(255,255,255,0.8)" }}>Friday light session</strong>, peaking again Saturday, then full recovery Sunday.
        </p>
      </div>
    </div>
  );
}

// ============ ZONE CARD (training focus) ============
function ZoneCard({ zone }) {
  const tierColors = {
    danger:       { primary: "#3D8EFF", bg: "rgba(61,142,255,0.06)", label: "DANGER ZONE" },
    moderate:     { primary: "#FFD700", bg: "rgba(255,215,0,0.05)",  label: "STRENGTH ZONE" },
    "high-value": { primary: "#FF8C00", bg: "rgba(255,140,0,0.06)",  label: "ELITE ZONE" },
    execution:    { primary: "#FF3D5A", bg: "rgba(255,61,90,0.06)",  label: "EXECUTION ZONE" }
  };
  const colors = tierColors[zone.tier];

  return (
    <div className="rounded-lg border overflow-hidden" style={{
      borderColor: colors.primary + "44",
      background: `linear-gradient(180deg, ${colors.bg} 0%, rgba(0,0,0,0.4) 100%)`
    }}>
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold" style={{ color: colors.primary }}>{zone.id}</span>
              <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded font-mono" style={{ background: colors.primary + "22", color: colors.primary, border: `1px solid ${colors.primary}44` }}>{colors.label}</span>
            </div>
            <h3 className="text-xl font-black text-white leading-none mb-1" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>{zone.label}</h3>
            <p className="text-[11px] italic text-white/50">{zone.label_sub}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4">
        <div className="sm:col-span-2">
          <PitchSVG players={[]} highlightZones={zone.zones_to_highlight} highlightColor={colors.primary} compact={false} />
        </div>
        <div className="sm:col-span-3">
          <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: colors.primary }}>What recent games show</div>
          <div className="space-y-1.5 mb-3">
            {zone.stats.map((s, i) => (
              <div key={i} className="flex items-baseline justify-between gap-2 text-xs border-b border-white/5 pb-1.5">
                <span className="text-white/60 leading-snug flex-1">{s.label}</span>
                <span className="font-mono font-bold text-white shrink-0">
                  {s.value}
                  {s.note && <span className="text-[9px] text-white/40 ml-1 italic">({s.note})</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/80 leading-relaxed italic" style={{ fontFamily: "'Georgia', serif" }}>{zone.plain_english}</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
          <span>Training focus for this zone</span>
          <span className="flex-1 h-px" style={{ background: colors.primary + "33" }} />
        </div>
        <div className="space-y-3">
          {zone.ssg_types.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[10px] font-mono font-bold shrink-0 pt-0.5" style={{ color: colors.primary }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white mb-0.5">{s.name}</div>
                <p className="text-[11px] text-white/65 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[11px] text-white/70 italic leading-relaxed mb-2">
          <span style={{ color: colors.primary }}>→ </span>{zone.why}
        </p>
        {zone.linked_ssgs && zone.linked_ssgs.length > 0 && (
          <div className="flex items-center gap-2 text-[9px] flex-wrap">
            <span className="text-white/40 uppercase tracking-widest font-mono">Build using:</span>
            {zone.linked_ssgs.map(id => (
              <span key={id} className="font-mono px-1.5 py-0.5 rounded font-bold" style={{ background: colors.primary + "22", color: colors.primary, border: `1px solid ${colors.primary}44` }}>{id}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SSG CARD ============
// ============ ANIMATED SSG PITCH (morphing between 3 phases — setup, action, outcome + ball) ============
// Computes "action" and "outcome" positions algorithmically based on player roles per SSG
function computeActionPositions(ssg, phase = "action") {
  // phase: "action" = mid-play, "outcome" = play completes (extends the motion further)
  const mult = phase === "outcome" ? 1.7 : 1.0;
  return ssg.players.map((p, i) => {
    let dx = 0, dy = 0;

    // Set Piece (SSG-07): all attackers converge on the box
    if (ssg.id === "SSG-07") {
      if (p.team === "att") {
        const targetX = 30 + (i * 12) % 50;
        const targetY = 14 + (i % 3) * 6;
        dx = (targetX - p.x) * 0.7;
        dy = (targetY - p.y) * 0.6;
      } else if (p.team === "def") {
        dx = (50 - p.x) * 0.25;
        dy = Math.max(0, 18 - p.y) * 0.4;
      }
    }
    else if (ssg.id === "SSG-08") {
      if (p.team === "att") {
        dy = -22;
        dx = (i % 2 === 0 ? -8 : 8);
      } else if (p.team === "def") {
        dy = -10;
        dx = (p.x < 50 ? -4 : 4);
      }
    }
    else if (ssg.id === "SSG-02") {
      if (p.team === "att") {
        dy = -28;
        dx = (i % 2 === 0 ? -3 : 3);
      } else if (p.team === "def") {
        dy = -8;
      }
    }
    else if (ssg.id === "SSG-03") {
      if (p.team === "att") {
        dy = -16;
        dx = p.x < 50 ? 12 : -12;
      } else if (p.team === "def") {
        dx = (50 - p.x) * 0.2;
        dy = -6;
      }
    }
    else {
      if (p.team === "att") {
        dy = -18;
        dx = (i % 2 === 0 ? -4 : 4);
      } else if (p.team === "def") {
        dy = -12;
        dx = 0;
      }
    }

    return {
      ...p,
      ax: Math.max(8, Math.min(92, p.x + dx * mult)),
      ay: Math.max(8, Math.min(95, p.y + dy * mult))
    };
  });
}

// Ball trajectory per SSG — 3 points (setup, action, outcome)
function ballPath(ssg) {
  const paths = {
    "SSG-01": [{ x: 50, y: 82 }, { x: 50, y: 50 }, { x: 50, y: 22 }],   // build-up through zones
    "SSG-02": [{ x: 50, y: 58 }, { x: 50, y: 35 }, { x: 50, y: 16 }],   // recovery to shot
    "SSG-03": [{ x: 18, y: 60 }, { x: 32, y: 32 }, { x: 50, y: 20 }],   // wide → cut-back → finish
    "SSG-04": [{ x: 22, y: 42 }, { x: 42, y: 25 }, { x: 50, y: 12 }],   // service → arrival → shot
    "SSG-05": [{ x: 32, y: 55 }, { x: 62, y: 45 }, { x: 50, y: 28 }],   // possession cycle
    "SSG-06": [{ x: 30, y: 55 }, { x: 50, y: 38 }, { x: 65, y: 22 }],   // 3-player combo
    "SSG-07": [{ x: 8,  y: 12 }, { x: 32, y: 18 }, { x: 50, y: 14 }],   // corner → flight → header
    "SSG-08": [{ x: 50, y: 78 }, { x: 50, y: 50 }, { x: 50, y: 26 }]    // CB carry forward
  };
  return paths[ssg.id] || [{ x: 50, y: 65 }, { x: 50, y: 45 }, { x: 50, y: 25 }];
}

function AnimatedSSGPitch({ ssg, highlightZones = [], highlightColor = SCOUTS.green, width = 240, height = 300 }) {
  const [phase, setPhase] = useState(0); // 0 = setup, 1 = action, 2 = outcome
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setPhase(p => (p + 1) % 3);
    }, 2400);
    return () => clearInterval(timer);
  }, [paused]);

  // Pre-compute positions for all 3 phases
  const playersAction = computeActionPositions(ssg, "action");
  const playersOutcome = computeActionPositions(ssg, "outcome");
  const balls = ballPath(ssg);
  const currentBall = balls[phase];

  // Pitch geometry
  const PX = 8, PY = 8;
  const fieldW = width - 2 * PX;
  const fieldH = height - 2 * PY;
  const PX_PCT = PX / width * 100;
  const PY_PCT = PY / height * 100;

  // Cyberpunk team colours
  const teamColor = {
    att: BHA.blueLight,
    def: "#FF6B35",
    neu: CYBER.amber
  };

  // Phase metadata
  const phaseInfo = [
    { label: "Setup",     color: BHA.blueLight, narrative: "Initial positions before the rep begins." },
    { label: "Action",    color: CYBER.cyan,    narrative: "Mid-play — players move, ball is in motion." },
    { label: "Outcome",   color: SCOUTS.green,  narrative: "Play completes — final positions reached." }
  ];
  const ph = phaseInfo[phase];

  // Get player position for current phase
  const getPos = (idx, phaseIdx) => {
    if (phaseIdx === 0) return ssg.players[idx];
    if (phaseIdx === 1) return { x: playersAction[idx].ax, y: playersAction[idx].ay };
    return { x: playersOutcome[idx].ax, y: playersOutcome[idx].ay };
  };

  return (
    <div className="w-full">
      {/* Phase indicator bar with all 3 stages */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          {phaseInfo.map((info, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span
                className="inline-block rounded-full"
                style={{
                  width: phase === idx ? 6 : 4,
                  height: phase === idx ? 6 : 4,
                  background: phase === idx ? info.color : "#444",
                  boxShadow: phase === idx ? `0 0 6px ${info.color}, 0 0 12px ${info.color}55` : "none",
                  animation: (phase === idx && !paused) ? "morphPulse 1.2s ease-in-out infinite" : "none",
                  transition: "all 300ms ease"
                }}
              />
              {phase === idx && (
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{
                  color: info.color,
                  textShadow: `0 0 4px ${info.color}88`
                }}>
                  {info.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setPaused(!paused)}
          className="text-[8px] font-mono uppercase tracking-wider text-white/40 hover:text-white transition-colors"
        >
          {paused ? "▶ Play" : "❚❚ Pause"}
        </button>
      </div>

      {/* Pitch container */}
      <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
        {/* SVG pitch background */}
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full" style={{ borderRadius: 4 }}>
          <defs>
            <pattern id={`ssgGrass-${ssg.id}`} x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
              <rect width="20" height="40" fill="#142E1E" />
              <rect width="20" height="20" fill="#1B3D2A" opacity="0.55" />
            </pattern>
          </defs>
          <rect x={PX} y={PY} width={fieldW} height={fieldH} fill={`url(#ssgGrass-${ssg.id})`} stroke="#fff" strokeOpacity="0.4" strokeWidth="1" rx="2" />
          <line x1={PX} y1={PY + fieldH / 2} x2={PX + fieldW} y2={PY + fieldH / 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <circle cx={PX + fieldW / 2} cy={PY + fieldH / 2} r="22" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <rect x={PX + fieldW * 0.22} y={PY} width={fieldW * 0.56} height={fieldH * 0.14} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <rect x={PX + fieldW * 0.22} y={PY + fieldH * 0.86} width={fieldW * 0.56} height={fieldH * 0.14} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <text x={width / 2} y="7" fill={SCOUTS.green} fontSize="6" fontWeight="bold" textAnchor="middle" opacity="0.7">▲</text>
        </svg>

        {/* Animated player markers */}
        {ssg.players.map((origP, idx) => {
          const pos = getPos(idx, phase);
          const leftPct = PX_PCT + (pos.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (pos.y / 100) * (100 - 2 * PY_PCT);
          const color = teamColor[origP.team] || "#fff";
          return (
            <div
              key={`${origP.team}-${idx}`}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1100ms cubic-bezier(0.45, 0, 0.15, 1), top 1100ms cubic-bezier(0.45, 0, 0.15, 1)",
                pointerEvents: "none",
                zIndex: origP.team === "att" ? 3 : origP.team === "def" ? 2 : 1
              }}
            >
              <div className="absolute rounded-full" style={{
                width: 28, height: 28,
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
              }} />
              <div
                className="relative flex items-center justify-center rounded-full font-black"
                style={{
                  width: 16, height: 16,
                  background: color,
                  color: origP.team === "neu" ? "#000" : "#fff",
                  border: "1.5px solid #fff",
                  fontSize: 8,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.7), 0 0 6px ${color}66`
                }}
              >
                {origP.num}
              </div>
            </div>
          );
        })}

        {/* Animated BALL */}
        {(() => {
          const leftPct = PX_PCT + (currentBall.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (currentBall.y / 100) * (100 - 2 * PY_PCT);
          return (
            <div
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1100ms cubic-bezier(0.55, 0, 0.45, 1), top 1100ms cubic-bezier(0.55, 0, 0.45, 1)",
                pointerEvents: "none",
                zIndex: 10
              }}
            >
              {/* Ball glow halo */}
              <div className="absolute rounded-full" style={{
                width: 22, height: 22,
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${CYBER.amber}AA 0%, ${CYBER.amber}33 40%, transparent 70%)`,
                animation: "morphPulse 0.9s ease-in-out infinite"
              }} />
              {/* Ball — white with black pentagon hint */}
              <div
                className="relative rounded-full"
                style={{
                  width: 10, height: 10,
                  background: "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 70%, #888 100%)",
                  border: `1.5px solid #000`,
                  boxShadow: `0 0 8px ${CYBER.amber}, 0 0 14px ${CYBER.amber}66, 0 1px 2px rgba(0,0,0,0.9)`
                }}
              />
            </div>
          );
        })()}
      </div>

      {/* Mini legend */}
      <div className="flex gap-2 mt-2 text-[8px] font-mono justify-center items-center">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: teamColor.att }} />ATTACK</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: teamColor.def }} />DEFEND</span>
        {ssg.players.some(p => p.team === "neu") && (
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: teamColor.neu }} />NEUTRAL</span>
        )}
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#fff", border: "1px solid #000" }} />
          <span style={{ color: CYBER.amber }}>BALL</span>
        </span>
      </div>
    </div>
  );
}

function SSGCard({ ssg }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border overflow-hidden" style={{
      borderColor: BHA.blueLight + "55",
      background: "linear-gradient(180deg, rgba(74,158,255,0.04) 0%, rgba(0,0,0,0.4) 100%)"
    }}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-white/10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold" style={{ color: BHA.blueLight }}>{ssg.id}</span>
            <div className="flex flex-wrap gap-1">
              {ssg.targets.map(t => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: BHA.blueLight + "44", color: BHA.blueLight, background: BHA.blueLight + "11" }}>{t}</span>
              ))}
            </div>
          </div>
          <h3 className="text-xl font-black text-white leading-none mb-1" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>{ssg.name}</h3>
          <p className="text-[11px] italic text-white/50">{ssg.subtitle}</p>
        </div>
        <Bracket side="right" color={BHA.blueLight} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4">
        <div className="sm:col-span-2"><AnimatedSSGPitch ssg={ssg} highlightZones={ssg.zones} /></div>
        <div className="sm:col-span-3 space-y-3">
          <div>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: BHA.blueLight }}>Key Concepts</div>
            <ul className="space-y-1.5">
              {ssg.coaching.map((c, i) => (
                <li key={i} className="text-[11px] text-white/80 leading-snug flex gap-2">
                  <span style={{ color: BHA.blueLight }}>—</span><span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-[9px]">
            <div><div className="text-white/40 uppercase tracking-widest mb-0.5">Pitch</div><div className="text-white/80 font-mono">{ssg.setup.pitch}</div></div>
            <div><div className="text-white/40 uppercase tracking-widest mb-0.5">Players</div><div className="text-white/80 font-mono">{ssg.setup.players}</div></div>
            <div><div className="text-white/40 uppercase tracking-widest mb-0.5">Duration</div><div className="text-white/80 font-mono">{ssg.setup.duration}</div></div>
          </div>
        </div>
      </div>
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-2 text-[10px] font-bold tracking-wider uppercase border-t border-white/10 hover:bg-white/[0.03] transition-colors" style={{ color: BHA.blueLight }}>
        {expanded ? "Hide Rules & Objectives ▲" : "Show Rules & Objectives ▼"}
      </button>
      {expanded && (
        <div className="border-t border-white/10 divide-y divide-white/10 text-xs">
          <div className="px-4 py-3">
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1.5 font-mono">Objective</div>
            <p className="text-white/75 leading-relaxed">{ssg.objective}</p>
          </div>
          <div className="px-4 py-3 bg-black/30">
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1.5 font-mono">Rules</div>
            <ol className="space-y-1.5">
              {ssg.rules.map((r, i) => (
                <li key={i} className="text-white/75 leading-snug flex gap-2">
                  <span className="text-white/30 font-mono shrink-0">{i + 1}.</span><span>{r}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="px-4 py-3">
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1.5 font-mono">Progressions</div>
            <p className="text-white/75 leading-relaxed italic">{ssg.progressions}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ KPI CARD ============
function KPICard({ kpi }) {
  const [expanded, setExpanded] = useState(false);
  const cat = kpiCategories[kpi.cat];
  return (
    <div onClick={() => setExpanded(!expanded)} className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden cursor-pointer transition-all hover:border-white/25">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-white/30 shrink-0">{kpi.id}</span>
            <h3 className="text-sm font-bold text-white leading-tight">{kpi.name}</h3>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 tracking-wider" style={{ background: priorityColors[kpi.priority] + "22", color: priorityColors[kpi.priority], border: `1px solid ${priorityColors[kpi.priority]}44` }}>{kpi.priority.toUpperCase()}</span>
        </div>
        <p className="text-xs text-white/50 leading-snug mb-3">{kpi.definition}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 rounded-full" style={{ background: cat.color }} />
            <span className="text-[10px] uppercase tracking-wider text-white/40">{cat.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-base font-mono font-bold" style={{ color: cat.color }}>{kpi.success}</span>
            <span className="text-[9px] text-white/40 ml-1">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/10 divide-y divide-white/10 text-xs">
          <div className="px-4 py-3 bg-black/30"><div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Formula</div><div className="font-mono text-white/80 text-[11px]">{kpi.formula}</div></div>
          <div className="px-4 py-3"><div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Why it matters</div><div className="text-white/70 leading-relaxed">{kpi.why}</div></div>
          <div className="px-4 py-3 bg-white/[0.02]"><div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Benchmark</div><div className="text-white/70">{kpi.benchmark}</div></div>
          <div className="px-4 py-3"><div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Target</div><div className="text-white/70">{kpi.target}</div></div>
          <div className="px-4 py-3 bg-white/[0.02]"><div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Training</div><div className="text-white/70 leading-relaxed">{kpi.training}</div></div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, footnote, height = 220 }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3"><h3 className="text-sm font-bold text-white">{title}</h3>{subtitle && <p className="text-[10px] text-white/40 mt-0.5">{subtitle}</p>}</div>
      <div style={{ width: "100%", height }}>{children}</div>
      {footnote && <p className="text-[10px] text-white/40 mt-3 italic leading-relaxed">{footnote}</p>}
    </div>
  );
}

// ============ ANIMATED PATTERN PITCH (choreographed combination plays, 3 phases + ball) ============
function AnimatedPatternPitch({ pattern, width = 240, height = 300 }) {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setPhase(p => (p + 1) % 3);
    }, 2600);
    return () => clearInterval(timer);
  }, [paused]);

  const PX = 8, PY = 8;
  const fieldW = width - 2 * PX;
  const fieldH = height - 2 * PY;
  const PX_PCT = PX / width * 100;
  const PY_PCT = PY / height * 100;

  const phaseColors = [BHA.blueLight, CYBER.cyan, SCOUTS.green];
  const currentBall = pattern.ball[phase];

  return (
    <div className="w-full">
      {/* Phase indicator — custom labels per pattern */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          {pattern.phaseLabels.map((lbl, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span
                className="inline-block rounded-full"
                style={{
                  width: phase === idx ? 6 : 4,
                  height: phase === idx ? 6 : 4,
                  background: phase === idx ? phaseColors[idx] : "#444",
                  boxShadow: phase === idx ? `0 0 6px ${phaseColors[idx]}, 0 0 12px ${phaseColors[idx]}55` : "none",
                  animation: (phase === idx && !paused) ? "morphPulse 1.2s ease-in-out infinite" : "none",
                  transition: "all 300ms ease"
                }}
              />
              {phase === idx && (
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{
                  color: phaseColors[idx],
                  textShadow: `0 0 4px ${phaseColors[idx]}88`
                }}>
                  {lbl}
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setPaused(!paused)}
          className="text-[8px] font-mono uppercase tracking-wider text-white/40 hover:text-white transition-colors"
        >
          {paused ? "▶ Play" : "❚❚ Pause"}
        </button>
      </div>

      {/* Pitch container */}
      <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full" style={{ borderRadius: 4 }}>
          <defs>
            <pattern id={`patGrass-${pattern.id}`} x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
              <rect width="20" height="40" fill="#142E1E" />
              <rect width="20" height="20" fill="#1B3D2A" opacity="0.55" />
            </pattern>
          </defs>
          <rect x={PX} y={PY} width={fieldW} height={fieldH} fill={`url(#patGrass-${pattern.id})`} stroke="#fff" strokeOpacity="0.4" strokeWidth="1" rx="2" />
          <line x1={PX} y1={PY + fieldH / 2} x2={PX + fieldW} y2={PY + fieldH / 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <circle cx={PX + fieldW / 2} cy={PY + fieldH / 2} r="22" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <rect x={PX + fieldW * 0.22} y={PY} width={fieldW * 0.56} height={fieldH * 0.14} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <rect x={PX + fieldW * 0.22} y={PY + fieldH * 0.86} width={fieldW * 0.56} height={fieldH * 0.14} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
          <text x={width / 2} y="7" fill={SCOUTS.green} fontSize="6" fontWeight="bold" textAnchor="middle" opacity="0.7">▲</text>
        </svg>

        {/* Players — ours (numbered, blue) and theirs (black dummies) */}
        {pattern.players.map((p, idx) => {
          const pos = p.path[phase];
          const leftPct = PX_PCT + (pos.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (pos.y / 100) * (100 - 2 * PY_PCT);
          const isUs = p.team === "us";
          return (
            <div
              key={p.num !== undefined ? `us-${p.num}` : `opp-${p.id}`}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1100ms cubic-bezier(0.45, 0, 0.15, 1), top 1100ms cubic-bezier(0.45, 0, 0.15, 1)",
                pointerEvents: "none",
                zIndex: isUs ? 3 : 2
              }}
            >
              {isUs ? (
                <>
                  <div className="absolute rounded-full" style={{
                    width: 30, height: 30,
                    left: "50%", top: "50%",
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, ${BHA.blueLight}55 0%, transparent 70%)`,
                  }} />
                  <div
                    className="relative flex items-center justify-center rounded-full font-black"
                    style={{
                      width: 17, height: 17,
                      background: BHA.blue,
                      color: "#fff",
                      border: "1.5px solid #fff",
                      fontSize: 8,
                      boxShadow: `0 1px 3px rgba(0,0,0,0.7), 0 0 6px ${BHA.blueLight}66`
                    }}
                  >
                    {p.num}
                  </div>
                  <div className="text-center mt-0.5 font-bold whitespace-nowrap" style={{
                    fontSize: 7,
                    color: "rgba(255,255,255,0.8)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.9)"
                  }}>
                    {p.label}
                  </div>
                </>
              ) : (
                <div
                  className="rounded-full"
                  style={{
                    width: 14, height: 14,
                    background: "#0a0a0a",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.7)"
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Ball */}
        {(() => {
          const leftPct = PX_PCT + (currentBall.x / 100) * (100 - 2 * PX_PCT);
          const topPct = PY_PCT + (currentBall.y / 100) * (100 - 2 * PY_PCT);
          return (
            <div
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1100ms cubic-bezier(0.55, 0, 0.45, 1), top 1100ms cubic-bezier(0.55, 0, 0.45, 1)",
                pointerEvents: "none",
                zIndex: 10
              }}
            >
              <div className="absolute rounded-full" style={{
                width: 22, height: 22,
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${CYBER.amber}AA 0%, ${CYBER.amber}33 40%, transparent 70%)`,
                animation: "morphPulse 0.9s ease-in-out infinite"
              }} />
              <div
                className="relative rounded-full"
                style={{
                  width: 10, height: 10,
                  background: "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 70%, #888 100%)",
                  border: `1.5px solid #000`,
                  boxShadow: `0 0 8px ${CYBER.amber}, 0 0 14px ${CYBER.amber}66, 0 1px 2px rgba(0,0,0,0.9)`
                }}
              />
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex gap-2 mt-2 text-[8px] font-mono justify-center items-center">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: BHA.blue, border: "1px solid #fff" }} />US</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.5)" }} />OPPOSITION</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#fff", border: "1px solid #000" }} />
          <span style={{ color: CYBER.amber }}>BALL</span>
        </span>
      </div>
    </div>
  );
}

// ============ PATTERN CARD (offensive-coverage board, image-2 style) ============
function PatternCard({ pattern }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded" style={{
              background: BHA.blueLight + "22",
              color: BHA.blueLight,
              border: `1px solid ${BHA.blueLight}44`
            }}>{pattern.id}</span>
          </div>
          <h3 className="text-sm font-bold text-white leading-tight" style={{ textShadow: `0 0 8px ${BHA.blueLight}33` }}>
            {pattern.name}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4">
        {/* Animated board */}
        <div className="sm:col-span-2">
          <AnimatedPatternPitch pattern={pattern} />
        </div>

        {/* Coaching content */}
        <div className="sm:col-span-3 space-y-3">
          <p className="text-[11px] text-white/60 leading-relaxed italic">{pattern.tagline}</p>

          {/* Coaching points — like the board's bullet list */}
          <div>
            <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-1.5" style={{ color: SCOUTS.green }}>Coaching points</div>
            <ul className="space-y-1.5">
              {pattern.coachingPoints.map((pt, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-white/70 leading-snug">
                  <span className="flex-shrink-0" style={{ color: SCOUTS.green }}>—</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence benchmark */}
          <div className="rounded p-2.5" style={{ background: CYBER.magenta + "0A", border: `1px solid ${CYBER.magenta}33` }}>
            <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-1" style={{ color: CYBER.magenta }}>Evidence</div>
            <p className="text-[10px] text-white/70 leading-relaxed">{pattern.benchmark}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TACTICAL ZONES (thirds x channels overlay — from match data + standard boards) ============
function TacticalZones() {
  const [layer, setLayer] = useState("channelSuccess"); // channelSuccess | thirdOrigin | pressTraps
  const [animated, setAnimated] = useState(false);
  // Replay the appear animation every time the layer changes (and on first mount).
  // Reset to hidden, then flip to shown a frame later so the CSS transitions run.
  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [layer]);

  // Pitch geometry — horizontal pitch (attacking right), like the reference boards
  const W = 100, H = 64;

  const layers = {
    channelSuccess: { label: "Channel Success", color: SCOUTS.green, desc: "Final-third success rate by channel. The central corridor more than doubles the wide channels." },
    thirdOrigin:    { label: "Build Origin",     color: CYBER.cyan,  desc: "Offensive-coverage success by the third where the sequence starts. Pre-offensive entries are most effective." },
    pressTraps:     { label: "Press Traps",      color: "#FF6B35",   desc: "Where we try to win the ball back. Primary trap in the right pre-defensive channel." }
  };
  const current = layers[layer];

  return (
    <div className="space-y-4">
      {/* Layer selector */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/10">
        {Object.entries(layers).map(([k, v]) => (
          <button key={k} onClick={() => setLayer(k)} className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider" style={{
            background: layer === k ? v.color + "22" : "transparent",
            color: layer === k ? v.color : "rgba(255,255,255,0.45)",
            border: `1px solid ${layer === k ? v.color + "55" : "transparent"}`
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* The pitch board */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 relative overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" style={{ borderRadius: 4 }}>
            <defs>
              <linearGradient id="zonePitchGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a3a26" />
                <stop offset="66%" stopColor="#16302a" />
                <stop offset="100%" stopColor="#3a2614" />
              </linearGradient>
            </defs>
            {/* Pitch base */}
            <rect x="2" y="2" width={W - 4} height={H - 4} fill="url(#zonePitchGrad)" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" rx="1.5" />
            {/* Third dividers (vertical — attacking is to the right) */}
            <line x1={2 + (W - 4) / 3} y1="2" x2={2 + (W - 4) / 3} y2={H - 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <line x1={2 + 2 * (W - 4) / 3} y1="2" x2={2 + 2 * (W - 4) / 3} y2={H - 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            {/* Channel dividers (horizontal) */}
            <line x1="2" y1={2 + (H - 4) / 3} x2={W - 2} y2={2 + (H - 4) / 3} stroke="#fff" strokeOpacity="0.18" strokeWidth="0.3" strokeDasharray="1 1.5" />
            <line x1="2" y1={2 + 2 * (H - 4) / 3} x2={W - 2} y2={2 + 2 * (H - 4) / 3} stroke="#fff" strokeOpacity="0.18" strokeWidth="0.3" strokeDasharray="1 1.5" />
            {/* Halfway + centre circle */}
            <line x1={W / 2} y1="2" x2={W / 2} y2={H - 2} stroke="#fff" strokeOpacity="0.2" strokeWidth="0.3" />
            <circle cx={W / 2} cy={H / 2} r="6" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="0.3" />
            {/* Penalty boxes */}
            <rect x="2" y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />
            <rect x={W - 11} y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />

            {/* Third labels */}
            <text x={2 + (W - 4) / 6} y="7" fill="#fff" fillOpacity="0.4" fontSize="2.6" fontStyle="italic" textAnchor="middle">Defensive 1/3</text>
            <text x={W / 2} y="7" fill="#fff" fillOpacity="0.4" fontSize="2.6" fontStyle="italic" textAnchor="middle">Midfield 1/3</text>
            <text x={2 + 5 * (W - 4) / 6} y="7" fill="#fff" fillOpacity="0.4" fontSize="2.6" fontStyle="italic" textAnchor="middle">Attacking 1/3</text>
            <text x={W - 4} y={H / 2} fill={SCOUTS.green} fillOpacity="0.6" fontSize="3" fontWeight="bold" textAnchor="end">▶</text>

            {/* ===== CHANNEL SUCCESS LAYER ===== */}
            {layer === "channelSuccess" && tacticalZones.channelSuccess.map((c, i) => {
              const yBand = 2 + (H - 4) / 3 * (i + 0.5);
              const finalX = 2 + 5 * (W - 4) / 6; // attacking third centre
              const r = 3 + (c.finalThird / 34.3) * 6; // scaled to the max success
              return (
                <g key={c.channel} style={{ opacity: animated ? 1 : 0, transition: `opacity 500ms ease ${i * 150}ms` }}>
                  {/* glow blob in the attacking third */}
                  <circle cx={finalX} cy={yBand} r={animated ? r : 0} fill={c.color} fillOpacity="0.25" style={{ transition: `r 700ms cubic-bezier(0.34,1.2,0.64,1) ${i * 150}ms` }} />
                  <circle cx={finalX} cy={yBand} r={animated ? r * 0.55 : 0} fill={c.color} fillOpacity="0.5" style={{ transition: `r 700ms cubic-bezier(0.34,1.2,0.64,1) ${i * 150 + 80}ms` }} />
                  <text x={finalX} y={yBand + 1} fill="#fff" fontSize="3.4" fontWeight="900" textAnchor="middle" style={{ textShadow: "0 0 3px #000" }}>{c.finalThird}%</text>
                  <text x={finalX} y={yBand - r - 1.5} fill={c.color} fontSize="2.4" fontWeight="bold" textAnchor="middle">{c.channel}</text>
                </g>
              );
            })}

            {/* ===== THIRD ORIGIN LAYER ===== */}
            {layer === "thirdOrigin" && tacticalZones.thirdOrigin.map((t, i) => {
              // Defensive third is index 2, attacking is index 0 → position by label
              const thirdIndex = t.third === "Defensive" ? 0 : t.third === "Midfield" ? 1 : 2;
              const cx = 2 + (W - 4) / 3 * (thirdIndex + 0.5);
              const cy = H / 2;
              const blobR = 5 + (t.success / 34.8) * 8;
              return (
                <g key={t.third} style={{ opacity: animated ? 1 : 0, transition: `opacity 500ms ease ${i * 150}ms` }}>
                  <rect
                    x={2 + (W - 4) / 3 * thirdIndex} y="2"
                    width={(W - 4) / 3} height={H - 4}
                    fill={t.color} fillOpacity={animated ? 0.1 : 0}
                    style={{ transition: `fill-opacity 600ms ease ${i * 150}ms` }}
                  />
                  <circle cx={cx} cy={cy} r={animated ? blobR : 0} fill={t.color} fillOpacity="0.3" style={{ transition: `r 700ms cubic-bezier(0.34,1.2,0.64,1) ${i * 150}ms` }} />
                  <text x={cx} y={cy - 1} fill="#fff" fontSize="4" fontWeight="900" textAnchor="middle" style={{ textShadow: "0 0 3px #000" }}>{t.success}%</text>
                  <text x={cx} y={cy + 4} fill="#fff" fillOpacity="0.7" fontSize="2.4" textAnchor="middle">{t.volume}% vol</text>
                </g>
              );
            })}

            {/* ===== PRESS TRAPS LAYER (minimal & static — hairline ring, core dot, label) ===== */}
            {layer === "pressTraps" && tacticalZones.pressTraps.map(p => {
              const cx = (p.x / 100) * W;
              const cy = (p.y / 100) * H;
              const isPrimary = p.intensity === "primary";
              const R = isPrimary ? 7 : p.intensity === "secondary" ? 5.5 : 4;
              const col = isPrimary ? "#FF3D5A" : p.intensity === "secondary" ? "#FF8C00" : "#9DB2BF";
              return (
                <g key={p.zone}>
                  {/* Whisper of fill */}
                  <circle cx={cx} cy={cy} r={R} fill={col} fillOpacity="0.08" />
                  {/* One hairline ring */}
                  <circle cx={cx} cy={cy} r={R} fill="none" stroke={col} strokeOpacity="0.5" strokeWidth="0.35" />
                  {/* Core dot */}
                  <circle cx={cx} cy={cy} r="1" fill={col} fillOpacity="0.9" />
                  {/* Zone code only — recoveries live in the cards below */}
                  <text x={cx} y={cy - R - 2} fill={col} fontSize="2.4" fontWeight="800" textAnchor="middle" fillOpacity="0.85">{p.zone}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Layer description */}
        <p className="text-[10px] text-white/55 leading-relaxed mt-2 italic px-1">{current.desc}</p>
      </div>

      {/* Data detail cards for the active layer */}
      <div className="space-y-2">
        {layer === "channelSuccess" && tacticalZones.channelSuccess.map(c => (
          <div key={c.channel} className="rounded-lg border p-3" style={{ borderColor: c.color + "33", background: c.color + "08" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{c.channel} channel</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/50">our vol: {c.ourShare}%</span>
                <span className="text-sm font-black font-mono" style={{ color: c.color, textShadow: `0 0 6px ${c.color}66` }}>{c.finalThird}%</span>
              </div>
            </div>
            <p className="text-[10px] text-white/55 leading-relaxed">{c.note}</p>
          </div>
        ))}
        {layer === "thirdOrigin" && tacticalZones.thirdOrigin.map(t => (
          <div key={t.third} className="rounded-lg border p-3" style={{ borderColor: t.color + "33", background: t.color + "08" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{t.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/50">vol: {t.volume}%</span>
                <span className="text-sm font-black font-mono" style={{ color: t.color, textShadow: `0 0 6px ${t.color}66` }}>{t.success}%</span>
              </div>
            </div>
            <p className="text-[10px] text-white/55 leading-relaxed">{t.note}</p>
          </div>
        ))}
        {layer === "pressTraps" && tacticalZones.pressTraps.map(p => {
          const col = p.intensity === "primary" ? "#FF3D5A" : p.intensity === "secondary" ? "#FF8C00" : "#9DB2BF";
          return (
            <div key={p.zone} className="rounded-lg border p-3" style={{ borderColor: col + "33", background: col + "08" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded" style={{ background: col + "22", color: col }}>{p.zone}</span>
                  <span className="text-xs font-bold text-white">{p.label}</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: col }}>{p.recoveries} rec/match</span>
              </div>
              <p className="text-[10px] text-white/55 leading-relaxed">{p.note}</p>
            </div>
          );
        })}
      </div>

      {/* Source footnote */}
      <p className="text-[9px] text-white/30 italic text-center font-mono">
        Zonal model from StatsBomb event coordinates · season to date
      </p>
    </div>
  );
}

// ============ MODEL INTERACTION PITCH (last-match coded sequence vs opponent, for the selected phase) ============
function ModelInteractionPitch({ phaseId, color, label }) {
  const seq = modelInteraction[phaseId];
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [snap, setSnap] = useState(false);

  // Hard-reset to frame 0 when the selected phase changes (no morph across different sequences)
  useEffect(() => {
    setSnap(true);
    setFrame(0);
    const t = setTimeout(() => setSnap(false), 50);
    return () => clearTimeout(t);
  }, [phaseId]);

  // Morph through this sequence's frames
  useEffect(() => {
    if (paused || !seq) return;
    const timer = setInterval(() => setFrame(f => (f + 1) % seq.frames.length), 2400);
    return () => clearInterval(timer);
  }, [paused, phaseId, seq]);

  if (!seq) return null;
  const F = seq.frames[frame];
  const grade = seq.clip.grade;
  const gradeCol = grade === "success" ? SCOUTS.green : "#FF3D5A";

  const W = 100, H = 64;
  const px = (v) => 2 + (v / 100) * (W - 4);
  const py = (v) => 2 + (v / 100) * (H - 4);
  const lp = (v) => ((2 + (v / 100) * (W - 4)) / W) * 100;
  const tp = (v) => ((2 + (v / 100) * (H - 4)) / H) * 100;
  const MORPH = snap ? "none" : "left 1300ms cubic-bezier(0.4, 0, 0.2, 1), top 1300ms cubic-bezier(0.4, 0, 0.2, 1)";
  const BALL_MORPH = snap ? "none" : "left 900ms cubic-bezier(0.3, 0, 0.3, 1) 100ms, top 900ms cubic-bezier(0.3, 0, 0.3, 1) 100ms";

  // ===== FINAL-ACTION GLOW (on the last action of a successfully-coded sequence) =====
  // Fires on the final frame — the decisive action — but only when the coded outcome was a
  // success (we don't celebrate the last touch of a turnover or a goal conceded).
  const thirdOf = (x) => (x < 33.3 ? 0 : x < 66.6 ? 1 : 2);
  const isLastFrame = frame === seq.frames.length - 1;
  const advanced = isLastFrame && grade === "success" && !snap;
  const curThird = thirdOf(F.ball[0]);
  const ourForward = F.us.filter(u => u[0] !== 1 && u[1] >= curThird * 33.3 - 4);
  const attackingFinal = ourForward.length >= 2;
  const nearestToBall = [...F.us]
    .filter(u => u[0] !== 1)
    .map(u => ({ num: u[0], d: Math.hypot(u[1] - F.ball[0], u[2] - F.ball[1]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map(o => o.num);
  const involvedFrontEdge = curThird * 33.3;
  const isInvolved = (num, x) => {
    if (num === 1) return false;
    if (attackingFinal) return x >= involvedFrontEdge - 4;
    return nearestToBall.includes(num);
  };
  const enteredBand = { x0: curThird * 33.3, x1: (curThird + 1) * 33.3 };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: color + "33" }}>
      <style>{`
        @keyframes miPlayerGlow {
          0%   { box-shadow: 0 1px 3px rgba(0,0,0,0.6); }
          30%  { box-shadow: 0 0 10px var(--glowc), 0 0 18px var(--glowc), 0 1px 3px rgba(0,0,0,0.6); }
          100% { box-shadow: 0 1px 3px rgba(0,0,0,0.6); }
        }
        @keyframes miZoneGlow {
          0%   { opacity: 0; }
          35%  { opacity: 0.16; }
          100% { opacity: 0; }
        }
      `}</style>
      {/* Header — last match + coded clip + outcome */}
      <div className="px-4 py-2.5 border-b flex items-center justify-between gap-2" style={{
        borderColor: color + "22", background: color + "0A"
      }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{
            color: color, background: color + "1A", border: `1px solid ${color}44`
          }}>⊕ INTERACTION</span>
          <span className="text-[10px] font-bold text-white truncate">Last match · vs {codedMatch.opponent}</span>
        </div>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0" style={{
          color: gradeCol, background: gradeCol + "1A", border: `1px solid ${gradeCol}44`
        }}>{grade}</span>
      </div>

      <div className="p-3">
        {/* Coded clip line + frame dots + pause */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-bold text-white/70 flex-shrink-0">{seq.clip.t}</span>
            <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: color, textShadow: `0 0 8px ${color}55` }}>
              {label} · {seq.clip.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              {seq.frames.map((fr, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="inline-block rounded-full" style={{
                    width: frame === i ? 6 : 4, height: frame === i ? 6 : 4,
                    background: frame === i ? color : "#444",
                    boxShadow: frame === i ? `0 0 6px ${color}, 0 0 12px ${color}55` : "none",
                    animation: (frame === i && !paused) ? "morphPulse 1.2s ease-in-out infinite" : "none",
                    transition: "all 300ms ease"
                  }} />
                  {frame === i && (
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{ color: color, textShadow: `0 0 4px ${color}88` }}>{fr.label}</span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setPaused(!paused)} className="text-[8px] font-mono uppercase tracking-wider text-white/40 hover:text-white transition-colors">
              {paused ? "▶ Play" : "❚❚ Pause"}
            </button>
          </div>
        </div>

        {/* Pitch */}
        <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" style={{ borderRadius: 4 }}>
            <defs>
              <linearGradient id="miPitchGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#16302a" />
                <stop offset="50%" stopColor="#1a3a26" />
                <stop offset="100%" stopColor="#16302a" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width={W - 4} height={H - 4} fill="url(#miPitchGrad)" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" rx="1.5" />
            <line x1={px(33.3)} y1="2" x2={px(33.3)} y2={H - 2} stroke="#fff" strokeOpacity="0.28" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <line x1={px(66.6)} y1="2" x2={px(66.6)} y2={H - 2} stroke="#fff" strokeOpacity="0.28" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <line x1={px(50)} y1="2" x2={px(50)} y2={H - 2} stroke="#fff" strokeOpacity="0.2" strokeWidth="0.3" />
            <circle cx={W / 2} cy={H / 2} r="6" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="0.3" />
            <rect x="2" y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />
            <rect x={W - 11} y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />
            <text x="4.5" y={H / 2 + 1} fill={SCOUTS.green} fillOpacity="0.4" fontSize="2.4" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 4.5 ${H / 2})`}>US</text>
            <text x={W - 4.5} y={H / 2 + 1} fill="#fff" fillOpacity="0.3" fontSize="2.4" fontWeight="bold" textAnchor="middle" transform={`rotate(90 ${W - 4.5} ${H / 2})`}>{codedMatch.opponentShort}</text>
            <text x={W - 4} y="6.5" fill={SCOUTS.green} fillOpacity="0.55" fontSize="3" fontWeight="bold" textAnchor="end">▶</text>

            {/* Final-action glow on the zone the ball ends in */}
            {advanced && (
              <rect
                key={`mi-zoneglow-${phaseId}-${frame}`}
                x={px(enteredBand.x0)} y="2"
                width={px(enteredBand.x1) - px(enteredBand.x0)} height={H - 4}
                fill={CYBER.neonGreen} rx="1"
                style={{ animation: "miZoneGlow 1.6s ease-out forwards" }}
              />
            )}
          </svg>

          {/* United — 11 black dummies */}
          {F.them.map((t, i) => (
            <div key={`t-${i}`} className="absolute" style={{
              left: `${lp(t[0])}%`, top: `${tp(t[1])}%`,
              transform: "translate(-50%, -50%)", transition: MORPH, pointerEvents: "none", zIndex: 1
            }}>
              <div className="rounded-full" style={{
                width: 10, height: 10, background: "#0a0a0a",
                border: "1.1px solid rgba(255,255,255,0.5)", boxShadow: "0 1px 2px rgba(0,0,0,0.7)"
              }} />
            </div>
          ))}

          {/* Us — numbered dots (GK gold) */}
          {F.us.map((u) => {
            const [num, x, y] = u;
            const isGK = num === 1;
            const glow = advanced && isInvolved(num, x);
            return (
              <div key={`u-${num}`} className="absolute" style={{
                left: `${lp(x)}%`, top: `${tp(y)}%`,
                transform: "translate(-50%, -50%)", transition: MORPH, pointerEvents: "none", zIndex: glow ? 4 : 3
              }}>
                <div className="absolute rounded-full" style={{
                  width: 24, height: 24, left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                  background: glow ? `radial-gradient(circle, ${CYBER.neonGreen}99 0%, transparent 70%)` : `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                  transition: "background 300ms ease"
                }} />
                <div className="relative flex items-center justify-center rounded-full font-black" style={{
                  width: 15, height: 15,
                  background: isGK ? "#FFD700" : SCOUTS.green,
                  color: isGK ? "#000" : "#fff",
                  border: glow ? `1.1px solid ${CYBER.neonGreen}` : "1.1px solid rgba(255,255,255,0.9)",
                  fontSize: 7,
                  "--glowc": CYBER.neonGreen,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
                  animation: glow ? "miPlayerGlow 1.6s ease-out forwards" : "none"
                }}>{num}</div>
              </div>
            );
          })}

          {/* Ball */}
          <div className="absolute" style={{
            left: `${lp(F.ball[0])}%`, top: `${tp(F.ball[1])}%`,
            transform: "translate(-50%, -50%)", transition: BALL_MORPH, pointerEvents: "none", zIndex: 5
          }}>
            <div className="absolute rounded-full" style={{
              width: 12, height: 12, left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${CYBER.amber}88 0%, transparent 70%)`
            }} />
            <div className="relative rounded-full" style={{
              width: 6, height: 6,
              background: "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 70%, #999 100%)",
              border: "1px solid #000", boxShadow: `0 0 5px ${CYBER.amber}, 0 1px 2px rgba(0,0,0,0.9)`
            }} />
          </div>
        </div>

        {/* Interaction synopsis — read + key observations */}
        <div className="mt-3 rounded-lg border p-3" style={{ borderColor: color + "33", background: color + "08" }}>
          <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-2 flex items-center gap-1.5" style={{ color: color }}>
            <span className="inline-block w-1 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
            Interaction synopsis
          </div>
          {/* Read */}
          <p className="text-[11px] text-white/80 leading-relaxed font-semibold mb-2">{seq.synopsis.read}</p>
          {/* Key observations */}
          <ul className="space-y-1.5">
            {seq.synopsis.points.map((pt, i) => (
              <li key={i} className="flex gap-2 text-[10px] text-white/60 leading-relaxed">
                <span className="font-mono font-black flex-shrink-0" style={{ color: color }}>▸</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stat link + source */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-white/10 flex-wrap">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{
            color: CYBER.cyan, background: CYBER.cyan + "12", border: `1px solid ${CYBER.cyan}33`
          }}>◆ {seq.stat}</span>
          <span className="text-[8px] font-mono text-white/30">StatsBomb x&y · Hudl Sportscode</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 text-[8px] font-mono justify-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: SCOUTS.green }} />US</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#FFD700" }} />GK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.5)" }} />{codedMatch.opponent}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#fff", border: "1px solid #000" }} /><span style={{ color: CYBER.amber }}>Ball</span></span>
        </div>
      </div>
    </div>
  );
}

// ============ GAME MODEL (phase boards — tracking-data style sequence playback) ============
// Designed to read like a tracking-data clip: near-continuous motion (no static holds),
// the ball zips between players faster than they move, an amber path traces the ball's
// route with event markers, players leave fading motion trails, and the loop restarts
// with a hard cut (like a clip replay) instead of morphing backwards.
function GameModel() {
  const [phaseId, setPhaseId] = useState("buildup");
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [snap, setSnap] = useState(false); // true = render without transitions (clip restart)

  const phase = gameModel.find(p => p.id === phaseId) || gameModel[0];
  const F = phase.frames[frame];

  // On phase switch: hard-cut to frame 0 and replay the text slide-ins
  useEffect(() => {
    setSnap(true);
    setFrame(0);
    setAnimated(false);
    const t1 = setTimeout(() => setSnap(false), 50);
    const t2 = setTimeout(() => setAnimated(true), 80);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phaseId]);

  // Near-continuous playback: frame advances every 2000ms while player motion runs 1850ms,
  // so dots barely settle before the next leg begins — tracking-clip cadence.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setFrame(f => {
        const nf = (f + 1) % 4;
        if (nf === 0) setSnap(true); // wrap = clip restart, no reverse morph
        return nf;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [paused, phaseId]);

  // Release the snap one paint after a restart so transitions resume
  useEffect(() => {
    if (!snap) return;
    const t = setTimeout(() => setSnap(false), 50);
    return () => clearTimeout(t);
  }, [snap]);

  const W = 100, H = 64;
  const px = (v) => 2 + (v / 100) * (W - 4);
  const py = (v) => 2 + (v / 100) * (H - 4);
  const lp = (v) => ((2 + (v / 100) * (W - 4)) / W) * 100;
  const tp = (v) => ((2 + (v / 100) * (H - 4)) / H) * 100;

  // Players drift (slow, near-linear, like tracking dots); the ball zips (fast, slight delay = pass release)
  const PLAYER_MORPH = snap ? "none" : "left 1850ms cubic-bezier(0.35, 0, 0.65, 1), top 1850ms cubic-bezier(0.35, 0, 0.65, 1)";
  const BALL_MORPH = snap ? "none" : "left 600ms cubic-bezier(0.25, 0, 0.35, 1) 150ms, top 600ms cubic-bezier(0.25, 0, 0.35, 1) 150ms";

  // Ball path so far in this sequence (drawn like a telestration trace)
  const ballTrail = phase.frames.slice(0, frame + 1).map(fr => fr.ball);
  const prevUs = frame > 0 ? phase.frames[frame - 1].us : null;

  // ===== FINAL-ACTION GLOW =====
  // The glow fires on the LAST action of the sequence (the final frame) for every phase —
  // celebrating the decisive moment (the through-ball, the regain, the strike, the block).
  const thirdOf = (x) => (x < 33.3 ? 0 : x < 66.6 ? 1 : 2);
  const isLastFrame = frame === phase.frames.length - 1;
  const advanced = isLastFrame && !snap;
  const curThird = thirdOf(F.ball[0]);
  // Are any of our outfield players in/ahead of the ball's third? (attacking final action)
  const ourForward = F.us.filter(u => u[0] !== 1 && u[1] >= curThird * 33.3 - 4);
  const attackingFinal = ourForward.length >= 2;
  // Attacking final action → glow the unit from the ball's third forward + glow that zone.
  // Defensive final action (we're behind the ball, e.g. Defensive Block) → glow the players
  // nearest the ball (the defenders making the stop) and the zone around the ball.
  const ballNum = null; // ball isn't a player; proximity computed below
  const nearestToBall = [...F.us]
    .filter(u => u[0] !== 1)
    .map(u => ({ num: u[0], d: Math.hypot(u[1] - F.ball[0], u[2] - F.ball[1]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map(o => o.num);
  const involvedFrontEdge = curThird * 33.3;
  const isInvolved = (num, x) => {
    if (num === 1) return false;
    if (attackingFinal) return x >= involvedFrontEdge - 4;
    return nearestToBall.includes(num); // defensive: the players around the ball
  };
  const enteredBand = { x0: curThird * 33.3, x1: (curThird + 1) * 33.3 };

  const zoneLabels = [
    { t: "LD",  x: 16.6, y: 16.6 }, { t: "CD",  x: 16.6, y: 50 }, { t: "RD",  x: 16.6, y: 83.3 },
    { t: "LPD", x: 41.6, y: 16.6 }, { t: "CPD", x: 41.6, y: 50 }, { t: "RPD", x: 41.6, y: 83.3 },
    { t: "LPO", x: 58.3, y: 16.6 }, { t: "CPO", x: 58.3, y: 50 }, { t: "RPO", x: 58.3, y: 83.3 },
    { t: "LO",  x: 83.3, y: 16.6 }, { t: "CO",  x: 83.3, y: 50 }, { t: "RO",  x: 83.3, y: 83.3 }
  ];
  const zh = phase.zoneHighlight;

  return (
    <div className="space-y-4">
      {/* Scoped keyframes for the motion-trail ghosts */}
      <style>{`
        @keyframes gmGhostFade {
          0% { opacity: 0.22; }
          100% { opacity: 0; }
        }
        @keyframes gmPlayerGlow {
          0%   { box-shadow: 0 1px 3px rgba(0,0,0,0.6); }
          30%  { box-shadow: 0 0 10px var(--glowc), 0 0 18px var(--glowc), 0 1px 3px rgba(0,0,0,0.6); }
          100% { box-shadow: 0 1px 3px rgba(0,0,0,0.6); }
        }
        @keyframes gmZoneGlow {
          0%   { opacity: 0; }
          35%  { opacity: 0.16; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Phase selector — 2 rows × 3 */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/10">
        {gameModel.map(p => (
          <button key={p.id} onClick={() => setPhaseId(p.id)} className="py-2 px-1 rounded text-[9px] font-bold transition-all uppercase tracking-wider leading-tight" style={{
            background: phaseId === p.id ? p.color + "22" : "transparent",
            color: phaseId === p.id ? p.color : "rgba(255,255,255,0.45)",
            border: `1px solid ${phaseId === p.id ? p.color + "55" : "transparent"}`,
            textShadow: phaseId === p.id ? `0 0 6px ${p.color}55` : "none"
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Phase header + frame indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{
          color: phase.color, background: phase.color + "1A", border: `1px solid ${phase.color}44`,
          boxShadow: `0 0 8px ${phase.color}33`
        }}>{phase.moment}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {phase.frames.map((fr, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="inline-block rounded-full" style={{
                  width: frame === idx ? 6 : 4,
                  height: frame === idx ? 6 : 4,
                  background: frame === idx ? phase.color : "#444",
                  boxShadow: frame === idx ? `0 0 6px ${phase.color}, 0 0 12px ${phase.color}55` : "none",
                  animation: (frame === idx && !paused) ? "morphPulse 1.2s ease-in-out infinite" : "none",
                  transition: "all 300ms ease"
                }} />
                {frame === idx && (
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{
                    color: phase.color, textShadow: `0 0 4px ${phase.color}88`
                  }}>{fr.label}</span>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setPaused(!paused)} className="text-[8px] font-mono uppercase tracking-wider text-white/40 hover:text-white transition-colors">
            {paused ? "▶ Play" : "❚❚ Pause"}
          </button>
        </div>
      </div>

      {/* The phase board — SVG pitch + trace, HTML overlay of moving players & ball */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 relative overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" style={{ borderRadius: 4 }}>
            <defs>
              <linearGradient id="gmPitchGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#16302a" />
                <stop offset="50%" stopColor="#1a3a26" />
                <stop offset="100%" stopColor="#16302a" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width={W - 4} height={H - 4} fill="url(#gmPitchGrad)" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" rx="1.5" />
            <line x1={px(33.3)} y1="2" x2={px(33.3)} y2={H - 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <line x1={px(66.6)} y1="2" x2={px(66.6)} y2={H - 2} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <line x1={px(50)} y1="2" x2={px(50)} y2={H - 2} stroke="#fff" strokeOpacity="0.18" strokeWidth="0.3" strokeDasharray="2 1 0.5 1" />
            <line x1="2" y1={py(33.3)} x2={W - 2} y2={py(33.3)} stroke="#fff" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="1 1.5" />
            <line x1="2" y1={py(66.6)} x2={W - 2} y2={py(66.6)} stroke="#fff" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="1 1.5" />
            <circle cx={W / 2} cy={H / 2} r="6" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="0.3" />
            <rect x="2" y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />
            <rect x={W - 11} y={H / 2 - 11} width="9" height="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.3" />
            <text x={px(16.6)} y="6.5" fill="#fff" fillOpacity="0.4" fontSize="2.4" fontStyle="italic" textAnchor="middle">Defensive 1/3</text>
            <text x={W / 2} y="6.5" fill="#fff" fillOpacity="0.4" fontSize="2.4" fontStyle="italic" textAnchor="middle">Midfield 1/3</text>
            <text x={px(83.3)} y="6.5" fill="#fff" fillOpacity="0.4" fontSize="2.4" fontStyle="italic" textAnchor="middle">Attacking 1/3</text>
            {zoneLabels.map(z => (
              <text key={z.t} x={px(z.x)} y={py(z.y)} fill="#fff" fillOpacity="0.13" fontSize="2.8" fontStyle="italic" fontWeight="bold" textAnchor="middle">{z.t}</text>
            ))}
            {/* Active-phase zone highlight */}
            <rect
              x={px(zh.x0)} y={py(zh.y0)}
              width={px(zh.x1) - px(zh.x0)} height={py(zh.y1) - py(zh.y0)}
              fill={phase.color} fillOpacity="0.07"
              stroke={phase.color} strokeOpacity="0.55" strokeWidth="0.45" rx="1"
            >
              <animate attributeName="stroke-opacity" values="0.55;0.25;0.55" dur="2.8s" repeatCount="indefinite" />
            </rect>

            {/* Final-action glow on the zone the ball ends in */}
            {advanced && (
              <rect
                key={`zoneglow-${phaseId}-${frame}`}
                x={px(enteredBand.x0)} y="2"
                width={px(enteredBand.x1) - px(enteredBand.x0)} height={H - 4}
                fill={CYBER.neonGreen} rx="1"
                style={{ animation: "gmZoneGlow 1.6s ease-out forwards" }}
              />
            )}

            {/* Ball path trace — telestration-style amber route with event markers at each visited point */}
            {ballTrail.length > 1 && (
              <polyline
                points={ballTrail.map(b => `${px(b[0])},${py(b[1])}`).join(" ")}
                fill="none" stroke={CYBER.amber} strokeOpacity="0.55" strokeWidth="0.5"
                strokeDasharray="1.6 1" strokeLinejoin="round"
              />
            )}
            {ballTrail.slice(0, -1).map((b, i) => (
              <g key={`bt-${i}`}>
                <circle cx={px(b[0])} cy={py(b[1])} r="1.3" fill="none" stroke={CYBER.amber} strokeOpacity="0.7" strokeWidth="0.35" />
                <circle cx={px(b[0])} cy={py(b[1])} r="0.4" fill={CYBER.amber} fillOpacity="0.8" />
              </g>
            ))}

            <text x={W - 4} y={H - 4} fill={SCOUTS.green} fillOpacity="0.6" fontSize="3" fontWeight="bold" textAnchor="end">▶</text>
          </svg>

          {/* Motion-trail ghosts — previous-frame positions fading out (our XI only, declutters) */}
          {!snap && prevUs && prevUs.map(u => {
            const [num, x, y] = u;
            return (
              <div key={`g-${phaseId}-${frame}-${num}`} className="absolute" style={{
                left: `${lp(x)}%`, top: `${tp(y)}%`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none", zIndex: 1,
                animation: "gmGhostFade 1.7s ease-out forwards"
              }}>
                <div className="rounded-full" style={{
                  width: 11, height: 11,
                  background: num === 1 ? "#FFD700" : SCOUTS.green
                }} />
              </div>
            );
          })}

          {/* Opposition — 11 black dummies, drifting */}
          {F.them.map((t, i) => (
            <div key={`t-${i}`} className="absolute" style={{
              left: `${lp(t[0])}%`, top: `${tp(t[1])}%`,
              transform: "translate(-50%, -50%)",
              transition: PLAYER_MORPH, pointerEvents: "none", zIndex: 2
            }}>
              <div className="rounded-full" style={{
                width: 10, height: 10,
                background: "#0a0a0a",
                border: "1.1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.7)"
              }} />
            </div>
          ))}

          {/* Our XI — flat tracking-style dots with shirt numbers (GK gold), drifting */}
          {F.us.map(u => {
            const [num, x, y] = u;
            const isGK = num === 1;
            const glow = advanced && isInvolved(num, x);
            return (
              <div key={`u-${num}`} className="absolute" style={{
                left: `${lp(x)}%`, top: `${tp(y)}%`,
                transform: "translate(-50%, -50%)",
                transition: PLAYER_MORPH, pointerEvents: "none", zIndex: glow ? 4 : 3
              }}>
                <div className="relative flex items-center justify-center rounded-full font-black" style={{
                  width: 15, height: 15,
                  background: isGK ? "#FFD700" : SCOUTS.green,
                  color: isGK ? "#000" : "#fff",
                  border: glow ? `1.1px solid ${CYBER.neonGreen}` : "1.1px solid rgba(255,255,255,0.9)",
                  fontSize: 7,
                  "--glowc": CYBER.neonGreen,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
                  animation: glow ? "gmPlayerGlow 1.6s ease-out forwards" : "none"
                }}>
                  {num}
                </div>
              </div>
            );
          })}

          {/* The ball — zips ahead of the players, small amber glow */}
          <div className="absolute" style={{
            left: `${lp(F.ball[0])}%`, top: `${tp(F.ball[1])}%`,
            transform: "translate(-50%, -50%)",
            transition: BALL_MORPH,
            pointerEvents: "none", zIndex: 5
          }}>
            <div className="absolute rounded-full" style={{
              width: 14, height: 14,
              left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${CYBER.amber}88 0%, transparent 70%)`
            }} />
            <div className="relative rounded-full" style={{
              width: 7, height: 7,
              background: "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 70%, #999 100%)",
              border: "1px solid #000",
              boxShadow: `0 0 5px ${CYBER.amber}, 0 1px 2px rgba(0,0,0,0.9)`
            }} />
          </div>
        </div>
      </div>

      {/* Principles — styled like the reference board's dashed list */}
      <div className="rounded-lg border p-4" style={{ borderColor: phase.color + "33", background: phase.color + "08" }}>
        <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-2.5 flex items-center gap-1.5" style={{ color: phase.color }}>
          <span className="inline-block w-1 h-1 rounded-full" style={{ background: phase.color, boxShadow: `0 0 4px ${phase.color}` }} />
          Principles · {phase.label}
        </div>
        <ul className="space-y-2">
          {phase.principles.map((pr, i) => (
            <li key={i} className="flex gap-2 text-[11px] text-white/75 leading-relaxed italic" style={{
              fontFamily: "'Georgia', serif",
              opacity: animated ? 1 : 0,
              transform: animated ? "translateX(0)" : "translateX(-6px)",
              transition: `opacity 400ms ease ${i * 90 + 200}ms, transform 400ms ease ${i * 90 + 200}ms`
            }}>
              <span style={{ color: phase.color }}>–</span>
              <span>{pr}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Evidence chips */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-2.5 text-white/50">Why · the evidence</div>
        <div className="space-y-1.5">
          {phase.evidence.map((e, i) => (
            <div key={i} className="flex gap-2 items-baseline text-[10px]" style={{
              opacity: animated ? 1 : 0,
              transition: `opacity 400ms ease ${i * 90 + 400}ms`
            }}>
              <span className="font-mono font-black flex-shrink-0" style={{ color: phase.color }}>▸</span>
              <span className="text-white/60 leading-relaxed">{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formation interaction — the actual last-match coded sequence for this phase, vs the opponent */}
      <ModelInteractionPitch phaseId={phaseId} color={phase.color} label={phase.label} />

      {/* Analyst match coding — Sportscode export for the last PL match */}
      {phase.coding && (() => {
        const cd = phase.coding;
        const up = cd.delta >= 0;
        const deltaCol = up ? SCOUTS.green : "#FF3D5A";
        const gradeCol = { success: SCOUTS.green, fail: "#FF3D5A" };
        return (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-2" style={{
              background: phase.color + "0A"
            }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{
                  color: phase.color, background: phase.color + "1A", border: `1px solid ${phase.color}44`
                }}>● CODED</span>
                <span className="text-[10px] font-bold text-white truncate">{codedMatch.fixture}</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 flex-shrink-0">{codedMatch.date}</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Instance bar — success / fail split */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-white/40">{cd.instances} instances tagged · {phase.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono" style={{ color: phase.color }}>{cd.successPct}%</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold" style={{
                      color: deltaCol, background: deltaCol + "15", border: `1px solid ${deltaCol}44`
                    }}>{up ? "▲" : "▼"} {up ? "+" : ""}{cd.delta}pp vs base</span>
                  </div>
                </div>
                {/* Stacked success/fail bar */}
                <div className="flex h-6 rounded overflow-hidden border border-white/10" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center justify-center" style={{
                    width: `${(cd.success / cd.instances) * 100}%`,
                    background: `linear-gradient(180deg, ${SCOUTS.green} 0%, ${SCOUTS.green}CC 100%)`,
                    boxShadow: `0 0 10px ${SCOUTS.green}66`
                  }}>
                    <span className="text-[9px] font-black text-black">{cd.success}</span>
                  </div>
                  <div className="flex items-center justify-center" style={{
                    width: `${(cd.fail / cd.instances) * 100}%`,
                    background: `linear-gradient(180deg, #FF3D5A 0%, #FF3D5ACC 100%)`,
                    boxShadow: `0 0 10px #FF3D5A66`
                  }}>
                    <span className="text-[9px] font-black text-white">{cd.fail}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-[8px] font-mono text-white/35">
                  <span>● success</span>
                  <span>baseline {cd.baselinePct}%</span>
                  <span>fail ●</span>
                </div>
              </div>

              {/* Analyst summary */}
              <p className="text-[11px] text-white/65 leading-relaxed italic border-l-2 pl-2.5" style={{ borderColor: phase.color + "55" }}>
                {cd.summary}
              </p>

              {/* Metric matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {cd.metrics.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between text-[10px] py-0.5 border-b border-white/5">
                    <span className="text-white/50">{m.k}</span>
                    <span className="font-mono font-bold text-white">{m.v}</span>
                  </div>
                ))}
              </div>

              {/* Coded clip instances — timeline-style rows */}
              <div>
                <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-1.5 text-white/40">Coded clips</div>
                <div className="space-y-1">
                  {cd.clips.map((clip, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] rounded px-2 py-1.5" style={{
                      background: gradeCol[clip.grade] + "0C",
                      borderLeft: `2px solid ${gradeCol[clip.grade]}`
                    }}>
                      <span className="font-mono font-bold text-white/70 flex-shrink-0">{clip.t}</span>
                      <span className="font-mono font-bold flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider" style={{
                        color: gradeCol[clip.grade], background: gradeCol[clip.grade] + "1A"
                      }}>{clip.label}</span>
                      <span className="text-white/50 leading-tight truncate">{clip.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[8px] font-mono text-white/30">
                <span>Coded in {codedMatch.software}</span>
                <span>{codedMatch.analyst}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* StatsBomb sequence data — season-long, coordinate-derived, league context */}
      {phase.statsbomb && (() => {
        const sb = phase.statsbomb;
        const hd = sb.headline;
        const aboveMed = hd.us >= hd.league;
        // Rank colour: top-6 green, 7-13 amber, 14-20 red
        const rankCol = (r) => r <= 6 ? SCOUTS.green : r <= 13 ? CYBER.amber : "#FF3D5A";
        const ord = (n) => { const s = ["th","st","nd","rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
        return (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: CYBER.cyan + "33" }}>
            {/* Header */}
            <div className="px-4 py-2.5 border-b flex items-center justify-between gap-2" style={{
              borderColor: CYBER.cyan + "22", background: CYBER.cyan + "0A"
            }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{
                  color: CYBER.cyan, background: CYBER.cyan + "1A", border: `1px solid ${CYBER.cyan}44`,
                  boxShadow: `0 0 8px ${CYBER.cyan}33`
                }}>◆ STATSBOMB</span>
                <span className="text-[10px] font-bold text-white truncate">Season sequence data · x&y</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 flex-shrink-0">{statsbombMeta.season}</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Headline metric + league rank */}
              <div className="flex items-stretch gap-3">
                <div className="flex-1 rounded-lg p-3" style={{ background: CYBER.cyan + "0C", border: `1px solid ${CYBER.cyan}22` }}>
                  <div className="text-[9px] uppercase tracking-widest font-mono text-white/45 mb-1">{hd.metric}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono" style={{ color: CYBER.cyan, textShadow: `0 0 10px ${CYBER.cyan}55` }}>{hd.us}{hd.unit}</span>
                    <span className="text-[10px] font-mono text-white/40">league {hd.league}{hd.unit}</span>
                  </div>
                  <div className="text-[9px] font-mono mt-1" style={{ color: aboveMed ? SCOUTS.green : "#FF3D5A" }}>
                    {aboveMed ? "▲ above" : "▼ below"} median
                  </div>
                </div>
                <div className="rounded-lg p-3 flex flex-col items-center justify-center" style={{
                  background: rankCol(hd.rank) + "12", border: `1px solid ${rankCol(hd.rank)}44`, minWidth: 92
                }}>
                  <div className="text-[8px] uppercase tracking-widest font-mono text-white/45 mb-0.5">League rank</div>
                  <div className="text-2xl font-black font-mono" style={{ color: rankCol(hd.rank), textShadow: `0 0 10px ${rankCol(hd.rank)}55` }}>{ord(hd.rank)}</div>
                  <div className="text-[8px] font-mono text-white/40">of {statsbombMeta.teams}</div>
                </div>
              </div>

              {/* Coordinate-derived summary */}
              <p className="text-[11px] text-white/65 leading-relaxed italic border-l-2 pl-2.5" style={{ borderColor: CYBER.cyan + "55" }}>
                {sb.summary}
              </p>

              {/* Metric table with percentile bars + league median + rank */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 gap-2 text-[8px] font-mono uppercase tracking-wider text-white/35 px-1">
                  <div className="col-span-5">Metric (coordinate-derived)</div>
                  <div className="col-span-2 text-right">Us</div>
                  <div className="col-span-2 text-right">Lg med</div>
                  <div className="col-span-3 text-right">Percentile</div>
                </div>
                {sb.metrics.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center text-[10px]">
                    <div className="col-span-5 text-white/60 leading-tight">{m.k}</div>
                    <div className="col-span-2 text-right font-mono font-bold text-white">{m.us}</div>
                    <div className="col-span-2 text-right font-mono text-white/45">{m.lg}</div>
                    <div className="col-span-3 flex items-center gap-1.5 justify-end">
                      {/* percentile bar */}
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)", maxWidth: 56 }}>
                        <div className="h-full rounded-full" style={{
                          width: `${m.pct}%`,
                          background: `linear-gradient(90deg, ${rankCol(m.rank)}AA, ${rankCol(m.rank)})`,
                          boxShadow: `0 0 6px ${rankCol(m.rank)}88`
                        }} />
                      </div>
                      <span className="font-mono font-bold w-6 text-right" style={{ color: rankCol(m.rank) }}>{m.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-[8px] font-mono text-white/30">
                <span>{statsbombMeta.provider} · {statsbombMeta.basis}</span>
                <span>percentile vs {statsbombMeta.teams} teams</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============ TACTICS TAB (fused: Game Model + Zone Data) ============
function TacticsTab() {
  const [subTab, setSubTab] = useState("model"); // "model" | "zones"

  return (
    <div>
      {/* Sub-tab strip */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-white/[0.04] border border-white/10">
        <button
          onClick={() => setSubTab("model")}
          className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider"
          style={{
            background: subTab === "model" ? BHA.blueLight + "22" : "transparent",
            color: subTab === "model" ? BHA.blueLight : "rgba(255,255,255,0.45)",
            border: `1px solid ${subTab === "model" ? BHA.blueLight + "55" : "transparent"}`
          }}
        >
          ⚙ Game Model
        </button>
        <button
          onClick={() => setSubTab("zones")}
          className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider"
          style={{
            background: subTab === "zones" ? SCOUTS.green + "22" : "transparent",
            color: subTab === "zones" ? SCOUTS.green : "rgba(255,255,255,0.45)",
            border: `1px solid ${subTab === "zones" ? SCOUTS.green + "55" : "transparent"}`
          }}
        >
          ▦ Zone Data
        </button>
      </div>

      {subTab === "model" && <GameModel />}
      {subTab === "zones" && <TacticalZones />}
    </div>
  );
}

function Section({ id, title, sub, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[10px] font-mono" style={{ color: BHA.blueLight }}>{id}</span>
        <h2 className="text-xl font-black text-white leading-none" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      {sub && <p className="text-xs text-white/40 mb-5 leading-relaxed">{sub}</p>}
      {children}
    </section>
  );
}

function StatPill({ label, value, sub, color }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      <span className="text-2xl font-black" style={{ color, fontFamily: "'Georgia', serif" }}>{value}</span>
      {sub && <span className="text-[10px] text-white/40">{sub}</span>}
    </div>
  );
}

// ============ SPEED THRESHOLD COMPONENT ============
function SpeedThreshold() {
  const [sortBy, setSortBy] = useState("topSpeed");
  const [view, setView] = useState("team");
  // Animation state — bar opens left-to-right on tab mount
  const [barAnimated, setBarAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const sortedPlayers = [...playerGPS].sort((a, b) => b[sortBy] - a[sortBy]);

  // Position-based status: check if player meets/exceeds position norm
  const getStatus = (player) => {
    const norm = positionNorms[player.pos];
    if (!norm) return { color: "#FFD700", text: "—" };
    const pct = (player.hsrM / norm.hsrM) * 100;
    if (pct >= 110) return { color: SCOUTS.green, text: "+" + Math.round(pct - 100) + "%", level: "above" };
    if (pct >= 95)  return { color: "#FFD700",    text: "OK",                                level: "ok" };
    if (pct >= 85)  return { color: "#FF8C00",    text: Math.round(pct - 100) + "%",         level: "below" };
    return { color: "#FF3D5A", text: Math.round(pct - 100) + "%", level: "monitor" };
  };

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes speedBarSweep {
          0% { left: -30%; }
          55%, 100% { left: 100%; }
        }
      `}</style>
      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mb-1">Squad Top Speed</div>
          <div className="text-2xl font-black" style={{ color: BHA.blueLight, fontFamily: "'Georgia', serif" }}>34.2</div>
          <div className="text-[10px] text-white/50 font-mono">km/h · Mitoma</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mb-1">Avg Distance</div>
          <div className="text-2xl font-black" style={{ color: "#FFD700", fontFamily: "'Georgia', serif" }}>9.4</div>
          <div className="text-[10px] text-white/50 font-mono">km / outfield player</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mb-1">Total HSR</div>
          <div className="text-2xl font-black" style={{ color: "#FF8C00", fontFamily: "'Georgia', serif" }}>7.8</div>
          <div className="text-[10px] text-white/50 font-mono">km · squad total</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mb-1">Sprints</div>
          <div className="text-2xl font-black" style={{ color: "#FF3D5A", fontFamily: "'Georgia', serif" }}>225</div>
          <div className="text-[10px] text-white/50 font-mono">team total · 5 sessions</div>
        </div>
      </div>

      {/* Speed zone distribution */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden">
        {/* Subtle scanline backdrop for cyberpunk feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
          background: `linear-gradient(180deg, transparent 0%, ${SCOUTS.green}05 50%, transparent 100%)`,
          backgroundSize: "100% 4px"
        }} />

        <div className="relative flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white" style={{
              textShadow: `0 0 6px ${SCOUTS.green}66`
            }}>Speed Zone Distribution</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Team-average % of session time spent in each zone</p>
          </div>
          <span className="text-[10px] font-mono text-white/40">StatSports Apex</span>
        </div>

        {/* Percentage labels above the bar — light, spaced, no outline */}
        <div className="relative flex mb-2">
          {speedZones.map((z, i) => (
            <div key={z.id} className="flex items-center justify-center" style={{
              width: `${z.teamPct}%`,
              opacity: barAnimated ? 1 : 0,
              transition: `opacity 400ms ease ${i * 90 + 500}ms`
            }}>
              {z.teamPct >= 6 && (
                <span className="tabular-nums" style={{
                  color: "#ffffff", fontSize: 18, fontWeight: 800, letterSpacing: "0.01em",
                  textShadow: `0 0 10px ${z.color}, 0 0 20px ${z.color}AA, 0 1px 2px rgba(0,0,0,0.8)`
                }}>{z.teamPct}%</span>
              )}
            </div>
          ))}
        </div>

        {/* Stacked horizontal bar — large cyberpunk LED-meter with neon glow */}
        <div className="relative rounded-lg mb-3" style={{
          height: 44,
          background: "linear-gradient(180deg, rgba(8,12,18,0.9) 0%, rgba(14,20,28,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: barAnimated
            ? `inset 0 1px 4px rgba(0,0,0,0.6), 0 0 18px ${BHA.blueLight}55, 0 0 40px ${BHA.blueLight}26, 0 6px 22px rgba(0,0,0,0.45)`
            : `inset 0 1px 4px rgba(0,0,0,0.6), 0 6px 22px rgba(0,0,0,0.45)`,
          transition: "box-shadow 700ms ease 300ms"
        }}>
          {/* inner clipping wrapper so segment glow can still bleed past the housing edges */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {/* faint vertical tick grid behind segments — reads as a calibrated instrument */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 13px, rgba(255,255,255,0.05) 13px, rgba(255,255,255,0.05) 14px)"
            }} />
            {/* the segments */}
            <div className="relative flex h-full">
              {speedZones.map((z, i) => (
                <div
                  key={z.id}
                  title={`${z.name}: ${z.teamPct}%`}
                  className="relative h-full"
                  style={{
                    width: barAnimated ? `${z.teamPct}%` : "0%",
                    background: `linear-gradient(180deg, ${z.color}F2 0%, ${z.color}C2 50%, ${z.color}E6 100%)`,
                    boxShadow: barAnimated
                      ? `inset 0 0 22px ${z.color}, inset 0 0 8px ${z.color}, 0 0 16px ${z.color}77`
                      : "none",
                    transition: `width 850ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms, box-shadow 600ms ease ${i * 90 + 300}ms`
                  }}
                >
                  {/* bright LED top edge-line */}
                  <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: 2.5,
                    background: `linear-gradient(180deg, #ffffff 0%, ${z.color} 100%)`,
                    opacity: 0.95,
                    boxShadow: `0 0 8px ${z.color}, 0 0 14px ${z.color}AA`
                  }} />
                  {/* glowing LED bottom edge-line */}
                  <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{
                    height: 1.5,
                    background: z.color,
                    opacity: 0.6,
                    boxShadow: `0 0 6px ${z.color}`
                  }} />
                  {/* soft upper sheen */}
                  <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: "42%",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 100%)"
                  }} />
                  {/* glowing neon seam on the trailing edge (not a dark gap) */}
                  {i < speedZones.length - 1 && (
                    <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{
                      width: 1,
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: `0 0 8px rgba(255,255,255,0.8), 0 0 4px ${z.color}`,
                      opacity: barAnimated ? 0.8 : 0,
                      transition: `opacity 400ms ease ${i * 90 + 500}ms`
                    }} />
                  )}
                </div>
              ))}
            </div>
            {/* moving scan-sheen sweep across the whole bar for a live, cyberpunk feel */}
            <div className="absolute inset-y-0 pointer-events-none" style={{
              width: "30%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              animation: barAnimated ? "speedBarSweep 4.5s ease-in-out infinite" : "none"
            }} />
          </div>
        </div>

        {/* Zone legend with staggered fade-in + cyberpunk glow on the swatch */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {speedZones.map((z, i) => (
            <div
              key={z.id}
              className="rounded p-2 bg-black/40 border relative overflow-hidden"
              style={{
                borderColor: barAnimated ? z.color + "55" : "rgba(255,255,255,0.05)",
                boxShadow: barAnimated ? `inset 0 0 8px ${z.color}15, 0 0 6px ${z.color}22` : "none",
                opacity: barAnimated ? 1 : 0,
                transform: barAnimated ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 400ms ease ${i * 80 + 800}ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 80 + 800}ms, border-color 400ms ease ${i * 80 + 800}ms, box-shadow 400ms ease ${i * 80 + 800}ms`
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{
                  background: z.color,
                  boxShadow: `0 0 6px ${z.color}, 0 0 10px ${z.color}88`
                }} />
                <span className="text-[9px] font-mono font-bold" style={{
                  color: z.color,
                  textShadow: `0 0 4px ${z.color}88`
                }}>{z.id}</span>
              </div>
              <div className="text-[10px] font-bold text-white leading-tight">{z.name}</div>
              <div className="text-[9px] text-white/40 font-mono mt-0.5">{z.range}</div>
              <div className="text-[10px] font-mono mt-1 font-bold" style={{
                color: z.color,
                textShadow: `0 0 6px ${z.color}66`
              }}>{z.teamDistKm} km</div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/55 italic leading-relaxed">
          <span style={{ color: BHA.blueLight }}>→</span> We currently spend 7% of session time at high intensity (Z4+Z5). Match demands typically require 9-11% — our sessions are slightly below match intensity.
        </div>
      </div>

      {/* Player leaderboard */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Player Leaderboard</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Most recent training session · sorted by {sortBy === "topSpeed" ? "top speed" : sortBy === "hsrM" ? "HSR distance" : sortBy === "sprints" ? "sprint count" : sortBy}</p>
          </div>
          <div className="flex gap-1 p-0.5 rounded bg-black/30">
            {[
              { id: "topSpeed", label: "Top Speed" },
              { id: "hsrM", label: "HSR" },
              { id: "sprints", label: "Sprints" },
              { id: "totalDistKm", label: "Distance" }
            ].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)} className="px-2 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all" style={{
                background: sortBy === s.id ? BHA.blueLight + "22" : "transparent",
                color: sortBy === s.id ? BHA.blueLight : "rgba(255,255,255,0.4)"
              }}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1 px-3 py-2 text-[9px] font-mono uppercase tracking-wider text-white/40 bg-black/20 border-b border-white/5">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-1">Pos</div>
          <div className="col-span-2 text-right">Top km/h</div>
          <div className="col-span-2 text-right">HSR (m)</div>
          <div className="col-span-1 text-right">Spr</div>
          <div className="col-span-2 text-right">vs Norm</div>
        </div>

        <div className="divide-y divide-white/5">
          {sortedPlayers.map(p => {
            const status = getStatus(p);
            const rec = gpsStatus[p.status] || gpsStatus.maintain;
            return (
              <div key={p.num} className="hover:bg-white/[0.03] transition-colors">
                {/* Main row: existing GPS data */}
                <div className="grid grid-cols-12 gap-1 px-3 pt-2 pb-1 text-[10px] items-center">
                  <div className="col-span-1 font-mono text-white/50">{p.num}</div>
                  <div className="col-span-3 font-bold text-white/90 leading-tight">{p.name}</div>
                  <div className="col-span-1 font-mono text-white/60 text-[9px]">{p.pos}</div>
                  <div className="col-span-2 text-right font-mono font-bold text-white">{p.topSpeed.toFixed(1)}</div>
                  <div className="col-span-2 text-right font-mono text-white/80">{p.hsrM}</div>
                  <div className="col-span-1 text-right font-mono text-white/80">{p.sprints}</div>
                  <div className="col-span-2 text-right">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded" style={{
                      color: status.color,
                      background: status.color + "1A",
                      border: `1px solid ${status.color}44`
                    }}>{status.text}</span>
                  </div>
                </div>
                {/* Recommendation row */}
                <div className="px-3 pb-2 pl-7 flex items-start gap-2">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0" style={{
                    color: rec.color,
                    background: rec.color + "15",
                    border: `1px solid ${rec.color}44`
                  }}>
                    {rec.icon} {rec.label}
                  </span>
                  <p className="text-[10px] text-white/55 leading-relaxed italic flex-1 pt-0.5">
                    {p.rec}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Recommendation legend */}
        <div className="px-3 py-2.5 border-t border-white/10 bg-black/30">
          <div className="text-[9px] uppercase tracking-widest font-mono text-white/40 mb-1.5">Load status key</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(gpsStatus).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 text-[9px]">
                <span className="font-mono font-bold" style={{ color: v.color }}>{v.icon}</span>
                <span className="font-mono font-bold" style={{ color: v.color }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match vs Training comparison */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-bold text-white mb-1">Match vs Training Demand</h3>
        <p className="text-[10px] text-white/40 mb-4">Are training sessions reaching match-day intensities? Outfield-player averages.</p>

        <div className="space-y-3">
          {matchVsTraining.map((m, i) => {
            const ratio = (m.training / m.match) * 100;
            const isGood = ratio >= 80;
            return (
              <div key={i}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] text-white/80 font-bold">{m.metric}</span>
                  <div className="flex items-baseline gap-2 text-[10px] font-mono">
                    <span className="text-white/60">Training <span className="text-white font-bold">{m.training}</span></span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/60">Match <span className="text-white font-bold">{m.match}</span></span>
                    <span className="text-white/30">·</span>
                    <span style={{ color: isGood ? SCOUTS.green : "#FF8C00" }}>{Math.round(ratio)}%</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{
                    width: "100%",
                    background: `linear-gradient(90deg, transparent, ${BHA.blue}33)`
                  }} />
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{
                    width: `${Math.min(ratio, 100)}%`,
                    background: isGood ? SCOUTS.green : "#FF8C00"
                  }} />
                  <div className="absolute inset-y-0 w-px bg-white/30" style={{ left: "100%", transform: "translateX(-1px)" }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/55 italic leading-relaxed">
          <span style={{ color: BHA.blueLight }}>→</span> Sprint count and HSR distance are the two metrics most below match demand. Hürzeler's staff should add a high-intensity SSG block once per microcycle to close the gap.
        </div>
      </div>

      {/* GPS flags - training implications */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-bold text-white mb-1">GPS Flags · Coaching Implications</h3>
        <p className="text-[10px] text-white/40 mb-4">Players whose data suggests adjustments to the weekly plan.</p>

        <div className="space-y-2">
          {gpsFlags.map((f, i) => {
            const flagColors = {
              monitor:   { primary: "#FF3D5A", bg: "rgba(255,61,90,0.06)",  label: "MONITOR" },
              highlight: { primary: SCOUTS.green, bg: "rgba(31,212,62,0.06)",label: "HIGHLIGHT" },
              tactical:  { primary: BHA.blueLight, bg: "rgba(74,158,255,0.06)", label: "TACTICAL" }
            };
            const c = flagColors[f.type];
            return (
              <div key={i} className="rounded p-3 border" style={{ background: c.bg, borderColor: c.primary + "44" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold tracking-widest font-mono px-1.5 py-0.5 rounded" style={{
                    background: c.primary + "22", color: c.primary, border: `1px solid ${c.primary}66`
                  }}>{c.label}</span>
                  <span className="text-[11px] font-bold text-white">{f.player}</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">{f.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ TEAM PERFORMANCE COMPONENT ============
function TeamPerformance() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [statTab, setStatTab] = useState("summary");

  const activeCategory = teamStatCategories[statTab];

  return (
    <div className="space-y-5">
      {/* Recent form strip */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-widest font-mono" style={{ color: BHA.blueLight }}>Recent Form (Most Recent → Oldest)</div>
          <div className="text-[10px] text-white/40 font-mono">Last 5 PL</div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {recentForm.map((m, i) => (
            <div key={i} className="rounded p-2 text-center" style={{
              background: m.result === "W" ? "rgba(31,212,62,0.1)" : m.result === "D" ? "rgba(255,215,0,0.08)" : "rgba(255,61,90,0.08)",
              border: `1px solid ${m.result === "W" ? SCOUTS.green + "44" : m.result === "D" ? "#FFD70044" : "#FF3D5A44"}`
            }}>
              <div className="text-base font-black mb-0.5" style={{ color: m.result === "W" ? SCOUTS.green : m.result === "D" ? "#FFD700" : "#FF3D5A" }}>
                {m.result}
              </div>
              <div className="text-[10px] font-mono font-bold text-white">{m.score}</div>
              <div className="text-[9px] text-white/50 mt-0.5 leading-tight">{m.opp}</div>
              <div className="text-[8px] text-white/30 font-mono mt-0.5">{m.venue} · {m.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Squad table + Position pitch + Team stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Squad table */}
        <div className="lg:col-span-4 rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: BHA.blueLight }}>Squad · Key stats by position</span>
            <span className="text-[9px] text-white/40 font-mono">{squad.length} players</span>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {(() => {
              // Group squad by position group
              const groupedSquad = {
                GK:  { label: "Goalkeepers", color: "#FFD700", players: squad.filter(p => p.pos === "GK") },
                DEF: { label: "Defenders",   color: "#3D8EFF", players: squad.filter(p => ["CB", "LB", "RB"].includes(p.pos)) },
                MID: { label: "Midfielders", color: SCOUTS.green, players: squad.filter(p => ["DM", "CM", "CAM"].includes(p.pos)) },
                FWD: { label: "Forwards",    color: "#FF6B35", players: squad.filter(p => ["LW", "RW", "WG", "ST"].includes(p.pos)) }
              };

              // Position-group-specific column definitions
              const colDefs = {
                GK:  [{ key: "cs",       label: "CS",   tooltip: "Clean sheets" },
                      { key: "savePct",  label: "SAV%", tooltip: "Save percentage" },
                      { key: "distPct",  label: "DST%", tooltip: "Distribution accuracy" },
                      { key: "sweeper",  label: "SWP",  tooltip: "Sweeper actions /90" }],
                DEF: [{ key: "tackles",  label: "TKL",  tooltip: "Tackles /90" },
                      { key: "ints",     label: "INT",  tooltip: "Interceptions /90" },
                      { key: "clr",      label: "CLR",  tooltip: "Clearances /90" },
                      { key: "aer",      label: "AER%", tooltip: "Aerial duels won %" }],
                MID: [{ key: "passPct",  label: "PAS%", tooltip: "Pass accuracy %" },
                      { key: "progPass", label: "PRG",  tooltip: "Progressive passes /90" },
                      { key: "recov",    label: "REC",  tooltip: "Recoveries /90" },
                      { key: "distKm",   label: "DST",  tooltip: "Distance km/match" }],
                FWD: [{ key: "goals",    label: "GLS",  tooltip: "Goals" },
                      { key: "sot",      label: "SoT",  tooltip: "Shots on target" },
                      { key: "drib",     label: "DRB",  tooltip: "Dribbles /90" },
                      { key: "convPct",  label: "CNV%", tooltip: "Shot conversion %" }]
              };

              // Color a value relative to its column
              const valueColor = (groupKey, statKey, value) => {
                // Quick heuristic thresholds for visual highlighting
                const benchmarks = {
                  GK:  { cs: [10, 6], savePct: [72, 67], distPct: [76, 70], sweeper: [1.1, 0.9] },
                  DEF: { tackles: [2.5, 2.0], ints: [2.0, 1.6], clr: [3.5, 2.5], aer: [70, 60] },
                  MID: { passPct: [85, 80], progPass: [4.0, 2.5], recov: [6.0, 4.5], distKm: [10.0, 9.5] },
                  FWD: { goals: [10, 5], sot: [40, 20], drib: [2.0, 1.0], convPct: [13, 10] }
                };
                const bm = benchmarks[groupKey] && benchmarks[groupKey][statKey];
                if (!bm) return "#fff";
                if (value >= bm[0]) return SCOUTS.green;
                if (value >= bm[1]) return "#FFD700";
                return "#FF9D3D";
              };

              return Object.entries(groupedSquad).map(([groupKey, group]) => {
                const cols = colDefs[groupKey];
                return (
                  <div key={groupKey}>
                    {/* Group header */}
                    <div className="px-2 py-1.5 flex items-center justify-between" style={{
                      background: group.color + "15",
                      borderTop: `1px solid ${group.color}33`,
                      borderBottom: `1px solid ${group.color}22`
                    }}>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest" style={{ color: group.color }}>
                        {group.label}
                      </span>
                      <span className="text-[9px] text-white/40 font-mono">{group.players.length}</span>
                    </div>
                    {/* Column headers — position-specific */}
                    <div className="grid grid-cols-12 gap-1 px-2 py-1 text-[8px] font-mono uppercase tracking-wider text-white/40 bg-black/20">
                      <div className="col-span-5">Name</div>
                      {cols.map((c, i) => (
                        <div key={c.key} className="col-span-1 text-center" title={c.tooltip}>{c.label}</div>
                      ))}
                      <div className="col-span-1 text-center">App</div>
                      <div className="col-span-2 text-right text-white/30">G+A</div>
                    </div>
                    {/* Player rows */}
                    <div className="divide-y divide-white/5">
                      {group.players.map(p => (
                        <div
                          key={p.num}
                          onClick={() => setSelectedPlayer(p)}
                          className="grid grid-cols-12 gap-1 px-2 py-1.5 text-[10px] cursor-pointer transition-colors hover:bg-white/[0.04]"
                          style={{
                            background: selectedPlayer && selectedPlayer.num === p.num ? group.color + "1A" : p.starter ? group.color + "08" : "transparent",
                            borderLeft: p.starter ? `2px solid ${group.color}` : "2px solid transparent"
                          }}
                        >
                          <div className="col-span-5 text-white/90 leading-tight flex items-center gap-1 min-w-0">
                            <span className="text-[8px] font-mono text-white/40 flex-shrink-0">#{p.num}</span>
                            <span className="font-bold truncate">{p.name}</span>
                            {p.captain && <span className="text-[7px] font-mono px-1 rounded flex-shrink-0" style={{ background: BHA.blue, color: "#fff" }}>C</span>}
                            {p.topScorer && <span className="text-[8px] flex-shrink-0">⭐</span>}
                          </div>
                          {cols.map(c => {
                            const v = p.keyStats && p.keyStats[c.key];
                            return (
                              <div key={c.key} className="col-span-1 text-center font-mono font-bold" style={{
                                color: typeof v === "number" ? valueColor(groupKey, c.key, v) : "#fff5"
                              }}>
                                {typeof v === "number" ? (v % 1 === 0 ? v : v.toFixed(1)) : "—"}
                              </div>
                            );
                          })}
                          <div className="col-span-1 text-center font-mono text-white/60">{p.apps}</div>
                          <div className="col-span-2 text-right font-mono text-white/55">{p.g}+{p.a}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          {selectedPlayer && (() => {
            // Position-grouped detail panel — shows all keyStats organised into sections
            const isGK = selectedPlayer.pos === "GK";
            const isDEF = ["CB", "LB", "RB"].includes(selectedPlayer.pos);
            const isMID = ["DM", "CM", "CAM"].includes(selectedPlayer.pos);
            const isFWD = ["LW", "RW", "WG", "ST"].includes(selectedPlayer.pos);
            const ks = selectedPlayer.keyStats || {};
            const groupColor = isGK ? "#FFD700" : isDEF ? "#3D8EFF" : isMID ? SCOUTS.green : "#FF6B35";

            // Defensive formatter — returns "—" for any undefined / null value
            const fmt = (val, suffix = "") => (val === undefined || val === null) ? "—" : (val + suffix);

            // Define groups of extended stats per position
            const detailGroups = isGK ? [
              { title: "Shot Stopping",  stats: [["Saves", fmt(ks.saves)], ["Save %", fmt(ks.savePct, "%")], ["Goals conceded", fmt(ks.goalsConc)], ["Shots faced", fmt(ks.shotsFaced)], ["Penalty saves", fmt(ks.penSaves)], ["Min/goal conceded", fmt(ks.minPerGoalConc, "'")]] },
              { title: "Distribution",   stats: [["Pass accuracy", fmt(ks.distPct, "%")], ["Sweeper actions", fmt(ks.sweeper, " /90")]] },
              { title: "Aerial / Box",   stats: [["High claims", fmt(ks.highClaims, " /90")], ["Crosses claimed", fmt(ks.crossesClaimed, " /90")]] }
            ] : isDEF ? [
              { title: "Defending",      stats: [["Tackles", fmt(ks.tackles, " /90")], ["Tackle %", fmt(ks.tklWonPct, "%")], ["Interceptions", fmt(ks.ints, " /90")], ["Clearances", fmt(ks.clr, " /90")], ["Blocks", fmt(ks.blocks, " /90")], ["Recoveries", fmt(ks.recoveries, " /90")]] },
              { title: "Duels & Aerial", stats: [["Aerial duels won", fmt(ks.aer, "%")], ["All duels won", fmt(ks.duelsPct, "%")]] },
              { title: "Discipline",     stats: [["Fouls", fmt(ks.fouls, " /90")], ["Yellow cards", fmt(ks.yellows)]] },
              { title: "Build-up",       stats: [["Pass accuracy", fmt(ks.passPct, "%")], ["Progressive carries", fmt(ks.progCarries, " /90")]] }
            ] : isMID ? [
              { title: "Distribution",   stats: [["Pass accuracy", fmt(ks.passPct, "%")], ["Progressive passes", fmt(ks.progPass, " /90")], ["Ball carries", fmt(ks.ballCarries, " /90")]] },
              { title: "Creating",       stats: [["Key passes", fmt(ks.keyPasses, " /90")], ["Through balls", fmt(ks.throughBalls, " /90")], ["Chances created", fmt(ks.chCreated, " /90")]] },
              { title: "Defending",      stats: [["Tackles", fmt(ks.tackles, " /90")], ["Interceptions", fmt(ks.ints, " /90")], ["Recoveries", fmt(ks.recov, " /90")]] },
              { title: "Workload",       stats: [["Distance", fmt(ks.distKm, " km")], ["Yellow cards", fmt(ks.yellows)], ["Fouls", fmt(ks.fouls, " /90")]] }
            ] : isFWD ? [
              { title: "Goal Output",    stats: [["Goals", fmt(ks.goals)], ["Assists", fmt(ks.assists)], ["Shots on target", fmt(ks.sot)], ["Shot accuracy", fmt(ks.shotAcc, "%")], ["Conversion", fmt(ks.convPct, "%")], ["Min/goal", fmt(ks.minPerGoal, "'")]] },
              { title: "Expected",       stats: [["xG", fmt(ks.xG)], ["xA", fmt(ks.xA)], ["Goals − xG", (typeof ks.xG === "number" ? (selectedPlayer.g - ks.xG).toFixed(1) : "—")]] },
              { title: "Quality",        stats: [["Big chances missed", fmt(ks.bigChMissed)], ["Successful dribbles", fmt(ks.drib, " /90")], ["Fouls won", fmt(ks.foulsWon, " /90")], ["Offsides", fmt(ks.offsides, " /90")]] }
            ] : [];

            return (
              <div className="border-t border-white/10 bg-black/40 max-h-[60vh] overflow-y-auto">
                {/* Header with cyberpunk-style glow */}
                <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 sticky top-0 bg-black/85 backdrop-blur-sm z-10" style={{
                  boxShadow: `inset 0 -1px 0 ${groupColor}33`
                }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{
                      background: groupColor,
                      color: "#000",
                      boxShadow: `0 0 6px ${groupColor}88`
                    }}>#{selectedPlayer.num}</span>
                    <span className="text-sm font-bold text-white truncate" style={{
                      textShadow: `0 0 8px ${groupColor}55`
                    }}>{selectedPlayer.name}</span>
                    {selectedPlayer.captain && <span className="text-[8px] font-mono px-1 rounded flex-shrink-0" style={{ background: BHA.blue, color: "#fff" }}>C</span>}
                    {selectedPlayer.star && <span className="text-[10px] flex-shrink-0">⭐</span>}
                  </div>
                  <button onClick={() => setSelectedPlayer(null)} className="text-white/40 hover:text-white text-xs font-mono px-2 flex-shrink-0">✕</button>
                </div>

                <div className="px-3 py-3 space-y-3">
                  {/* Top-line summary row */}
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    <div className="rounded p-1.5 bg-white/[0.03]">
                      <div className="text-white/40 uppercase tracking-widest text-[8px]">Pos</div>
                      <div className="font-mono font-bold text-base" style={{ color: groupColor, textShadow: `0 0 4px ${groupColor}66` }}>{selectedPlayer.pos}</div>
                    </div>
                    <div className="rounded p-1.5 bg-white/[0.03]">
                      <div className="text-white/40 uppercase tracking-widest text-[8px]">Apps</div>
                      <div className="font-mono font-bold text-white text-base">{selectedPlayer.apps}</div>
                    </div>
                    <div className="rounded p-1.5 bg-white/[0.03]">
                      <div className="text-white/40 uppercase tracking-widest text-[8px]">Goals</div>
                      <div className="font-mono font-bold text-white text-base">{selectedPlayer.g}</div>
                    </div>
                    <div className="rounded p-1.5 bg-white/[0.03]">
                      <div className="text-white/40 uppercase tracking-widest text-[8px]">Assists</div>
                      <div className="font-mono font-bold text-white text-base">{selectedPlayer.a}</div>
                    </div>
                  </div>

                  {/* Extended stat groups */}
                  {detailGroups.map((group, idx) => (
                    <div key={idx} className="rounded p-2.5" style={{
                      background: groupColor + "08",
                      border: `1px solid ${groupColor}22`
                    }}>
                      <div className="text-[9px] uppercase tracking-widest font-mono font-bold mb-2 flex items-center gap-1.5" style={{ color: groupColor }}>
                        <span className="inline-block w-1 h-1 rounded-full" style={{ background: groupColor, boxShadow: `0 0 4px ${groupColor}` }} />
                        {group.title}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {group.stats.map(([label, value], i) => (
                          <div key={i} className="flex justify-between text-[10px] items-baseline">
                            <span className="text-white/55">{label}</span>
                            <span className="font-mono font-bold text-white" style={{
                              textShadow: `0 0 4px ${groupColor}44`
                            }}>{value !== undefined ? value : "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Footer tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] font-mono text-white/40">{selectedPlayer.nation}</span>
                    {selectedPlayer.starter && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: groupColor + "22", color: groupColor }}>STARTER</span>}
                    {selectedPlayer.topScorer && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: CYBER.amber + "22", color: CYBER.amber }}>TOP SCORER</span>}
                    {selectedPlayer.star && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: CYBER.magenta + "22", color: CYBER.magenta, boxShadow: `0 0 6px ${CYBER.magentaGlow}` }}>★ KEY PLAYER</span>}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Position pitch */}
        <div className="lg:col-span-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-2" style={{ color: BHA.blueLight }}>Starting XI · 4-2-3-1</div>
          <TeamPositionPitch players={startingXI} />
          <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/40 leading-relaxed">
            Average positions from recent matches. Blue glow shows touch density per zone.
          </div>
        </div>

        {/* Team stats */}
        <div className="lg:col-span-4 rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: BHA.blueLight }}>Team Stats</span>
            <span className="text-[9px] text-white/40 font-mono">BHA vs PL avg</span>
          </div>
          <div className="flex gap-0.5 p-1 bg-black/30 overflow-x-auto">
            {Object.entries(teamStatCategories).map(([k, c]) => (
              <button key={k} onClick={() => setStatTab(k)} className="shrink-0 px-2 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap" style={{
                background: statTab === k ? BHA.blueLight + "22" : "transparent",
                color: statTab === k ? BHA.blueLight : "rgba(255,255,255,0.4)"
              }}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 grid grid-cols-12 gap-1 text-[9px] font-mono uppercase tracking-wider text-white/40 border-b border-white/5">
            <div className="col-span-6">Stat</div>
            <div className="col-span-3 text-right">BHA</div>
            <div className="col-span-3 text-right">PL avg</div>
          </div>
          <div className="max-h-[440px] overflow-y-auto divide-y divide-white/5">
            {activeCategory.stats.map((s, i) => {
              const isBetter = (s.better === "high" && s.bha > s.avg) || (s.better === "low" && s.bha < s.avg);
              return (
                <div key={i} className="grid grid-cols-12 gap-1 px-3 py-2 text-[10px] items-baseline">
                  <div className="col-span-6 text-white/80 leading-tight">{s.name}<span className="text-white/30 text-[9px] ml-1 font-mono">{s.unit}</span></div>
                  <div className="col-span-3 text-right font-mono font-bold" style={{ color: isBetter ? SCOUTS.green : "#FF6B35" }}>
                    {typeof s.bha === "number" && s.bha < 10 ? s.bha.toFixed(s.bha < 5 ? 2 : 1) : s.bha}
                  </div>
                  <div className="col-span-3 text-right font-mono text-white/50">
                    {typeof s.avg === "number" && s.avg < 10 ? s.avg.toFixed(s.avg < 5 ? 2 : 1) : s.avg}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: training implications */}
      <div className="rounded-lg border p-4" style={{
        borderColor: BHA.blue + "55",
        background: `linear-gradient(135deg, ${BHA.blue}11 0%, rgba(0,0,0,0.4) 100%)`
      }}>
        <div className="text-[10px] uppercase tracking-widest mb-2 font-mono" style={{ color: BHA.blueLight }}>What this means for training</div>
        <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
          <li><span style={{ color: BHA.blueLight }}>▸</span> <strong className="text-white">Strengths to maintain:</strong> Pass accuracy (84% vs 81%), possession (55% vs 50%), dribble success (56% vs 53%). Our ball-retention identity is fundamentally working.</li>
          <li><span style={{ color: BHA.blueLight }}>▸</span> <strong className="text-white">Below-average areas:</strong> Big chance conversion (42% vs 49%), set piece goals (11 vs 14), aerial duels (47% vs 50%). These are the explicit training focus.</li>
          <li><span style={{ color: BHA.blueLight }}>▸</span> <strong className="text-white">Key player risk:</strong> Squad is over-reliant on Mitoma (7.6 rating), Welbeck (top scorer) and Baleba (5.3 progressive passes/match). Build redundancy in succession planning.</li>
        </ul>
      </div>
    </div>
  );
}

// =================================================================
// MAIN APP
// =================================================================

export default function App() {
  const [view, setView] = useState("team");
  const [activeCat, setActiveCat] = useState("buildup");
  const cats = Object.entries(kpiCategories);
  const activeCatData = kpiCategories[activeCat];
  const filteredKpis = kpis.filter(k => k.cat === activeCat);

  return (
    <div className="min-h-screen text-white relative" style={{
      background: "radial-gradient(ellipse at 50% 0%, #0a1828 0%, #050810 60%, #000000 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif"
    }}>
      {/* Global keyframes for the live-LED indicator */}
      <style>{`
        @keyframes scoutsLedBlink {
          0%, 45% {
            opacity: 1;
            box-shadow: 0 0 4px ${SCOUTS.green}, 0 0 10px ${SCOUTS.green}, 0 0 16px ${SCOUTS.green}88;
            transform: scale(1);
          }
          50%, 100% {
            opacity: 0.25;
            box-shadow: 0 0 2px ${SCOUTS.green}44;
            transform: scale(0.92);
          }
        }
        @keyframes morphPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none opacity-[0.22] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: "200px"
      }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {/* HEADER */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <BHACrest size={18} />
            <span style={{ color: BHA.blueLight }}>Brighton &amp; Hove Albion FC</span>
            <span className="flex-1 h-px bg-white/10" />
            <ScoutsBrand small />
          </div>

          <div className="flex items-start gap-2">
            <div className="pt-3"><Bracket side="left" color={BHA.blueLight} /></div>
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-3xl sm:text-4xl font-black leading-[0.95] tracking-tight" style={{
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.035em",
                textShadow: `0 0 12px rgba(255,255,255,0.25), 0 0 24px rgba(61,190,255,0.15)`
              }}>
                The Seagulls' <em style={{
                  color: BHA.blueLight,
                  fontStyle: "italic",
                  textShadow: `0 0 8px ${BHA.blueLight}, 0 0 18px ${BHA.blueLight}88, 0 0 28px ${BHA.blueLight}44`
                }}>Training</em> Dashboard
              </h1>
              <p className="text-xs text-white/50 leading-relaxed italic mt-2">
                Performance, training focus and small-sided games — built from analysis of our recent matches.
              </p>
            </div>
            <div className="pt-3"><Bracket side="right" color={BHA.blueLight} /></div>
          </div>

          {/* Season summary */}
          <div className="grid grid-cols-4 gap-2 mt-6 p-4 rounded-lg border" style={{
            background: "rgba(0,87,184,0.08)",
            borderColor: BHA.blue + "55"
          }}>
            <StatPill label="Position" value={`${seasonSummary.finalPosition}th`} color={BHA.blueLight} />
            <StatPill label="Points" value={seasonSummary.points} color="#FFD700" sub={`${seasonSummary.won}W ${seasonSummary.drawn}D ${seasonSummary.lost}L`} />
            <StatPill label="Goals" value={`${seasonSummary.goalsFor}:${seasonSummary.goalsAgainst}`} color={SCOUTS.green} sub={seasonSummary.goalDiff} />
            <StatPill label="Top Scorer" value={seasonSummary.topScorerGoals} color="#FF6B35" sub={seasonSummary.topScorer} />
          </div>
          <p className="text-[10px] text-white/40 italic text-center mt-2">
            Head Coach: Fabian Hürzeler · Stadium: Falmer (American Express) · Qualified: UEFA Conference League play-off
          </p>
        </header>

        {/* HEADLINE FINDING */}
        <div className="mb-8 p-5 rounded-lg border relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${BHA.blue}15 0%, rgba(0,0,0,0.4) 100%)`,
          borderColor: BHA.blueLight + "55"
        }}>
          <div className="text-[10px] uppercase tracking-widest text-white/50 mb-2 font-mono flex items-center gap-2">
            <span style={{ color: BHA.blueLight }}>●</span> The training thesis
          </div>
          <p className="text-base leading-relaxed text-white/90" style={{ fontFamily: "'Georgia', serif" }}>
            We create chances of <em className="text-white/60">top-6 quality</em> but finish like an 8th-placed side. Our identity in build-up and middle-third control is fundamentally working; the gap is in <strong style={{ color: BHA.blueLight }}>final-third execution and set pieces</strong>.
          </p>
        </div>

        {/* GLOSSARY */}
        <div className="mb-6 p-4 rounded-lg border border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-mono flex items-center gap-2">
            <span style={{ color: BHA.blueLight }}>◆</span> Quick Glossary
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded p-2.5 bg-white/[0.03] border border-white/5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono font-black text-base" style={{ color: BHA.blueLight }}>SSG</span>
                <span className="text-[10px] text-white/40 font-mono">Small-Sided Game</span>
              </div>
              <p className="text-[11px] text-white/65 leading-snug">A training drill with reduced players and pitch size to develop specific tactical skills.</p>
            </div>
            <div className="rounded p-2.5 bg-white/[0.03] border border-white/5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono font-black text-base" style={{ color: BHA.blueLight }}>xG</span>
                <span className="text-[10px] text-white/40 font-mono">Expected Goals</span>
              </div>
              <p className="text-[11px] text-white/65 leading-snug">A statistical model of the average goals a team's shots would score, based on chance quality.</p>
            </div>
            <div className="rounded p-2.5 bg-white/[0.03] border border-white/5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono font-black text-base" style={{ color: BHA.blueLight }}>MR</span>
                <span className="text-[10px] text-white/40 font-mono">Match Rating</span>
              </div>
              <p className="text-[11px] text-white/65 leading-snug">An average performance rating for a player out of 10, across their appearances.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-3 font-mono">Zone codes used on the pitch</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded p-2.5 bg-white/[0.02] border border-white/5">
                <div className="font-mono font-black text-[11px] mb-1 tracking-wider" style={{ color: "#3D8EFF" }}>LD · CD · RD</div>
                <div className="text-[10px] text-white/55 leading-snug">Defensive area — our own defensive third</div>
              </div>
              <div className="rounded p-2.5 bg-white/[0.02] border border-white/5">
                <div className="font-mono font-black text-[11px] mb-1 tracking-wider" style={{ color: "#FFD700" }}>LPD · CPD · RPD</div>
                <div className="text-[10px] text-white/55 leading-snug">Pre-defensive — our middle third</div>
              </div>
              <div className="rounded p-2.5 bg-white/[0.02] border border-white/5">
                <div className="font-mono font-black text-[11px] mb-1 tracking-wider" style={{ color: "#FF8C00" }}>LPO · CPO · RPO</div>
                <div className="text-[10px] text-white/55 leading-snug">Pre-offensive — opposition's middle third</div>
              </div>
              <div className="rounded p-2.5 bg-white/[0.02] border border-white/5">
                <div className="font-mono font-black text-[11px] mb-1 tracking-wider" style={{ color: "#FF3D5A" }}>LO · CO · RO</div>
                <div className="text-[10px] text-white/55 leading-snug">Offensive area — the final third where goals happen</div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg bg-white/[0.03] border border-white/10 overflow-x-auto">
          {[
            { id: "team", label: "Team" },
            { id: "tactics", label: "Tactics" },
            { id: "speed", label: "Speed" },
            { id: "training", label: "Training" },
            { id: "ssgs", label: "SSGs" },
            { id: "pitch", label: "Pitch" },
            { id: "kpis", label: "KPIs" },
            { id: "visuals", label: "Visuals" },
            { id: "insights", label: "Insights" },
            { id: "index", label: "Index" }
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} className="flex-1 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-wider whitespace-nowrap" style={{
              background: view === v.id ? BHA.blueLight + "22" : "transparent",
              color: view === v.id ? BHA.blueLight : "rgba(255,255,255,0.4)",
              border: `1px solid ${view === v.id ? BHA.blueLight + "55" : "transparent"}`
            }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* ======== TEAM PERFORMANCE ======== */}
        {view === "team" && (
          <Section id="01" title="Team Performance" sub="Squad ratings, starting XI positions and team-level stats from our recent matches. Compare against Premier League averages to spot what to work on in training.">
            <TeamPerformance />
          </Section>
        )}

        {/* ======== TACTICS (Zone Data + Game Model) ======== */}
        {view === "tactics" && (
          <Section id="02" title="Tactics" sub="One tactical reference: 'Zone Data' shows where our sequences succeed by thirds and channels; 'Game Model' is the phase-by-phase principles document with animated boards from our match data.">
            <TacticsTab />
          </Section>
        )}

        {/* ======== SPEED THRESHOLD ======== */}
        {view === "speed" && (
          <Section id="03" title="Speed Thresholds · GPS Data" sub="StatSports Apex data from the latest training microcycle. Use this to balance training intensity, monitor sprint exposure and flag players whose load needs adjusting.">
            <SpeedThreshold />
          </Section>
        )}

        {/* ======== TRAINING FOCUS ======== */}
        {view === "training" && (
          <Section id="04" title="Training" sub="The week's plan and the zone-by-zone focus areas that inform it. Mon-Sun shows what's on each day; Zone Focus is the reference document that drives session design.">
            <TrainingTab />
          </Section>
        )}

        {/* ======== SSGs ======== */}
        {view === "ssgs" && (
          <Section id="05" title="Small-Sided Games" sub="Eight game-based training designs adapted to our specific strengths and weaknesses. Each session lists the player numbers from the current squad to make implementation immediate.">
            <div className="space-y-4">
              {ssgs.map(s => <SSGCard key={s.id} ssg={s} />)}
            </div>
          </Section>
        )}

        {/* ======== PITCH ======== */}
        {view === "pitch" && (
          <Section id="06" title="Interactive Pitch" sub="Toggle between build-up success, possession loss rate, and final-third corridor data — all derived from our recent matches.">
            <InteractivePitch />
            <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">Reading the pitch</div>
              <ul className="space-y-2 text-xs text-white/65 leading-relaxed">
                <li><span style={{ color: SCOUTS.green }}>●</span> <strong>Pre-offensive area (us at 37.4%)</strong> is our elite zone — well above the PL average of 34.8%. This is where Mitoma and Minteh isolate.</li>
                <li><span style={{ color: "#FF3D5A" }}>●</span> <strong>Defensive area (us at 8.1% when moves end here)</strong> — the recovery from the Man Utd defeat sits in this number. Two of three conceded goals originated here.</li>
                <li><span style={{ color: SCOUTS.green }}>●</span> <strong>Central corridor (us at 31.2%)</strong> is below the PL average of 34.3% — too many of our entries are wide, too few are central.</li>
              </ul>
            </div>
          </Section>
        )}

        {/* ======== KPIs ======== */}
        {view === "kpis" && (
          <Section id="07" title="KPI Library" sub="Sixteen performance indicators tailored to us. Tap any card to expand its definition, benchmark, target and training application.">
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
              {cats.map(([key, cat]) => (
                <button key={key} onClick={() => setActiveCat(key)} className="shrink-0 px-3 py-2 rounded text-[11px] font-bold transition-all border" style={{
                  background: activeCat === key ? cat.color + "1A" : "rgba(255,255,255,0.02)",
                  borderColor: activeCat === key ? cat.color : "rgba(255,255,255,0.1)",
                  color: activeCat === key ? cat.color : "rgba(255,255,255,0.5)"
                }}>
                  {cat.label}<span className="ml-1.5 opacity-50">({kpis.filter(k => k.cat === key).length})</span>
                </button>
              ))}
            </div>
            <div className="mb-4 p-3 rounded bg-white/[0.02] border-l-2" style={{ borderColor: activeCatData.color }}>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: activeCatData.color }}>{activeCatData.sub}</div>
              <p className="text-xs text-white/60 italic">{activeCatData.description}</p>
            </div>
            <div className="space-y-2">
              {filteredKpis.map(k => <KPICard key={k.id} kpi={k} />)}
            </div>
          </Section>
        )}

        {/* ======== VISUALS ======== */}
        {view === "visuals" && (
          <Section id="08" title="Visual Analysis" sub="Our recent-game data, visualised.">
            <div className="space-y-4">
              <ChartCard title="xG vs Actual Goals" subtitle="Final 9 matchweeks" footnote="We consistently underperform our xG. Across the season, we scored 0.07 goals less per match than expected — that's a finishing problem, not a chance creation problem.">
                <ResponsiveContainer>
                  <AreaChart data={xgVsActual}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="mw" stroke="rgba(255,255,255,0.6)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.2)", fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="xg" name="xG" stroke={BHA.blueLight} fill={BHA.blueLight} fillOpacity={0.2} strokeWidth={2} />
                    <Line type="monotone" dataKey="goals" name="Goals" stroke={SCOUTS.green} strokeWidth={2.5} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Us vs Premier League Average" subtitle="Performance profile by category" height={260} footnote="We're above average in build-up, mid-third control, wide creation and counter-press — and below average in finishing and set pieces. The profile of a side punching tactically above its finishing weight.">
                <ResponsiveContainer>
                  <RadarChart data={playerRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" fontSize={8} angle={90} domain={[0, 100]} />
                    <Radar name="Us" dataKey="bha" stroke={BHA.blueLight} fill={BHA.blueLight} fillOpacity={0.4} strokeWidth={2} />
                    <Radar name="PL avg" dataKey="pl" stroke="rgba(255,255,255,0.4)" fill="rgba(255,255,255,0.1)" strokeWidth={1.5} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Zone Success — Us vs PL Average" subtitle="Where we over- and under-perform" footnote="We out-perform the league across the first three zones. The drop comes in the attacking third, where we finish below average despite generating top-6 quality chances.">
                <ResponsiveContainer>
                  <BarChart data={zoneGap} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="zone" stroke="rgba(255,255,255,0.6)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={10} unit="%" />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.2)", fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar name="Us" dataKey="bha" fill={BHA.blueLight} radius={[4, 4, 0, 0]} />
                    <Bar name="PL avg" dataKey="pl" fill="rgba(255,255,255,0.3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Set Piece Goals — League Comparison" subtitle="Where we sit in the table" footnote="We scored 11 set piece goals across the season, three below the PL average and 11 behind Arsenal. The largest single fixable gap in our profile.">
                <ResponsiveContainer>
                  <BarChart data={setPieceComparison} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="team" stroke="rgba(255,255,255,0.6)" fontSize={8} angle={-15} textAnchor="end" height={40} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.2)", fontSize: 11 }} />
                    <Bar dataKey="goals" radius={[4, 4, 0, 0]}>
                      {setPieceComparison.map((e, i) => (
                        <Cell key={i} fill={e.highlight ? BHA.blueLight : "rgba(255,255,255,0.3)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>
        )}

        {/* ======== INSIGHTS ======== */}
        {view === "insights" && (
          <Section id="09" title="Hidden Insights" sub="The patterns from our recent matches that conventional analysis misses.">
            <div className="space-y-3">
              {insights.map((ins, idx) => {
                const s = severityStyles[ins.severity];
                return (
                  <div key={idx} className="rounded-lg border p-4" style={{ background: s.bg, borderColor: s.border + "44" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold tracking-widest font-mono px-2 py-0.5 rounded" style={{ background: s.border + "22", color: s.text, border: `1px solid ${s.border}66` }}>{s.label}</span>
                      <span className="text-[9px] font-mono text-white/30">#{String(idx + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>{ins.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-3">{ins.body}</p>
                    <div className="text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-white/50 inline-block">{ins.metric}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ======== INDEX ======== */}
        {view === "index" && (
          <Section id="10" title="Index" sub="All training zones, SSGs and KPIs at a glance.">
            <div className="rounded-lg border border-white/10 overflow-hidden mb-6">
              <div className="px-3 py-2 bg-white/[0.04] text-[10px] font-mono uppercase tracking-wider" style={{ color: BHA.blueLight }}>Training Focus Zones</div>
              <div className="divide-y divide-white/5">
                {trainingFocusZones.map(z => (
                  <div key={z.id} className="px-3 py-2.5 flex items-center gap-3 text-[10px] hover:bg-white/[0.02]">
                    <span className="font-mono w-12 shrink-0" style={{ color: BHA.blueLight }}>{z.id}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-bold leading-tight">{z.label}</div>
                      <div className="text-white/40 italic text-[9px]">{z.label_sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 overflow-hidden mb-6">
              <div className="px-3 py-2 bg-white/[0.04] text-[10px] font-mono uppercase tracking-wider" style={{ color: BHA.blueLight }}>Small-Sided Games</div>
              <div className="divide-y divide-white/5">
                {ssgs.map(s => (
                  <div key={s.id} className="px-3 py-2.5 flex items-center gap-3 text-[10px] hover:bg-white/[0.02]">
                    <span className="font-mono w-12 shrink-0" style={{ color: BHA.blueLight }}>{s.id}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-bold leading-tight">{s.name}</div>
                      <div className="text-white/40 italic text-[9px]">{s.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <div className="px-3 py-2 bg-white/[0.04] text-[10px] font-mono uppercase tracking-wider text-white/60">KPIs ({kpis.length})</div>
              <div className="divide-y divide-white/5">
                {kpis.map(k => {
                  const cat = kpiCategories[k.cat];
                  return (
                    <div key={k.id} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-[10px] hover:bg-white/[0.02]">
                      <div className="col-span-1 font-mono text-white/40">{k.id}</div>
                      <div className="col-span-5 text-white/80 leading-tight">{k.name}</div>
                      <div className="col-span-3 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full shrink-0" style={{ background: cat.color }} />
                        <span className="text-white/50">{cat.label}</span>
                      </div>
                      <div className="col-span-2 font-mono font-bold" style={{ color: cat.color }}>{k.success}</div>
                      <div className="col-span-1"><span className="text-[8px] px-1 py-0.5 rounded font-bold" style={{ background: priorityColors[k.priority] + "22", color: priorityColors[k.priority] }}>{k.priority.slice(0, 3).toUpperCase()}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-white/10 text-center space-y-3">
          <div className="flex justify-center items-center gap-3">
            <BHACrest size={18} />
            <ScoutsBrand />
          </div>
          <p className="text-[10px] font-mono text-white/25 leading-relaxed">
            Brighton &amp; Hove Albion Training Dashboard · Built with analysis from recent matches · Some advanced metrics are estimated where public data is incomplete
          </p>
        </footer>

      </div>
    </div>
  );
}
