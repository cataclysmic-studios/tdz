import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "common/shared/exceptions";
import * as Dependencies from "common/shared/dependencies";

try {
	Dependencies.registerAll();
	Flamework.addPaths("common/src/client/hook-managers");
	Flamework.addPaths("common/src/client/components");
	Flamework.addPaths("common/src/client/controllers");
	Flamework.addPaths("places/main/src/client/components");
	Flamework.addPaths("places/main/src/client/controllers");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}
