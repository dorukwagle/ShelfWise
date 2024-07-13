import {describe, expect, it, vi} from "vitest";

vi.stubEnv("NODE_ENV", "test");

describe.skip("/api/me", () => {
    it('should should succeed', () => {
        expect(3+4).equal(7);
    });
});