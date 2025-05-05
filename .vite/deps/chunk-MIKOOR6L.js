import {
  createClientLogger,
  init_browser
} from "./chunk-SPLQORUU.js";
import {
  jwtDecode
} from "./chunk-FAHVASUX.js";
import {
  __esm,
  __export
} from "./chunk-V4OQ3NZ2.js";

// node_modules/@azure/core-util/node_modules/@azure/abort-controller/dist/browser/AbortError.js
var AbortError;
var init_AbortError = __esm({
  "node_modules/@azure/core-util/node_modules/@azure/abort-controller/dist/browser/AbortError.js"() {
    AbortError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "AbortError";
      }
    };
  }
});

// node_modules/@azure/core-util/node_modules/@azure/abort-controller/dist/browser/index.js
var init_browser2 = __esm({
  "node_modules/@azure/core-util/node_modules/@azure/abort-controller/dist/browser/index.js"() {
    init_AbortError();
  }
});

// node_modules/@azure/core-util/dist/browser/createAbortablePromise.js
function createAbortablePromise(buildPromise, options) {
  const { cleanupBeforeAbort, abortSignal, abortErrorMsg } = options !== null && options !== void 0 ? options : {};
  return new Promise((resolve, reject) => {
    function rejectOnAbort() {
      reject(new AbortError(abortErrorMsg !== null && abortErrorMsg !== void 0 ? abortErrorMsg : "The operation was aborted."));
    }
    function removeListeners() {
      abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.removeEventListener("abort", onAbort);
    }
    function onAbort() {
      cleanupBeforeAbort === null || cleanupBeforeAbort === void 0 ? void 0 : cleanupBeforeAbort();
      removeListeners();
      rejectOnAbort();
    }
    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
      return rejectOnAbort();
    }
    try {
      buildPromise((x) => {
        removeListeners();
        resolve(x);
      }, (x) => {
        removeListeners();
        reject(x);
      });
    } catch (err) {
      reject(err);
    }
    abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", onAbort);
  });
}
var init_createAbortablePromise = __esm({
  "node_modules/@azure/core-util/dist/browser/createAbortablePromise.js"() {
    init_browser2();
  }
});

// node_modules/@azure/core-util/dist/browser/random.js
function getRandomIntegerInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const offset = Math.floor(Math.random() * (max - min + 1));
  return offset + min;
}
var init_random = __esm({
  "node_modules/@azure/core-util/dist/browser/random.js"() {
  }
});

// node_modules/@azure/core-util/dist/browser/delay.js
function delay(timeInMs, options) {
  let token;
  const { abortSignal, abortErrorMsg } = options !== null && options !== void 0 ? options : {};
  return createAbortablePromise((resolve) => {
    token = setTimeout(resolve, timeInMs);
  }, {
    cleanupBeforeAbort: () => clearTimeout(token),
    abortSignal,
    abortErrorMsg: abortErrorMsg !== null && abortErrorMsg !== void 0 ? abortErrorMsg : StandardAbortMessage
  });
}
function calculateRetryDelay(retryAttempt, config) {
  const exponentialDelay = config.retryDelayInMs * Math.pow(2, retryAttempt);
  const clampedDelay = Math.min(config.maxRetryDelayInMs, exponentialDelay);
  const retryAfterInMs = clampedDelay / 2 + getRandomIntegerInclusive(0, clampedDelay / 2);
  return { retryAfterInMs };
}
var StandardAbortMessage;
var init_delay = __esm({
  "node_modules/@azure/core-util/dist/browser/delay.js"() {
    init_createAbortablePromise();
    init_random();
    StandardAbortMessage = "The delay was aborted.";
  }
});

// node_modules/@azure/core-util/dist/browser/aborterUtils.js
async function cancelablePromiseRace(abortablePromiseBuilders, options) {
  var _a4, _b2;
  const aborter = new AbortController();
  function abortHandler() {
    aborter.abort();
  }
  (_a4 = options === null || options === void 0 ? void 0 : options.abortSignal) === null || _a4 === void 0 ? void 0 : _a4.addEventListener("abort", abortHandler);
  try {
    return await Promise.race(abortablePromiseBuilders.map((p) => p({ abortSignal: aborter.signal })));
  } finally {
    aborter.abort();
    (_b2 = options === null || options === void 0 ? void 0 : options.abortSignal) === null || _b2 === void 0 ? void 0 : _b2.removeEventListener("abort", abortHandler);
  }
}
var init_aborterUtils = __esm({
  "node_modules/@azure/core-util/dist/browser/aborterUtils.js"() {
  }
});

// node_modules/@azure/core-util/dist/browser/object.js
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input) && !(input instanceof RegExp) && !(input instanceof Date);
}
var init_object = __esm({
  "node_modules/@azure/core-util/dist/browser/object.js"() {
  }
});

// node_modules/@azure/core-util/dist/browser/error.js
function isError(e) {
  if (isObject(e)) {
    const hasName = typeof e.name === "string";
    const hasMessage = typeof e.message === "string";
    return hasName && hasMessage;
  }
  return false;
}
function getErrorMessage(e) {
  if (isError(e)) {
    return e.message;
  } else {
    let stringified;
    try {
      if (typeof e === "object" && e) {
        stringified = JSON.stringify(e);
      } else {
        stringified = String(e);
      }
    } catch (err) {
      stringified = "[unable to stringify input]";
    }
    return `Unknown error ${stringified}`;
  }
}
var init_error = __esm({
  "node_modules/@azure/core-util/dist/browser/error.js"() {
    init_object();
  }
});

// node_modules/@azure/core-util/dist/browser/bytesEncoding.common.js
function uint8ArrayToString(bytes, format) {
  switch (format) {
    case "utf-8":
      return uint8ArrayToUtf8String(bytes);
    case "base64":
      return uint8ArrayToBase64(bytes);
    case "base64url":
      return uint8ArrayToBase64Url(bytes);
    case "hex":
      return uint8ArrayToHexString(bytes);
  }
}
function stringToUint8Array(value, format) {
  switch (format) {
    case "utf-8":
      return utf8StringToUint8Array(value);
    case "base64":
      return base64ToUint8Array(value);
    case "base64url":
      return base64UrlToUint8Array(value);
    case "hex":
      return hexStringToUint8Array(value);
  }
}
function uint8ArrayToBase64(bytes) {
  return btoa([...bytes].map((x) => String.fromCharCode(x)).join(""));
}
function uint8ArrayToBase64Url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function uint8ArrayToUtf8String(bytes) {
  const decoder = new TextDecoder();
  const dataString = decoder.decode(bytes);
  return dataString;
}
function uint8ArrayToHexString(bytes) {
  return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function utf8StringToUint8Array(value) {
  return new TextEncoder().encode(value);
}
function base64ToUint8Array(value) {
  return new Uint8Array([...atob(value)].map((x) => x.charCodeAt(0)));
}
function base64UrlToUint8Array(value) {
  const base64String = value.replace(/-/g, "+").replace(/_/g, "/");
  return base64ToUint8Array(base64String);
}
function hexStringToUint8Array(value) {
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < value.length / 2; ++i) {
    const highNibble = value[2 * i];
    const lowNibble = value[2 * i + 1];
    if (!hexDigits.has(highNibble) || !hexDigits.has(lowNibble)) {
      return bytes.slice(0, i);
    }
    bytes[i] = parseInt(`${highNibble}${lowNibble}`, 16);
  }
  return bytes;
}
var hexDigits;
var init_bytesEncoding_common = __esm({
  "node_modules/@azure/core-util/dist/browser/bytesEncoding.common.js"() {
    hexDigits = new Set("0123456789abcdefABCDEF");
  }
});

// node_modules/@azure/core-util/dist/browser/bytesEncoding.js
var init_bytesEncoding = __esm({
  "node_modules/@azure/core-util/dist/browser/bytesEncoding.js"() {
    init_bytesEncoding_common();
  }
});

// node_modules/@azure/core-util/dist/browser/sha256.common.js
function getCrypto() {
  if (subtleCrypto) {
    return subtleCrypto;
  }
  if (!self.crypto || !self.crypto.subtle) {
    throw new Error("Your browser environment does not support cryptography functions.");
  }
  subtleCrypto = self.crypto.subtle;
  return subtleCrypto;
}
async function computeSha256Hmac(key, stringToSign, encoding) {
  const crypto = getCrypto();
  const keyBytes = stringToUint8Array(key, "base64");
  const stringToSignBytes = stringToUint8Array(stringToSign, "utf-8");
  const cryptoKey = await crypto.importKey("raw", keyBytes, {
    name: "HMAC",
    hash: { name: "SHA-256" }
  }, false, ["sign"]);
  const signature = await crypto.sign({
    name: "HMAC",
    hash: { name: "SHA-256" }
  }, cryptoKey, stringToSignBytes);
  return uint8ArrayToString(new Uint8Array(signature), encoding);
}
async function computeSha256Hash(content, encoding) {
  const contentBytes = stringToUint8Array(content, "utf-8");
  const digest = await getCrypto().digest({ name: "SHA-256" }, contentBytes);
  return uint8ArrayToString(new Uint8Array(digest), encoding);
}
var subtleCrypto;
var init_sha256_common = __esm({
  "node_modules/@azure/core-util/dist/browser/sha256.common.js"() {
    init_bytesEncoding();
  }
});

// node_modules/@azure/core-util/dist/browser/sha256.js
var init_sha256 = __esm({
  "node_modules/@azure/core-util/dist/browser/sha256.js"() {
    init_sha256_common();
  }
});

// node_modules/@azure/core-util/dist/browser/typeGuards.js
function isDefined(thing) {
  return typeof thing !== "undefined" && thing !== null;
}
function isObjectWithProperties(thing, properties) {
  if (!isDefined(thing) || typeof thing !== "object") {
    return false;
  }
  for (const property of properties) {
    if (!objectHasProperty(thing, property)) {
      return false;
    }
  }
  return true;
}
function objectHasProperty(thing, property) {
  return isDefined(thing) && typeof thing === "object" && property in thing;
}
var init_typeGuards = __esm({
  "node_modules/@azure/core-util/dist/browser/typeGuards.js"() {
  }
});

// node_modules/@azure/core-util/dist/browser/uuidUtils.common.js
function generateUUID() {
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    const randomNumber = Math.floor(Math.random() * 16);
    if (i === 12) {
      uuid += "4";
    } else if (i === 16) {
      uuid += randomNumber & 3 | 8;
    } else {
      uuid += randomNumber.toString(16);
    }
    if (i === 7 || i === 11 || i === 15 || i === 19) {
      uuid += "-";
    }
  }
  return uuid;
}
var init_uuidUtils_common = __esm({
  "node_modules/@azure/core-util/dist/browser/uuidUtils.common.js"() {
  }
});

