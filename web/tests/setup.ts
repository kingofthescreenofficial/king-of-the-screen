import "@testing-library/jest-dom/vitest";
import os from "node:os";
import path from "node:path";

process.env.KOTS_DATABASE_PATH = path.join(os.tmpdir(), `kots-vitest-${process.pid}.sqlite`);
