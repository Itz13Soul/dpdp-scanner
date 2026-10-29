import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateIp, normalizeInput, TargetError } from "../src/lib/target";
import { registrable, isThirdParty } from "../src/lib/domains";

test("private and special addresses are rejected", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700:4700::1111"]) assert.equal(isPrivateIp(ip), false, ip);
});

test("input normalisation accepts domains and rejects risky forms", () => {
  assert.equal(normalizeInput("example.com").href, "https://example.com/");
  assert.equal(normalizeInput("http://example.in/a#x").href, "http://example.in/a");
  for (const bad of ["ftp://example.com", "https://user:pw@example.com", "http://example.com:8080", "http://127.0.0.1", "http://[::1]/", "localhost", "", "javascript:alert(1)"]) {
    assert.throws(() => normalizeInput(bad), TargetError, bad);
  }
});

test("registrable domain handles Indian second-level suffixes", () => {
  assert.equal(registrable("www.example.co.in"), "example.co.in");
  assert.equal(registrable("a.b.example.com"), "example.com");
  assert.equal(isThirdParty("www.shop.in", "cdn.shop.in"), false);
  assert.equal(isThirdParty("shop.in", "www.google-analytics.com"), true);
});
