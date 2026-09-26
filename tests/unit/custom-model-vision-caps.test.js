import { afterEach, describe, expect, it } from "vitest";

import { getCapabilitiesForModel, setCustomCapsSource } from "../../open-sse/providers/capabilities.js";

// #4301: a custom (OpenAI-compatible / Anthropic-compatible) provider's model
// id is opaque to the built-in catalog, so vision was resolved from the model
// NAME alone. `step-5-preview` matches no vision token, so the request path
// stripped images even though the user marked the model vision-capable in the
// dashboard — the flag only ever reached the /api/models catalog response.

const STEP_MODEL = "step/step-5-preview";

function declareCaps(caps) {
  setCustomCapsSource({ getCaps: () => caps });
}

afterEach(() => {
  setCustomCapsSource(null);
});

describe("user-declared caps reach the request path (#4301)", () => {
  it("honours a declared vision flag for an unknown custom model", () => {
    declareCaps({ vision: true });
    expect(getCapabilitiesForModel("my-custom-node", STEP_MODEL).vision).toBe(true);
  });

  it("matches the declaration on the bare id as well as the prefixed one", () => {
    const seen = [];
    setCustomCapsSource({
      getCaps: (provider, model) => {
        seen.push(model);
        return model === "step-5-preview" ? { vision: true } : null;
      },
    });
    expect(getCapabilitiesForModel("my-custom-node", STEP_MODEL).vision).toBe(true);
    // The prefixed id is retried as the bare id, so both forms resolve.
    expect(seen).toContain("step-5-preview");
  });

  it("lets a declaration turn vision OFF for a model the heuristic would flag", () => {
    // Opposite direction: a real text-only model whose id happens to contain
    // "vl" must be declarable as text-only, not forced to vision.
    declareCaps({ vision: false });
    expect(getCapabilitiesForModel("my-custom-node", "some-vl-model").vision).toBe(false);
  });

  it("applies to the built-in tables too, not just unknown ids", () => {
    declareCaps({ vision: false, reasoning: false });
    const caps = getCapabilitiesForModel("anthropic", "claude-opus-5.5");
    expect(caps.vision).toBe(false);
    expect(caps.reasoning).toBe(false);
  });

  it("overrides a pattern-matched model (the heuristic has the last word today)", () => {
    // No source installed -> name heuristic still grants vision.
    expect(getCapabilitiesForModel("my-custom-node", "some-vl-model").vision).toBe(true);
    // Declared -> the user's answer wins.
    declareCaps({ vision: false });
    expect(getCapabilitiesForModel("my-custom-node", "some-vl-model").vision).toBe(false);
  });
});

describe("declaration is scoped and safe", () => {
  it("only applies to the provider that declared it", () => {
    declareCaps({ vision: true });
    expect(getCapabilitiesForModel("node-a", STEP_MODEL).vision).toBe(true);

    setCustomCapsSource({ getCaps: (provider) => (provider === "node-b" ? { vision: true } : null) });
    expect(getCapabilitiesForModel("node-a", STEP_MODEL).vision).toBe(false);
    expect(getCapabilitiesForModel("node-b", STEP_MODEL).vision).toBe(true);
  });

  it("ignores non-boolean and unknown keys", () => {
    declareCaps({ vision: "yes", thinkingFormat: "claude-adaptive", contextWindow: 999999, nope: true });
    const caps = getCapabilitiesForModel("my-custom-node", STEP_MODEL);
    // "yes" is not a boolean -> ignored, and the pattern-matched default stands.
    expect(caps.vision).toBe(false);
    // thinkingFormat/limits are not declarable; the built-in value is untouched.
    expect(caps.thinkingFormat).toBe("step");
    expect(caps.contextWindow).toBe(128000);
  });

  it("fails open when the lookup throws", () => {
    setCustomCapsSource({
      getCaps: () => {
        throw new Error("db unavailable");
      },
    });
    // Must not strip the data — the resolved result is still complete.
    const caps = getCapabilitiesForModel("my-custom-node", STEP_MODEL);
    expect(caps.vision).toBe(false);
    expect(caps.contextWindow).toBe(128000);
  });

  it("is a no-op when no source is installed (browser bundle)", () => {
    setCustomCapsSource(null);
    expect(getCapabilitiesForModel("my-custom-node", STEP_MODEL).vision).toBe(false);
    // Built-in tables keep working.
    expect(getCapabilitiesForModel("anthropic", "claude-opus-5.5").vision).toBe(true);
  });
});
