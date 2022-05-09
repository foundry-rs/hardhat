#!/usr/bin/env node

import { run } from "./binary";

void (async () => {
  const success = await run();
  if (success) {
    console.log("setup foundryup");
  } else {
    console.log("Failed to setup foundryup");
  }
})();
