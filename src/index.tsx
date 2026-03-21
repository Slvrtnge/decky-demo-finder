import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  Navigation,
  staticClasses,
  Focusable,
  TextField,
} from "@decky/ui";
import {
  callable,
  definePlugin,
  toaster,
  fetchNoCors,
  routerHook,
} from "@decky/api";
import { useState, useEffect, useCallback, useRef, Fragment, FC, useMemo } from "react";
import { FaGamepad, FaSearch, FaExternalLinkAlt, FaSyncAlt, FaKey, FaSortAlphaDown, FaChevronDown, FaChevronUp, FaPaste } from "react-icons/fa";

// ---- Backend callables ----
const getWishlist = callable<[steam_id: string], WishlistItem[] | string>("get_wishlist");
const checkDemosBatch = callable<[appids: number[]], Record<string, DemoInfo>>("check_demos_batch");
const setApiKey = callable<[api_key: string], boolean>("set_api_key");
const getApiKey = callable<[], string>("get_api_key");
const resolveNamesBatch = callable<[appids: number[]], Record<string, string>>("resolve_names_batch");
const saveDemoCache = callable<[cache_data: Record<string, DemoInfo>], boolean>("save_demo_cache");
const loadDemoCache = callable<[], Record<string, DemoInfo>>("load_demo_cache");
const setSgdbApiKey = callable<[api_key: string], boolean>("set_sgdb_api_key");
const getSgdbApiKey = callable<[], string>("get_sgdb_api_key");
const fetchSgdbImagesBatch = callable<[appids: number[]], Record<string, string | null>>("fetch_sgdb_images_batch");
const openUrlInBrowser = callable<[url: string], boolean>("open_url_in_browser");
const readClipboard = callable<[], string>("read_clipboard");

// ---- Types ----
interface WishlistItem {
  appid: number;
  name: string;
  date_added?: number;
}

interface DemoInfo {
  has_demo: boolean;
  demo_appid: number | null;
  demo_url: string | null;
  app_url: string;
  release_date?: string | null;
  name?: string | null;
  header_image?: string | null;
  definitive?: boolean;
}

interface WishlistItemWithDemo extends WishlistItem {
  demoInfo?: DemoInfo;
}

type SortMode = "alpha" | "date_added" | "release_date";

const BATCH_SIZE = 50;
const ITEMS_PER_PAGE = 20;
// Maximum pages to paginate through wishlistdata (100 items/page → 2 000 items max)
const MAX_WISHLIST_PAGES = 20;

const API_KEY_HELP_URL = "https://steamcommunity.com/dev/apikey";
const SGDB_KEY_HELP_URL = "https://www.steamgriddb.com/profile/preferences/api";

// ---- Styles ----
const containerStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: "4px",
};

const itemContainerStyle: React.CSSProperties = {
  display: "flex", flexDirection: "row", alignItems: "center",
  justifyContent: "space-between", padding: "8px 4px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const gameNameStyle: React.CSSProperties = {
  flex: 1, fontSize: "13px", overflow: "hidden",
  textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px",
};

const demoBadgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "4px",
  padding: "4px 10px", borderRadius: "4px", fontSize: "11px",
  fontWeight: "bold", cursor: "pointer",
  background: "linear-gradient(135deg, #1a9fff 0%, #0070d1 100%)",
  color: "#fff", border: "none", whiteSpace: "nowrap",
};

const noDemoStyle: React.CSSProperties = {
  fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap",
};

const statusStyle: React.CSSProperties = {
  textAlign: "center", padding: "8px", fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
};

const pageBtnStyle: React.CSSProperties = {
  padding: "4px 12px", borderRadius: "4px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)", color: "#fff",
  cursor: "pointer", fontSize: "12px",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "11px", color: "rgba(255,255,255,0.5)",
  padding: "4px 0", lineHeight: "1.4",
};

const focusHighlightCSS = `
  .demo-finder-item-focus {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  .demo-finder-page-btn-focus {
    border-color: rgba(255, 255, 255, 0.6) !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }
  .demo-finder-card-focus {
    outline: 2px solid rgba(100, 180, 255, 0.8) !important;
    border-radius: 6px;
  }
`;

// ---- Full-page view styles ----
const fullPageStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column",
  width: "100%", height: "100vh",
  background: "#1b2838", color: "#fff",
  overflow: "hidden",
  boxSizing: "border-box",
  paddingTop: "58px",
};

const fullPageHeaderStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "16px",
  padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
  flexShrink: 0, background: "rgba(0,0,0,0.3)", flexWrap: "wrap",
};

const fullPageTitleStyle: React.CSSProperties = {
  fontSize: "22px", fontWeight: "bold",
  display: "flex", alignItems: "center", gap: "10px",
  flex: 1, whiteSpace: "nowrap",
};

const fullPageBtnStyle: React.CSSProperties = {
  padding: "6px 14px", borderRadius: "4px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.12)", color: "#fff",
  cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap",
};

const fullPageActiveBtnStyle: React.CSSProperties = {
  ...fullPageBtnStyle,
  background: "rgba(100,180,255,0.25)",
  border: "1px solid rgba(100,180,255,0.6)",
};

const fullPageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(266px, 1fr))",
  gap: "12px", padding: "16px 24px 24px 24px",
  overflowY: "auto", flex: 1,
  minHeight: 0,
  alignContent: "start",
};

const fullPageCardStyle: React.CSSProperties = {
  borderRadius: "6px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  overflow: "hidden", cursor: "pointer",
  display: "flex", flexDirection: "column",
};

const fullPageCardImgStyle: React.CSSProperties = {
  width: "100%", height: "auto",
  aspectRatio: "460 / 215",
  objectFit: "contain", display: "block",
  background: "rgba(0,0,0,0.3)",
};

const fullPageCardBodyStyle: React.CSSProperties = {
  padding: "8px", flex: 1,
  display: "flex", flexDirection: "column", gap: "6px",
};

const fullPageCardNameStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: "bold",
  overflow: "hidden", textOverflow: "ellipsis",
  display: "-webkit-box", WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  lineHeight: "1.3",
};

const fullPageDemoBadgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "4px",
  padding: "3px 8px", borderRadius: "3px", fontSize: "10px",
  fontWeight: "bold",
  background: "linear-gradient(135deg, #1a9fff 0%, #0070d1 100%)",
  color: "#fff", alignSelf: "flex-start",
};

const fullPageStatusStyle: React.CSSProperties = {
  textAlign: "center", padding: "32px", fontSize: "14px",
  color: "rgba(255,255,255,0.5)", width: "100%",
};

const fullPagePaginationStyle: React.CSSProperties = {
  display: "flex", justifyContent: "center", alignItems: "center",
  gap: "16px", padding: "16px 12px", marginTop: "12px",
  marginBottom: "16px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  flexShrink: 0,
};

const fullPageButtonGroupStyle: React.CSSProperties = {
  display: "flex", gap: "12px", alignItems: "center",
};

const FULL_PAGE_ITEMS_PER_PAGE = 24;

