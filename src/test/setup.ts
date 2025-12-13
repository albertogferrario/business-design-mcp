import { beforeEach, afterAll } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { resetDirectoryInit } from "../storage/index.js";

// Create a unique temp directory for each test run
// Include random suffix to avoid collisions between parallel test files
const TEST_DATA_DIR = join(
  tmpdir(),
  `business-design-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

// Set environment variable before any imports
process.env.BUSINESS_DESIGN_DATA_DIR = TEST_DATA_DIR;

async function cleanTestDir(): Promise<void> {
  try {
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {
    // Directory might not exist yet
  }
  // Reset directory initialization state
  resetDirectoryInit();
}

beforeEach(async () => {
  await cleanTestDir();
});

afterAll(async () => {
  await cleanTestDir();
});
