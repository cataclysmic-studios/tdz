import { Controller, type OnInit } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";

import { Events } from "client/network";

@Controller()
export class SoundController implements OnInit {
  public onInit(): void {
    Events.playSoundEffect.connect(name => Sound.SoundEffects[name].Play());
  }
}