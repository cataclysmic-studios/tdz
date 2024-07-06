import { Controller, type OnInit } from "@flamework/core";
import type { Components } from "@flamework/components";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";
import Object from "@rbxts/object-utils";

import { Events } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { EnemyInfo } from "shared/entity-components";
import { getRecordDifference, growIn } from "shared/utility";
import { ENEMY_STORAGE } from "shared/constants";
import type { EnemyEntriesRecordPacket } from "shared/packet-structs";

import type { Enemy } from "client/components/enemy";
import type { PathController } from "./path";

@Controller()
export class EnemyController implements OnInit {
  private readonly currentEnemyComponents: Partial<Record<number, Enemy>> = {};
  private currentEnemyRecord: Record<number, Omit<EnemyInfo, "patch">> = {};

  public constructor(
    private readonly components: Components,
    private readonly path: PathController
  ) { }

  public onInit(): void {
    Events.enemyDied.connect(enemy => {
      this.currentEnemyComponents[enemy]?.destroy();
      this.currentEnemyComponents[enemy] = undefined;
    });
    Events.updateEnemies.connect(({ buffer, blobs }) => {
      task.spawn(() => {
        const oldRecord = this.currentEnemyRecord;
        const serializer = createBinarySerializer<EnemyEntriesRecordPacket>();
        const enemyRecordEntries = serializer.deserialize(buffer, blobs);
        this.currentEnemyRecord = Object.fromEntries(enemyRecordEntries);

        for (const [id, enemy] of Object.entries(this.currentEnemyComponents))
          enemy.setInfo(this.currentEnemyRecord[id]);

        const oldRecordEntries = Object.entries(oldRecord);
        const hasAllEnemies = oldRecordEntries.size() > 0
          && Object.keys(enemyRecordEntries).every(key => Object.keys(oldRecord).includes(key));

        if (hasAllEnemies) return;
        if (Object.entries(enemyRecordEntries).size() === 0) return;

        // we have new enemies
        const path = this.path.get();
        if (path === undefined) return;

        const map = path.map;
        const newEnemiesRecord = getRecordDifference(oldRecord, this.currentEnemyRecord);
        const newEnemyEntries = Object.entries(newEnemiesRecord);
        for (const [enemy, info] of newEnemyEntries)
          task.spawn(() => {
            const enemyModel = Assets.Enemies[info.name].Clone();
            const spawnCFrame = map.StartPoint.CFrame.add(new Vector3(0, (info.height / 2) - (map.StartPoint.Size.Y / 2), 0));
            enemyModel.SetAttribute("ID", enemy);
            enemyModel.HumanoidRootPart.CFrame = spawnCFrame;
            enemyModel.Parent = ENEMY_STORAGE;

            growIn(enemyModel);
            if (enemyModel.FindFirstChild("HumanoidRootPart") === undefined || enemyModel.GetAttribute("ID") === undefined) return;
            const enemyComponent = this.components.addComponent<Enemy>(enemyModel);
            this.currentEnemyComponents[enemy] = enemyComponent;
            enemyComponent.setInfo(info);
          });
      })
    });
  }
}