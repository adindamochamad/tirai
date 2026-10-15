type EnabledItems = {
  enabled?: unknown;
};

type EnabledChange = {
  newValue?: unknown;
};

export type ExtensionStorage = {
  local: {
    get(key: "enabled", callback: (items: EnabledItems) => void): void;
    set(items: { enabled: boolean }): void;
  };
  onChanged: {
    addListener(
      listener: (
        changes: { enabled?: EnabledChange },
        areaName: string,
      ) => void,
    ): void;
  };
};

type MessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response: unknown) => void,
) => boolean | void;

export type ExtensionRuntime = {
  onInstalled: {
    addListener(listener: () => void): void;
  };
  onMessage: {
    addListener(listener: MessageListener): void;
  };
};

export type ExtensionTab = {
  id?: number;
};

export type ExtensionTabs = {
  query(
    queryInfo: { active: boolean; currentWindow: boolean },
    callback: (tabs: ExtensionTab[]) => void,
  ): void;
  sendMessage(
    tabId: number,
    message: unknown,
    callback?: (response: unknown) => void,
  ): void;
};

type ChromeHost = {
  storage?: {
    local?: ExtensionStorage["local"];
    onChanged?: ExtensionStorage["onChanged"];
  };
  runtime?: Partial<ExtensionRuntime>;
  tabs?: Partial<ExtensionTabs>;
};

function chromeHost(): ChromeHost | undefined {
  return (globalThis as { chrome?: ChromeHost }).chrome;
}

export function extensionStorage(): ExtensionStorage | undefined {
  const storage = chromeHost()?.storage;
  if (!storage?.local?.get || !storage.onChanged?.addListener) return undefined;
  return { local: storage.local, onChanged: storage.onChanged };
}

export function extensionRuntime(): ExtensionRuntime | undefined {
  const runtime = chromeHost()?.runtime;
  if (!runtime?.onInstalled?.addListener || !runtime.onMessage?.addListener) {
    return undefined;
  }
  return {
    onInstalled: runtime.onInstalled,
    onMessage: runtime.onMessage,
  };
}

export function extensionTabs(): ExtensionTabs | undefined {
  const tabs = chromeHost()?.tabs;
  if (!tabs?.query || !tabs.sendMessage) return undefined;
  return { query: tabs.query, sendMessage: tabs.sendMessage };
}