// ---- Persisted state (survives component unmount/remount) ----
let cachedWishlist: WishlistItemWithDemo[] = [];
let cachedHasScanned = false;
let cachedFilterDemoOnly = false;
let cachedDemoResults: Record<string, DemoInfo> = {};
let cachedDemoCacheLoaded = false;
let cachedSortBy: SortMode = "alpha";
/** Capsule / header image URLs harvested from Steam wishlistdata. */
let capsuleImageCache: Record<string, string> = {};
/** SteamGridDB artwork URLs cached in memory (appid → URL). */
let sgdbImageCache: Record<string, string> = {};

// ---- Helpers ----
function getSteamId(): string {
  try {
    const id = (window as unknown as { App?: { m_CurrentUser?: { strSteamID?: string } } })
      .App?.m_CurrentUser?.strSteamID;
    if (id) return id;
  } catch (_e) { /* ignore */ }
  return "";
}

/**
 * Frontend fallback: fetch wishlist via fetchNoCors (Decky proxy).
 * Uses IWishlistService/GetWishlist/v1 with API key and steamid.
 */
async function fetchWishlistFrontend(steamId: string, apiKey: string): Promise<WishlistItem[]> {
  try {
    let url = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamId}`;
    if (apiKey) {
      url += `&key=${apiKey}`;
    }
    const resp = await fetchNoCors(url, {
      headers: { "Accept": "application/json" },
    });
    if (!resp.ok) {
      console.warn(`[Demo Finder] Frontend GetWishlist returned status ${resp.status}`);
      return [];
    }
    const data = await resp.json();
    const items = data?.response?.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    return items
      .filter((item: { appid?: number }) => item.appid != null)
      .map((item: { appid: number; name?: string; date_added?: number }) => ({
        appid: item.appid,
        name: item.name || `App ${item.appid}`,
        date_added: item.date_added || 0,
      }));
  } catch (e) {
    console.error("[Demo Finder] Frontend wishlist fetch failed:", e);
    return [];
  }
}

/** Returns true if the item has a placeholder name that still needs resolving. */
function isPlaceholderName(item: WishlistItem): boolean {
  return !item.name || item.name.startsWith("App ") || item.name === "Unknown";
}

/** Wrap a promise with a timeout (in ms). Rejects with an Error on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label = "operation"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * For any wishlist items that still carry placeholder names (e.g. "App 12345")
 * after the backend has already done its best, call resolve_names_batch to
 * fetch real names from the Steam Store appdetails API.
 *
 * @param items - The wishlist items to check and update.
 * @returns A new array with placeholder names replaced by real game titles where possible.
 */
async function resolveItemNames(items: WishlistItem[]): Promise<WishlistItem[]> {
  const placeholders = items.filter(isPlaceholderName);
  if (placeholders.length === 0) return items;
  try {
    const names = await resolveNamesBatch(placeholders.map((p) => p.appid));
    return items.map((item) => {
      const resolved = names[String(item.appid)];
      if (resolved && isPlaceholderName(item)) {
        return { ...item, name: resolved };
      }
      return item;
    });
  } catch (e) {
    console.warn("[Demo Finder] Post-load name resolution failed:", e);
    return items;
  }
}

/**
 * Resolve placeholder names using Decky's fetchNoCors to call the Steam
 * wishlistdata endpoint as the logged-in user.  This bypasses the privacy
 * restriction that prevents the backend (which has no Steam auth cookies) from
 * reading a Friends-Only wishlist.
 *
 * @param steamId - The user's 64-bit Steam ID string.
 * @returns A mapping of appid string → name for all resolved games.
 */
async function resolveNamesViaWishlistData(steamId: string): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  if (!steamId) return names;
  try {
    for (let page = 0; page <= MAX_WISHLIST_PAGES; page++) {
      const url = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/?p=${page}`;
      const resp = await fetchNoCors(url, { headers: { "Accept": "application/json" } });
      if (!resp.ok) {
        console.warn(`[Demo Finder] wishlistdata page ${page} returned status ${resp.status}`);
        break;
      }
      const data = await resp.json();
      if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
        break;
      }
      for (const [appidStr, info] of Object.entries(data)) {
        if (info && typeof info === "object" && !Array.isArray(info)) {
          const rec = info as Record<string, unknown>;
          const name = rec.name;
          if (typeof name === "string" && name) {
            names[appidStr] = name;
          }
          // Harvest capsule image URL so the full-page view has an image
          // source available even before a demo scan is performed.
          const capsule = rec.capsule;
          if (typeof capsule === "string" && capsule) {
            capsuleImageCache[appidStr] = capsule;
          }
        }
      }
    }
  } catch (e) {
    console.warn("[Demo Finder] Frontend wishlistdata name resolution failed:", e);
  }
  if (Object.keys(names).length > 0) {
    console.log(`[Demo Finder] Frontend wishlistdata resolved ${Object.keys(names).length} names`);
  }
  return names;
}

/**
 * Resolve placeholder names by calling checkDemosBatch on items that still
 * have "App #" placeholder names. The _check_demo_shared_session backend
 * already fetches appdetails and extracts the game name, so this leverages
 * the same mechanism that scanForDemos uses to fix names.
 *
 * @param items - The current wishlist (including items with real names).
 * @returns A new array with placeholder names replaced by real game titles where possible.
 */
async function resolveNamesViaDemoBatch(items: WishlistItem[]): Promise<WishlistItem[]> {
  const placeholders = items.filter(isPlaceholderName);
  if (placeholders.length === 0) return items;
  try {
    const appids = placeholders.map((p) => p.appid);
    const results = await checkDemosBatch(appids);
    return items.map((item) => {
      const demoResult = results[String(item.appid)];
      if (demoResult?.name && isPlaceholderName(item)) {
        return { ...item, name: demoResult.name };
      }
      return item;
    });
  } catch (e) {
    console.warn("[Demo Finder] Demo-batch name resolution failed:", e);
    return items;
  }
}

const DemoButton: FC<{ demoInfo: DemoInfo; gameName: string }> = ({ demoInfo, gameName }) => {
  const handleClick = () => {
    if (demoInfo.demo_appid) {
      Navigation.NavigateToExternalWeb(
        demoInfo.demo_url || `https://store.steampowered.com/app/${demoInfo.demo_appid}/`
      );
      Navigation.CloseSideMenus();
      toaster.toast({ title: "Demo Finder", body: `Opening demo for ${gameName}` });
    }
  };

  return (
    <Focusable style={{ display: "inline-flex" }} onActivate={handleClick}>
      <div style={demoBadgeStyle} onClick={handleClick}>
        <FaGamepad size={12} /> Play Demo <FaExternalLinkAlt size={9} />
      </div>
    </Focusable>
  );
};

