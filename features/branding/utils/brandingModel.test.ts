import test from "node:test";
import assert from "node:assert/strict";
import {
  CACHE_MAX_BYTES,
  DEFAULT_COLORS,
  appColorsFrom,
  benefitIonicon,
  contrast,
  darken,
  darkEnoughForWhiteText,
  defaultBranding,
  fromCache,
  lighten,
  luminance,
  mailUrl,
  mix,
  normalizeHex,
  parseBranding,
  readableOnWhite,
  safeWebUrl,
  sameColors,
  telUrl,
  toCache,
  welcomeSlides,
} from "./brandingModel.ts";

const OCEAN = { black: "#0b2545", secondary: "#5b6b80", surface: "#f1f6fb", red: "#e5484d", purple: "#1d7afc", success: "#3dab25" };

const FULL = {
  ShopName: " Demo Mart ",
  Email: "hello@demo.example",
  Phone: "+92 313 7675517",
  Address: "1 Main Road",
  NewsletterText: "Join us",
  Theme: { Preset: "ocean", Colors: { ...OCEAN, black: "#ABC", pink: "nope" } },
  Benefits: [{ Icon: "truck", Title: "Free delivery", Description: "Over 5000" }, { Icon: "odd", Title: "Odd icon" }, { Icon: "star", Title: " " }],
  Social: [{ Platform: "Facebook", Url: "https://facebook.com/demo" }, { Platform: "instagram", Url: "javascript:alert(1)" }],
};

test("a full answer is read as the shop's branding", () => {
  const b = parseBranding(FULL);
  assert.equal(b.shopName, "Demo Mart");
  assert.equal(b.email, "hello@demo.example");
  assert.equal(b.phone, "+92 313 7675517");
  assert.equal(b.theme.preset, "ocean");
  assert.equal(b.theme.colors.black, "#aabbcc");
  assert.equal(b.theme.colors.pink, undefined);
  assert.deepEqual(b.benefits.map((x) => [x.icon, x.title]), [["truck", "Free delivery"], ["star", "Odd icon"]]);
  assert.deepEqual(b.social.map((s) => s.url), ["https://facebook.com/demo"]);
});

test("nothing or rubbish gives the neutral default, never an error", () => {
  for (const raw of [undefined, null, 5, "x", [], {}]) {
    const b = parseBranding(raw, "Shop");
    assert.equal(b.shopName, "Shop");
    assert.deepEqual(b.benefits, []);
    assert.deepEqual(b.theme.colors, {});
  }
  assert.equal(defaultBranding("").shopName, "Our Store");
});

test("only web addresses are links", () => {
  assert.equal(safeWebUrl("https://a.example/x"), "https://a.example/x");
  assert.equal(safeWebUrl("http://a.example"), "http://a.example");
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "ftp://a.example", "not a url", "", 5, null]) assert.equal(safeWebUrl(bad), null);
});

test("colour maths", () => {
  assert.equal(normalizeHex(" #ABC "), "#aabbcc");
  assert.equal(mix("#000000", "#ffffff", 0.5), "#808080");
  assert.equal(darken("#ffffff", 1), "#000000");
  assert.equal(lighten("#000000", 1), "#ffffff");
  assert.ok(luminance("#ffffff") > 0.99 && luminance("#000000") < 0.01);
  assert.ok(contrast("#000000", "#ffffff") > 20);
  assert.ok(Math.abs(contrast("#ffffff", "#ffffff") - 1) < 1e-9);
});

test("a light colour is darkened until it reads on white, a dark one is left alone", () => {
  assert.ok(contrast(readableOnWhite("#ffe066"), "#ffffff") >= 3);
  assert.equal(readableOnWhite("#1d7afc", 3), "#1d7afc");
  assert.ok(contrast(darkEnoughForWhiteText("#e8e8e8"), "#ffffff") >= 4.5);
  assert.equal(darkEnoughForWhiteText("#0b2545"), "#0b2545");
});

test("nothing set keeps the app's own colours", () => {
  assert.deepEqual(appColorsFrom(null), DEFAULT_COLORS);
  assert.deepEqual(appColorsFrom({}), DEFAULT_COLORS);
  assert.notEqual(appColorsFrom({}).headerOne, DEFAULT_COLORS.headerOne);     // a copy, never the shared array
});

