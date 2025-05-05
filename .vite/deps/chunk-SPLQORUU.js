import {
  __esm
} from "./chunk-V4OQ3NZ2.js";

// node_modules/@azure/logger/dist/browser/log.common.js
function log(...args) {
  if (args.length > 0) {
    const firstArg = String(args[0]);
    if (firstArg.includes(":error")) {
      console.error(...args);
    } else if (firstArg.includes(":warning")) {
      console.warn(...args);
    } else if (firstArg.includes(":info")) {
      console.info(...args);
    } else if (firstArg.includes(":verbose")) {
      console.debug(...args);
    } else {
      console.debug(...args);
    }
  }
}
var init_log_common = __esm({
  "node_modules/@azure/logger/dist/browser/log.common.js"() {
  }
});

// node_modules/@azure/logger/dist/browser/log.js
var init_log = __esm({
  "node_modules/@azure/logger/dist/browser/log.js"() {
    init_log_common();
  }
});

// node_modules/@azure/logger/dist/browser/debug.js
function enable(namespaces) {
  enabledString = namespaces;
  enabledNamespaces = [];
  skippedNamespaces = [];
  const wildcard = /\*/g;
  const namespaceList = namespaces.split(",").map((ns) => ns.trim().replace(wildcard, ".*?"));
  for (const ns of namespaceList) {
    if (ns.startsWith("-")) {
      skippedNamespaces.push(new RegExp(`^${ns.substr(1)}$`));
    } else {
      enabledNamespaces.push(new RegExp(`^${ns}$`));
    }
  }
  for (const instance of debuggers) {
    instance.enabled = enabled(instance.namespace);
  }
}
function enabled(namespace) {
  if (namespace.endsWith("*")) {
    return true;
  }
  for (const skipped of skippedNamespaces) {
    if (skipped.test(namespace)) {
      return false;
    }
  }
  for (const enabledNamespace of enabledNamespaces) {
    if (enabledNamespace.test(namespace)) {
      return true;
    }
  }
  return false;
}
function disable() {
  const result = enabledString || "";
  enable("");
  return result;
}
function createDebugger(namespace) {
  const newDebugger = Object.assign(debug, {
    enabled: enabled(namespace),
    destroy,
    log: debugObj.log,
    namespace,
    extend
  });
  function debug(...args) {
    if (!newDebugger.enabled) {
      return;
    }
    if (args.length > 0) {
      args[0] = `${namespace} ${args[0]}`;
    }
    newDebugger.log(...args);
  }
  debuggers.push(newDebugger);
  return newDebugger;
}
function destroy() {
  const index = debuggers.indexOf(this);
  if (index >= 0) {
    debuggers.splice(index, 1);
    return true;
  }
  return false;
}
function extend(namespace) {
  const newDebugger = createDebugger(`${this.namespace}:${namespace}`);
  newDebugger.log = this.log;
  return newDebugger;
}
var debugEnvVariable, enabledString, enabledNamespaces, skippedNamespaces, debuggers, debugObj, debug_default;
var init_debug = __esm({
  "node_modules/@azure/logger/dist/browser/debug.js"() {
    init_log();
    debugEnvVariable = typeof process !== "undefined" && process.env && process.env.DEBUG || void 0;
    enabledNamespaces = [];
    skippedNamespaces = [];
    debuggers = [];
    if (debugEnvVariable) {
      enable(debugEnvVariable);
    }
    debugObj = Object.assign((namespace) => {
      return createDebugger(namespace);
    }, {
      enable,
      enabled,
      disable,
      log
    });
    debug_default = debugObj;
  }
});

// node_modules/@azure/logger/dist/browser/index.js
function setLogLevel(level) {
  if (level && !isAzureLogLevel(level)) {
    throw new Error(`Unknown log level '${level}'. Acceptable values: ${AZURE_LOG_LEVELS.join(",")}`);
  }
  azureLogLevel = level;
  const enabledNamespaces2 = [];
  for (const logger of registeredLoggers) {
    if (shouldEnable(logger)) {
      enabledNamespaces2.push(logger.namespace);
    }
  }
  debug_default.enable(enabledNamespaces2.join(","));
}
function getLogLevel() {
  return azureLogLevel;
}
function createClientLogger(namespace) {
  const clientRootLogger = AzureLogger.extend(namespace);
  patchLogMethod(AzureLogger, clientRootLogger);
  return {
    error: createLogger(clientRootLogger, "error"),
    warning: createLogger(clientRootLogger, "warning"),
    info: createLogger(clientRootLogger, "info"),
    verbose: createLogger(clientRootLogger, "verbose")
  };
}
function patchLogMethod(parent, child) {
  child.log = (...args) => {
    parent.log(...args);
  };
}
function createLogger(parent, level) {
  const logger = Object.assign(parent.extend(level), {
    level
  });
  patchLogMethod(parent, logger);
  if (shouldEnable(logger)) {
    const enabledNamespaces2 = debug_default.disable();
    debug_default.enable(enabledNamespaces2 + "," + logger.namespace);
  }
  registeredLoggers.add(logger);
  return logger;
}
function shouldEnable(logger) {
  return Boolean(azureLogLevel && levelMap[logger.level] <= levelMap[azureLogLevel]);
}
function isAzureLogLevel(logLevel) {
  return AZURE_LOG_LEVELS.includes(logLevel);
}
var registeredLoggers, logLevelFromEnv, azureLogLevel, AzureLogger, AZURE_LOG_LEVELS, levelMap;
var init_browser = __esm({
  "node_modules/@azure/logger/dist/browser/index.js"() {
    init_debug();
    registeredLoggers = /* @__PURE__ */ new Set();
    logLevelFromEnv = typeof process !== "undefined" && process.env && process.env.AZURE_LOG_LEVEL || void 0;
    AzureLogger = debug_default("azure");
    AzureLogger.log = (...args) => {
      debug_default.log(...args);
    };
    AZURE_LOG_LEVELS = ["verbose", "info", "warning", "error"];
    if (logLevelFromEnv) {
      if (isAzureLogLevel(logLevelFromEnv)) {
        setLogLevel(logLevelFromEnv);
      } else {
        console.error(`AZURE_LOG_LEVEL set to unknown log level '${logLevelFromEnv}'; logging is not enabled. Acceptable values: ${AZURE_LOG_LEVELS.join(", ")}.`);
      }
    }
    levelMap = {
      verbose: 400,
      info: 300,
      warning: 200,
      error: 100
    };
  }
});

export {
  AzureLogger,
  getLogLevel,
  createClientLogger,
  init_browser
};
//# sourceMappingURL=chunk-SPLQORUU.js.map
