import test from "node:test";
import assert from "node:assert/strict";
import { CONTACT_LIMITS, CONTACT_TYPES, hasErrors, messageCounter, validateContact } from "./contactForm.ts";

const GOOD = { name: "Ali Khan", email: "ali@example.com", phone: "+92 313 7675517", message: "Hello, I have a question about delivery.", type: 3 };

test("a good message has no errors", () => {
  assert.equal(hasErrors(validateContact(GOOD)), false);
});

test("every field says what is wrong", () => {
  const e = validateContact({ name: " ", email: "nope", phone: "12", message: "short", type: 99 });
  assert.deepEqual(Object.keys(e).sort(), ["email", "message", "name", "phone", "type"]);
});

test("limits match the API", () => {
  assert.ok(validateContact({ ...GOOD, name: "n".repeat(CONTACT_LIMITS.name + 1) }).name);
  assert.ok(validateContact({ ...GOOD, message: "m".repeat(CONTACT_LIMITS.messageMax + 1) }).message);
  assert.equal(validateContact({ ...GOOD, message: "m".repeat(CONTACT_LIMITS.messageMax) }).message, undefined);
  assert.ok(validateContact({ ...GOOD, email: "a".repeat(150) + "@example.com" }).email);
});

test("phone numbers of any country are accepted, rubbish is not", () => {
  for (const phone of ["+923137675517", "0313-7675517", "(021) 345 6789", "+1 333 345 6868"]) {
    assert.equal(validateContact({ ...GOOD, phone }).phone, undefined, phone);
  }
  for (const phone of ["", "abc", "12345", "+92 313 7675517 <b>"]) {
    assert.ok(validateContact({ ...GOOD, phone }).phone, phone);
  }
});

test("every kind is one the API knows", () => {
  assert.deepEqual(CONTACT_TYPES.map((t) => t.value), [1, 2, 3, 4, 5]);
  for (const t of CONTACT_TYPES) assert.equal(validateContact({ ...GOOD, type: t.value }).type, undefined);
});

test("the message counter", () => {
  assert.equal(messageCounter("hello"), "5/4000");
});
