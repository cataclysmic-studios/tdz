import { Bezier } from "./bezier";

export const enum EndOfPathInstruction {
  Stop
}

export class Path {
  /** Contains the total length of the path at the current segment and no further */
  private readonly segmentLengths: number[] = [];
  private totalLength = 0;

  public constructor(
    private readonly map: MapModel
  ) {
    this.calculateLengths();
  }

  public getDirectionAtDistance(distance: number, endInstruction = EndOfPathInstruction.Stop): Vector3 {
    return this.getCFrameAtDistance(distance, endInstruction).LookVector;
  }

  public getPositionAtDistance(distance: number, endInstruction = EndOfPathInstruction.Stop): Vector3 {
    return this.getCFrameAtDistance(distance, endInstruction).Position;
  }

  public getCFrameAtDistance(distance: number, endInstruction = EndOfPathInstruction.Stop): CFrame {
    const nodes = this.getNodes();
    if (distance <= 0)
      return nodes[0].CFrame;
    else if (distance >= this.totalLength)
      switch (endInstruction) {
        // distance is passed by value so it cannot be changed, unsure how to do anything like loop or reverse lol
        // oh well, not useful for this game anyways
        case EndOfPathInstruction.Stop:
          return nodes[nodes.size() - 1].CFrame;
      }

    for (const i of $range(1, this.segmentLengths.size() - 1)) {
      if (distance > this.segmentLengths[i]) continue;

      const segmentDistance = this.segmentLengths[i] - this.segmentLengths[i - 1];
      const t = (distance - this.segmentLengths[i - 1]) / segmentDistance;
      const node0 = nodes[i - 1];
      const node1 = nodes[i];
      const p0 = node0.Position;
      const p3 = node1.Position;
      const direction0 = node0.CFrame.LookVector;
      const direction1 = node1.CFrame.LookVector;

      let position: Vector3;
      let tangent: Vector3;
      if (this.isFacingSameDirection(direction0, direction1)) {
        position = p0.add(p3.sub(p0).mul(t));
        tangent = p3.sub(p0).Unit;
      } else {
        const curveSize = p3.sub(p0).Magnitude / 2;
        const p1 = p0.add(direction0.mul(curveSize));
        const p2 = p3.sub(direction1.mul(curveSize));
        const bezier = new Bezier(p0, p1, p2, p3);
        position = bezier.getPoint(t);
        tangent = bezier.getTangent(t);
      }

      return new CFrame(position, position.add(tangent));
    }

    return nodes[nodes.size() - 1].CFrame; // fallback in case of precision errors
  }

  private calculateLengths(): void {
    this.totalLength = 0; // in case of re-calculation for any wild reason
    this.segmentLengths.clear();
    this.segmentLengths.push(0);

    const nodes = this.getNodes();
    for (const i of $range(1, nodes.size() - 1)) {
      const node0 = nodes[i - 1];
      const node1 = nodes[i];
      const p0 = node0.Position;
      const p3 = node1.Position;
      const direction0 = node0.CFrame.LookVector;
      const direction1 = node1.CFrame.LookVector;

      let segmentLength = 0;
      if (this.isFacingSameDirection(direction0, direction1))
        segmentLength = p3.sub(p0).Magnitude;
      else {
        const curveSize = p3.sub(p0).Magnitude / 2;
        const p1 = p0.add(direction0.mul(curveSize)); // control point one
        const p2 = p3.sub(direction1.mul(curveSize)); // control point two
        const segmentsPerBezier = this.getSegmentsPerBezier();
        for (const j of $range(1, segmentsPerBezier)) {
          const t1 = (j - 1) / segmentsPerBezier;
          const t2 = j / segmentsPerBezier;
          const bezier = new Bezier(p0, p1, p2, p3);
          const bezierP1 = bezier.getPoint(t1);
          const bezierP2 = bezier.getPoint(t2);
          segmentLength += bezierP2.sub(bezierP1).Magnitude;
        }
      }

      this.totalLength += segmentLength;
      this.segmentLengths.push(this.totalLength);
    }
  }

  private getNodes(): Part[] {
    const points = this.map.PathNodes.GetChildren()
      .filter((i): i is Part => i.IsA("Part"))
      .sort((a, b) => tonumber(a.Name)! < tonumber(b.Name)!);

    points.unshift(this.map.StartPoint);
    points.push(this.map.EndPoint);
    return points;
  }

  private isFacingSameDirection(direction1: Vector3, direction2: Vector3): boolean {
    return direction1.Dot(direction2) > 0.99;
  }

  private getSegmentsPerBezier(): number {
    return <number>this.map.GetAttribute("SegmentsPerBezier") ?? 10;
  }
}