import { BaseComponent } from "@flamework/components";
import { RunService as Runtime } from "@rbxts/services";

import { flatten } from "./utility/array";
import { getInstancePath } from "./utility/instances";
import { getName } from "./utility/meta";
import repr from "./utility/repr";

type LogFunctionName = ExtractKeys<typeof Log, Callback>;

const DISABLED: Partial<Record<LogFunctionName, boolean>> = {

};

const log = (category: LogFunctionName, ...messages: defined[]): void => {
  if (DISABLED[category]) return;

  const prefix = `[${category.upper().gsub("_", " ")[0]}]:`;
  if (category === "fatal")
    error(`${prefix} ${flatten(messages).map(v => typeOf(v) === "table" ? repr(v) : v).join(" ")}`, 0);
  else if (category === "warning")
    warn(prefix, ...messages);
  else
    print(prefix, ...messages);
}

namespace Log {
  export class Exception {
    public constructor(
      name: string,
      public readonly message: string,
      public readonly level?: number
    ) {
      Log.fatal(`${name}Exception: ${message}`);
    }
  }

  export function ok(...messages: defined[]): void {
    log("ok", ...messages);
  }

  export function info(...messages: defined[]): void {
    log("info", ...messages);
  }

  export function warning(...messages: defined[]): void {
    log("warning", ...messages);
  }

  export function fatal(...messages: defined[]): void {
    log("fatal", ...messages);
  }

  export function debug(...messages: defined[]): void {
    if (!Runtime.IsStudio()) return;
    log("debug", ...messages);
  }

  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  export async function client_component(component: BaseComponent): Promise<void> {
    log("client_component", `Started ${getName(component)} on ${await getInstancePath(component.instance)}`);
  }

  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  export async function server_component(component: BaseComponent): Promise<void> {
    log("server_component", `Started ${getName(component)} on ${await getInstancePath(component.instance)}`);
  }

  /**
   * @param name Name of the controller
   */
  export function controller(controller: object): void {
    log("controller", `Started ${getName(controller)}`);
  }

  /**
   * @param name Name of the service
   */
  export function service(service: object): void {
    log("service", `Started ${getName(service)}`);
  }
}

export default Log;