import { HttpService as HTTP, DataStoreService as DataStore } from "@rbxts/services";
import { endsWith, slice } from "@rbxts/string-utils";
import Object from "@rbxts/object-utils";

import Log from "../shared/logger";

const DB_URL = "https://rbx-tdz-default-rtdb.firebaseio.com/";

export default class Firebase {
  private readonly auth = DataStore.GetDataStore("Secrets", "SUCKMEOFF").GetAsync("FIREBASE_AUTH")[0];
  private readonly authURL = `.json?auth=${this.auth}`;
  private readonly baseURL = this.fixPath(DB_URL) + "/";

  public set(path?: string, value?: unknown, headers: Record<string, string> = { "X-HTTP-Method-Override": "PUT" }): void {
    const valueIsObject = typeOf(value) === "table" && value !== undefined;
    const valueIsEmptyArray = valueIsObject && "size" in <object>value && (<Array<defined>>value).size() === 0;
    const valueIsEmptyObject = valueIsObject && Object.entries(value!).size() === 0;
    if (valueIsEmptyArray || valueIsEmptyObject)
      return this.delete(path);

    try {
      HTTP.PostAsync(
        this.getEndpoint(path),
        HTTP.JSONEncode(value),
        "ApplicationJson",
        false, headers
      );
    } catch (error) {
      Log.fatal(`[Firebase]: ${error}`)
    }
  }

  public get<T>(path?: string, defaultValue?: T): T {
    try {
      return <T>HTTP.JSONDecode(HTTP.GetAsync(this.getEndpoint(path), true)) ?? defaultValue!;
    } catch (error) {
      throw Log.fatal(`[Firebase]: ${error}`);
    }
  }

  public delete(path?: string): void {
    this.set(path, undefined, { "X-HTTP-Method-Override": "DELETE" });
  }

  public reset(): void {
    this.delete("");
  }

  public increment(path?: string, delta = 1): number {
    const result = this.get<number>(path) + delta;
    this.set(path, result);
    return result;
  }

  public addToArray<T extends defined>(path: string, value: T, maxArraySize?: number): void {
    const data = this.get<T[]>(path, []);
    if (maxArraySize !== undefined)
      if (data.size() >= maxArraySize) {
        const diff = data.size() - maxArraySize;
        for (let i = 0; i < diff + 1; i++)
          data.shift();
      }

    data.push(value);
    this.set(path, data);
  }

  private getEndpoint(path?: string): string {
    path = this.fixPath(path);
    return this.baseURL + HTTP.UrlEncode(path === undefined ? "" : `/${path}`) + this.authURL;
  }

  private fixPath(path?: string): string {
    if (path === undefined) return "";
    path = this.removeExtraSlash(path);
    return path;
  }

  private removeExtraSlash(path: string): string {
    if (endsWith(path, "/"))
      path = slice(path, 0, -1);

    return endsWith(path, "/") ? this.removeExtraSlash(path) : path;
  }
}