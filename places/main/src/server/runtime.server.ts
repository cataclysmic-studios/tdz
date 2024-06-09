import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "common/shared/exceptions";
import * as Dependencies from "common/shared/dependencies";

try {
	Dependencies.registerAll();
	Flamework.addPaths("common/src/server/hook-managers");
	Flamework.addPaths("common/src/server/components");
	Flamework.addPaths("common/src/server/services");
	Flamework.addPaths("places/lobby/src/server/components");
	Flamework.addPaths("places/lobby/src/server/services");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}