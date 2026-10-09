// The DarkOS mark: a "D" whose counter holds an "O". One set of numbers drives
// both the SVG logo and the 3D model, so the two can never drift apart.
// Units are model units, y up, centred on the bowl.

export const MARK = {
  stemX: -1, // outer stem
  R: 1.2, // outer bowl radius (also half the height)
  innerStemX: -0.66,
  r: 0.86, // inner bowl radius
  core: { x: 0.1, r: 0.42 },
  // visual centre of the whole mark on x, used to centre geometry
  centreX: 0.1,
} as const;

// SVG path, y flipped for screen space. Even-odd fill cuts the counter.
export const MARK_PATH = [
  `M ${MARK.stemX} ${MARK.R} L ${MARK.stemX} ${-MARK.R} L 0 ${-MARK.R}`,
  `A ${MARK.R} ${MARK.R} 0 0 1 0 ${MARK.R} Z`,
  `M ${MARK.innerStemX} ${MARK.r} L ${MARK.innerStemX} ${-MARK.r} L 0 ${-MARK.r}`,
  `A ${MARK.r} ${MARK.r} 0 0 1 0 ${MARK.r} Z`,
].join(" ");

export const MARK_VIEWBOX = "-1.12 -1.32 2.44 2.64";