test("the shop's colours become the app's colours", () => {
  const c = appColorsFrom(OCEAN);
  assert.equal(c.primary, "#1d7afc");
  assert.equal(c.container, "#0b2545");
  assert.equal(c.headerOne[0], "#0b2545");
  assert.notEqual(c.headerOne[1], c.headerOne[0]);
  assert.equal(c.secondary, "#f1f6fb");
  assert.ok(contrast(c.accent, "#ffffff") >= 3);
  assert.ok(contrast(c.error, "#ffffff") >= 3);
  assert.ok(contrast(c.tertiary, "#ffffff") >= 3);
  assert.equal(c.white, DEFAULT_COLORS.white);
  assert.equal(c.textMain, DEFAULT_COLORS.textMain);
});

test("whatever the shop picks stays readable", () => {
  const c = appColorsFrom({ purple: "#fff176", black: "#f5f5f5", surface: "#222222", secondary: "#eeeeee", red: "#ffcdd2", success: "#ccffcc" });
  assert.ok(contrast(c.primary, "#ffffff") >= 3);
  assert.ok(contrast(c.container, "#ffffff") >= 4.5);
  assert.ok(contrast(c.tertiary, "#ffffff") >= 3);
  assert.ok(contrast(c.error, "#ffffff") >= 3);
  assert.ok(contrast(c.success, "#ffffff") >= 3);
  assert.equal(c.secondary, DEFAULT_COLORS.secondary);          // a dark surface would hide the text: the light default stays
});

test("what is kept on the phone is small, and reads back", () => {
  const b = parseBranding(FULL);
  const raw = toCache(b);
  assert.ok(raw.length < CACHE_MAX_BYTES / 4);
  const back = fromCache(raw);
  assert.equal(back.shopName, "Demo Mart");
  assert.deepEqual(back.theme.colors, b.theme.colors);
});

test("a damaged or foreign cache gives the default, never an error", () => {
  for (const raw of [null, undefined, "", "not json", "{}", '{"v":2,"n":"x","c":{}}', "x".repeat(CACHE_MAX_BYTES + 1)]) {
    const b = fromCache(raw, "Shop");
    assert.equal(b.shopName, "Shop");
    assert.deepEqual(b.theme.colors, {});
  }
  assert.deepEqual(fromCache('{"v":1,"n":"A","c":{"black":"red","purple":"#123"}}').theme.colors, { purple: "#112233" });
});

test("changed colours are noticed", () => {
  assert.equal(sameColors({ black: "#000000" }, { black: "#000000" }), true);
  assert.equal(sameColors({ black: "#000000" }, { black: "#111111" }), false);
  assert.equal(sameColors({}, { purple: "#111111" }), false);
  assert.equal(sameColors({}, {}), true);
});

test("phone and email links are safe", () => {
  assert.equal(telUrl("+92 313-7675517"), "tel:+923137675517");
  assert.equal(telUrl("abc"), null);
  assert.equal(telUrl(null), null);
  assert.equal(mailUrl("a@b.co"), "mailto:a@b.co");
  assert.equal(mailUrl("a b@c.com"), null);
});

test("benefit icons map to icons the app has", () => {
  assert.equal(benefitIonicon("truck"), "bicycle-outline");
  assert.equal(benefitIonicon("headset"), "headset-outline");
});

test("the welcome slides are the shop's own points when it has written some", () => {
  const b = parseBranding(FULL);
  const slides = welcomeSlides(b, ["#111111", "#222222"]);
  assert.deepEqual(slides.map((s) => s.title), ["FREE DELIVERY", "ODD ICON"]);
  assert.equal(slides[0].icon, "bicycle-outline");
  assert.equal(slides[0].description, "Over 5000");
  assert.equal(slides[1].description, "Demo Mart");              // no description written: the shop's name
  assert.deepEqual(slides.map((s) => s.accentColor), ["#111111", "#222222"]);
});

test("without points the slides are plain and only use the shop's name", () => {
  const slides = welcomeSlides(defaultBranding("Demo Mart"), ["#111111"]);
  assert.equal(slides.length, 3);
  assert.equal(slides[0].title, "WELCOME TO DEMO MART");
  assert.ok(slides.every((s) => s.accentColor === "#111111"));
  assert.equal(welcomeSlides(defaultBranding("X"), []).length, 3);   // an empty palette never fails
});