const GameStoreLinkButton: FC<{ appid: number; gameName: string }> = ({ appid, gameName }) => {
  const handleClick = () => {
    Navigation.NavigateToExternalWeb(`https://store.steampowered.com/app/${appid}/`);
    Navigation.CloseSideMenus();
    toaster.toast({ title: "Demo Finder", body: `Opening store page for ${gameName}` });
  };

  return (
    <Focusable style={{ display: "inline-flex" }} onActivate={handleClick}>
      <div
        style={{ ...demoBadgeStyle, background: "rgba(255,255,255,0.1)" }}
        onClick={handleClick}
        title="Open store page"
      >
        <FaExternalLinkAlt size={10} />
      </div>
    </Focusable>
  );
};

// ---- API Key Setup ----
const ApiKeySetup: FC<{ hasKey: boolean; onKeySaved: () => void }> = ({ hasKey, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  // Read the input value from the DOM as a fallback when React state
  // is empty.  Steam Deck's virtual keyboard may not fire onChange on
  // paste, leaving keyInput stale while the actual <input> holds the
  // pasted text.
  const getInputValue = (): string => {
    if (keyInput.trim()) return keyInput.trim();
    try {
      const el = fieldRef.current?.querySelector("input") as HTMLInputElement | null;
      if (el?.value?.trim()) return el.value.trim();
    } catch (_e) { /* ignore */ }
    return "";
  };

  const handlePaste = async () => {
    try {
      let text = "";
      let clipboardReadFailed = false;
      try {
        text = await navigator.clipboard.readText();
      } catch (_e) { /* browser API unavailable on Steam Deck */ }
      if (!text) {
        try {
          text = await readClipboard();
        } catch (e) {
          console.error("[Demo Finder] Backend clipboard read failed:", e);
          clipboardReadFailed = true;
        }
      }
      if (text?.trim()) {
        setKeyInput(text.trim());
        toaster.toast({ title: "Demo Finder", body: "Pasted from clipboard." });
      } else if (clipboardReadFailed) {
        toaster.toast({ title: "Demo Finder", body: "Could not access clipboard. Please paste your key into the text field manually." });
      } else {
        toaster.toast({ title: "Demo Finder", body: "Clipboard appears empty. Copy your key first, then try again." });
      }
    } catch (e) {
      console.error("[Demo Finder] Clipboard paste error:", e);
      toaster.toast({ title: "Demo Finder", body: "Could not read clipboard. Please paste your key into the text field manually." });
    }
  };

  const handleSave = async () => {
    const value = getInputValue();
    if (!value) {
      toaster.toast({ title: "Demo Finder", body: "Please enter an API key first." });
      return;
    }
    setSaving(true);
    try {
      await setApiKey(value);
    } catch (e) {
      console.error("[Demo Finder] Failed to save API key:", e);
      toaster.toast({ title: "Demo Finder", body: "Failed to save API key. Please try again." });
      setSaving(false);
      return;
    }
    toaster.toast({ title: "Demo Finder", body: "API key saved! Refreshing wishlist..." });
    setKeyInput("");
    try { onKeySaved(); } catch (_e) { /* best-effort post-save callback */ }
    setSaving(false);
  };

  const openKeyPage = () => {
    Navigation.NavigateToExternalWeb(API_KEY_HELP_URL);
    Navigation.CloseSideMenus();
  };

  return (
    <PanelSection title="Steam API Key Setup">
      <div style={helpTextStyle}>
        {hasKey
          ? "✅ API key is configured. You can update it below if needed."
          : "⚠️ A Steam Web API key is required to access your wishlist. It's free to register."}
      </div>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={openKeyPage}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <FaKey size={12} /> Get Your Free API Key
          </div>
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <div ref={fieldRef}>
          <TextField
            label="Steam Web API Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e?.target?.value ?? "")}
            bIsPassword={true}
          />
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handlePaste}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <FaPaste size={12} /> Paste from Clipboard
          </div>
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save API Key"}
        </ButtonItem>
      </PanelSectionRow>
      <div style={helpTextStyle}>
        Go to steamcommunity.com/dev/apikey to register a key.
        Enter any domain name (e.g. "localhost").
        Your wishlist must also be set to Public.
      </div>
    </PanelSection>
  );
};

// ---- SteamGridDB API Key Setup ----
const SgdbKeySetup: FC<{ hasKey: boolean; onKeySaved: () => void }> = ({ hasKey, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const getInputValue = (): string => {
    if (keyInput.trim()) return keyInput.trim();
    try {
      const el = fieldRef.current?.querySelector("input") as HTMLInputElement | null;
      if (el?.value?.trim()) return el.value.trim();
    } catch (_e) { /* ignore */ }
    return "";
  };

  const handlePaste = async () => {
    try {
      let text = "";
      let clipboardReadFailed = false;
      try {
        text = await navigator.clipboard.readText();
      } catch (_e) { /* browser API unavailable on Steam Deck */ }
      if (!text) {
        try {
          text = await readClipboard();
        } catch (e) {
          console.error("[Demo Finder] Backend clipboard read failed:", e);
          clipboardReadFailed = true;
        }
      }
      if (text?.trim()) {
        setKeyInput(text.trim());
        toaster.toast({ title: "Demo Finder", body: "Pasted from clipboard." });
      } else if (clipboardReadFailed) {
        toaster.toast({ title: "Demo Finder", body: "Could not access clipboard. Please paste your key into the text field manually." });
      } else {
        toaster.toast({ title: "Demo Finder", body: "Clipboard appears empty. Copy your key first, then try again." });
      }
    } catch (e) {
      console.error("[Demo Finder] Clipboard paste error:", e);
      toaster.toast({ title: "Demo Finder", body: "Could not read clipboard. Please paste your key into the text field manually." });
    }
  };

  const handleSave = async () => {
    const value = getInputValue();
    if (!value) {
      toaster.toast({ title: "Demo Finder", body: "Please enter a SteamGridDB API key first." });
      return;
    }
    setSaving(true);
    try {
      await setSgdbApiKey(value);
    } catch (e) {
      console.error("[Demo Finder] Failed to save SGDB API key:", e);
      toaster.toast({ title: "Demo Finder", body: "Failed to save SteamGridDB API key. Please try again." });
      setSaving(false);
      return;
    }
    toaster.toast({ title: "Demo Finder", body: "SteamGridDB API key saved!" });
    setKeyInput("");
    try { onKeySaved(); } catch (_e) { /* best-effort post-save callback */ }
    setSaving(false);
  };

  const openKeyPage = async () => {
    try {
      const sc = (window as unknown as { SteamClient?: { System?: { OpenInSystemBrowser?: (url: string) => void } } }).SteamClient;
      if (sc?.System?.OpenInSystemBrowser) {
        sc.System.OpenInSystemBrowser(SGDB_KEY_HELP_URL);
      } else {
        await openUrlInBrowser(SGDB_KEY_HELP_URL);
      }
    } catch (_e) {
      Navigation.NavigateToExternalWeb(SGDB_KEY_HELP_URL);
    }
    Navigation.CloseSideMenus();
  };

  return (
    <PanelSection title="SteamGridDB API Key">
      <div style={helpTextStyle}>
        {hasKey
          ? "✅ SteamGridDB key configured. Missing artwork will use SGDB as a fallback."
          : "⚠️ Optional: Provide a SteamGridDB API key to fill in missing game artwork."}
      </div>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={openKeyPage}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <FaKey size={12} /> Get Your Free SGDB API Key
          </div>
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <div ref={fieldRef}>
          <TextField
            label="SteamGridDB API Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e?.target?.value ?? "")}
            bIsPassword={true}
          />
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handlePaste}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <FaPaste size={12} /> Paste from Clipboard
          </div>
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save SGDB Key"}
        </ButtonItem>
      </PanelSectionRow>
      <div style={helpTextStyle}>
        Free key available at steamgriddb.com — provides artwork for games missing images on Steam.
      </div>
    </PanelSection>
  );
};

