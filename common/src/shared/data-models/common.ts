export interface StorableVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface StorableCFrame extends StorableVector3 {
  readonly r00: number;
  readonly r01: number;
  readonly r02: number;
  readonly r10: number;
  readonly r11: number;
  readonly r12: number;
  readonly r20: number;
  readonly r21: number;
  readonly r22: number;
}