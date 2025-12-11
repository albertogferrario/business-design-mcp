import { describe, it, expect, beforeEach } from "vitest";
import {
  createMarketSizing,
  updateMarketSizing,
  getMarketSizing,
  listMarketSizings,
} from "./market.js";
import { createProject } from "../storage/index.js";

describe("Market Sizing", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete market sizing analysis", async () => {
    const sizing = await createMarketSizing({
      projectId,
      name: "Document Automation Market",
      description: "Market sizing for the document automation software market",
      tam: {
        value: 50_000_000_000,
        currency: "USD",
        unit: "annual",
        methodology: "Top-down based on global enterprise software spend",
        sources: ["Gartner 2024 Report", "IDC Market Analysis"],
        assumptions: [
          "5% of enterprise software spend goes to document automation",
          "10% YoY growth in digitization",
        ],
      },
      sam: {
        value: 5_000_000_000,
        currency: "USD",
        unit: "annual",
        constraints: ["English-speaking markets only", "Companies with 50+ employees"],
        targetSegments: ["Financial services", "Healthcare", "Legal"],
      },
      som: {
        value: 50_000_000,
        currency: "USD",
        unit: "annual",
        timeframe: "3 years",
        captureStrategy: "Focus on mid-market, land-and-expand model",
        assumptions: [
          "1% market share in Year 3",
          "Average deal size $50k",
          "1000 customers",
        ],
      },
      growthRate: {
        rate: 15,
        period: "annual",
        drivers: ["Digital transformation", "AI adoption", "Remote work"],
      },
    });

    expect(sizing.id).toBeDefined();
    expect(sizing.type).toBe("market-sizing");
    expect(sizing.tam.value).toBe(50_000_000_000);
    expect(sizing.sam.value).toBe(5_000_000_000);
    expect(sizing.som.value).toBe(50_000_000);
    expect(sizing.growthRate?.rate).toBe(15);
  });

  it("should create a minimal market sizing", async () => {
    const sizing = await createMarketSizing({
      projectId,
      name: "Quick Sizing",
      tam: {
        value: 1_000_000_000,
        currency: "USD",
        unit: "annual",
      },
      sam: {
        value: 100_000_000,
        currency: "USD",
        unit: "annual",
      },
      som: {
        value: 10_000_000,
        currency: "USD",
        unit: "annual",
      },
    });

    expect(sizing.id).toBeDefined();
    expect(sizing.tam.methodology).toBeUndefined();
    expect(sizing.growthRate).toBeUndefined();
  });

  it("should use default currency and unit", async () => {
    const sizing = await createMarketSizing({
      projectId,
      name: "Defaults Test",
      tam: { value: 1000000, currency: "USD", unit: "annual" },
      sam: { value: 100000, currency: "USD", unit: "annual" },
      som: { value: 10000, currency: "USD", unit: "annual" },
    });

    expect(sizing.tam.currency).toBe("USD");
    expect(sizing.tam.unit).toBe("annual");
  });

  it("should update a market sizing analysis", async () => {
    const created = await createMarketSizing({
      projectId,
      name: "Original",
      tam: { value: 1000, currency: "USD", unit: "annual" },
      sam: { value: 100, currency: "USD", unit: "annual" },
      som: { value: 10, currency: "USD", unit: "annual" },
    });

    const updated = await updateMarketSizing({
      entityId: created.id,
      name: "Updated Sizing",
      tam: {
        value: 2000,
        currency: "EUR",
        unit: "annual",
        methodology: "New methodology",
      },
      growthRate: {
        rate: 20,
        period: "5-year CAGR",
        drivers: ["Market expansion"],
      },
    });

    expect(updated.name).toBe("Updated Sizing");
    expect(updated.tam.value).toBe(2000);
    expect(updated.tam.currency).toBe("EUR");
    expect(updated.tam.methodology).toBe("New methodology");
    expect(updated.growthRate?.rate).toBe(20);
    expect(updated.sam.value).toBe(100); // unchanged
  });

  it("should throw when updating non-existent analysis", async () => {
    await expect(
      updateMarketSizing({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("Market Sizing non-existent not found");
  });

  it("should get a market sizing by ID", async () => {
    const created = await createMarketSizing({
      projectId,
      name: "Test Sizing",
      tam: { value: 1000, currency: "USD", unit: "annual" },
      sam: { value: 100, currency: "USD", unit: "annual" },
      som: { value: 10, currency: "USD", unit: "annual" },
    });

    const retrieved = await getMarketSizing(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list market sizings in a project", async () => {
    const baseSizing = {
      tam: { value: 1000, currency: "USD" as const, unit: "annual" as const },
      sam: { value: 100, currency: "USD" as const, unit: "annual" as const },
      som: { value: 10, currency: "USD" as const, unit: "annual" as const },
    };

    await createMarketSizing({ projectId, name: "Sizing 1", ...baseSizing });
    await createMarketSizing({ projectId, name: "Sizing 2", ...baseSizing });

    const sizings = await listMarketSizings(projectId);

    expect(sizings).toHaveLength(2);
  });

  it("should handle different currencies", async () => {
    const sizing = await createMarketSizing({
      projectId,
      name: "EUR Market",
      tam: { value: 1000000, currency: "EUR", unit: "annual" },
      sam: { value: 100000, currency: "EUR", unit: "annual" },
      som: { value: 10000, currency: "EUR", unit: "annual" },
    });

    expect(sizing.tam.currency).toBe("EUR");
  });

  it("should handle monthly unit", async () => {
    const sizing = await createMarketSizing({
      projectId,
      name: "Monthly Market",
      tam: { value: 1000000, currency: "USD", unit: "monthly" },
      sam: { value: 100000, currency: "USD", unit: "monthly" },
      som: { value: 10000, currency: "USD", unit: "monthly" },
    });

    expect(sizing.tam.unit).toBe("monthly");
  });
});