// ---- Controller type detection ----
type ControllerType = "playstation" | "xbox" | "unknown";

function detectControllerType(id: string): ControllerType {
  const lower = id.toLowerCase();
  if (
    lower.includes("054c") || // Sony vendor ID
    lower.includes("playstation") ||
    lower.includes("dualshock") ||
    lower.includes("dualsense")
  ) return "playstation";
  if (
    lower.includes("045e") || // Microsoft vendor ID
    lower.includes("xbox") ||
    lower.includes("xinput") ||
    lower.includes("28de") || // Valve vendor ID
    lower.includes("steam") ||
    lower.includes("valve")
  ) return "xbox";
  return "unknown";
}

function getBumperLabels(type: ControllerType): { prev: string; next: string } {
  if (type === "xbox") return { prev: "LB", next: "RB" };
  // PlayStation and unknown default to L1/R1 (Steam Deck uses L1/R1 labeling)
  return { prev: "L1", next: "R1" };
}

// ---- Bumper Navigation Hook ----
function useBumperNavigation(
  setPage: React.Dispatch<React.SetStateAction<number>>,
  totalPages: number
) {
  const totalPagesRef = useRef(totalPages);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  useEffect(() => {
    const prevButtons: Record<number, boolean> = { 4: false, 5: false };
    const interval = setInterval(() => {
      const gamepads = navigator.getGamepads?.();
      if (!gamepads) return;
      for (const gp of gamepads) {
        if (!gp) continue;
        // L1/LB (button 4) = previous page
        const l1 = gp.buttons[4]?.pressed ?? false;
        if (l1 && !prevButtons[4]) {
          setPage((p) => Math.max(0, p - 1));
        }
        prevButtons[4] = l1;
        // R1/RB (button 5) = next page
        const r1 = gp.buttons[5]?.pressed ?? false;
        if (r1 && !prevButtons[5]) {
          setPage((p) => Math.min(totalPagesRef.current - 1, p + 1));
        }
        prevButtons[5] = r1;
        break; // Only use the first connected gamepad
      }
    }, 100);
    return () => clearInterval(interval);
  }, [setPage]);
}

