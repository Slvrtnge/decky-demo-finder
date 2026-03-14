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
} from "@decky/api";
import { useState, useEffect, useCallback, useRef, Fragment, FC, useMemo } from "react";
import { FaGamepad, FaSearch, FaExternalLinkAlt, FaSyncAlt, FaKey, FaSortAlphaDown, FaChevronDown, FaChevronUp } from "react-icons/fa";

// ---- Backend callables ----
const getWishlist = callable<[steam_id: string], WishlistItem[] | string>("get_wishlist");
const checkDemosBatch = callable<[appids: number[]], Record<string, DemoInfo>>("check_demos_batch");
const setApiKey = callable<[api_key: string], boolean>("set_api_key");
const getApiKey = callable<[], string>("get_api_key");
const resolveNamesBatch = callable<[appids: number[]], Record<string, string>>("resolve_names_batch");

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

// ---- Persisted state (survives component unmount/remount) ----
let cachedWishlist: WishlistItemWithDemo[] = [];
let cachedHasScanned = false;
let cachedFilterDemoOnly = false;

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
          const name = (info as Record<string, unknown>).name;
          if (typeof name === "string" && name) {
            names[appidStr] = name;
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

  const handleSave = async () => {
    const value = getInputValue();
    if (!value) {
      toaster.toast({ title: "Demo Finder", body: "Please enter an API key first." });
      return;
    }
    setSaving(true);
    try {
      await setApiKey(value);
      toaster.toast({ title: "Demo Finder", body: "API key saved! Refreshing wishlist..." });
      setKeyInput("");
      onKeySaved();
    } catch (e) {
      console.error("[Demo Finder] Failed to save API key:", e);
      toaster.toast({ title: "Demo Finder", body: "Failed to save API key." });
    }
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
  const [sortBy, setSortBy] = useState<SortMode>("alpha");
  const [optionsCollapsed, setOptionsCollapsed] = useState(false);

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

  // Sync component state back to module-level cache for persistence
  useEffect(() => { cachedWishlist = wishlist; }, [wishlist]);
  useEffect(() => { cachedHasScanned = hasScanned; }, [hasScanned]);
  useEffect(() => { cachedFilterDemoOnly = filterDemoOnly; }, [filterDemoOnly]);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setResolvingNames(false);
    setError(null);
    setHasScanned(false);
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
        let resolvedItems = resolvedFromBatch.map((item) => {
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
    } catch (e) {
      setError(`Failed to load wishlist: ${e}`);
      setLoading(false);
      setResolvingNames(false);
    }
  }, [checkApiKey]);

  const scanForDemos = useCallback(async () => {
    if (wishlist.length === 0) return;
    setScanning(true);
    setFilterDemoOnly(false);
    setPage(0);

    const appids = wishlist.map((item) => item.appid);
    const totalBatches = Math.ceil(appids.length / BATCH_SIZE);
    const updatedWishlist = [...wishlist];

    for (let i = 0; i < totalBatches; i++) {
      const batch = appids.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      setScanProgress(`Batch ${i + 1}/${totalBatches} (${batch.length} games)...`);
      try {
        const results = await checkDemosBatch(batch);
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
          }
        }
        setWishlist([...updatedWishlist]);
      } catch (e) {
        console.error("Batch check error:", e);
      }
    }

    setScanning(false);
    setHasScanned(true);
    setScanProgress("");

    const demosFound = updatedWishlist.filter((item) => item.demoInfo?.has_demo).length;
    toaster.toast({
      title: "Demo Finder",
      body: `Done! Found ${demosFound} demo${demosFound !== 1 ? "s" : ""} in ${wishlist.length} games.`,
    });
  }, [wishlist]);

  useEffect(() => {
    checkApiKey().then((hasKey) => {
      if (!hasKey) {
        setShowSetup(true);
        setError("Steam API key required. Please configure your key below to get started.");
      }
      // Only auto-load if there is no cached data
      if (cachedWishlist.length === 0) {
        loadWishlist();
      }
    });
  }, [checkApiKey, loadWishlist]);

  const handleKeySaved = () => {
    setHasApiKey(true);
    setShowSetup(false);
    setError(null);
    loadWishlist();
  };

  const cycleSortMode = () => {
    setSortBy((prev) => {
      if (prev === "alpha") return "date_added";
      if (prev === "date_added") return "release_date";
      return "alpha";
    });
    setPage(0);
  };

  // Label shown on the button describes the *next* sort action (what clicking will do)
  const sortLabel: Record<SortMode, string> = {
    alpha: "Date Added",
    date_added: "Release Date",
    release_date: "A → Z",
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
        return da - db;
      });
    }
    return sorted;
  }, [wishlist, filterDemoOnly, sortBy]);

  const displayItems = sortedFilteredItems;
  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const pagedItems = displayItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const demosFoundCount = wishlist.filter((item) => item.demoInfo?.has_demo).length;

  return (
    <Fragment>
      <PanelSection title="Wishlist Demo Finder">
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
                <ButtonItem layout="below" onClick={scanForDemos} disabled={scanning || loading}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <FaSearch size={14} />
                    {scanning ? "Scanning..." : `Scan ${wishlist.length} Games for Demos`}
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
                  {showSetup ? "Hide Setup" : (hasApiKey ? "Update API Key" : "⚠️ Set Up API Key")}
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
              <Focusable key={item.appid} style={itemContainerStyle}>
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
            <Focusable style={{ display: "flex", justifyContent: "center", gap: "12px", padding: "8px 0" }}>
              <Focusable onActivate={() => setPage(Math.max(0, page - 1))}
                style={{ ...pageBtnStyle, opacity: page === 0 ? 0.3 : 1 }}>
                <div onClick={() => setPage(Math.max(0, page - 1))}>◀ Prev</div>
              </Focusable>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", alignSelf: "center" }}>
                {page + 1} / {totalPages}
              </span>
              <Focusable onActivate={() => setPage(Math.min(totalPages - 1, page + 1))}
                style={{ ...pageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }}>
                <div onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>Next ▶</div>
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
    },
  };
});