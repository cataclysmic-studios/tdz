import { Service } from "@flamework/core";
import Matter from "@rbxts/matter";

@Service()
export class MatterService {
  public readonly world = new Matter.World;
}