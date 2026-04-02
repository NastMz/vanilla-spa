import { JSDOM } from "jsdom";

const trackedGlobals = new Map();

export function installDom(options = {}) {
  const overrides = options.overrides ?? {};
  const dom = new JSDOM(
    options.html ??
      "<!doctype html><html><body><div id=\"app\"></div><div id=\"toast-container\"></div></body></html>",
    {
      pretendToBeVisual: true,
      url: options.url ?? "https://example.test/",
    },
  );

  bindGlobal("window", dom.window);
  bindGlobal("document", dom.window.document);
  bindGlobal("Node", dom.window.Node);
  bindGlobal("HTMLElement", dom.window.HTMLElement);
  bindGlobal("Event", dom.window.Event);
  bindGlobal("CustomEvent", dom.window.CustomEvent);
  bindGlobal("navigator", dom.window.navigator);
  bindGlobal(
    "history",
    pickOverride(overrides, "history", dom.window.history),
  );
  bindGlobal(
    "location",
    pickOverride(overrides, "location", dom.window.location),
  );
  bindGlobal(
    "localStorage",
    pickOverride(overrides, "localStorage", dom.window.localStorage),
  );
  bindGlobal("requestAnimationFrame", (callback) => {
    callback(0);
    return 1;
  });
  bindGlobal("cancelAnimationFrame", () => {});
  bindGlobal("scrollTo", pickOverride(overrides, "scrollTo", () => {}));
  bindGlobal(
    "addEventListener",
    pickOverride(
      overrides,
      "addEventListener",
      dom.window.addEventListener.bind(dom.window),
    ),
  );
  bindGlobal(
    "removeEventListener",
    pickOverride(
      overrides,
      "removeEventListener",
      dom.window.removeEventListener.bind(dom.window),
    ),
  );
  bindGlobal(
    "dispatchEvent",
    pickOverride(
      overrides,
      "dispatchEvent",
      dom.window.dispatchEvent.bind(dom.window),
    ),
  );

  dom.window.scrollTo = pickOverride(overrides, "windowScrollTo", () => {});

  return dom;
}

export function cleanupDom(dom) {
  for (const [name, descriptor] of trackedGlobals) {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      delete globalThis[name];
    }
  }

  trackedGlobals.clear();
  dom.window.close();
}

function bindGlobal(name, value) {
  if (!trackedGlobals.has(name)) {
    trackedGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  }

  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
}

function pickOverride(overrides, name, fallback) {
  if (Object.prototype.hasOwnProperty.call(overrides, name)) {
    return overrides[name];
  }

  return fallback;
}