// node_modules/@azure/core-util/dist/browser/uuidUtils.js
function randomUUID() {
  return uuidFunction();
}
var _a2, uuidFunction;
var init_uuidUtils = __esm({
  "node_modules/@azure/core-util/dist/browser/uuidUtils.js"() {
    init_uuidUtils_common();
    uuidFunction = typeof ((_a2 = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a2 === void 0 ? void 0 : _a2.randomUUID) === "function" ? globalThis.crypto.randomUUID.bind(globalThis.crypto) : generateUUID;
  }
});

// node_modules/@azure/core-util/dist/browser/checkEnvironment.js
var _a3, _b, _c, _d, isBrowser, isWebWorker, isDeno, isBun, isNodeLike, isNode, isNodeRuntime, isReactNative;
var init_checkEnvironment = __esm({
  "node_modules/@azure/core-util/dist/browser/checkEnvironment.js"() {
    isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
    isWebWorker = typeof self === "object" && typeof (self === null || self === void 0 ? void 0 : self.importScripts) === "function" && (((_a3 = self.constructor) === null || _a3 === void 0 ? void 0 : _a3.name) === "DedicatedWorkerGlobalScope" || ((_b = self.constructor) === null || _b === void 0 ? void 0 : _b.name) === "ServiceWorkerGlobalScope" || ((_c = self.constructor) === null || _c === void 0 ? void 0 : _c.name) === "SharedWorkerGlobalScope");
    isDeno = typeof Deno !== "undefined" && typeof Deno.version !== "undefined" && typeof Deno.version.deno !== "undefined";
    isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
    isNodeLike = typeof globalThis.process !== "undefined" && Boolean(globalThis.process.version) && Boolean((_d = globalThis.process.versions) === null || _d === void 0 ? void 0 : _d.node);
    isNode = isNodeLike;
    isNodeRuntime = isNodeLike && !isBun && !isDeno;
    isReactNative = typeof navigator !== "undefined" && (navigator === null || navigator === void 0 ? void 0 : navigator.product) === "ReactNative";
  }
});

// node_modules/@azure/core-util/dist/browser/index.js
var browser_exports = {};
__export(browser_exports, {
  calculateRetryDelay: () => calculateRetryDelay,
  cancelablePromiseRace: () => cancelablePromiseRace,
  computeSha256Hash: () => computeSha256Hash,
  computeSha256Hmac: () => computeSha256Hmac,
  createAbortablePromise: () => createAbortablePromise,
  delay: () => delay,
  getErrorMessage: () => getErrorMessage,
  getRandomIntegerInclusive: () => getRandomIntegerInclusive,
  isBrowser: () => isBrowser,
  isBun: () => isBun,
  isDefined: () => isDefined,
  isDeno: () => isDeno,
  isError: () => isError,
  isNode: () => isNode,
  isNodeLike: () => isNodeLike,
  isNodeRuntime: () => isNodeRuntime,
  isObject: () => isObject,
  isObjectWithProperties: () => isObjectWithProperties,
  isReactNative: () => isReactNative,
  isWebWorker: () => isWebWorker,
  objectHasProperty: () => objectHasProperty,
  randomUUID: () => randomUUID,
  stringToUint8Array: () => stringToUint8Array,
  uint8ArrayToString: () => uint8ArrayToString
});
var init_browser3 = __esm({
  "node_modules/@azure/core-util/dist/browser/index.js"() {
    init_delay();
    init_aborterUtils();
    init_createAbortablePromise();
    init_random();
    init_object();
    init_error();
    init_sha256();
    init_typeGuards();
    init_uuidUtils();
    init_checkEnvironment();
    init_bytesEncoding();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/pipeline.js
function createEmptyPipeline() {
  return HttpPipeline.create();
}
var ValidPhaseNames, HttpPipeline;
var init_pipeline = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/pipeline.js"() {
    ValidPhaseNames = /* @__PURE__ */ new Set(["Deserialize", "Serialize", "Retry", "Sign"]);
    HttpPipeline = class _HttpPipeline {
      constructor(policies) {
        var _a4;
        this._policies = [];
        this._policies = (_a4 = policies === null || policies === void 0 ? void 0 : policies.slice(0)) !== null && _a4 !== void 0 ? _a4 : [];
        this._orderedPolicies = void 0;
      }
      addPolicy(policy, options = {}) {
        if (options.phase && options.afterPhase) {
          throw new Error("Policies inside a phase cannot specify afterPhase.");
        }
        if (options.phase && !ValidPhaseNames.has(options.phase)) {
          throw new Error(`Invalid phase name: ${options.phase}`);
        }
        if (options.afterPhase && !ValidPhaseNames.has(options.afterPhase)) {
          throw new Error(`Invalid afterPhase name: ${options.afterPhase}`);
        }
        this._policies.push({
          policy,
          options
        });
        this._orderedPolicies = void 0;
      }
      removePolicy(options) {
        const removedPolicies = [];
        this._policies = this._policies.filter((policyDescriptor) => {
          if (options.name && policyDescriptor.policy.name === options.name || options.phase && policyDescriptor.options.phase === options.phase) {
            removedPolicies.push(policyDescriptor.policy);
            return false;
          } else {
            return true;
          }
        });
        this._orderedPolicies = void 0;
        return removedPolicies;
      }
      sendRequest(httpClient, request) {
        const policies = this.getOrderedPolicies();
        const pipeline = policies.reduceRight((next, policy) => {
          return (req) => {
            return policy.sendRequest(req, next);
          };
        }, (req) => httpClient.sendRequest(req));
        return pipeline(request);
      }
      getOrderedPolicies() {
        if (!this._orderedPolicies) {
          this._orderedPolicies = this.orderPolicies();
        }
        return this._orderedPolicies;
      }
      clone() {
        return new _HttpPipeline(this._policies);
      }
      static create() {
        return new _HttpPipeline();
      }
      orderPolicies() {
        const result = [];
        const policyMap = /* @__PURE__ */ new Map();
        function createPhase(name) {
          return {
            name,
            policies: /* @__PURE__ */ new Set(),
            hasRun: false,
            hasAfterPolicies: false
          };
        }
        const serializePhase = createPhase("Serialize");
        const noPhase = createPhase("None");
        const deserializePhase = createPhase("Deserialize");
        const retryPhase = createPhase("Retry");
        const signPhase = createPhase("Sign");
        const orderedPhases = [serializePhase, noPhase, deserializePhase, retryPhase, signPhase];
        function getPhase(phase) {
          if (phase === "Retry") {
            return retryPhase;
          } else if (phase === "Serialize") {
            return serializePhase;
          } else if (phase === "Deserialize") {
            return deserializePhase;
          } else if (phase === "Sign") {
            return signPhase;
          } else {
            return noPhase;
          }
        }
        for (const descriptor of this._policies) {
          const policy = descriptor.policy;
          const options = descriptor.options;
          const policyName = policy.name;
          if (policyMap.has(policyName)) {
            throw new Error("Duplicate policy names not allowed in pipeline");
          }
          const node = {
            policy,
            dependsOn: /* @__PURE__ */ new Set(),
            dependants: /* @__PURE__ */ new Set()
          };
          if (options.afterPhase) {
            node.afterPhase = getPhase(options.afterPhase);
            node.afterPhase.hasAfterPolicies = true;
          }
          policyMap.set(policyName, node);
          const phase = getPhase(options.phase);
          phase.policies.add(node);
        }
        for (const descriptor of this._policies) {
          const { policy, options } = descriptor;
          const policyName = policy.name;
          const node = policyMap.get(policyName);
          if (!node) {
            throw new Error(`Missing node for policy ${policyName}`);
          }
          if (options.afterPolicies) {
            for (const afterPolicyName of options.afterPolicies) {
              const afterNode = policyMap.get(afterPolicyName);
              if (afterNode) {
                node.dependsOn.add(afterNode);
                afterNode.dependants.add(node);
              }
            }
          }
          if (options.beforePolicies) {
            for (const beforePolicyName of options.beforePolicies) {
              const beforeNode = policyMap.get(beforePolicyName);
              if (beforeNode) {
                beforeNode.dependsOn.add(node);
                node.dependants.add(beforeNode);
              }
            }
          }
        }
        function walkPhase(phase) {
          phase.hasRun = true;
          for (const node of phase.policies) {
            if (node.afterPhase && (!node.afterPhase.hasRun || node.afterPhase.policies.size)) {
              continue;
            }
            if (node.dependsOn.size === 0) {
              result.push(node.policy);
              for (const dependant of node.dependants) {
                dependant.dependsOn.delete(node);
              }
              policyMap.delete(node.policy.name);
              phase.policies.delete(node);
            }
          }
        }
        function walkPhases() {
          for (const phase of orderedPhases) {
            walkPhase(phase);
            if (phase.policies.size > 0 && phase !== noPhase) {
              if (!noPhase.hasRun) {
                walkPhase(noPhase);
              }
              return;
            }
            if (phase.hasAfterPolicies) {
              walkPhase(noPhase);
            }
          }
        }
        let iteration = 0;
        while (policyMap.size > 0) {
          iteration++;
          const initialResultLength = result.length;
          walkPhases();
          if (result.length <= initialResultLength && iteration > 1) {
            throw new Error("Cannot satisfy policy dependencies due to requirements cycle.");
          }
        }
        return result;
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/log.js
var logger;
var init_log = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/log.js"() {
    init_browser();
    logger = createClientLogger("core-rest-pipeline");
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/sanitizer.js
var RedactedString, defaultAllowedHeaderNames, defaultAllowedQueryParameters, Sanitizer;
var init_sanitizer = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/sanitizer.js"() {
    init_browser3();
    RedactedString = "REDACTED";
    defaultAllowedHeaderNames = [
      "x-ms-client-request-id",
      "x-ms-return-client-request-id",
      "x-ms-useragent",
      "x-ms-correlation-request-id",
      "x-ms-request-id",
      "client-request-id",
      "ms-cv",
      "return-client-request-id",
      "traceparent",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Origin",
      "Access-Control-Expose-Headers",
      "Access-Control-Max-Age",
      "Access-Control-Request-Headers",
      "Access-Control-Request-Method",
      "Origin",
      "Accept",
      "Accept-Encoding",
      "Cache-Control",
      "Connection",
      "Content-Length",
      "Content-Type",
      "Date",
      "ETag",
      "Expires",
      "If-Match",
      "If-Modified-Since",
      "If-None-Match",
      "If-Unmodified-Since",
      "Last-Modified",
      "Pragma",
      "Request-Id",
      "Retry-After",
      "Server",
      "Transfer-Encoding",
      "User-Agent",
      "WWW-Authenticate"
    ];
    defaultAllowedQueryParameters = ["api-version"];
    Sanitizer = class {
      constructor({ additionalAllowedHeaderNames: allowedHeaderNames = [], additionalAllowedQueryParameters: allowedQueryParameters = [] } = {}) {
        allowedHeaderNames = defaultAllowedHeaderNames.concat(allowedHeaderNames);
        allowedQueryParameters = defaultAllowedQueryParameters.concat(allowedQueryParameters);
        this.allowedHeaderNames = new Set(allowedHeaderNames.map((n) => n.toLowerCase()));
        this.allowedQueryParameters = new Set(allowedQueryParameters.map((p) => p.toLowerCase()));
      }
      sanitize(obj) {
        const seen = /* @__PURE__ */ new Set();
        return JSON.stringify(obj, (key, value) => {
          if (value instanceof Error) {
            return Object.assign(Object.assign({}, value), { name: value.name, message: value.message });
          }
          if (key === "headers") {
            return this.sanitizeHeaders(value);
          } else if (key === "url") {
            return this.sanitizeUrl(value);
          } else if (key === "query") {
            return this.sanitizeQuery(value);
          } else if (key === "body") {
            return void 0;
          } else if (key === "response") {
            return void 0;
          } else if (key === "operationSpec") {
            return void 0;
          } else if (Array.isArray(value) || isObject(value)) {
            if (seen.has(value)) {
              return "[Circular]";
            }
            seen.add(value);
          }
          return value;
        }, 2);
      }
      sanitizeUrl(value) {
        if (typeof value !== "string" || value === null || value === "") {
          return value;
        }
        const url = new URL(value);
        if (!url.search) {
          return value;
        }
        for (const [key] of url.searchParams) {
          if (!this.allowedQueryParameters.has(key.toLowerCase())) {
            url.searchParams.set(key, RedactedString);
          }
        }
        return url.toString();
      }
      sanitizeHeaders(obj) {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
          if (this.allowedHeaderNames.has(key.toLowerCase())) {
            sanitized[key] = obj[key];
          } else {
            sanitized[key] = RedactedString;
          }
        }
        return sanitized;
      }
      sanitizeQuery(value) {
        if (typeof value !== "object" || value === null) {
          return value;
        }
        const sanitized = {};
        for (const k of Object.keys(value)) {
          if (this.allowedQueryParameters.has(k.toLowerCase())) {
            sanitized[k] = value[k];
          } else {
            sanitized[k] = RedactedString;
          }
        }
        return sanitized;
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/logPolicy.js
function logPolicy(options = {}) {
  var _a4;
  const logger2 = (_a4 = options.logger) !== null && _a4 !== void 0 ? _a4 : logger.info;
  const sanitizer = new Sanitizer({
    additionalAllowedHeaderNames: options.additionalAllowedHeaderNames,
    additionalAllowedQueryParameters: options.additionalAllowedQueryParameters
  });
  return {
    name: logPolicyName,
    async sendRequest(request, next) {
      if (!logger2.enabled) {
        return next(request);
      }
      logger2(`Request: ${sanitizer.sanitize(request)}`);
      const response = await next(request);
      logger2(`Response status code: ${response.status}`);
      logger2(`Headers: ${sanitizer.sanitize(response.headers)}`);
      return response;
    }
  };
}
var logPolicyName;
var init_logPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/logPolicy.js"() {
    init_log();
    init_sanitizer();
    logPolicyName = "logPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/redirectPolicy.js
function redirectPolicy(options = {}) {
  const { maxRetries = 20 } = options;
  return {
    name: redirectPolicyName,
    async sendRequest(request, next) {
      const response = await next(request);
      return handleRedirect(next, response, maxRetries);
    }
  };
}
async function handleRedirect(next, response, maxRetries, currentRetries = 0) {
  const { request, status, headers } = response;
  const locationHeader = headers.get("location");
  if (locationHeader && (status === 300 || status === 301 && allowedRedirect.includes(request.method) || status === 302 && allowedRedirect.includes(request.method) || status === 303 && request.method === "POST" || status === 307) && currentRetries < maxRetries) {
    const url = new URL(locationHeader, request.url);
    request.url = url.toString();
    if (status === 303) {
      request.method = "GET";
      request.headers.delete("Content-Length");
      delete request.body;
    }
    request.headers.delete("Authorization");
    const res = await next(request);
    return handleRedirect(next, res, maxRetries, currentRetries + 1);
  }
  return response;
}
var redirectPolicyName, allowedRedirect;
var init_redirectPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/redirectPolicy.js"() {
    redirectPolicyName = "redirectPolicy";
    allowedRedirect = ["GET", "HEAD"];
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/userAgentPlatform.js
function getHeaderName() {
  return "x-ms-useragent";
}
function getBrowserInfo(userAgent) {
  const browserRegexes = [
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari/ }
  ];
  for (const browser of browserRegexes) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return { brand: browser.name, version: match[1] };
    }
  }
  return void 0;
}
function getBrandVersionString(brands) {
  const brandOrder = ["Google Chrome", "Microsoft Edge", "Opera", "Brave", "Chromium"];
  for (const brand of brandOrder) {
    const foundBrand = brands.find((b) => b.brand === brand);
    if (foundBrand) {
      return foundBrand;
    }
  }
  return void 0;
}
async function setPlatformSpecificData(map) {
  const localNavigator = globalThis.navigator;
  let osPlatform = "unknown";
  if (localNavigator === null || localNavigator === void 0 ? void 0 : localNavigator.userAgentData) {
    const entropyValues = await localNavigator.userAgentData.getHighEntropyValues([
      "architecture",
      "platformVersion"
    ]);
    osPlatform = `${entropyValues.architecture}-${entropyValues.platform}-${entropyValues.platformVersion}`;
    const brand = getBrandVersionString(localNavigator.userAgentData.brands);
    if (brand) {
      map.set(brand.brand, brand.version);
    }
  } else if (localNavigator === null || localNavigator === void 0 ? void 0 : localNavigator.platform) {
    osPlatform = localNavigator.platform;
    const brand = getBrowserInfo(localNavigator.userAgent);
    if (brand) {
      map.set(brand.brand, brand.version);
    }
  } else if (typeof globalThis.EdgeRuntime === "string") {
    map.set("EdgeRuntime", globalThis.EdgeRuntime);
  }
  map.set("OS", osPlatform);
}
var init_userAgentPlatform = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/userAgentPlatform.js"() {
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/constants.js
var SDK_VERSION, DEFAULT_RETRY_POLICY_COUNT;
var init_constants = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/constants.js"() {
    SDK_VERSION = "1.19.1";
    DEFAULT_RETRY_POLICY_COUNT = 3;
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/userAgent.js
function getUserAgentString(telemetryInfo) {
  const parts = [];
  for (const [key, value] of telemetryInfo) {
    const token = value ? `${key}/${value}` : key;
    parts.push(token);
  }
  return parts.join(" ");
}
function getUserAgentHeaderName() {
  return getHeaderName();
}
async function getUserAgentValue(prefix) {
  const runtimeInfo = /* @__PURE__ */ new Map();
  runtimeInfo.set("core-rest-pipeline", SDK_VERSION);
  await setPlatformSpecificData(runtimeInfo);
  const defaultAgent = getUserAgentString(runtimeInfo);
  const userAgentValue = prefix ? `${prefix} ${defaultAgent}` : defaultAgent;
  return userAgentValue;
}
var init_userAgent = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/userAgent.js"() {
    init_userAgentPlatform();
    init_constants();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/userAgentPolicy.js
function userAgentPolicy(options = {}) {
  const userAgentValue = getUserAgentValue(options.userAgentPrefix);
  return {
    name: userAgentPolicyName,
    async sendRequest(request, next) {
      if (!request.headers.has(UserAgentHeaderName)) {
        request.headers.set(UserAgentHeaderName, await userAgentValue);
      }
      return next(request);
    }
  };
}
var UserAgentHeaderName, userAgentPolicyName;
var init_userAgentPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/userAgentPolicy.js"() {
    init_userAgent();
    UserAgentHeaderName = getUserAgentHeaderName();
    userAgentPolicyName = "userAgentPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/typeGuards.js
function isNodeReadableStream(x) {
  return Boolean(x && typeof x["pipe"] === "function");
}
function isWebReadableStream(x) {
  return Boolean(x && typeof x.getReader === "function" && typeof x.tee === "function");
}
function isBlob(x) {
  return typeof x.stream === "function";
}
var init_typeGuards2 = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/typeGuards.js"() {
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/file.js
function hasRawContent(x) {
  return typeof x[rawContent] === "function";
}
function getRawContent(blob) {
  if (hasRawContent(blob)) {
    return blob[rawContent]();
  } else {
    return blob.stream();
  }
}
function createFileFromStream(stream, name, options = {}) {
  var _a4, _b2, _c2, _d2;
  return Object.assign(Object.assign({}, unimplementedMethods), { type: (_a4 = options.type) !== null && _a4 !== void 0 ? _a4 : "", lastModified: (_b2 = options.lastModified) !== null && _b2 !== void 0 ? _b2 : (/* @__PURE__ */ new Date()).getTime(), webkitRelativePath: (_c2 = options.webkitRelativePath) !== null && _c2 !== void 0 ? _c2 : "", size: (_d2 = options.size) !== null && _d2 !== void 0 ? _d2 : -1, name, stream: () => {
    const s = stream();
    if (isNodeReadableStream(s)) {
      throw new Error("Not supported: a Node stream was provided as input to createFileFromStream.");
    }
    return s;
  }, [rawContent]: stream });
}
function createFile(content, name, options = {}) {
  var _a4, _b2, _c2;
  if (isNodeLike) {
    return Object.assign(Object.assign({}, unimplementedMethods), { type: (_a4 = options.type) !== null && _a4 !== void 0 ? _a4 : "", lastModified: (_b2 = options.lastModified) !== null && _b2 !== void 0 ? _b2 : (/* @__PURE__ */ new Date()).getTime(), webkitRelativePath: (_c2 = options.webkitRelativePath) !== null && _c2 !== void 0 ? _c2 : "", size: content.byteLength, name, arrayBuffer: async () => content.buffer, stream: () => new Blob([content]).stream(), [rawContent]: () => content });
  } else {
    return new File([content], name, options);
  }
}
var unimplementedMethods, rawContent;
var init_file = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/file.js"() {
    init_browser3();
    init_typeGuards2();
    unimplementedMethods = {
      arrayBuffer: () => {
        throw new Error("Not implemented");
      },
      bytes: () => {
        throw new Error("Not implemented");
      },
      slice: () => {
        throw new Error("Not implemented");
      },
      text: () => {
        throw new Error("Not implemented");
      }
    };
    rawContent = Symbol("rawContent");
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/concat.common.js
function drain(stream) {
  return new Response(stream).blob();
}
async function toBlobPart(source) {
  if (source instanceof Blob || source instanceof Uint8Array) {
    return source;
  }
  if (isWebReadableStream(source)) {
    return drain(source);
  }
  const rawContent2 = getRawContent(source);
  if (isNodeReadableStream(rawContent2)) {
    throw new Error("Encountered unexpected type. In the browser, `concat` supports Web ReadableStream, Blob, Uint8Array, and files created using `createFile` only.");
  }
  return toBlobPart(rawContent2);
}
async function concat(sources) {
  const parts = [];
  for (const source of sources) {
    parts.push(await toBlobPart(typeof source === "function" ? source() : source));
  }
  return new Blob(parts);
}
var init_concat_common = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/concat.common.js"() {
    init_file();
    init_typeGuards2();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/concat.js
var init_concat = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/concat.js"() {
    init_concat_common();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/multipartPolicy.js
function generateBoundary() {
  return `----AzSDKFormBoundary${randomUUID()}`;
}
function encodeHeaders(headers) {
  let result = "";
  for (const [key, value] of headers) {
    result += `${key}: ${value}\r
`;
  }
  return result;
}
function getLength(source) {
  if (source instanceof Uint8Array) {
    return source.byteLength;
  } else if (isBlob(source)) {
    return source.size === -1 ? void 0 : source.size;
  } else {
    return void 0;
  }
}
function getTotalLength(sources) {
  let total = 0;
  for (const source of sources) {
    const partLength = getLength(source);
    if (partLength === void 0) {
      return void 0;
    } else {
      total += partLength;
    }
  }
  return total;
}
async function buildRequestBody(request, parts, boundary) {
  const sources = [
    stringToUint8Array(`--${boundary}`, "utf-8"),
    ...parts.flatMap((part) => [
      stringToUint8Array("\r\n", "utf-8"),
      stringToUint8Array(encodeHeaders(part.headers), "utf-8"),
      stringToUint8Array("\r\n", "utf-8"),
      part.body,
      stringToUint8Array(`\r
--${boundary}`, "utf-8")
    ]),
    stringToUint8Array("--\r\n\r\n", "utf-8")
  ];
  const contentLength = getTotalLength(sources);
  if (contentLength) {
    request.headers.set("Content-Length", contentLength);
  }
  request.body = await concat(sources);
}
function assertValidBoundary(boundary) {
  if (boundary.length > maxBoundaryLength) {
    throw new Error(`Multipart boundary "${boundary}" exceeds maximum length of 70 characters`);
  }
  if (Array.from(boundary).some((x) => !validBoundaryCharacters.has(x))) {
    throw new Error(`Multipart boundary "${boundary}" contains invalid characters`);
  }
}
function multipartPolicy() {
  return {
    name: multipartPolicyName,
    async sendRequest(request, next) {
      var _a4;
      if (!request.multipartBody) {
        return next(request);
      }
      if (request.body) {
        throw new Error("multipartBody and regular body cannot be set at the same time");
      }
      let boundary = request.multipartBody.boundary;
      const contentTypeHeader = (_a4 = request.headers.get("Content-Type")) !== null && _a4 !== void 0 ? _a4 : "multipart/mixed";
      const parsedHeader = contentTypeHeader.match(/^(multipart\/[^ ;]+)(?:; *boundary=(.+))?$/);
      if (!parsedHeader) {
        throw new Error(`Got multipart request body, but content-type header was not multipart: ${contentTypeHeader}`);
      }
      const [, contentType, parsedBoundary] = parsedHeader;
      if (parsedBoundary && boundary && parsedBoundary !== boundary) {
        throw new Error(`Multipart boundary was specified as ${parsedBoundary} in the header, but got ${boundary} in the request body`);
      }
      boundary !== null && boundary !== void 0 ? boundary : boundary = parsedBoundary;
      if (boundary) {
        assertValidBoundary(boundary);
      } else {
        boundary = generateBoundary();
      }
      request.headers.set("Content-Type", `${contentType}; boundary=${boundary}`);
      await buildRequestBody(request, request.multipartBody.parts, boundary);
      request.multipartBody = void 0;
      return next(request);
    }
  };
}
var multipartPolicyName, maxBoundaryLength, validBoundaryCharacters;
var init_multipartPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/multipartPolicy.js"() {
    init_browser3();
    init_concat();
    init_typeGuards2();
    multipartPolicyName = "multipartPolicy";
    maxBoundaryLength = 70;
    validBoundaryCharacters = new Set(`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'()+,-./:=?`);
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/decompressResponsePolicy.js
function decompressResponsePolicy() {
  throw new Error("decompressResponsePolicy is not supported in browser environment");
}
var decompressResponsePolicyName;
var init_decompressResponsePolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/decompressResponsePolicy.js"() {
    decompressResponsePolicyName = "decompressResponsePolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/node_modules/@azure/abort-controller/dist/browser/AbortError.js
var AbortError2;
var init_AbortError2 = __esm({
  "node_modules/@azure/core-rest-pipeline/node_modules/@azure/abort-controller/dist/browser/AbortError.js"() {
    AbortError2 = class extends Error {
      constructor(message) {
        super(message);
        this.name = "AbortError";
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/node_modules/@azure/abort-controller/dist/browser/index.js
var init_browser4 = __esm({
  "node_modules/@azure/core-rest-pipeline/node_modules/@azure/abort-controller/dist/browser/index.js"() {
    init_AbortError2();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/helpers.js
function delay2(delayInMs, value, options) {
  return new Promise((resolve, reject) => {
    let timer = void 0;
    let onAborted = void 0;
    const rejectOnAbort = () => {
      return reject(new AbortError2((options === null || options === void 0 ? void 0 : options.abortErrorMsg) ? options === null || options === void 0 ? void 0 : options.abortErrorMsg : StandardAbortMessage2));
    };
    const removeListeners = () => {
      if ((options === null || options === void 0 ? void 0 : options.abortSignal) && onAborted) {
        options.abortSignal.removeEventListener("abort", onAborted);
      }
    };
    onAborted = () => {
      if (timer) {
        clearTimeout(timer);
      }
      removeListeners();
      return rejectOnAbort();
    };
    if ((options === null || options === void 0 ? void 0 : options.abortSignal) && options.abortSignal.aborted) {
      return rejectOnAbort();
    }
    timer = setTimeout(() => {
      removeListeners();
      resolve(value);
    }, delayInMs);
    if (options === null || options === void 0 ? void 0 : options.abortSignal) {
      options.abortSignal.addEventListener("abort", onAborted);
    }
  });
}
function parseHeaderValueAsNumber(response, headerName) {
  const value = response.headers.get(headerName);
  if (!value)
    return;
  const valueAsNum = Number(value);
  if (Number.isNaN(valueAsNum))
    return;
  return valueAsNum;
}
var StandardAbortMessage2;
var init_helpers = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/helpers.js"() {
    init_browser4();
    StandardAbortMessage2 = "The operation was aborted.";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/retryStrategies/throttlingRetryStrategy.js
function getRetryAfterInMs(response) {
  if (!(response && [429, 503].includes(response.status)))
    return void 0;
  try {
    for (const header of AllRetryAfterHeaders) {
      const retryAfterValue = parseHeaderValueAsNumber(response, header);
      if (retryAfterValue === 0 || retryAfterValue) {
        const multiplyingFactor = header === RetryAfterHeader ? 1e3 : 1;
        return retryAfterValue * multiplyingFactor;
      }
    }
    const retryAfterHeader = response.headers.get(RetryAfterHeader);
    if (!retryAfterHeader)
      return;
    const date = Date.parse(retryAfterHeader);
    const diff = date - Date.now();
    return Number.isFinite(diff) ? Math.max(0, diff) : void 0;
  } catch (_a4) {
    return void 0;
  }
}
function isThrottlingRetryResponse(response) {
  return Number.isFinite(getRetryAfterInMs(response));
}
function throttlingRetryStrategy() {
  return {
    name: "throttlingRetryStrategy",
    retry({ response }) {
      const retryAfterInMs = getRetryAfterInMs(response);
      if (!Number.isFinite(retryAfterInMs)) {
        return { skipStrategy: true };
      }
      return {
        retryAfterInMs
      };
    }
  };
}
var RetryAfterHeader, AllRetryAfterHeaders;
var init_throttlingRetryStrategy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/retryStrategies/throttlingRetryStrategy.js"() {
    init_helpers();
    RetryAfterHeader = "Retry-After";
    AllRetryAfterHeaders = ["retry-after-ms", "x-ms-retry-after-ms", RetryAfterHeader];
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/retryStrategies/exponentialRetryStrategy.js
function exponentialRetryStrategy(options = {}) {
  var _a4, _b2;
  const retryInterval = (_a4 = options.retryDelayInMs) !== null && _a4 !== void 0 ? _a4 : DEFAULT_CLIENT_RETRY_INTERVAL;
  const maxRetryInterval = (_b2 = options.maxRetryDelayInMs) !== null && _b2 !== void 0 ? _b2 : DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
  return {
    name: "exponentialRetryStrategy",
    retry({ retryCount, response, responseError }) {
      const matchedSystemError = isSystemError(responseError);
      const ignoreSystemErrors = matchedSystemError && options.ignoreSystemErrors;
      const isExponential = isExponentialRetryResponse(response);
      const ignoreExponentialResponse = isExponential && options.ignoreHttpStatusCodes;
      const unknownResponse = response && (isThrottlingRetryResponse(response) || !isExponential);
      if (unknownResponse || ignoreExponentialResponse || ignoreSystemErrors) {
        return { skipStrategy: true };
      }
      if (responseError && !matchedSystemError && !isExponential) {
        return { errorToThrow: responseError };
      }
      return calculateRetryDelay(retryCount, {
        retryDelayInMs: retryInterval,
        maxRetryDelayInMs: maxRetryInterval
      });
    }
  };
}
function isExponentialRetryResponse(response) {
  return Boolean(response && response.status !== void 0 && (response.status >= 500 || response.status === 408) && response.status !== 501 && response.status !== 505);
}
function isSystemError(err) {
  if (!err) {
    return false;
  }
  return err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "ENOENT" || err.code === "ENOTFOUND";
}
var DEFAULT_CLIENT_RETRY_INTERVAL, DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
var init_exponentialRetryStrategy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/retryStrategies/exponentialRetryStrategy.js"() {
    init_browser3();
    init_throttlingRetryStrategy();
    DEFAULT_CLIENT_RETRY_INTERVAL = 1e3;
    DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1e3 * 64;
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/retryPolicy.js
function retryPolicy(strategies, options = { maxRetries: DEFAULT_RETRY_POLICY_COUNT }) {
  const logger2 = options.logger || retryPolicyLogger;
  return {
    name: retryPolicyName,
    async sendRequest(request, next) {
      var _a4, _b2;
      let response;
      let responseError;
      let retryCount = -1;
      retryRequest: while (true) {
        retryCount += 1;
        response = void 0;
        responseError = void 0;
        try {
          logger2.info(`Retry ${retryCount}: Attempting to send request`, request.requestId);
          response = await next(request);
          logger2.info(`Retry ${retryCount}: Received a response from request`, request.requestId);
        } catch (e) {
          logger2.error(`Retry ${retryCount}: Received an error from request`, request.requestId);
          responseError = e;
          if (!e || responseError.name !== "RestError") {
            throw e;
          }
          response = responseError.response;
        }
        if ((_a4 = request.abortSignal) === null || _a4 === void 0 ? void 0 : _a4.aborted) {
          logger2.error(`Retry ${retryCount}: Request aborted.`);
          const abortError = new AbortError2();
          throw abortError;
        }
        if (retryCount >= ((_b2 = options.maxRetries) !== null && _b2 !== void 0 ? _b2 : DEFAULT_RETRY_POLICY_COUNT)) {
          logger2.info(`Retry ${retryCount}: Maximum retries reached. Returning the last received response, or throwing the last received error.`);
          if (responseError) {
            throw responseError;
          } else if (response) {
            return response;
          } else {
            throw new Error("Maximum retries reached with no response or error to throw");
          }
        }
        logger2.info(`Retry ${retryCount}: Processing ${strategies.length} retry strategies.`);
        strategiesLoop: for (const strategy of strategies) {
          const strategyLogger = strategy.logger || retryPolicyLogger;
          strategyLogger.info(`Retry ${retryCount}: Processing retry strategy ${strategy.name}.`);
          const modifiers = strategy.retry({
            retryCount,
            response,
            responseError
          });
          if (modifiers.skipStrategy) {
            strategyLogger.info(`Retry ${retryCount}: Skipped.`);
            continue strategiesLoop;
          }
          const { errorToThrow, retryAfterInMs, redirectTo } = modifiers;
          if (errorToThrow) {
            strategyLogger.error(`Retry ${retryCount}: Retry strategy ${strategy.name} throws error:`, errorToThrow);
            throw errorToThrow;
          }
          if (retryAfterInMs || retryAfterInMs === 0) {
            strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} retries after ${retryAfterInMs}`);
            await delay2(retryAfterInMs, void 0, { abortSignal: request.abortSignal });
            continue retryRequest;
          }
          if (redirectTo) {
            strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} redirects to ${redirectTo}`);
            request.url = redirectTo;
            continue retryRequest;
          }
        }
        if (responseError) {
          logger2.info(`None of the retry strategies could work with the received error. Throwing it.`);
          throw responseError;
        }
        if (response) {
          logger2.info(`None of the retry strategies could work with the received response. Returning it.`);
          return response;
        }
      }
    }
  };
}
var retryPolicyLogger, retryPolicyName;
var init_retryPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/retryPolicy.js"() {
    init_helpers();
    init_browser();
    init_browser4();
    init_constants();
    retryPolicyLogger = createClientLogger("core-rest-pipeline retryPolicy");
    retryPolicyName = "retryPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/defaultRetryPolicy.js
function defaultRetryPolicy(options = {}) {
  var _a4;
  return {
    name: defaultRetryPolicyName,
    sendRequest: retryPolicy([throttlingRetryStrategy(), exponentialRetryStrategy(options)], {
      maxRetries: (_a4 = options.maxRetries) !== null && _a4 !== void 0 ? _a4 : DEFAULT_RETRY_POLICY_COUNT
    }).sendRequest
  };
}
var defaultRetryPolicyName;
var init_defaultRetryPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/defaultRetryPolicy.js"() {
    init_exponentialRetryStrategy();
    init_throttlingRetryStrategy();
    init_retryPolicy();
    init_constants();
    defaultRetryPolicyName = "defaultRetryPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/httpHeaders.js
function normalizeName(name) {
  return name.toLowerCase();
}
function* headerIterator(map) {
  for (const entry of map.values()) {
    yield [entry.name, entry.value];
  }
}
function createHttpHeaders(rawHeaders) {
  return new HttpHeadersImpl(rawHeaders);
}
var HttpHeadersImpl;
var init_httpHeaders = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/httpHeaders.js"() {
    HttpHeadersImpl = class {
      constructor(rawHeaders) {
        this._headersMap = /* @__PURE__ */ new Map();
        if (rawHeaders) {
          for (const headerName of Object.keys(rawHeaders)) {
            this.set(headerName, rawHeaders[headerName]);
          }
        }
      }
      /**
       * Set a header in this collection with the provided name and value. The name is
       * case-insensitive.
       * @param name - The name of the header to set. This value is case-insensitive.
       * @param value - The value of the header to set.
       */
      set(name, value) {
        this._headersMap.set(normalizeName(name), { name, value: String(value).trim() });
      }
      /**
       * Get the header value for the provided header name, or undefined if no header exists in this
       * collection with the provided name.
       * @param name - The name of the header. This value is case-insensitive.
       */
      get(name) {
        var _a4;
        return (_a4 = this._headersMap.get(normalizeName(name))) === null || _a4 === void 0 ? void 0 : _a4.value;
      }
      /**
       * Get whether or not this header collection contains a header entry for the provided header name.
       * @param name - The name of the header to set. This value is case-insensitive.
       */
      has(name) {
        return this._headersMap.has(normalizeName(name));
      }
      /**
       * Remove the header with the provided headerName.
       * @param name - The name of the header to remove.
       */
      delete(name) {
        this._headersMap.delete(normalizeName(name));
      }
      /**
       * Get the JSON object representation of this HTTP header collection.
       */
      toJSON(options = {}) {
        const result = {};
        if (options.preserveCase) {
          for (const entry of this._headersMap.values()) {
            result[entry.name] = entry.value;
          }
        } else {
          for (const [normalizedName, entry] of this._headersMap) {
            result[normalizedName] = entry.value;
          }
        }
        return result;
      }
      /**
       * Get the string representation of this HTTP header collection.
       */
      toString() {
        return JSON.stringify(this.toJSON({ preserveCase: true }));
      }
      /**
       * Iterate over tuples of header [name, value] pairs.
       */
      [Symbol.iterator]() {
        return headerIterator(this._headersMap);
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/formDataPolicy.js
function formDataToFormDataMap(formData) {
  var _a4;
  const formDataMap = {};
  for (const [key, value] of formData.entries()) {
    (_a4 = formDataMap[key]) !== null && _a4 !== void 0 ? _a4 : formDataMap[key] = [];
    formDataMap[key].push(value);
  }
  return formDataMap;
}
function formDataPolicy() {
  return {
    name: formDataPolicyName,
    async sendRequest(request, next) {
      if (isNodeLike && typeof FormData !== "undefined" && request.body instanceof FormData) {
        request.formData = formDataToFormDataMap(request.body);
        request.body = void 0;
      }
      if (request.formData) {
        const contentType = request.headers.get("Content-Type");
        if (contentType && contentType.indexOf("application/x-www-form-urlencoded") !== -1) {
          request.body = wwwFormUrlEncode(request.formData);
        } else {
          await prepareFormData(request.formData, request);
        }
        request.formData = void 0;
      }
      return next(request);
    }
  };
}
function wwwFormUrlEncode(formData) {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        urlSearchParams.append(key, subValue.toString());
      }
    } else {
      urlSearchParams.append(key, value.toString());
    }
  }
  return urlSearchParams.toString();
}
async function prepareFormData(formData, request) {
  const contentType = request.headers.get("Content-Type");
  if (contentType && !contentType.startsWith("multipart/form-data")) {
    return;
  }
  request.headers.set("Content-Type", contentType !== null && contentType !== void 0 ? contentType : "multipart/form-data");
  const parts = [];
  for (const [fieldName, values] of Object.entries(formData)) {
    for (const value of Array.isArray(values) ? values : [values]) {
      if (typeof value === "string") {
        parts.push({
          headers: createHttpHeaders({
            "Content-Disposition": `form-data; name="${fieldName}"`
          }),
          body: stringToUint8Array(value, "utf-8")
        });
      } else if (value === void 0 || value === null || typeof value !== "object") {
        throw new Error(`Unexpected value for key ${fieldName}: ${value}. Value should be serialized to string first.`);
      } else {
        const fileName = value.name || "blob";
        const headers = createHttpHeaders();
        headers.set("Content-Disposition", `form-data; name="${fieldName}"; filename="${fileName}"`);
        headers.set("Content-Type", value.type || "application/octet-stream");
        parts.push({
          headers,
          body: value
        });
      }
    }
  }
  request.multipartBody = { parts };
}
var formDataPolicyName;
var init_formDataPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/formDataPolicy.js"() {
    init_browser3();
    init_httpHeaders();
    formDataPolicyName = "formDataPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/proxyPolicy.common.js
function getDefaultProxySettings() {
  throw new Error(errorMessage);
}
function proxyPolicy() {
  throw new Error(errorMessage);
}
var proxyPolicyName, errorMessage;
var init_proxyPolicy_common = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/proxyPolicy.common.js"() {
    proxyPolicyName = "proxyPolicy";
    errorMessage = "proxyPolicy is not supported in browser environment";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/proxyPolicy.js
var init_proxyPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/proxyPolicy.js"() {
    init_proxyPolicy_common();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/setClientRequestIdPolicy.js
function setClientRequestIdPolicy(requestIdHeaderName = "x-ms-client-request-id") {
  return {
    name: setClientRequestIdPolicyName,
    async sendRequest(request, next) {
      if (!request.headers.has(requestIdHeaderName)) {
        request.headers.set(requestIdHeaderName, request.requestId);
      }
      return next(request);
    }
  };
}
var setClientRequestIdPolicyName;
var init_setClientRequestIdPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/setClientRequestIdPolicy.js"() {
    setClientRequestIdPolicyName = "setClientRequestIdPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/agentPolicy.js
function agentPolicy(agent) {
  return {
    name: agentPolicyName,
    sendRequest: async (req, next) => {
      if (!req.agent) {
        req.agent = agent;
      }
      return next(req);
    }
  };
}
var agentPolicyName;
var init_agentPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/agentPolicy.js"() {
    agentPolicyName = "agentPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/tlsPolicy.js
function tlsPolicy(tlsSettings) {
  return {
    name: tlsPolicyName,
    sendRequest: async (req, next) => {
      if (!req.tlsSettings) {
        req.tlsSettings = tlsSettings;
      }
      return next(req);
    }
  };
}
var tlsPolicyName;
var init_tlsPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/tlsPolicy.js"() {
    tlsPolicyName = "tlsPolicy";
  }
});

// node_modules/@azure/core-tracing/dist/browser/tracingContext.js
function createTracingContext(options = {}) {
  let context = new TracingContextImpl(options.parentContext);
  if (options.span) {
    context = context.setValue(knownContextKeys.span, options.span);
  }
  if (options.namespace) {
    context = context.setValue(knownContextKeys.namespace, options.namespace);
  }
  return context;
}
var knownContextKeys, TracingContextImpl;
var init_tracingContext = __esm({
  "node_modules/@azure/core-tracing/dist/browser/tracingContext.js"() {
    knownContextKeys = {
      span: Symbol.for("@azure/core-tracing span"),
      namespace: Symbol.for("@azure/core-tracing namespace")
    };
    TracingContextImpl = class _TracingContextImpl {
      constructor(initialContext) {
        this._contextMap = initialContext instanceof _TracingContextImpl ? new Map(initialContext._contextMap) : /* @__PURE__ */ new Map();
      }
      setValue(key, value) {
        const newContext = new _TracingContextImpl(this);
        newContext._contextMap.set(key, value);
        return newContext;
      }
      getValue(key) {
        return this._contextMap.get(key);
      }
      deleteValue(key) {
        const newContext = new _TracingContextImpl(this);
        newContext._contextMap.delete(key);
        return newContext;
      }
    };
  }
});

// node_modules/@azure/core-tracing/dist/browser/state.js
var state;
var init_state = __esm({
  "node_modules/@azure/core-tracing/dist/browser/state.js"() {
    state = {
      instrumenterImplementation: void 0
    };
  }
});

// node_modules/@azure/core-tracing/dist/browser/instrumenter.js
function createDefaultTracingSpan() {
  return {
    end: () => {
    },
    isRecording: () => false,
    recordException: () => {
    },
    setAttribute: () => {
    },
    setStatus: () => {
    },
    addEvent: () => {
    }
  };
}
function createDefaultInstrumenter() {
  return {
    createRequestHeaders: () => {
      return {};
    },
    parseTraceparentHeader: () => {
      return void 0;
    },
    startSpan: (_name, spanOptions) => {
      return {
        span: createDefaultTracingSpan(),
        tracingContext: createTracingContext({ parentContext: spanOptions.tracingContext })
      };
    },
    withContext(_context, callback, ...callbackArgs) {
      return callback(...callbackArgs);
    }
  };
}
function getInstrumenter() {
  if (!state.instrumenterImplementation) {
    state.instrumenterImplementation = createDefaultInstrumenter();
  }
  return state.instrumenterImplementation;
}
var init_instrumenter = __esm({
  "node_modules/@azure/core-tracing/dist/browser/instrumenter.js"() {
    init_tracingContext();
    init_state();
  }
});

// node_modules/@azure/core-tracing/dist/browser/tracingClient.js
function createTracingClient(options) {
  const { namespace, packageName, packageVersion } = options;
  function startSpan(name, operationOptions, spanOptions) {
    var _a4;
    const startSpanResult = getInstrumenter().startSpan(name, Object.assign(Object.assign({}, spanOptions), { packageName, packageVersion, tracingContext: (_a4 = operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions) === null || _a4 === void 0 ? void 0 : _a4.tracingContext }));
    let tracingContext = startSpanResult.tracingContext;
    const span = startSpanResult.span;
    if (!tracingContext.getValue(knownContextKeys.namespace)) {
      tracingContext = tracingContext.setValue(knownContextKeys.namespace, namespace);
    }
    span.setAttribute("az.namespace", tracingContext.getValue(knownContextKeys.namespace));
    const updatedOptions = Object.assign({}, operationOptions, {
      tracingOptions: Object.assign(Object.assign({}, operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions), { tracingContext })
    });
    return {
      span,
      updatedOptions
    };
  }
  async function withSpan(name, operationOptions, callback, spanOptions) {
    const { span, updatedOptions } = startSpan(name, operationOptions, spanOptions);
    try {
      const result = await withContext(updatedOptions.tracingOptions.tracingContext, () => Promise.resolve(callback(updatedOptions, span)));
      span.setStatus({ status: "success" });
      return result;
    } catch (err) {
      span.setStatus({ status: "error", error: err });
      throw err;
    } finally {
      span.end();
    }
  }
  function withContext(context, callback, ...callbackArgs) {
    return getInstrumenter().withContext(context, callback, ...callbackArgs);
  }
  function parseTraceparentHeader(traceparentHeader) {
    return getInstrumenter().parseTraceparentHeader(traceparentHeader);
  }
  function createRequestHeaders(tracingContext) {
    return getInstrumenter().createRequestHeaders(tracingContext);
  }
  return {
    startSpan,
    withSpan,
    withContext,
    parseTraceparentHeader,
    createRequestHeaders
  };
}
var init_tracingClient = __esm({
  "node_modules/@azure/core-tracing/dist/browser/tracingClient.js"() {
    init_instrumenter();
    init_tracingContext();
  }
});

// node_modules/@azure/core-tracing/dist/browser/index.js
var init_browser5 = __esm({
  "node_modules/@azure/core-tracing/dist/browser/index.js"() {
    init_instrumenter();
    init_tracingClient();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/inspect.common.js
var custom;
var init_inspect_common = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/inspect.common.js"() {
    custom = {};
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/inspect.js
var init_inspect = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/inspect.js"() {
    init_inspect_common();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/restError.js
function isRestError(e) {
  if (e instanceof RestError) {
    return true;
  }
  return isError(e) && e.name === "RestError";
}
var errorSanitizer, RestError;
var init_restError = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/restError.js"() {
    init_browser3();
    init_inspect();
    init_sanitizer();
    errorSanitizer = new Sanitizer();
    RestError = class _RestError extends Error {
      constructor(message, options = {}) {
        super(message);
        this.name = "RestError";
        this.code = options.code;
        this.statusCode = options.statusCode;
        Object.defineProperty(this, "request", { value: options.request, enumerable: false });
        Object.defineProperty(this, "response", { value: options.response, enumerable: false });
        Object.setPrototypeOf(this, _RestError.prototype);
      }
      /**
       * Logging method for util.inspect in Node
       */
      [custom]() {
        return `RestError: ${this.message} 
 ${errorSanitizer.sanitize(Object.assign(Object.assign({}, this), { request: this.request, response: this.response }))}`;
      }
    };
    RestError.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
    RestError.PARSE_ERROR = "PARSE_ERROR";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/tracingPolicy.js
function tracingPolicy(options = {}) {
  const userAgentPromise = getUserAgentValue(options.userAgentPrefix);
  const sanitizer = new Sanitizer({
    additionalAllowedQueryParameters: options.additionalAllowedQueryParameters
  });
  const tracingClient = tryCreateTracingClient();
  return {
    name: tracingPolicyName,
    async sendRequest(request, next) {
      var _a4;
      if (!tracingClient) {
        return next(request);
      }
      const userAgent = await userAgentPromise;
      const spanAttributes = {
        "http.url": sanitizer.sanitizeUrl(request.url),
        "http.method": request.method,
        "http.user_agent": userAgent,
        requestId: request.requestId
      };
      if (userAgent) {
        spanAttributes["http.user_agent"] = userAgent;
      }
      const { span, tracingContext } = (_a4 = tryCreateSpan(tracingClient, request, spanAttributes)) !== null && _a4 !== void 0 ? _a4 : {};
      if (!span || !tracingContext) {
        return next(request);
      }
      try {
        const response = await tracingClient.withContext(tracingContext, next, request);
        tryProcessResponse(span, response);
        return response;
      } catch (err) {
        tryProcessError(span, err);
        throw err;
      }
    }
  };
}
function tryCreateTracingClient() {
  try {
    return createTracingClient({
      namespace: "",
      packageName: "@azure/core-rest-pipeline",
      packageVersion: SDK_VERSION
    });
  } catch (e) {
    logger.warning(`Error when creating the TracingClient: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryCreateSpan(tracingClient, request, spanAttributes) {
  try {
    const { span, updatedOptions } = tracingClient.startSpan(`HTTP ${request.method}`, { tracingOptions: request.tracingOptions }, {
      spanKind: "client",
      spanAttributes
    });
    if (!span.isRecording()) {
      span.end();
      return void 0;
    }
    const headers = tracingClient.createRequestHeaders(updatedOptions.tracingOptions.tracingContext);
    for (const [key, value] of Object.entries(headers)) {
      request.headers.set(key, value);
    }
    return { span, tracingContext: updatedOptions.tracingOptions.tracingContext };
  } catch (e) {
    logger.warning(`Skipping creating a tracing span due to an error: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryProcessError(span, error) {
  try {
    span.setStatus({
      status: "error",
      error: isError(error) ? error : void 0
    });
    if (isRestError(error) && error.statusCode) {
      span.setAttribute("http.status_code", error.statusCode);
    }
    span.end();
  } catch (e) {
    logger.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}
function tryProcessResponse(span, response) {
  try {
    span.setAttribute("http.status_code", response.status);
    const serviceRequestId = response.headers.get("x-ms-request-id");
    if (serviceRequestId) {
      span.setAttribute("serviceRequestId", serviceRequestId);
    }
    if (response.status >= 400) {
      span.setStatus({
        status: "error"
      });
    }
    span.end();
  } catch (e) {
    logger.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}
var tracingPolicyName;
var init_tracingPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/tracingPolicy.js"() {
    init_browser5();
    init_constants();
    init_userAgent();
    init_log();
    init_browser3();
    init_restError();
    init_sanitizer();
    tracingPolicyName = "tracingPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/createPipelineFromOptions.js
function createPipelineFromOptions(options) {
  var _a4;
  const pipeline = createEmptyPipeline();
  if (isNodeLike) {
    if (options.agent) {
      pipeline.addPolicy(agentPolicy(options.agent));
    }
    if (options.tlsOptions) {
      pipeline.addPolicy(tlsPolicy(options.tlsOptions));
    }
    pipeline.addPolicy(proxyPolicy(options.proxyOptions));
    pipeline.addPolicy(decompressResponsePolicy());
  }
  pipeline.addPolicy(formDataPolicy(), { beforePolicies: [multipartPolicyName] });
  pipeline.addPolicy(userAgentPolicy(options.userAgentOptions));
  pipeline.addPolicy(setClientRequestIdPolicy((_a4 = options.telemetryOptions) === null || _a4 === void 0 ? void 0 : _a4.clientRequestIdHeaderName));
  pipeline.addPolicy(multipartPolicy(), { afterPhase: "Deserialize" });
  pipeline.addPolicy(defaultRetryPolicy(options.retryOptions), { phase: "Retry" });
  pipeline.addPolicy(tracingPolicy(Object.assign(Object.assign({}, options.userAgentOptions), options.loggingOptions)), {
    afterPhase: "Retry"
  });
  if (isNodeLike) {
    pipeline.addPolicy(redirectPolicy(options.redirectOptions), { afterPhase: "Retry" });
  }
  pipeline.addPolicy(logPolicy(options.loggingOptions), { afterPhase: "Sign" });
  return pipeline;
}
var init_createPipelineFromOptions = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/createPipelineFromOptions.js"() {
    init_logPolicy();
    init_pipeline();
    init_redirectPolicy();
    init_userAgentPolicy();
    init_multipartPolicy();
    init_decompressResponsePolicy();
    init_defaultRetryPolicy();
    init_formDataPolicy();
    init_browser3();
    init_proxyPolicy();
    init_setClientRequestIdPolicy();
    init_agentPolicy();
    init_tlsPolicy();
    init_tracingPolicy();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/fetchHttpClient.js
function isBlob2(body) {
  return (typeof Blob === "function" || typeof Blob === "object") && body instanceof Blob;
}
async function makeRequest(request) {
  const { abortController, abortControllerCleanup } = setupAbortSignal(request);
  try {
    const headers = buildFetchHeaders(request.headers);
    const { streaming, body: requestBody } = buildRequestBody2(request);
    const requestInit = Object.assign(Object.assign({ body: requestBody, method: request.method, headers, signal: abortController.signal }, "credentials" in Request.prototype ? { credentials: request.withCredentials ? "include" : "same-origin" } : {}), "cache" in Request.prototype ? { cache: "no-store" } : {});
    if (streaming) {
      requestInit.duplex = "half";
    }
    const response = await fetch(request.url, requestInit);
    if (isBlob2(request.body) && request.onUploadProgress) {
      request.onUploadProgress({ loadedBytes: request.body.size });
    }
    return buildPipelineResponse(response, request, abortControllerCleanup);
  } catch (e) {
    abortControllerCleanup === null || abortControllerCleanup === void 0 ? void 0 : abortControllerCleanup();
    throw e;
  }
}
async function buildPipelineResponse(httpResponse, request, abortControllerCleanup) {
  var _a4, _b2;
  const headers = buildPipelineHeaders(httpResponse);
  const response = {
    request,
    headers,
    status: httpResponse.status
  };
  const bodyStream = isWebReadableStream(httpResponse.body) ? buildBodyStream(httpResponse.body, {
    onProgress: request.onDownloadProgress,
    onEnd: abortControllerCleanup
  }) : httpResponse.body;
  if (
    // Value of POSITIVE_INFINITY in streamResponseStatusCodes is considered as any status code
    ((_a4 = request.streamResponseStatusCodes) === null || _a4 === void 0 ? void 0 : _a4.has(Number.POSITIVE_INFINITY)) || ((_b2 = request.streamResponseStatusCodes) === null || _b2 === void 0 ? void 0 : _b2.has(response.status))
  ) {
    if (request.enableBrowserStreams) {
      response.browserStreamBody = bodyStream !== null && bodyStream !== void 0 ? bodyStream : void 0;
    } else {
      const responseStream = new Response(bodyStream);
      response.blobBody = responseStream.blob();
      abortControllerCleanup === null || abortControllerCleanup === void 0 ? void 0 : abortControllerCleanup();
    }
  } else {
    const responseStream = new Response(bodyStream);
    response.bodyAsText = await responseStream.text();
    abortControllerCleanup === null || abortControllerCleanup === void 0 ? void 0 : abortControllerCleanup();
  }
  return response;
}
function setupAbortSignal(request) {
  const abortController = new AbortController();
  let abortControllerCleanup;
  let abortListener;
  if (request.abortSignal) {
    if (request.abortSignal.aborted) {
      throw new AbortError2("The operation was aborted. Request has already been canceled.");
    }
    abortListener = (event) => {
      if (event.type === "abort") {
        abortController.abort();
      }
    };
    request.abortSignal.addEventListener("abort", abortListener);
    abortControllerCleanup = () => {
      var _a4;
      if (abortListener) {
        (_a4 = request.abortSignal) === null || _a4 === void 0 ? void 0 : _a4.removeEventListener("abort", abortListener);
      }
    };
  }
  if (request.timeout > 0) {
    setTimeout(() => {
      abortController.abort();
    }, request.timeout);
  }
  return { abortController, abortControllerCleanup };
}
function getError(e, request) {
  var _a4;
  if (e && (e === null || e === void 0 ? void 0 : e.name) === "AbortError") {
    return e;
  } else {
    return new RestError(`Error sending request: ${e.message}`, {
      code: (_a4 = e === null || e === void 0 ? void 0 : e.code) !== null && _a4 !== void 0 ? _a4 : RestError.REQUEST_SEND_ERROR,
      request
    });
  }
}
function buildFetchHeaders(pipelineHeaders) {
  const headers = new Headers();
  for (const [name, value] of pipelineHeaders) {
    headers.append(name, value);
  }
  return headers;
}
function buildPipelineHeaders(httpResponse) {
  const responseHeaders = createHttpHeaders();
  for (const [name, value] of httpResponse.headers) {
    responseHeaders.set(name, value);
  }
  return responseHeaders;
}
function buildRequestBody2(request) {
  const body = typeof request.body === "function" ? request.body() : request.body;
  if (isNodeReadableStream(body)) {
    throw new Error("Node streams are not supported in browser environment.");
  }
  return isWebReadableStream(body) ? { streaming: true, body: buildBodyStream(body, { onProgress: request.onUploadProgress }) } : { streaming: false, body };
}
function buildBodyStream(readableStream, options = {}) {
  let loadedBytes = 0;
  const { onProgress, onEnd } = options;
  if (isTransformStreamSupported(readableStream)) {
    return readableStream.pipeThrough(new TransformStream({
      transform(chunk, controller) {
        if (chunk === null) {
          controller.terminate();
          return;
        }
        controller.enqueue(chunk);
        loadedBytes += chunk.length;
        if (onProgress) {
          onProgress({ loadedBytes });
        }
      },
      flush() {
        onEnd === null || onEnd === void 0 ? void 0 : onEnd();
      }
    }));
  } else {
    const reader = readableStream.getReader();
    return new ReadableStream({
      async pull(controller) {
        var _a4;
        const { done, value } = await reader.read();
        if (done || !value) {
          onEnd === null || onEnd === void 0 ? void 0 : onEnd();
          controller.close();
          reader.releaseLock();
          return;
        }
        loadedBytes += (_a4 = value === null || value === void 0 ? void 0 : value.length) !== null && _a4 !== void 0 ? _a4 : 0;
        controller.enqueue(value);
        if (onProgress) {
          onProgress({ loadedBytes });
        }
      },
      cancel(reason) {
        onEnd === null || onEnd === void 0 ? void 0 : onEnd();
        return reader.cancel(reason);
      }
    });
  }
}
function createFetchHttpClient() {
  return new FetchHttpClient();
}
function isTransformStreamSupported(readableStream) {
  return readableStream.pipeThrough !== void 0 && self.TransformStream !== void 0;
}
var FetchHttpClient;
var init_fetchHttpClient = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/fetchHttpClient.js"() {
    init_browser4();
    init_restError();
    init_httpHeaders();
    init_typeGuards2();
    FetchHttpClient = class {
      /**
       * Makes a request over an underlying transport layer and returns the response.
       * @param request - The request to be made.
       */
      async sendRequest(request) {
        const url = new URL(request.url);
        const isInsecure = url.protocol !== "https:";
        if (isInsecure && !request.allowInsecureConnection) {
          throw new Error(`Cannot connect to ${request.url} while allowInsecureConnection is false.`);
        }
        if (request.proxySettings) {
          throw new Error("HTTP proxy is not supported in browser environment");
        }
        try {
          return await makeRequest(request);
        } catch (e) {
          throw getError(e, request);
        }
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/defaultHttpClient.js
function createDefaultHttpClient() {
  return createFetchHttpClient();
}
var init_defaultHttpClient = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/defaultHttpClient.js"() {
    init_fetchHttpClient();
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/pipelineRequest.js
function createPipelineRequest(options) {
  return new PipelineRequestImpl(options);
}
var PipelineRequestImpl;
var init_pipelineRequest = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/pipelineRequest.js"() {
    init_httpHeaders();
    init_browser3();
    PipelineRequestImpl = class {
      constructor(options) {
        var _a4, _b2, _c2, _d2, _e, _f, _g;
        this.url = options.url;
        this.body = options.body;
        this.headers = (_a4 = options.headers) !== null && _a4 !== void 0 ? _a4 : createHttpHeaders();
        this.method = (_b2 = options.method) !== null && _b2 !== void 0 ? _b2 : "GET";
        this.timeout = (_c2 = options.timeout) !== null && _c2 !== void 0 ? _c2 : 0;
        this.multipartBody = options.multipartBody;
        this.formData = options.formData;
        this.disableKeepAlive = (_d2 = options.disableKeepAlive) !== null && _d2 !== void 0 ? _d2 : false;
        this.proxySettings = options.proxySettings;
        this.streamResponseStatusCodes = options.streamResponseStatusCodes;
        this.withCredentials = (_e = options.withCredentials) !== null && _e !== void 0 ? _e : false;
        this.abortSignal = options.abortSignal;
        this.tracingOptions = options.tracingOptions;
        this.onUploadProgress = options.onUploadProgress;
        this.onDownloadProgress = options.onDownloadProgress;
        this.requestId = options.requestId || randomUUID();
        this.allowInsecureConnection = (_f = options.allowInsecureConnection) !== null && _f !== void 0 ? _f : false;
        this.enableBrowserStreams = (_g = options.enableBrowserStreams) !== null && _g !== void 0 ? _g : false;
        this.agent = options.agent;
        this.tlsSettings = options.tlsSettings;
      }
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/exponentialRetryPolicy.js
function exponentialRetryPolicy(options = {}) {
  var _a4;
  return retryPolicy([
    exponentialRetryStrategy(Object.assign(Object.assign({}, options), { ignoreSystemErrors: true }))
  ], {
    maxRetries: (_a4 = options.maxRetries) !== null && _a4 !== void 0 ? _a4 : DEFAULT_RETRY_POLICY_COUNT
  });
}
var exponentialRetryPolicyName;
var init_exponentialRetryPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/exponentialRetryPolicy.js"() {
    init_exponentialRetryStrategy();
    init_retryPolicy();
    init_constants();
    exponentialRetryPolicyName = "exponentialRetryPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/systemErrorRetryPolicy.js
function systemErrorRetryPolicy(options = {}) {
  var _a4;
  return {
    name: systemErrorRetryPolicyName,
    sendRequest: retryPolicy([
      exponentialRetryStrategy(Object.assign(Object.assign({}, options), { ignoreHttpStatusCodes: true }))
    ], {
      maxRetries: (_a4 = options.maxRetries) !== null && _a4 !== void 0 ? _a4 : DEFAULT_RETRY_POLICY_COUNT
    }).sendRequest
  };
}
var systemErrorRetryPolicyName;
var init_systemErrorRetryPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/systemErrorRetryPolicy.js"() {
    init_exponentialRetryStrategy();
    init_retryPolicy();
    init_constants();
    systemErrorRetryPolicyName = "systemErrorRetryPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/throttlingRetryPolicy.js
function throttlingRetryPolicy(options = {}) {
  var _a4;
  return {
    name: throttlingRetryPolicyName,
    sendRequest: retryPolicy([throttlingRetryStrategy()], {
      maxRetries: (_a4 = options.maxRetries) !== null && _a4 !== void 0 ? _a4 : DEFAULT_RETRY_POLICY_COUNT
    }).sendRequest
  };
}
var throttlingRetryPolicyName;
var init_throttlingRetryPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/throttlingRetryPolicy.js"() {
    init_throttlingRetryStrategy();
    init_retryPolicy();
    init_constants();
    throttlingRetryPolicyName = "throttlingRetryPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/util/tokenCycler.js
async function beginRefresh(getAccessToken, retryIntervalInMs, refreshTimeout) {
  async function tryGetAccessToken() {
    if (Date.now() < refreshTimeout) {
      try {
        return await getAccessToken();
      } catch (_a4) {
        return null;
      }
    } else {
      const finalToken = await getAccessToken();
      if (finalToken === null) {
        throw new Error("Failed to refresh access token.");
      }
      return finalToken;
    }
  }
  let token = await tryGetAccessToken();
  while (token === null) {
    await delay2(retryIntervalInMs);
    token = await tryGetAccessToken();
  }
  return token;
}
function createTokenCycler(credential, tokenCyclerOptions) {
  let refreshWorker = null;
  let token = null;
  let tenantId;
  const options = Object.assign(Object.assign({}, DEFAULT_CYCLER_OPTIONS), tokenCyclerOptions);
  const cycler = {
    /**
     * Produces true if a refresh job is currently in progress.
     */
    get isRefreshing() {
      return refreshWorker !== null;
    },
    /**
     * Produces true if the cycler SHOULD refresh (we are within the refresh
     * window and not already refreshing)
     */
    get shouldRefresh() {
      var _a4;
      if (cycler.isRefreshing) {
        return false;
      }
      if ((token === null || token === void 0 ? void 0 : token.refreshAfterTimestamp) && token.refreshAfterTimestamp < Date.now()) {
        return true;
      }
      return ((_a4 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a4 !== void 0 ? _a4 : 0) - options.refreshWindowInMs < Date.now();
    },
    /**
     * Produces true if the cycler MUST refresh (null or nearly-expired
     * token).
     */
    get mustRefresh() {
      return token === null || token.expiresOnTimestamp - options.forcedRefreshWindowInMs < Date.now();
    }
  };
  function refresh(scopes, getTokenOptions) {
    var _a4;
    if (!cycler.isRefreshing) {
      const tryGetAccessToken = () => credential.getToken(scopes, getTokenOptions);
      refreshWorker = beginRefresh(
        tryGetAccessToken,
        options.retryIntervalInMs,
        // If we don't have a token, then we should timeout immediately
        (_a4 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a4 !== void 0 ? _a4 : Date.now()
      ).then((_token) => {
        refreshWorker = null;
        token = _token;
        tenantId = getTokenOptions.tenantId;
        return token;
      }).catch((reason) => {
        refreshWorker = null;
        token = null;
        tenantId = void 0;
        throw reason;
      });
    }
    return refreshWorker;
  }
  return async (scopes, tokenOptions) => {
    const hasClaimChallenge = Boolean(tokenOptions.claims);
    const tenantIdChanged = tenantId !== tokenOptions.tenantId;
    if (hasClaimChallenge) {
      token = null;
    }
    const mustRefresh = tenantIdChanged || hasClaimChallenge || cycler.mustRefresh;
    if (mustRefresh) {
      return refresh(scopes, tokenOptions);
    }
    if (cycler.shouldRefresh) {
      refresh(scopes, tokenOptions);
    }
    return token;
  };
}
var DEFAULT_CYCLER_OPTIONS;
var init_tokenCycler = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/util/tokenCycler.js"() {
    init_helpers();
    DEFAULT_CYCLER_OPTIONS = {
      forcedRefreshWindowInMs: 1e3,
      // Force waiting for a refresh 1s before the token expires
      retryIntervalInMs: 3e3,
      // Allow refresh attempts every 3s
      refreshWindowInMs: 1e3 * 60 * 2
      // Start refreshing 2m before expiry
    };
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/bearerTokenAuthenticationPolicy.js
async function trySendRequest(request, next) {
  try {
    return [await next(request), void 0];
  } catch (e) {
    if (isRestError(e) && e.response) {
      return [e.response, e];
    } else {
      throw e;
    }
  }
}
async function defaultAuthorizeRequest(options) {
  const { scopes, getAccessToken, request } = options;
  const getTokenOptions = {
    abortSignal: request.abortSignal,
    tracingOptions: request.tracingOptions,
    enableCae: true
  };
  const accessToken = await getAccessToken(scopes, getTokenOptions);
  if (accessToken) {
    options.request.headers.set("Authorization", `Bearer ${accessToken.token}`);
  }
}
function isChallengeResponse(response) {
  return response.status === 401 && response.headers.has("WWW-Authenticate");
}
async function authorizeRequestOnCaeChallenge(onChallengeOptions, caeClaims) {
  var _a4;
  const { scopes } = onChallengeOptions;
  const accessToken = await onChallengeOptions.getAccessToken(scopes, {
    enableCae: true,
    claims: caeClaims
  });
  if (!accessToken) {
    return false;
  }
  onChallengeOptions.request.headers.set("Authorization", `${(_a4 = accessToken.tokenType) !== null && _a4 !== void 0 ? _a4 : "Bearer"} ${accessToken.token}`);
  return true;
}
function bearerTokenAuthenticationPolicy(options) {
  var _a4, _b2, _c2;
  const { credential, scopes, challengeCallbacks } = options;
  const logger2 = options.logger || logger;
  const callbacks = {
    authorizeRequest: (_b2 = (_a4 = challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequest) === null || _a4 === void 0 ? void 0 : _a4.bind(challengeCallbacks)) !== null && _b2 !== void 0 ? _b2 : defaultAuthorizeRequest,
    authorizeRequestOnChallenge: (_c2 = challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequestOnChallenge) === null || _c2 === void 0 ? void 0 : _c2.bind(challengeCallbacks)
  };
  const getAccessToken = credential ? createTokenCycler(
    credential
    /* , options */
  ) : () => Promise.resolve(null);
  return {
    name: bearerTokenAuthenticationPolicyName,
    /**
     * If there's no challenge parameter:
     * - It will try to retrieve the token using the cache, or the credential's getToken.
     * - Then it will try the next policy with or without the retrieved token.
     *
     * It uses the challenge parameters to:
     * - Skip a first attempt to get the token from the credential if there's no cached token,
     *   since it expects the token to be retrievable only after the challenge.
     * - Prepare the outgoing request if the `prepareRequest` method has been provided.
     * - Send an initial request to receive the challenge if it fails.
     * - Process a challenge if the response contains it.
     * - Retrieve a token with the challenge information, then re-send the request.
     */
    async sendRequest(request, next) {
      if (!request.url.toLowerCase().startsWith("https://")) {
        throw new Error("Bearer token authentication is not permitted for non-TLS protected (non-https) URLs.");
      }
      await callbacks.authorizeRequest({
        scopes: Array.isArray(scopes) ? scopes : [scopes],
        request,
        getAccessToken,
        logger: logger2
      });
      let response;
      let error;
      let shouldSendRequest;
      [response, error] = await trySendRequest(request, next);
      if (isChallengeResponse(response)) {
        let claims = getCaeChallengeClaims(response.headers.get("WWW-Authenticate"));
        if (claims) {
          let parsedClaim;
          try {
            parsedClaim = atob(claims);
          } catch (e) {
            logger2.warning(`The WWW-Authenticate header contains "claims" that cannot be parsed. Unable to perform the Continuous Access Evaluation authentication flow. Unparsable claims: ${claims}`);
            return response;
          }
          shouldSendRequest = await authorizeRequestOnCaeChallenge({
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            response,
            request,
            getAccessToken,
            logger: logger2
          }, parsedClaim);
          if (shouldSendRequest) {
            [response, error] = await trySendRequest(request, next);
          }
        } else if (callbacks.authorizeRequestOnChallenge) {
          shouldSendRequest = await callbacks.authorizeRequestOnChallenge({
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            request,
            response,
            getAccessToken,
            logger: logger2
          });
          if (shouldSendRequest) {
            [response, error] = await trySendRequest(request, next);
          }
          if (isChallengeResponse(response)) {
            claims = getCaeChallengeClaims(response.headers.get("WWW-Authenticate"));
            if (claims) {
              let parsedClaim;
              try {
                parsedClaim = atob(claims);
              } catch (e) {
                logger2.warning(`The WWW-Authenticate header contains "claims" that cannot be parsed. Unable to perform the Continuous Access Evaluation authentication flow. Unparsable claims: ${claims}`);
                return response;
              }
              shouldSendRequest = await authorizeRequestOnCaeChallenge({
                scopes: Array.isArray(scopes) ? scopes : [scopes],
                response,
                request,
                getAccessToken,
                logger: logger2
              }, parsedClaim);
              if (shouldSendRequest) {
                [response, error] = await trySendRequest(request, next);
              }
            }
          }
        }
      }
      if (error) {
        throw error;
      } else {
        return response;
      }
    }
  };
}
function parseChallenges(challenges) {
  const challengeRegex = /(\w+)\s+((?:\w+=(?:"[^"]*"|[^,]*),?\s*)+)/g;
  const paramRegex = /(\w+)="([^"]*)"/g;
  const parsedChallenges = [];
  let match;
  while ((match = challengeRegex.exec(challenges)) !== null) {
    const scheme = match[1];
    const paramsString = match[2];
    const params = {};
    let paramMatch;
    while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
      params[paramMatch[1]] = paramMatch[2];
    }
    parsedChallenges.push({ scheme, params });
  }
  return parsedChallenges;
}
function getCaeChallengeClaims(challenges) {
  var _a4;
  if (!challenges) {
    return;
  }
  const parsedChallenges = parseChallenges(challenges);
  return (_a4 = parsedChallenges.find((x) => x.scheme === "Bearer" && x.params.claims && x.params.error === "insufficient_claims")) === null || _a4 === void 0 ? void 0 : _a4.params.claims;
}
var bearerTokenAuthenticationPolicyName;
var init_bearerTokenAuthenticationPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/bearerTokenAuthenticationPolicy.js"() {
    init_tokenCycler();
    init_log();
    init_restError();
    bearerTokenAuthenticationPolicyName = "bearerTokenAuthenticationPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/ndJsonPolicy.js
function ndJsonPolicy() {
  return {
    name: ndJsonPolicyName,
    async sendRequest(request, next) {
      if (typeof request.body === "string" && request.body.startsWith("[")) {
        const body = JSON.parse(request.body);
        if (Array.isArray(body)) {
          request.body = body.map((item) => JSON.stringify(item) + "\n").join("");
        }
      }
      return next(request);
    }
  };
}
var ndJsonPolicyName;
var init_ndJsonPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/ndJsonPolicy.js"() {
    ndJsonPolicyName = "ndJsonPolicy";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/policies/auxiliaryAuthenticationHeaderPolicy.js
async function sendAuthorizeRequest(options) {
  var _a4, _b2;
  const { scopes, getAccessToken, request } = options;
  const getTokenOptions = {
    abortSignal: request.abortSignal,
    tracingOptions: request.tracingOptions
  };
  return (_b2 = (_a4 = await getAccessToken(scopes, getTokenOptions)) === null || _a4 === void 0 ? void 0 : _a4.token) !== null && _b2 !== void 0 ? _b2 : "";
}
function auxiliaryAuthenticationHeaderPolicy(options) {
  const { credentials, scopes } = options;
  const logger2 = options.logger || logger;
  const tokenCyclerMap = /* @__PURE__ */ new WeakMap();
  return {
    name: auxiliaryAuthenticationHeaderPolicyName,
    async sendRequest(request, next) {
      if (!request.url.toLowerCase().startsWith("https://")) {
        throw new Error("Bearer token authentication for auxiliary header is not permitted for non-TLS protected (non-https) URLs.");
      }
      if (!credentials || credentials.length === 0) {
        logger2.info(`${auxiliaryAuthenticationHeaderPolicyName} header will not be set due to empty credentials.`);
        return next(request);
      }
      const tokenPromises = [];
      for (const credential of credentials) {
        let getAccessToken = tokenCyclerMap.get(credential);
        if (!getAccessToken) {
          getAccessToken = createTokenCycler(credential);
          tokenCyclerMap.set(credential, getAccessToken);
        }
        tokenPromises.push(sendAuthorizeRequest({
          scopes: Array.isArray(scopes) ? scopes : [scopes],
          request,
          getAccessToken,
          logger: logger2
        }));
      }
      const auxiliaryTokens = (await Promise.all(tokenPromises)).filter((token) => Boolean(token));
      if (auxiliaryTokens.length === 0) {
        logger2.warning(`None of the auxiliary tokens are valid. ${AUTHORIZATION_AUXILIARY_HEADER} header will not be set.`);
        return next(request);
      }
      request.headers.set(AUTHORIZATION_AUXILIARY_HEADER, auxiliaryTokens.map((token) => `Bearer ${token}`).join(", "));
      return next(request);
    }
  };
}
var auxiliaryAuthenticationHeaderPolicyName, AUTHORIZATION_AUXILIARY_HEADER;
var init_auxiliaryAuthenticationHeaderPolicy = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/policies/auxiliaryAuthenticationHeaderPolicy.js"() {
    init_tokenCycler();
    init_log();
    auxiliaryAuthenticationHeaderPolicyName = "auxiliaryAuthenticationHeaderPolicy";
    AUTHORIZATION_AUXILIARY_HEADER = "x-ms-authorization-auxiliary";
  }
});

// node_modules/@azure/core-rest-pipeline/dist/browser/index.js
var browser_exports2 = {};
__export(browser_exports2, {
  RestError: () => RestError,
  agentPolicy: () => agentPolicy,
  agentPolicyName: () => agentPolicyName,
  auxiliaryAuthenticationHeaderPolicy: () => auxiliaryAuthenticationHeaderPolicy,
  auxiliaryAuthenticationHeaderPolicyName: () => auxiliaryAuthenticationHeaderPolicyName,
  bearerTokenAuthenticationPolicy: () => bearerTokenAuthenticationPolicy,
  bearerTokenAuthenticationPolicyName: () => bearerTokenAuthenticationPolicyName,
  createDefaultHttpClient: () => createDefaultHttpClient,
  createEmptyPipeline: () => createEmptyPipeline,
  createFile: () => createFile,
  createFileFromStream: () => createFileFromStream,
  createHttpHeaders: () => createHttpHeaders,
  createPipelineFromOptions: () => createPipelineFromOptions,
  createPipelineRequest: () => createPipelineRequest,
  decompressResponsePolicy: () => decompressResponsePolicy,
  decompressResponsePolicyName: () => decompressResponsePolicyName,
  defaultRetryPolicy: () => defaultRetryPolicy,
  exponentialRetryPolicy: () => exponentialRetryPolicy,
  exponentialRetryPolicyName: () => exponentialRetryPolicyName,
  formDataPolicy: () => formDataPolicy,
  formDataPolicyName: () => formDataPolicyName,
  getDefaultProxySettings: () => getDefaultProxySettings,
  isRestError: () => isRestError,
  logPolicy: () => logPolicy,
  logPolicyName: () => logPolicyName,
  multipartPolicy: () => multipartPolicy,
  multipartPolicyName: () => multipartPolicyName,
  ndJsonPolicy: () => ndJsonPolicy,
  ndJsonPolicyName: () => ndJsonPolicyName,
  proxyPolicy: () => proxyPolicy,
  proxyPolicyName: () => proxyPolicyName,
  redirectPolicy: () => redirectPolicy,
  redirectPolicyName: () => redirectPolicyName,
  retryPolicy: () => retryPolicy,
  setClientRequestIdPolicy: () => setClientRequestIdPolicy,
  setClientRequestIdPolicyName: () => setClientRequestIdPolicyName,
  systemErrorRetryPolicy: () => systemErrorRetryPolicy,
  systemErrorRetryPolicyName: () => systemErrorRetryPolicyName,
  throttlingRetryPolicy: () => throttlingRetryPolicy,
  throttlingRetryPolicyName: () => throttlingRetryPolicyName,
  tlsPolicy: () => tlsPolicy,
  tlsPolicyName: () => tlsPolicyName,
  tracingPolicy: () => tracingPolicy,
  tracingPolicyName: () => tracingPolicyName,
  userAgentPolicy: () => userAgentPolicy,
  userAgentPolicyName: () => userAgentPolicyName
});
var init_browser6 = __esm({
  "node_modules/@azure/core-rest-pipeline/dist/browser/index.js"() {
    init_pipeline();
    init_createPipelineFromOptions();
    init_defaultHttpClient();
    init_httpHeaders();
    init_pipelineRequest();
    init_restError();
    init_decompressResponsePolicy();
    init_exponentialRetryPolicy();
    init_setClientRequestIdPolicy();
    init_logPolicy();
    init_multipartPolicy();
    init_proxyPolicy();
    init_redirectPolicy();
    init_systemErrorRetryPolicy();
    init_throttlingRetryPolicy();
    init_retryPolicy();
    init_tracingPolicy();
    init_defaultRetryPolicy();
    init_userAgentPolicy();
    init_tlsPolicy();
    init_formDataPolicy();
    init_bearerTokenAuthenticationPolicy();
    init_ndJsonPolicy();
    init_auxiliaryAuthenticationHeaderPolicy();
    init_agentPolicy();
    init_file();
  }
});

// node_modules/@azure/communication-common/dist-esm/src/tokenParser.js
var parseToken = (token) => {
  const { exp } = jwtDecode(token);
  return {
    token,
    expiresOnTimestamp: exp * 1e3
  };
};

// node_modules/@azure/communication-common/dist-esm/src/autoRefreshTokenCredential.js
var expiredToken = { token: "", expiresOnTimestamp: -10 };
var minutesToMs = (minutes) => minutes * 1e3 * 60;
var defaultExpiringSoonInterval = minutesToMs(10);
var defaultRefreshAfterLifetimePercentage = 0.5;
var AutoRefreshTokenCredential = class {
  constructor(refreshArgs) {
    this.expiringSoonIntervalInMs = defaultExpiringSoonInterval;
    this.refreshAfterLifetimePercentage = defaultRefreshAfterLifetimePercentage;
    this.activeTokenFetching = null;
    this.activeTokenUpdating = null;
    this.disposed = false;
    const { tokenRefresher, token, refreshProactively } = refreshArgs;
    this.refresh = tokenRefresher;
    this.currentToken = token ? parseToken(token) : expiredToken;
    this.refreshProactively = refreshProactively !== null && refreshProactively !== void 0 ? refreshProactively : false;
    if (this.refreshProactively) {
      this.scheduleRefresh();
    }
  }
  async getToken(options) {
    if (!this.isTokenExpiringSoon(this.currentToken)) {
      return this.currentToken;
    }
    if (!this.isTokenValid(this.currentToken)) {
      const updatePromise = this.updateTokenAndReschedule(options === null || options === void 0 ? void 0 : options.abortSignal);
      await updatePromise;
    }
    return this.currentToken;
  }
  dispose() {
    this.disposed = true;
    this.activeTokenFetching = null;
    this.activeTokenUpdating = null;
    this.currentToken = expiredToken;
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
  }
  async updateTokenAndReschedule(abortSignal) {
    if (this.activeTokenUpdating) {
      return this.activeTokenUpdating;
    }
    this.activeTokenUpdating = this.refreshTokenAndReschedule(abortSignal);
    try {
      await this.activeTokenUpdating;
    } finally {
      this.activeTokenUpdating = null;
    }
  }
  async refreshTokenAndReschedule(abortSignal) {
    const newToken = await this.refreshToken(abortSignal);
    if (!this.isTokenValid(newToken)) {
      throw new Error("The token returned from the tokenRefresher is expired.");
    }
    this.currentToken = newToken;
    if (this.refreshProactively) {
      this.scheduleRefresh();
    }
  }
  async refreshToken(abortSignal) {
    try {
      if (!this.activeTokenFetching) {
        this.activeTokenFetching = this.refresh(abortSignal);
      }
      return parseToken(await this.activeTokenFetching);
    } finally {
      this.activeTokenFetching = null;
    }
  }
  scheduleRefresh() {
    if (this.disposed) {
      return;
    }
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
    const tokenTtlInMs = this.currentToken.expiresOnTimestamp - Date.now();
    let timespanInMs = null;
    if (this.isTokenExpiringSoon(this.currentToken)) {
      timespanInMs = tokenTtlInMs * this.refreshAfterLifetimePercentage;
    } else {
      timespanInMs = tokenTtlInMs - this.expiringSoonIntervalInMs;
    }
    this.activeTimeout = setTimeout(() => this.updateTokenAndReschedule(), timespanInMs);
  }
  isTokenValid(token) {
    return token && Date.now() < token.expiresOnTimestamp;
  }
  isTokenExpiringSoon(token) {
    return !token || Date.now() >= token.expiresOnTimestamp - this.expiringSoonIntervalInMs;
  }
};

// node_modules/@azure/communication-common/dist-esm/src/staticTokenCredential.js
var StaticTokenCredential = class {
  constructor(token) {
    this.token = token;
  }
  async getToken() {
    return this.token;
  }
  dispose() {
  }
};

// node_modules/@azure/communication-common/dist-esm/src/azureCommunicationTokenCredential.js
var AzureCommunicationTokenCredential = class {
  constructor(tokenOrRefreshOptions) {
    this.disposed = false;
    if (typeof tokenOrRefreshOptions === "string") {
      this.tokenCredential = new StaticTokenCredential(parseToken(tokenOrRefreshOptions));
    } else {
      this.tokenCredential = new AutoRefreshTokenCredential(tokenOrRefreshOptions);
    }
  }
  /**
   * Gets an `AccessToken` for the user. Throws if already disposed.
   * @param abortSignal - An implementation of `AbortSignalLike` to cancel the operation.
   */
  async getToken(options) {
    this.throwIfDisposed();
    const token = await this.tokenCredential.getToken(options);
    this.throwIfDisposed();
    return token;
  }
  /**
   * Disposes the CommunicationTokenCredential and cancels any internal auto-refresh operation.
   */
  dispose() {
    this.disposed = true;
    this.tokenCredential.dispose();
  }
  throwIfDisposed() {
    if (this.disposed) {
      throw new Error("User credential is disposed");
    }
  }
};

// node_modules/@azure/communication-common/dist-esm/src/credential/encodeUtils.browser.js
var encodeUTF8 = (str) => new TextEncoder().encode(str);
function encodeUTF8fromBase64(str) {
  if (typeof atob !== "function") {
    throw new Error("Your browser environment is missing the global `atob` function");
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function encodeBase64(value) {
  if (typeof btoa !== "function") {
    throw new Error("Your browser environment is missing the global `btoa` function");
  }
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

// node_modules/@azure/communication-common/dist-esm/src/credential/cryptoUtils.browser.js
var _a;
var subtle = (_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a === void 0 ? void 0 : _a.subtle;
var shaHash = async (content) => {
  const data = encodeUTF8(content);
  const hash = await subtle.digest("SHA-256", data);
  return encodeBase64(hash);
};
var shaHMAC = async (secret, content) => {
  const importParams = { name: "HMAC", hash: { name: "SHA-256" } };
  const encodedMessage = encodeUTF8(content);
  const encodedKey = encodeUTF8fromBase64(secret);
  const crypto = subtle;
  const cryptoKey = await crypto.importKey("raw", encodedKey, importParams, false, ["sign"]);
  const signature = await crypto.sign(importParams, cryptoKey, encodedMessage);
  return encodeBase64(signature);
};

// node_modules/@azure/communication-common/dist-esm/src/credential/communicationAccessKeyCredentialPolicy.js
init_browser3();
var communicationAccessKeyCredentialPolicy = "CommunicationAccessKeyCredentialPolicy";
function createCommunicationAccessKeyCredentialPolicy(credential) {
  return {
    name: communicationAccessKeyCredentialPolicy,
    async sendRequest(request, next) {
      var _a4;
      const verb = request.method.toUpperCase();
      const utcNow = (/* @__PURE__ */ new Date()).toUTCString();
      const contentHash = await shaHash(((_a4 = request.body) === null || _a4 === void 0 ? void 0 : _a4.toString()) || "");
      const dateHeader = "x-ms-date";
      const signedHeaders = `${dateHeader};host;x-ms-content-sha256`;
      const url = new URL(request.url);
      const query = url.searchParams.toString();
      const urlPathAndQuery = query ? `${url.pathname}?${query}` : url.pathname;
      const port = url.port;
      const hostAndPort = port ? `${url.host}:${port}` : url.host;
      const stringToSign = `${verb}
${urlPathAndQuery}
${utcNow};${hostAndPort};${contentHash}`;
      const signature = await shaHMAC(credential.key, stringToSign);
      if (isNode) {
        request.headers.set("Host", hostAndPort || "");
      }
      request.headers.set(dateHeader, utcNow);
      request.headers.set("x-ms-content-sha256", contentHash);
      request.headers.set("Authorization", `HMAC-SHA256 SignedHeaders=${signedHeaders}&Signature=${signature}`);
      return next(request);
    }
  };
}

// node_modules/@azure/communication-common/dist-esm/src/credential/communicationAuthPolicy.js
init_browser6();

// node_modules/@azure/core-auth/dist/browser/azureKeyCredential.js
var AzureKeyCredential = class {
  /**
   * The value of the key to be used in authentication
   */
  get key() {
    return this._key;
  }
  /**
   * Create an instance of an AzureKeyCredential for use
   * with a service client.
   *
   * @param key - The initial value of the key to use in authentication
   */
  constructor(key) {
    if (!key) {
      throw new Error("key must be a non-empty string");
    }
    this._key = key;
  }
  /**
   * Change the value of the key.
   *
   * Updates will take effect upon the next request after
   * updating the key value.
   *
   * @param newKey - The new key value to be used
   */
  update(newKey) {
    this._key = newKey;
  }
};

// node_modules/@azure/core-auth/dist/browser/keyCredential.js
init_browser3();

// node_modules/@azure/core-auth/dist/browser/azureNamedKeyCredential.js
init_browser3();

// node_modules/@azure/core-auth/dist/browser/azureSASCredential.js
init_browser3();

// node_modules/@azure/core-auth/dist/browser/tokenCredential.js
function isTokenCredential(credential) {
  const castCredential = credential;
  return castCredential && typeof castCredential.getToken === "function" && (castCredential.signRequest === void 0 || castCredential.getToken.length > 0);
}

// node_modules/@azure/communication-common/dist-esm/src/credential/communicationAuthPolicy.js
function createCommunicationAuthPolicy(credential) {
  if (isTokenCredential(credential)) {
    const policyOptions = {
      credential,
      scopes: ["https://communication.azure.com//.default"]
    };
    return bearerTokenAuthenticationPolicy(policyOptions);
  } else {
    return createCommunicationAccessKeyCredentialPolicy(credential);
  }
}

// node_modules/@azure/communication-common/dist-esm/src/credential/connectionString.js
var CONNECTION_STRING_REGEX = /endpoint=(.*);accesskey=(.*)/i;
var tryParseConnectionString = (s) => {
  const match = s.match(CONNECTION_STRING_REGEX);
  if ((match === null || match === void 0 ? void 0 : match[1]) && match[2]) {
    return { endpoint: match[1], credential: new AzureKeyCredential(match[2]) };
  }
  return void 0;
};
var parseConnectionString = (connectionString) => {
  const parsedConnectionString = tryParseConnectionString(connectionString);
  if (parsedConnectionString) {
    return parsedConnectionString;
  } else {
    throw new Error(`Invalid connection string ${connectionString}`);
  }
};

// node_modules/@azure/communication-common/dist-esm/src/credential/clientArguments.js
var isValidEndpoint = (host) => {
  var _a4;
  const url = new URL(host);
  return !!((_a4 = url.protocol) === null || _a4 === void 0 ? void 0 : _a4.match(/^http[s]?/)) && url.host !== void 0 && url.host !== "" && (url.pathname === void 0 || url.pathname === "" || url.pathname === "/");
};
var assertValidEndpoint = (host) => {
  if (!isValidEndpoint(host)) {
    throw new Error(`Invalid endpoint url ${host}`);
  }
};
var isKeyCredential2 = (credential) => {
  const castCredential = credential;
  return castCredential && typeof castCredential.key === "string" && castCredential.getToken === void 0;
};
var parseClientArguments = (connectionStringOrUrl, credentialOrOptions) => {
  if (isKeyCredential2(credentialOrOptions) || isTokenCredential(credentialOrOptions)) {
    assertValidEndpoint(connectionStringOrUrl);
    return { url: connectionStringOrUrl, credential: credentialOrOptions };
  } else {
    const { endpoint: host, credential } = parseConnectionString(connectionStringOrUrl);
    assertValidEndpoint(host);
    return { url: host, credential };
  }
};

// node_modules/@azure/communication-common/dist-esm/src/identifierModels.js
var isCommunicationUserIdentifier = (identifier) => {
  return typeof identifier.communicationUserId === "string";
};
var isPhoneNumberIdentifier = (identifier) => {
  return typeof identifier.phoneNumber === "string";
};
var isMicrosoftTeamsUserIdentifier = (identifier) => {
  return typeof identifier.microsoftTeamsUserId === "string";
};
var isMicrosoftTeamsAppIdentifier = (identifier) => {
  return typeof identifier.teamsAppId === "string";
};
var isUnknownIdentifier = (identifier) => {
  return typeof identifier.id === "string";
};
var getIdentifierKind = (identifier) => {
  if (isCommunicationUserIdentifier(identifier)) {
    return Object.assign(Object.assign({}, identifier), { kind: "communicationUser" });
  }
  if (isPhoneNumberIdentifier(identifier)) {
    return Object.assign(Object.assign({}, identifier), { kind: "phoneNumber" });
  }
  if (isMicrosoftTeamsUserIdentifier(identifier)) {
    return Object.assign(Object.assign({}, identifier), { kind: "microsoftTeamsUser" });
  }
  if (isMicrosoftTeamsAppIdentifier(identifier)) {
    return Object.assign(Object.assign({}, identifier), { kind: "microsoftTeamsApp" });
  }
  return Object.assign(Object.assign({}, identifier), { kind: "unknown" });
};
var getIdentifierRawId = (identifier) => {
  const identifierKind = getIdentifierKind(identifier);
  switch (identifierKind.kind) {
    case "communicationUser":
      return identifierKind.communicationUserId;
    case "microsoftTeamsUser": {
      const { microsoftTeamsUserId, rawId, cloud, isAnonymous } = identifierKind;
      if (rawId)
        return rawId;
      if (isAnonymous)
        return `8:teamsvisitor:${microsoftTeamsUserId}`;
      switch (cloud) {
        case "dod":
          return `8:dod:${microsoftTeamsUserId}`;
        case "gcch":
          return `8:gcch:${microsoftTeamsUserId}`;
        case "public":
          return `8:orgid:${microsoftTeamsUserId}`;
      }
      return `8:orgid:${microsoftTeamsUserId}`;
    }
    case "microsoftTeamsApp": {
      const { teamsAppId, rawId, cloud } = identifierKind;
      if (rawId)
        return rawId;
      switch (cloud) {
        case "dod":
          return `28:dod:${teamsAppId}`;
        case "gcch":
          return `28:gcch:${teamsAppId}`;
      }
      return `28:orgid:${teamsAppId}`;
    }
    case "phoneNumber": {
      const { phoneNumber, rawId } = identifierKind;
      if (rawId)
        return rawId;
      return `4:${phoneNumber}`;
    }
    case "unknown": {
      return identifierKind.id;
    }
  }
};
var buildMicrosoftTeamsAppIdentifier = (teamsAppId, cloud) => {
  return {
    kind: "microsoftTeamsApp",
    teamsAppId,
    cloud
  };
};
var buildMicrosoftTeamsUserIdentifier = (id, cloud, isAnonymous) => {
  return {
    kind: "microsoftTeamsUser",
    microsoftTeamsUserId: id,
    isAnonymous,
    cloud
  };
};
var createIdentifierFromRawId = (rawId) => {
  if (rawId.startsWith("4:")) {
    return { kind: "phoneNumber", phoneNumber: `${rawId.substring("4:".length)}` };
  }
  const segments = rawId.split(":");
  if (segments.length !== 3) {
    return { kind: "unknown", id: rawId };
  }
  const prefix = `${segments[0]}:${segments[1]}:`;
  const suffix = segments[2];
  switch (prefix) {
    case "8:teamsvisitor:":
      return { kind: "microsoftTeamsUser", microsoftTeamsUserId: suffix, isAnonymous: true };
    case "8:orgid:":
      return buildMicrosoftTeamsUserIdentifier(suffix, "public", false);
    case "8:dod:":
      return buildMicrosoftTeamsUserIdentifier(suffix, "dod", false);
    case "8:gcch:":
      return buildMicrosoftTeamsUserIdentifier(suffix, "gcch", false);
    case "8:acs:":
    case "8:spool:":
    case "8:dod-acs:":
    case "8:gcch-acs:":
      return { kind: "communicationUser", communicationUserId: rawId };
    case "28:orgid:":
      return buildMicrosoftTeamsAppIdentifier(suffix, "public");
    case "28:gcch:":
      return buildMicrosoftTeamsAppIdentifier(suffix, "gcch");
    case "28:dod:":
      return buildMicrosoftTeamsAppIdentifier(suffix, "dod");
  }
  return { kind: "unknown", id: rawId };
};

// node_modules/@azure/communication-common/dist-esm/src/identifierModelSerializer.js
var assertNotNullOrUndefined = (obj, prop) => {
  const subObjName = Object.keys(obj)[0];
  const subObj = obj[subObjName];
  if (prop in subObj) {
    return subObj[prop];
  }
  throw new Error(`Property ${prop} is required for identifier of type ${subObjName}.`);
};
var assertMaximumOneNestedModel = (identifier) => {
  const presentProperties = [];
  if (identifier.communicationUser !== void 0) {
    presentProperties.push("communicationUser");
  }
  if (identifier.microsoftTeamsUser !== void 0) {
    presentProperties.push("microsoftTeamsUser");
  }
  if (identifier.microsoftTeamsApp !== void 0) {
    presentProperties.push("microsoftTeamsApp");
  }
  if (identifier.phoneNumber !== void 0) {
    presentProperties.push("phoneNumber");
  }
  if (presentProperties.length > 1) {
    throw new Error(`Only one of the properties in ${JSON.stringify(presentProperties)} should be present.`);
  }
};
var serializeCommunicationIdentifier = (identifier) => {
  var _a4, _b2, _c2, _d2, _e, _f;
  const identifierKind = getIdentifierKind(identifier);
  switch (identifierKind.kind) {
    case "communicationUser":
      return {
        rawId: getIdentifierRawId(identifierKind),
        communicationUser: { id: identifierKind.communicationUserId }
      };
    case "phoneNumber":
      return {
        rawId: (_a4 = identifierKind.rawId) !== null && _a4 !== void 0 ? _a4 : getIdentifierRawId(identifierKind),
        phoneNumber: {
          value: identifierKind.phoneNumber
        }
      };
    case "microsoftTeamsUser":
      return {
        rawId: (_b2 = identifierKind.rawId) !== null && _b2 !== void 0 ? _b2 : getIdentifierRawId(identifierKind),
        microsoftTeamsUser: {
          userId: identifierKind.microsoftTeamsUserId,
          isAnonymous: (_c2 = identifierKind.isAnonymous) !== null && _c2 !== void 0 ? _c2 : false,
          cloud: (_d2 = identifierKind.cloud) !== null && _d2 !== void 0 ? _d2 : "public"
        }
      };
    case "microsoftTeamsApp":
      return {
        rawId: (_e = identifierKind.rawId) !== null && _e !== void 0 ? _e : getIdentifierRawId(identifierKind),
        microsoftTeamsApp: {
          appId: identifierKind.teamsAppId,
          cloud: (_f = identifierKind.cloud) !== null && _f !== void 0 ? _f : "public"
        }
      };
    case "unknown":
      return { rawId: identifierKind.id };
    default:
      throw new Error(`Can't serialize an identifier with kind ${identifierKind.kind}`);
  }
};
var getKind = (serializedIdentifier) => {
  if (serializedIdentifier.communicationUser) {
    return "communicationUser";
  }
  if (serializedIdentifier.phoneNumber) {
    return "phoneNumber";
  }
  if (serializedIdentifier.microsoftTeamsUser) {
    return "microsoftTeamsUser";
  }
  if (serializedIdentifier.microsoftTeamsApp) {
    return "microsoftTeamsApp";
  }
  return "unknown";
};
var deserializeCommunicationIdentifier = (serializedIdentifier) => {
  var _a4;
  assertMaximumOneNestedModel(serializedIdentifier);
  const { communicationUser, microsoftTeamsUser, microsoftTeamsApp, phoneNumber } = serializedIdentifier;
  const kind = (_a4 = serializedIdentifier.kind) !== null && _a4 !== void 0 ? _a4 : getKind(serializedIdentifier);
  if (kind === "communicationUser" && communicationUser) {
    return {
      kind: "communicationUser",
      communicationUserId: assertNotNullOrUndefined({ communicationUser }, "id")
    };
  }
  if (kind === "phoneNumber" && phoneNumber) {
    return {
      kind: "phoneNumber",
      phoneNumber: assertNotNullOrUndefined({ phoneNumber }, "value"),
      rawId: assertNotNullOrUndefined({ phoneNumber: serializedIdentifier }, "rawId")
    };
  }
  if (kind === "microsoftTeamsUser" && microsoftTeamsUser) {
    return {
      kind: "microsoftTeamsUser",
      microsoftTeamsUserId: assertNotNullOrUndefined({ microsoftTeamsUser }, "userId"),
      isAnonymous: assertNotNullOrUndefined({ microsoftTeamsUser }, "isAnonymous"),
      cloud: assertNotNullOrUndefined({ microsoftTeamsUser }, "cloud"),
      rawId: assertNotNullOrUndefined({ microsoftTeamsUser: serializedIdentifier }, "rawId")
    };
  }
  if (kind === "microsoftTeamsApp" && microsoftTeamsApp) {
    return {
      kind: "microsoftTeamsApp",
      teamsAppId: assertNotNullOrUndefined({ microsoftTeamsApp }, "appId"),
      cloud: assertNotNullOrUndefined({ microsoftTeamsApp }, "cloud"),
      rawId: assertNotNullOrUndefined({ microsoftTeamsApp: serializedIdentifier }, "rawId")
    };
  }
  return {
    kind: "unknown",
    id: assertNotNullOrUndefined({ unknown: serializedIdentifier }, "rawId")
  };
};

export {
  AzureCommunicationTokenCredential,
  browser_exports,
  init_browser3 as init_browser,
  createCommunicationAccessKeyCredentialPolicy,
  createTracingClient,
  init_browser5 as init_browser2,
  RestError,
  createPipelineFromOptions,
  createDefaultHttpClient,
  createPipelineRequest,
  bearerTokenAuthenticationPolicy,
  browser_exports2,
  init_browser6 as init_browser3,
  createCommunicationAuthPolicy,
  parseConnectionString,
  isKeyCredential2 as isKeyCredential,
  parseClientArguments,
  isCommunicationUserIdentifier,
  isPhoneNumberIdentifier,
  isMicrosoftTeamsUserIdentifier,
  isMicrosoftTeamsAppIdentifier,
  isUnknownIdentifier,
  getIdentifierKind,
  getIdentifierRawId,
  createIdentifierFromRawId,
  serializeCommunicationIdentifier,
  deserializeCommunicationIdentifier
};
//# sourceMappingURL=chunk-MIKOOR6L.js.map
