import { type OnInit, type OnStart, Service } from "@flamework/core";
import { startsWith } from "@rbxts/string-utils";
import Signal from "@rbxts/signal";

import type { LogStart } from "shared/hooks";
import type { OnPlayerLeave } from "server/hooks";
import { Events, Functions } from "server/network";
import { type PlayerData, INITIAL_DATA } from "shared/data-models/player-data";
import Firebase from "server/firebase";

@Service({ loadOrder: 0 })
export class DatabaseService implements OnInit, OnStart, OnPlayerLeave, LogStart {
	public readonly loaded = new Signal<(player: Player) => void>;
	public readonly updated = new Signal<(player: Player, directory: string, value: unknown) => void>;
	public playerData: Record<string, PlayerData> = {};

	private db!: Firebase;

	public onInit(): void {
		Events.data.initialize.connect(player => this.setup(player));
		Events.data.set.connect((player, directory, value) => this.set(player, directory, value));
		Events.data.increment.connect((player, directory, amount) => this.increment(player, directory, amount));
		Events.data.decrement.connect((player, directory, amount) => this.decrement(player, directory, amount));
		Events.data.addToArray.connect((player, directory, value) => this.addToArray(player, directory, value));
		Events.data.deleteFromArray.connect((player, directory, value) => this.deleteFromArray(player, directory, value));
		Functions.data.get.setCallback((player, directory, defaultValue) => this.get(player, directory ?? "", defaultValue));
	}

	public onStart(): void {
		this.db = new Firebase;
		this.playerData = this.getDatabase();
	}

	public onPlayerLeave(player: Player): void {
		this.db.set(`playerData/${player.UserId}`, this.getCached(player));
	}

	public get<T>(player: Player, directory: string, defaultValue?: T): T {
		let data: Record<string, unknown> = this.getCached(player);
		if (directory === "") return <T>data;

		const pieces = directory.split("/");
		for (const piece of pieces)
			data = <Record<string, unknown>>(data ?? {})[piece];

		return <T>(data ?? defaultValue);
	}

	public set<T>(player: Player, directory: string, value: T): void {
		let data: Record<string, unknown> = this.getCached(player);
		const pieces = directory.split("/");
		const lastPiece = pieces[pieces.size() - 1];
		for (const piece of pieces) {
			if (piece === lastPiece) continue;
			data = <Record<string, unknown>>(data ?? {})[piece] ?? {};
		}

		data[lastPiece] = value;
		this.update(player, this.getDirectoryForPlayer(player, directory), value);
	}

	public increment(player: Player, directory: string, amount = 1): number {
		const oldValue = this.get<number>(player, directory, 0);
		const value = oldValue + amount;
		this.set(player, directory, value);
		return value;
	}

	public decrement(player: Player, directory: string, amount = 1): number {
		return this.increment(player, directory, -amount);
	}

	public addToArray<T extends defined = defined>(player: Player, directory: string, value: T): void {
		const array = this.get<T[]>(player, directory, []);
		array.push(value);
		this.set(player, directory, array);
	}

	public deleteFromArray<T extends defined = defined>(player: Player, directory: string, value: T): void {
		const array = this.get<T[]>(player, directory);
		array.remove(array.indexOf(value));
		this.set(player, directory, array);
	}

	public filterFromArray<T extends defined = defined>(player: Player, directory: string, filter: (value: T, index: number) => boolean): void {
		const array = this.get<T[]>(player, directory, []);
		this.set(player, directory, array.filter(filter));
	}

	public delete(player: Player, directory: string): void {
		this.set(player, directory, undefined);
	}

	public getDatabase(): Record<string, PlayerData> {
		return this.db.get("playerData", {});
	}

	private getCached(player: Player): PlayerData {
		return this.playerData[tostring(player.UserId)] ?? INITIAL_DATA;
	}

	private update(player: Player, fullDirectory: string, value: unknown): void {
		this.updated.Fire(player, fullDirectory, value);
		Events.data.updated(player, fullDirectory, value);
	}

	private setup(player: Player): void {
		const data = this.db.get<PlayerData>(`playerData/${player.UserId}`, table.clone(INITIAL_DATA));
		this.playerData[tostring(player.UserId)] = data;
		this.initialize(player, "coins", 0);
		this.initialize(player, "ownedTowers", []);
		this.initialize(player, "lastLogin", 0);
		this.initialize(player, "loginStreak", 0);
		this.initialize(player, "claimedDaily", false);
		this.initializeSettings(player);

		this.loaded.Fire(player);
	}

	private initializeSettings(player: Player): void {
		this.initialize(player, "settings/general/autoskip", false);
		this.initialize(player, "settings/audio/sfx", 100);
		this.initialize(player, "settings/audio/music", 100);
		this.initialize(player, "settings/audio/ambience", 100);
		this.initialize(player, "settings/graphics/towerVFX", true);
	}

	private initialize<T>(player: Player, directory: string, initialValue: T): void {
		this.set(player, directory, this.get(player, directory, initialValue));
	}

	private getDirectoryForPlayer(player: Player, directory: string): string {
		if (startsWith(directory, `playerData/${player.UserId}/`))
			return directory;

		return `playerData/${player.UserId}/${directory}`;
	}
}