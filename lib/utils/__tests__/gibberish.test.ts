import { describe, expect, it } from "vitest";
import { detectGibberish } from "../gibberish";

describe("detectGibberish", () => {
  it("returns null for real English text", () => {
    expect(detectGibberish("Managed a team of five engineers to deliver the project on time")).toBeNull();
    expect(detectGibberish("Developed RESTful APIs using Node.js and PostgreSQL")).toBeNull();
    expect(detectGibberish("Led cross-functional collaboration to improve customer satisfaction")).toBeNull();
  });

  it("returns null for short text (below minWords threshold)", () => {
    expect(detectGibberish("abc")).toBeNull();
    expect(detectGibberish("fdsdf fd")).toBeNull();
  });

  it("detects obvious keyboard mashing", () => {
    expect(detectGibberish("sshshf rs hbv eeeehg hs fh dh deth gredsh ehrher vadazf gs")).not.toBeNull();
    expect(detectGibberish("fdshsh rsshshs rshrsh dfghjk qwerty asdfgh")).not.toBeNull();
    expect(detectGibberish("xvbnm zxcvb qwrtp lkjhg mnbvc")).not.toBeNull();
  });

  it("returns null for empty or whitespace-only text", () => {
    expect(detectGibberish("")).toBeNull();
    expect(detectGibberish("   ")).toBeNull();
  });

  it("returns null for text with technical terms and real structure", () => {
    expect(detectGibberish("Implemented CI/CD pipeline using Jenkins and Docker containers")).toBeNull();
    expect(detectGibberish("Reduced server response time by 40% through database optimization")).toBeNull();
  });

  it("respects custom minWords parameter", () => {
    // 2 gibberish words — below default minWords=3, returns null
    expect(detectGibberish("xdf ght")).toBeNull();
    // With minWords=2, it should detect
    expect(detectGibberish("xdf ght plm", 2)).not.toBeNull();
  });

  it("handles mixed real and gibberish words", () => {
    // Mostly real words — should pass
    expect(detectGibberish("Managed the project and delivered results on time")).toBeNull();
    // Almost entirely gibberish with a couple real words — should fail
    expect(detectGibberish("sshshf hbv xccq plmn bvnrt kdjf the zxwq and trrp")).not.toBeNull();
  });
});