/** Polls the first connected gamepad and returns controller-appropriate bumper labels. */
function useControllerLabels(): { prev: string; next: string } {
  const [labels, setLabels] = useState<{ prev: string; next: string }>({ prev: "L1", next: "R1" });

  useEffect(() => {
    const interval = setInterval(() => {
      const gamepads = navigator.getGamepads?.();
      if (!gamepads) return;
      for (const gp of gamepads) {
        if (!gp) continue;
        const type = detectControllerType(gp.id);
        const newLabels = getBumperLabels(type);
        setLabels((cur) =>
          cur.prev === newLabels.prev && cur.next === newLabels.next ? cur : newLabels
        );
        return;
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return labels;
}

// ---- Full-Page Wishlist with Demo Integration ----
const FullPageWishlistWithDemos: FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItemWithDemo[]>(cachedWishlist);
  const [hasScanned, setHasScanned] = useState(cachedHasScanned);
  const [filterDemoOnly, setFilterDemoOnly] = useState(cachedFilterDemoOnly);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>(cachedSortBy);
  const [page, setPage] = useState(0);
  const bumperLabels = useControllerLabels();

  // Sync back to module-level cache
  useEffect(() => { cachedWishlist = wishlist; }, [wishlist]);
  useEffect(() => { cachedHasScanned = hasScanned; }, [hasScanned]);
  useEffect(() => { cachedFilterDemoOnly = filterDemoOnly; }, [filterDemoOnly]);
  useEffect(() => { cachedSortBy = sortBy; }, [sortBy]);

  const parseSteamDate = (d: string): number => {
    const ts = Date.parse(d);
    return isNaN(ts) ? Infinity : ts;
  };

  const sortedFilteredItems = useMemo(() => {
    const base = filterDemoOnly
      ? wishlist.filter((item) => item.demoInfo?.has_demo)
      : wishlist;
    const sorted = [...base];
    if (sortBy === "alpha") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    } else if (sortBy === "date_added") {
      sorted.sort((a, b) => (b.date_added ?? 0) - (a.date_added ?? 0));
    } else if (sortBy === "release_date") {
      sorted.sort((a, b) => {
        const da = a.demoInfo?.release_date ? parseSteamDate(a.demoInfo.release_date) : Infinity;
        const db = b.demoInfo?.release_date ? parseSteamDate(b.demoInfo.release_date) : Infinity;
        return db - da;
      });
    }
    return sorted;
  }, [wishlist, filterDemoOnly, sortBy]);

  const totalPages = Math.ceil(sortedFilteredItems.length / FULL_PAGE_ITEMS_PER_PAGE);
  const pagedItems = sortedFilteredItems.slice(
    page * FULL_PAGE_ITEMS_PER_PAGE,
    (page + 1) * FULL_PAGE_ITEMS_PER_PAGE
  );
  const demosFoundCount = wishlist.filter((item) => item.demoInfo?.has_demo).length;

  useBumperNavigation(setPage, totalPages);

  const cycleSortMode = () => {
    setSortBy((prev) => {
      if (prev === "alpha") return "date_added";
      if (prev === "date_added") return "release_date";
      return "alpha";
    });
    setPage(0);
  };

  const sortLabel: Record<SortMode, string> = {
    alpha: "A → Z",
    date_added: "Date Added",
    release_date: "Release Date",
  };

  const scanForDemos = async () => {
    if (wishlist.length === 0) return;
    setScanning(true);
    setPage(0);

    // On re-scan, skip appids that already have a definitive result cached
    const appids = wishlist
      .map((item) => item.appid)
      .filter((appid) => !cachedDemoResults[String(appid)]?.definitive);
    const totalBatches = Math.ceil(appids.length / BATCH_SIZE);
    const updatedWishlist = [...wishlist];

    for (let i = 0; i < totalBatches; i++) {
      const batch = appids.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      setScanProgress(`Batch ${i + 1}/${totalBatches} (${batch.length} games)...`);
      try {
        const results = await withTimeout(checkDemosBatch(batch), 120_000, `Batch ${i + 1}/${totalBatches}`);
        for (const appidStr of Object.keys(results)) {
          const idx = updatedWishlist.findIndex((item) => String(item.appid) === appidStr);
          if (idx !== -1) {
            const demoResult = results[appidStr];
            const resolvedName = demoResult.name;
            if (resolvedName && isPlaceholderName(updatedWishlist[idx])) {
              updatedWishlist[idx] = { ...updatedWishlist[idx], name: resolvedName, demoInfo: demoResult };
            } else {
              updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
            }
            cachedDemoResults[appidStr] = demoResult;
          }
        }
      } catch (e) {
        console.error("[Demo Finder Full Page] Batch check error:", e);
      }
    }

    // Re-apply cached demo results so items skipped by the definitive filter
    // (or whose React state lost demoInfo) are always up to date.
    for (let i = 0; i < updatedWishlist.length; i++) {
      const cached = cachedDemoResults[String(updatedWishlist[i].appid)];
      if (cached) {
        updatedWishlist[i] = { ...updatedWishlist[i], demoInfo: cached };
      }
    }
    setWishlist([...updatedWishlist]);

    setScanning(false);
    setHasScanned(true);
    setScanProgress("");
    cachedHasScanned = true;

    const demosFound = updatedWishlist.filter((item) => item.demoInfo?.has_demo).length;
    if (demosFound > 0) {
      setFilterDemoOnly(true);
      cachedFilterDemoOnly = true;
    }

    toaster.toast({
      title: "Demo Finder",
      body: `Done! Found ${demosFound} demo${demosFound !== 1 ? "s" : ""} in ${wishlist.length} games.`,
    });

    // Persist cache to disk
    try {
      await saveDemoCache(cachedDemoResults);
    } catch (e) {
      console.warn("[Demo Finder] Failed to persist demo cache:", e);
    }
  };

  const openGame = (appid: number, gameName: string) => {
    Navigation.NavigateToExternalWeb(`https://store.steampowered.com/app/${appid}/`);
    toaster.toast({ title: "Demo Finder", body: `Opening store page for ${gameName}` });
  };

  const openDemo = (demoInfo: DemoInfo, gameName: string) => {
    if (demoInfo.demo_appid) {
      Navigation.NavigateToExternalWeb(
        demoInfo.demo_url || `https://store.steampowered.com/app/${demoInfo.demo_appid}/`
      );
      toaster.toast({ title: "Demo Finder", body: `Opening demo for ${gameName}` });
    }
  };

  return (
    <div style={fullPageStyle}>
      <style>{focusHighlightCSS}</style>
      {/* Header */}
      <div style={fullPageHeaderStyle}>
        <div style={fullPageTitleStyle}>
          <FaGamepad size={22} /> Demo Finder
          {wishlist.length > 0 && (
            <span style={{ fontSize: "14px", fontWeight: "normal", color: "rgba(255,255,255,0.5)" }}>
              — {wishlist.length} games
              {hasScanned && `, ${demosFoundCount} with demos`}
            </span>
          )}
        </div>

        {/* Sort button */}
        {wishlist.length > 0 && (
          <Focusable style={fullPageButtonGroupStyle} flow-children="horizontal">
            <Focusable onActivate={cycleSortMode}>
              <div style={fullPageBtnStyle} onClick={cycleSortMode}>
                <FaSortAlphaDown size={12} style={{ marginRight: "6px" }} />
                {sortLabel[sortBy]}
              </div>
            </Focusable>

            {/* Filter toggle */}
            {hasScanned && demosFoundCount > 0 && (
              <Focusable onActivate={() => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }}>
                <div
                  style={filterDemoOnly ? fullPageActiveBtnStyle : fullPageBtnStyle}
                  onClick={() => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }}
                >
                  {filterDemoOnly ? `🎮 Demos Only (${demosFoundCount})` : `All Games (${wishlist.length})`}
                </div>
              </Focusable>
            )}

            {/* Scan button */}
            <Focusable onActivate={scanning ? undefined : scanForDemos}>
              <div
                style={{ ...fullPageBtnStyle, opacity: scanning ? 0.6 : 1 }}
                onClick={scanning ? undefined : scanForDemos}
              >
                <FaSearch size={12} style={{ marginRight: "6px" }} />
                {scanning ? scanProgress || "Scanning..." : hasScanned ? "Re-scan" : `Scan ${wishlist.length} Games`}
              </div>
            </Focusable>
          </Focusable>
        )}
      </div>

      {/* Content area */}
      {wishlist.length === 0 ? (
        <div style={fullPageStatusStyle}>
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>🎮</div>
          <div>No wishlist loaded.</div>
          <div style={{ fontSize: "12px", marginTop: "8px", color: "rgba(255,255,255,0.4)" }}>
            Open the Demo Finder in the Quick Access menu (☰) to load your wishlist.
          </div>
        </div>
      ) : (
        <Focusable
          style={fullPageGridStyle}
          flow-children="grid"
        >
          {scanning && (
            <div style={fullPageStatusStyle}>{scanProgress || "Scanning for demos..."}</div>
          )}
          {!scanning && pagedItems.map((item) => (
            <Focusable
              key={item.appid}
              style={fullPageCardStyle}
              focusWithinClassName="demo-finder-card-focus"
              onActivate={() => openGame(item.appid, item.name)}
            >
              <img
                src={item.demoInfo?.header_image || capsuleImageCache[String(item.appid)] || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/header.jpg`}
                alt={item.name}
                style={fullPageCardImgStyle}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  const cdnBase = `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/`;
                  const sharedBase = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.appid}/`;
                  const fallbacks = [
                    `${cdnBase}header.jpg`,
                    `${sharedBase}header.jpg`,
                    `${cdnBase}capsule_616x353.jpg`,
                    `${sharedBase}capsule_616x353.jpg`,
                    `${cdnBase}library_600x900.jpg`,
                    `${sharedBase}library_600x900.jpg`,
                    `${cdnBase}hero_capsule.jpg`,
                    `${sharedBase}hero_capsule.jpg`,
                    `${cdnBase}capsule_231x87.jpg`,
                    `${sharedBase}capsule_231x87.jpg`,
                    `${cdnBase}capsule_sm_120.jpg`,
                    `${sharedBase}capsule_sm_120.jpg`,
                  ];
                  let next = parseInt(img.dataset.fbIdx ?? "-1", 10) + 1;
                  // Skip any fallback whose base URL matches the currently-failed src
                  const curBase = img.src.split("?")[0];
                  while (next < fallbacks.length && curBase === fallbacks[next]) next++;
                  if (next < fallbacks.length) {
                    img.dataset.fbIdx = String(next);
                    img.src = fallbacks[next];
                  } else {
                    // All Steam CDN URLs exhausted — try SteamGridDB next
                    const appidStr = String(item.appid);
                    const showPlaceholder = () => {
                      img.style.display = "none";
                      const placeholder = img.parentElement?.querySelector(".img-placeholder") as HTMLElement | null;
                      if (placeholder) placeholder.style.display = "flex";
                    };
                    if (sgdbImageCache[appidStr]) {
                      img.src = sgdbImageCache[appidStr];
                    } else {
                      getSgdbApiKey().then((key) => {
                        if (!key) { showPlaceholder(); return; }
                        fetchSgdbImagesBatch([item.appid]).then((res) => {
                          const url = res?.[appidStr];
                          if (url) {
                            sgdbImageCache[appidStr] = url;
                            img.src = url;
                          } else {
                            sgdbImageCache[appidStr] = "";
                            showPlaceholder();
                          }
                        }).catch(() => showPlaceholder());
                      }).catch(() => showPlaceholder());
                    }
                  }
                }}
              />
              <div
                className="img-placeholder"
                style={{
                  display: "none", width: "100%", aspectRatio: "460 / 215",
                  background: "linear-gradient(135deg, rgba(27,40,56,0.9) 0%, rgba(15,25,40,0.9) 100%)",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "11px", color: "rgba(255,255,255,0.35)",
                  textAlign: "center", padding: "8px", boxSizing: "border-box",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                <FaGamepad size={20} style={{ opacity: 0.3 }} />
              </div>
              <div style={fullPageCardBodyStyle}>
                <div style={fullPageCardNameStyle} title={item.name}>{item.name}</div>
                {item.demoInfo ? (
                  item.demoInfo.has_demo ? (
                    <Focusable
                      style={{ display: "contents" }}
                      onActivate={() => { openDemo(item.demoInfo!, item.name); }}
                    >
                      <div
                        style={fullPageDemoBadgeStyle}
                        onClick={(e) => { e.stopPropagation(); openDemo(item.demoInfo!, item.name); }}
                      >
                        <FaGamepad size={9} /> Play Demo
                      </div>
                    </Focusable>
                  ) : (
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>No demo</span>
                  )
                ) : !hasScanned ? (
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>—</span>
                ) : (
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>No demo</span>
                )}
                {item.demoInfo?.release_date && (
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                    {item.demoInfo.release_date}
                  </span>
                )}
              </div>
            </Focusable>
          ))}

          {/* Pagination inside scrollable area */}
          {!scanning && totalPages > 1 && (
            <Focusable
              style={{ ...fullPagePaginationStyle, gridColumn: "1 / -1" }}
            >
              <Focusable
                onActivate={() => setPage(Math.max(0, page - 1))}
                style={{ ...fullPageBtnStyle, opacity: page === 0 ? 0.3 : 1 }}
              >
                <div onClick={() => setPage(Math.max(0, page - 1))}>{bumperLabels.prev} ◀ Prev</div>
              </Focusable>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                {page + 1} / {totalPages}
              </span>
              <Focusable
                onActivate={() => setPage(Math.min(totalPages - 1, page + 1))}
                style={{ ...fullPageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }}
              >
                <div onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>Next ▶ {bumperLabels.next}</div>
              </Focusable>
            </Focusable>
          )}
        </Focusable>
      )}
    </div>
  );
};

// ---- Main Content ----
function Content() {
  const [wishlist, setWishlist] = useState<WishlistItemWithDemo[]>(cachedWishlist);
  const [loading, setLoading] = useState(false);
  const [resolvingNames, setResolvingNames] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filterDemoOnly, setFilterDemoOnly] = useState(cachedFilterDemoOnly);
  const [hasScanned, setHasScanned] = useState(cachedHasScanned);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [hasSgdbKey, setHasSgdbKey] = useState(false);
  const [showSgdbSetup, setShowSgdbSetup] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>(cachedSortBy);
  const [optionsCollapsed, setOptionsCollapsed] = useState(false);
  const bumperLabels = useControllerLabels();

  const checkApiKey = useCallback(async () => {
    try {
      const key = await getApiKey();
      setHasApiKey(!!key);
      return !!key;
    } catch {
      setHasApiKey(false);
      return false;
    }
  }, []);

  const checkSgdbApiKey = useCallback(async () => {
    try {
      const key = await getSgdbApiKey();
      setHasSgdbKey(!!key);
      return !!key;
    } catch {
      setHasSgdbKey(false);
      return false;
    }
  }, []);

  // Sync component state back to module-level cache for persistence
  useEffect(() => { cachedWishlist = wishlist; }, [wishlist]);
  useEffect(() => { cachedHasScanned = hasScanned; }, [hasScanned]);
  useEffect(() => { cachedFilterDemoOnly = filterDemoOnly; }, [filterDemoOnly]);
  useEffect(() => { cachedSortBy = sortBy; }, [sortBy]);

  // Ref to the latest scanForDemos so loadWishlist can call it without stale closure
  const scanForDemosRef = useRef<((items: WishlistItemWithDemo[]) => Promise<void>) | null>(null);

  const scanForDemos = useCallback(async (itemsParam?: WishlistItemWithDemo[]) => {
    const items = itemsParam ?? wishlist;
    if (items.length === 0) return;
    setScanning(true);
    setFilterDemoOnly(false);
    setPage(0);

    // On re-scan, skip appids that already have a definitive result cached
    const appids = items
      .map((item) => item.appid)
      .filter((appid) => !cachedDemoResults[String(appid)]?.definitive);
    const totalBatches = Math.ceil(appids.length / BATCH_SIZE);
    const updatedWishlist = [...items];

    for (let i = 0; i < totalBatches; i++) {
      const batch = appids.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      setScanProgress(`Batch ${i + 1}/${totalBatches} (${batch.length} games)...`);
      try {
        const results = await withTimeout(checkDemosBatch(batch), 120_000, `Batch ${i + 1}/${totalBatches}`);
        for (const appidStr of Object.keys(results)) {
          const idx = updatedWishlist.findIndex((item) => String(item.appid) === appidStr);
          if (idx !== -1) {
            const demoResult = results[appidStr];
            // Update game name from appdetails if current name is a placeholder
            const resolvedName = demoResult.name;
            if (resolvedName && isPlaceholderName(updatedWishlist[idx])) {
              updatedWishlist[idx] = { ...updatedWishlist[idx], name: resolvedName, demoInfo: demoResult };
            } else {
              updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
            }
            cachedDemoResults[appidStr] = demoResult;
          }
        }
      } catch (e) {
        console.error("Batch check error:", e);
      }
    }

    // Re-apply cached demo results so items skipped by the definitive filter
    // (or whose React state lost demoInfo) are always up to date.
    for (let i = 0; i < updatedWishlist.length; i++) {
      const cached = cachedDemoResults[String(updatedWishlist[i].appid)];
      if (cached) {
        updatedWishlist[i] = { ...updatedWishlist[i], demoInfo: cached };
      }
    }
    setWishlist([...updatedWishlist]);

    setScanning(false);
    setHasScanned(true);
    setScanProgress("");
    cachedHasScanned = true;

    const demosFound = updatedWishlist.filter((item) => item.demoInfo?.has_demo).length;

    // Auto-enable demos-only filter when demos are found
    if (demosFound > 0) {
      setFilterDemoOnly(true);
      cachedFilterDemoOnly = true;
    }

    // Auto-collapse options so the demo list is immediately visible
    setOptionsCollapsed(true);

    toaster.toast({
      title: "Demo Finder",
      body: `Done! Found ${demosFound} demo${demosFound !== 1 ? "s" : ""} in ${items.length} games.`,
    });

    // Persist demo cache to disk
    try {
      await saveDemoCache(cachedDemoResults);
    } catch (e) {
      console.warn("[Demo Finder] Failed to persist demo cache:", e);
    }
  }, [wishlist]);

  // Keep the ref current
  useEffect(() => { scanForDemosRef.current = scanForDemos; }, [scanForDemos]);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setResolvingNames(false);
    setError(null);
    setHasScanned(false);
    cachedHasScanned = false;
    try {
      const steamId = getSteamId();
      if (!steamId) {
        setError("Could not detect your Steam ID. Make sure you are logged in.");
        setLoading(false);
        return;
      }

      // Backend fetch (tries authenticated, then unauthenticated, then legacy)
      const result = await getWishlist(steamId);

      // Backend returns error codes as strings when it fails
      if (typeof result === "string") {
        if (result === "NO_API_KEY") {
          setError("No Steam API key configured. Please set up your API key below to load your wishlist.");
          setShowSetup(true);
          setWishlist([]);
        } else if (result === "NO_STEAM_ID") {
          setError("Could not detect your Steam ID. Make sure you are logged in.");
        } else if (result === "FETCH_FAILED") {
          setError("Failed to load wishlist. Check that your API key is valid and your wishlist is set to Public.");
          setShowSetup(true);
          setWishlist([]);
        }
        setLoading(false);
        return;
      }

      let items: WishlistItem[] = Array.isArray(result) ? result : [];

      // Frontend fallback via fetchNoCors
      if (items.length === 0) {
        console.log("[Demo Finder] Backend returned empty, trying frontend fallback...");
        const apiKey = await getApiKey();
        items = await fetchWishlistFrontend(steamId, apiKey);
      }

      if (items.length === 0) {
        const keySet = await checkApiKey();
        if (!keySet) {
          setError("No Steam API key configured. Please set up your API key below to load your wishlist.");
          setShowSetup(true);
        } else {
          setError("Wishlist is empty or could not be loaded. Ensure your wishlist is set to Public and your API key is valid.");
        }
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Show the list immediately (even with placeholder names) so the user
      // sees their games right away, then resolve names in the background.
      setWishlist(items.map((item) => ({ ...item })));
      setPage(0);
      setLoading(false);

      setResolvingNames(true);
      let resolvedItems: WishlistItemWithDemo[] = items.map((item) => ({ ...item }));
      try {
        // Run resolveItemNames (backend appdetails) and resolveNamesViaWishlistData
        // (frontend fetchNoCors to wishlistdata as logged-in user) in parallel.
        // The wishlistdata call works even for Friends-Only wishlists since the
        // request is made with the user's Steam session cookies via fetchNoCors.
        const [resolvedFromBatch, wishlistDataNames] = await Promise.all([
          resolveItemNames(items),
          resolveNamesViaWishlistData(steamId),
        ]);

        // Merge: start from resolvedFromBatch, then apply wishlistdata names
        // only to items that still have placeholder names.
        resolvedItems = resolvedFromBatch.map((item) => {
          if (isPlaceholderName(item)) {
            const wdName = wishlistDataNames[String(item.appid)];
            if (wdName) return { ...item, name: wdName };
          }
          return item;
        });
        setWishlist(resolvedItems.map((item) => ({ ...item })));

        // Second pass: use checkDemosBatch to resolve remaining placeholders.
        // _check_demo_shared_session already fetches appdetails and extracts
        // the game name, so this leverages the same data without extra requests.
        const stillMissing = resolvedItems.filter(isPlaceholderName);
        if (stillMissing.length > 0 && resolvedItems.length <= 200) {
          console.log(`[Demo Finder] ${stillMissing.length} placeholder(s) remain — running demo-batch name resolution`);
          resolvedItems = await resolveNamesViaDemoBatch(resolvedItems);
          setWishlist(resolvedItems.map((item) => ({ ...item })));
        }

        // Third pass: if placeholders still remain, wait 5s and retry resolveNamesBatch
        // to give Steam's rate limiter time to reset.
        const stillMissing2 = resolvedItems.filter(isPlaceholderName);
        if (stillMissing2.length > 0) {
          console.log(`[Demo Finder] ${stillMissing2.length} placeholder(s) remain after demo-batch — retrying resolveNamesBatch in 5s`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          resolvedItems = await resolveItemNames(resolvedItems);
          setWishlist(resolvedItems.map((item) => ({ ...item })));
        }
      } finally {
        setResolvingNames(false);
      }

      // After wishlist is fully loaded and names are resolved:
      // apply cached demo results (if any), otherwise auto-scan.
      if (Object.keys(cachedDemoResults).length > 0) {
        const withDemo = resolvedItems.map((item) => {
          const demoInfo = cachedDemoResults[String(item.appid)];
          if (demoInfo) return { ...item, demoInfo };
          return item;
        });
        setWishlist(withDemo);
        setHasScanned(true);
        cachedHasScanned = true;
        const demosFound = withDemo.filter((i) => i.demoInfo?.has_demo).length;
        if (demosFound > 0) {
          setFilterDemoOnly(true);
          cachedFilterDemoOnly = true;
          setOptionsCollapsed(true);
        }
      } else {
        // No cached results — auto-scan
        await scanForDemosRef.current?.(resolvedItems);
      }
    } catch (e) {
      setError(`Failed to load wishlist: ${e}`);
      setLoading(false);
      setResolvingNames(false);
    }
  }, [checkApiKey]);

  useEffect(() => {
    // Load cached demo results from disk (once, on first mount)
    if (!cachedDemoCacheLoaded) {
      cachedDemoCacheLoaded = true;
      loadDemoCache().then((cache) => {
        if (cache && Object.keys(cache).length > 0) {
          cachedDemoResults = cache;
          console.log(`[Demo Finder] Loaded ${Object.keys(cache).length} cached demo results from disk`);
        }
      }).catch((e) => {
        console.warn("[Demo Finder] Failed to load demo cache from disk:", e);
      });
    }

    checkApiKey().then((hasKey) => {
      if (!hasKey) {
        setShowSetup(true);
        setError("Steam API key required. Please configure your key below to get started.");
      }
      // Only auto-load if there is no cached wishlist data
      if (cachedWishlist.length === 0) {
        loadWishlist();
      }
    });
    checkSgdbApiKey();
  }, [checkApiKey, checkSgdbApiKey, loadWishlist]);

  const handleKeySaved = () => {
    setHasApiKey(true);
    setShowSetup(false);
    setError(null);
    loadWishlist();
  };

  const handleSgdbKeySaved = () => {
    setHasSgdbKey(true);
    setShowSgdbSetup(false);
  };

  const cycleSortMode = () => {
    setSortBy((prev) => {
      if (prev === "alpha") return "date_added";
      if (prev === "date_added") return "release_date";
      return "alpha";
    });
    setPage(0);
  };

  const sortLabel: Record<SortMode, string> = {
    alpha: "A → Z",
    date_added: "Date Added",
    release_date: "Release Date",
  };

  const parseSteamDate = (d: string): number => {
    // Steam dates look like "Mar 14, 2026" or "Q1 2026" or "Coming Soon" etc.
    const ts = Date.parse(d);
    return isNaN(ts) ? Infinity : ts;
  };

  const sortedFilteredItems = useMemo(() => {
    const base = filterDemoOnly
      ? wishlist.filter((item) => item.demoInfo?.has_demo)
      : wishlist;
    const sorted = [...base];
    if (sortBy === "alpha") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    } else if (sortBy === "date_added") {
      sorted.sort((a, b) => (b.date_added ?? 0) - (a.date_added ?? 0));
    } else if (sortBy === "release_date") {
      sorted.sort((a, b) => {
        const da = a.demoInfo?.release_date ? parseSteamDate(a.demoInfo.release_date) : Infinity;
        const db = b.demoInfo?.release_date ? parseSteamDate(b.demoInfo.release_date) : Infinity;
        return db - da;
      });
    }
    return sorted;
  }, [wishlist, filterDemoOnly, sortBy]);

  const displayItems = sortedFilteredItems;
  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const pagedItems = displayItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const demosFoundCount = wishlist.filter((item) => item.demoInfo?.has_demo).length;

  useBumperNavigation(setPage, totalPages);

  const openFullPage = () => {
    Navigation.Navigate("/demo-finder-wishlist");
  };

  return (
    <Fragment>
      <style>{focusHighlightCSS}</style>
      <PanelSection title="Wishlist Demo Finder">
        {/* Always-visible shortcut to the full-page view */}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={openFullPage}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
              <FaGamepad size={14} /> Open Full Wishlist View
            </div>
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => setOptionsCollapsed(!optionsCollapsed)}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
              {optionsCollapsed ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
              {optionsCollapsed ? "Show Options" : "Hide Options"}
            </div>
          </ButtonItem>
        </PanelSectionRow>

        {!optionsCollapsed && (
          <Fragment>
            <PanelSectionRow>
              <ButtonItem layout="below" onClick={loadWishlist} disabled={loading || scanning}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <FaSyncAlt size={14} />
                  {loading ? "Loading..." : "Refresh Wishlist"}
                </div>
              </ButtonItem>
            </PanelSectionRow>

            {wishlist.length > 0 && (
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={() => scanForDemos()} disabled={scanning || loading}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <FaSearch size={14} />
                    {scanning ? "Scanning..." : hasScanned ? `Re-scan ${wishlist.length} Games` : `Scan ${wishlist.length} Games for Demos`}
                  </div>
                </ButtonItem>
              </PanelSectionRow>
            )}

            {hasScanned && demosFoundCount > 0 && (
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={() => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }}>
                  {filterDemoOnly ? `Show All (${wishlist.length})` : `Show Only Demos (${demosFoundCount})`}
                </ButtonItem>
              </PanelSectionRow>
            )}

            {wishlist.length > 0 && (
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={cycleSortMode}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <FaSortAlphaDown size={14} />
                    Sort: {sortLabel[sortBy]}
                  </div>
                </ButtonItem>
              </PanelSectionRow>
            )}

            <PanelSectionRow>
              <ButtonItem layout="below" onClick={() => setShowSetup(!showSetup)}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <FaKey size={12} />
                  {showSetup ? "Hide Setup" : (hasApiKey ? "Update Steam API Key" : "⚠️ Set Up Steam API Key")}
                </div>
              </ButtonItem>
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem layout="below" onClick={() => setShowSgdbSetup(!showSgdbSetup)}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <FaKey size={12} />
                  {showSgdbSetup ? "Hide SGDB Setup" : (hasSgdbKey ? "Update SGDB Key" : "Set Up SGDB Artwork Key")}
                </div>
              </ButtonItem>
            </PanelSectionRow>
          </Fragment>
        )}
      </PanelSection>

      {error && (
        <PanelSection><div style={{ ...statusStyle, color: "#ff6b6b" }}>{error}</div></PanelSection>
      )}

      {showSetup && (
        <ApiKeySetup hasKey={hasApiKey} onKeySaved={handleKeySaved} />
      )}

      {showSgdbSetup && (
        <SgdbKeySetup hasKey={hasSgdbKey} onKeySaved={handleSgdbKeySaved} />
      )}

      {scanning && (
        <PanelSection><div style={statusStyle}>{scanProgress}</div></PanelSection>
      )}
      {loading && (
        <PanelSection><div style={statusStyle}>Loading wishlist...</div></PanelSection>
      )}
      {resolvingNames && !loading && (
        <PanelSection><div style={statusStyle}>Resolving game names...</div></PanelSection>
      )}

      {!loading && wishlist.length > 0 && (
        <PanelSection title={filterDemoOnly ? `Demos (${demosFoundCount})` : `Wishlist (${displayItems.length})`}>
          <div style={containerStyle}>
            {pagedItems.map((item) => (
              <Focusable key={item.appid} style={itemContainerStyle} focusWithinClassName="demo-finder-item-focus">
                <div style={gameNameStyle} title={item.name}>{item.name}</div>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {item.demoInfo ? (
                    item.demoInfo.has_demo ? (
                      <DemoButton demoInfo={item.demoInfo} gameName={item.name} />
                    ) : (<span style={noDemoStyle}>No demo</span>)
                  ) : hasScanned ? (
                    <span style={noDemoStyle}>No demo</span>
                  ) : (<span style={noDemoStyle}>—</span>)}
                  <GameStoreLinkButton appid={item.appid} gameName={item.name} />
                </div>
              </Focusable>
            ))}
          </div>

          {totalPages > 1 && (
            <Focusable style={{ display: "flex", justifyContent: "center", gap: "12px", padding: "8px 0 12px 0" }}>
              <Focusable onActivate={() => setPage(Math.max(0, page - 1))}
                style={{ ...pageBtnStyle, opacity: page === 0 ? 0.3 : 1 }}
                focusWithinClassName="demo-finder-page-btn-focus">
                <div onClick={() => setPage(Math.max(0, page - 1))}>{bumperLabels.prev} ◀ Prev</div>
              </Focusable>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", alignSelf: "center" }}>
                {page + 1} / {totalPages}
              </span>
              <Focusable onActivate={() => setPage(Math.min(totalPages - 1, page + 1))}
                style={{ ...pageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }}
                focusWithinClassName="demo-finder-page-btn-focus">
                <div onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>Next ▶ {bumperLabels.next}</div>
              </Focusable>
            </Focusable>
          )}
        </PanelSection>
      )}
    </Fragment>
  );
}

// ---- Plugin Registration ----
export default definePlugin(() => {
  console.log("Demo Finder plugin initializing");

  // Register full-page wishlist route
  routerHook.addRoute("/demo-finder-wishlist", FullPageWishlistWithDemos, { exact: true });

  return {
    name: "Demo Finder",
    titleView: (
      <div className={staticClasses.Title}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaGamepad /> Demo Finder
        </div>
      </div>
    ),
    content: <Content />,
    icon: <FaGamepad />,
    onDismount() {
      console.log("Demo Finder unloading");
      routerHook.removeRoute("/demo-finder-wishlist");
    },
  };
});