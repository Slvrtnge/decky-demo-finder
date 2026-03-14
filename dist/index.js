const manifest = {"name":"Demo Finder"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const toaster = api.toaster;
const fetchNoCors = api.fetchNoCors;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaSyncAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z"},"child":[]}]})(props);
}function FaSortAlphaDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M176 352h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.36 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352zm240-64H288a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h56l-61.26 70.45A32 32 0 0 0 272 446.37V464a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16h-56l61.26-70.45A32 32 0 0 0 432 321.63V304a16 16 0 0 0-16-16zm31.06-85.38l-59.27-160A16 16 0 0 0 372.72 32h-41.44a16 16 0 0 0-15.07 10.62l-59.27 160A16 16 0 0 0 272 224h24.83a16 16 0 0 0 15.23-11.08l4.42-12.92h71l4.41 12.92A16 16 0 0 0 407.16 224H432a16 16 0 0 0 15.06-21.38zM335.61 144L352 96l16.39 48z"},"child":[]}]})(props);
}function FaSearch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"},"child":[]}]})(props);
}function FaKey (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"},"child":[]}]})(props);
}function FaGamepad (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z"},"child":[]}]})(props);
}function FaExternalLinkAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"},"child":[]}]})(props);
}

// ---- Backend callables ----
const getWishlist = callable("get_wishlist");
const checkDemosBatch = callable("check_demos_batch");
const setApiKey = callable("set_api_key");
const getApiKey = callable("get_api_key");
const resolveNamesBatch = callable("resolve_names_batch");
const BATCH_SIZE = 50;
const ITEMS_PER_PAGE = 20;
// Maximum pages to paginate through wishlistdata (100 items/page → 2 000 items max)
const MAX_WISHLIST_PAGES = 20;
const API_KEY_HELP_URL = "https://steamcommunity.com/dev/apikey";
// ---- Styles ----
const containerStyle = {
    display: "flex", flexDirection: "column", gap: "4px",
};
const itemContainerStyle = {
    display: "flex", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", padding: "8px 4px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
};
const gameNameStyle = {
    flex: 1, fontSize: "13px", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px",
};
const demoBadgeStyle = {
    display: "inline-flex", alignItems: "center", gap: "4px",
    padding: "4px 10px", borderRadius: "4px", fontSize: "11px",
    fontWeight: "bold", cursor: "pointer",
    background: "linear-gradient(135deg, #1a9fff 0%, #0070d1 100%)",
    color: "#fff", border: "none", whiteSpace: "nowrap",
};
const noDemoStyle = {
    fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap",
};
const statusStyle = {
    textAlign: "center", padding: "8px", fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
};
const pageBtnStyle = {
    padding: "4px 12px", borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)", color: "#fff",
    cursor: "pointer", fontSize: "12px",
};
const helpTextStyle = {
    fontSize: "11px", color: "rgba(255,255,255,0.5)",
    padding: "4px 0", lineHeight: "1.4",
};
// ---- Persisted state (survives component unmount/remount) ----
let cachedWishlist = [];
let cachedHasScanned = false;
let cachedFilterDemoOnly = false;
// ---- Helpers ----
function getSteamId() {
    try {
        const id = window
            .App?.m_CurrentUser?.strSteamID;
        if (id)
            return id;
    }
    catch (_e) { /* ignore */ }
    return "";
}
/**
 * Frontend fallback: fetch wishlist via fetchNoCors (Decky proxy).
 * Uses IWishlistService/GetWishlist/v1 with API key and steamid.
 */
async function fetchWishlistFrontend(steamId, apiKey) {
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
            .filter((item) => item.appid != null)
            .map((item) => ({
            appid: item.appid,
            name: item.name || `App ${item.appid}`,
            date_added: item.date_added || 0,
        }));
    }
    catch (e) {
        console.error("[Demo Finder] Frontend wishlist fetch failed:", e);
        return [];
    }
}
/** Returns true if the item has a placeholder name that still needs resolving. */
function isPlaceholderName(item) {
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
async function resolveItemNames(items) {
    const placeholders = items.filter(isPlaceholderName);
    if (placeholders.length === 0)
        return items;
    try {
        const names = await resolveNamesBatch(placeholders.map((p) => p.appid));
        return items.map((item) => {
            const resolved = names[String(item.appid)];
            if (resolved && isPlaceholderName(item)) {
                return { ...item, name: resolved };
            }
            return item;
        });
    }
    catch (e) {
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
async function resolveNamesViaWishlistData(steamId) {
    const names = {};
    if (!steamId)
        return names;
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
                    const name = info.name;
                    if (typeof name === "string" && name) {
                        names[appidStr] = name;
                    }
                }
            }
        }
    }
    catch (e) {
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
async function resolveNamesViaDemoBatch(items) {
    const placeholders = items.filter(isPlaceholderName);
    if (placeholders.length === 0)
        return items;
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
    }
    catch (e) {
        console.warn("[Demo Finder] Demo-batch name resolution failed:", e);
        return items;
    }
}
const DemoButton = ({ demoInfo, gameName }) => {
    const handleClick = () => {
        if (demoInfo.demo_appid) {
            DFL.Navigation.NavigateToExternalWeb(demoInfo.demo_url || `https://store.steampowered.com/app/${demoInfo.demo_appid}/`);
            DFL.Navigation.CloseSideMenus();
            toaster.toast({ title: "Demo Finder", body: `Opening demo for ${gameName}` });
        }
    };
    return (SP_JSX.jsx(DFL.Focusable, { style: { display: "inline-flex" }, onActivate: handleClick, children: SP_JSX.jsxs("div", { style: demoBadgeStyle, onClick: handleClick, children: [SP_JSX.jsx(FaGamepad, { size: 12 }), " Play Demo ", SP_JSX.jsx(FaExternalLinkAlt, { size: 9 })] }) }));
};
const GameStoreLinkButton = ({ appid, gameName }) => {
    const handleClick = () => {
        DFL.Navigation.NavigateToExternalWeb(`https://store.steampowered.com/app/${appid}/`);
        DFL.Navigation.CloseSideMenus();
        toaster.toast({ title: "Demo Finder", body: `Opening store page for ${gameName}` });
    };
    return (SP_JSX.jsx(DFL.Focusable, { style: { display: "inline-flex" }, onActivate: handleClick, children: SP_JSX.jsx("div", { style: { ...demoBadgeStyle, background: "rgba(255,255,255,0.1)" }, onClick: handleClick, title: "Open store page", children: SP_JSX.jsx(FaExternalLinkAlt, { size: 10 }) }) }));
};
// ---- API Key Setup ----
const ApiKeySetup = ({ hasKey, onKeySaved }) => {
    const [keyInput, setKeyInput] = SP_REACT.useState("");
    const [saving, setSaving] = SP_REACT.useState(false);
    const fieldRef = SP_REACT.useRef(null);
    // Read the input value from the DOM as a fallback when React state
    // is empty.  Steam Deck's virtual keyboard may not fire onChange on
    // paste, leaving keyInput stale while the actual <input> holds the
    // pasted text.
    const getInputValue = () => {
        if (keyInput.trim())
            return keyInput.trim();
        try {
            const el = fieldRef.current?.querySelector("input");
            if (el?.value?.trim())
                return el.value.trim();
        }
        catch (_e) { /* ignore */ }
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
        }
        catch (e) {
            console.error("[Demo Finder] Failed to save API key:", e);
            toaster.toast({ title: "Demo Finder", body: "Failed to save API key." });
        }
        setSaving(false);
    };
    const openKeyPage = () => {
        DFL.Navigation.NavigateToExternalWeb(API_KEY_HELP_URL);
        DFL.Navigation.CloseSideMenus();
    };
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "Steam API Key Setup", children: [SP_JSX.jsx("div", { style: helpTextStyle, children: hasKey
                    ? "✅ API key is configured. You can update it below if needed."
                    : "⚠️ A Steam Web API key is required to access your wishlist. It's free to register." }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: openKeyPage, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaKey, { size: 12 }), " Get Your Free API Key"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { ref: fieldRef, children: SP_JSX.jsx(DFL.TextField, { label: "Steam Web API Key", value: keyInput, onChange: (e) => setKeyInput(e?.target?.value ?? ""), bIsPassword: true }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSave, disabled: saving, children: saving ? "Saving..." : "Save API Key" }) }), SP_JSX.jsx("div", { style: helpTextStyle, children: "Go to steamcommunity.com/dev/apikey to register a key. Enter any domain name (e.g. \"localhost\"). Your wishlist must also be set to Public." })] }));
};
// ---- Main Content ----
function Content() {
    const [wishlist, setWishlist] = SP_REACT.useState(cachedWishlist);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [resolvingNames, setResolvingNames] = SP_REACT.useState(false);
    const [scanning, setScanning] = SP_REACT.useState(false);
    const [scanProgress, setScanProgress] = SP_REACT.useState("");
    const [error, setError] = SP_REACT.useState(null);
    const [page, setPage] = SP_REACT.useState(0);
    const [filterDemoOnly, setFilterDemoOnly] = SP_REACT.useState(cachedFilterDemoOnly);
    const [hasScanned, setHasScanned] = SP_REACT.useState(cachedHasScanned);
    const [hasApiKey, setHasApiKey] = SP_REACT.useState(false);
    const [showSetup, setShowSetup] = SP_REACT.useState(false);
    const [sortBy, setSortBy] = SP_REACT.useState("alpha");
    const checkApiKey = SP_REACT.useCallback(async () => {
        try {
            const key = await getApiKey();
            setHasApiKey(!!key);
            return !!key;
        }
        catch {
            setHasApiKey(false);
            return false;
        }
    }, []);
    // Sync component state back to module-level cache for persistence
    SP_REACT.useEffect(() => { cachedWishlist = wishlist; }, [wishlist]);
    SP_REACT.useEffect(() => { cachedHasScanned = hasScanned; }, [hasScanned]);
    SP_REACT.useEffect(() => { cachedFilterDemoOnly = filterDemoOnly; }, [filterDemoOnly]);
    const loadWishlist = SP_REACT.useCallback(async () => {
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
                }
                else if (result === "NO_STEAM_ID") {
                    setError("Could not detect your Steam ID. Make sure you are logged in.");
                }
                else if (result === "FETCH_FAILED") {
                    setError("Failed to load wishlist. Check that your API key is valid and your wishlist is set to Public.");
                    setShowSetup(true);
                    setWishlist([]);
                }
                setLoading(false);
                return;
            }
            let items = Array.isArray(result) ? result : [];
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
                }
                else {
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
                        if (wdName)
                            return { ...item, name: wdName };
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
            }
            finally {
                setResolvingNames(false);
            }
        }
        catch (e) {
            setError(`Failed to load wishlist: ${e}`);
            setLoading(false);
            setResolvingNames(false);
        }
    }, [checkApiKey]);
    const scanForDemos = SP_REACT.useCallback(async () => {
        if (wishlist.length === 0)
            return;
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
                        }
                        else {
                            updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
                        }
                    }
                }
                setWishlist([...updatedWishlist]);
            }
            catch (e) {
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
    SP_REACT.useEffect(() => {
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
            if (prev === "alpha")
                return "date_added";
            if (prev === "date_added")
                return "release_date";
            return "alpha";
        });
        setPage(0);
    };
    // Label shown on the button describes the *next* sort action (what clicking will do)
    const sortLabel = {
        alpha: "Date Added",
        date_added: "Release Date",
        release_date: "A → Z",
    };
    const parseSteamDate = (d) => {
        // Steam dates look like "Mar 14, 2026" or "Q1 2026" or "Coming Soon" etc.
        const ts = Date.parse(d);
        return isNaN(ts) ? Infinity : ts;
    };
    const sortedFilteredItems = SP_REACT.useMemo(() => {
        const base = filterDemoOnly
            ? wishlist.filter((item) => item.demoInfo?.has_demo)
            : wishlist;
        const sorted = [...base];
        if (sortBy === "alpha") {
            sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        }
        else if (sortBy === "date_added") {
            sorted.sort((a, b) => (b.date_added ?? 0) - (a.date_added ?? 0));
        }
        else if (sortBy === "release_date") {
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
    return (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Wishlist Demo Finder", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: loadWishlist, disabled: loading || scanning, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSyncAlt, { size: 14 }), loading ? "Loading..." : "Refresh Wishlist"] }) }) }), wishlist.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: scanForDemos, disabled: scanning || loading, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSearch, { size: 14 }), scanning ? "Scanning..." : `Scan ${wishlist.length} Games for Demos`] }) }) })), hasScanned && demosFoundCount > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }, children: filterDemoOnly ? `Show All (${wishlist.length})` : `Show Only Demos (${demosFoundCount})` }) })), wishlist.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: cycleSortMode, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSortAlphaDown, { size: 14 }), "Sort: ", sortLabel[sortBy]] }) }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setShowSetup(!showSetup), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaKey, { size: 12 }), showSetup ? "Hide Setup" : (hasApiKey ? "Update API Key" : "⚠️ Set Up API Key")] }) }) })] }), error && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: { ...statusStyle, color: "#ff6b6b" }, children: error }) })), showSetup && (SP_JSX.jsx(ApiKeySetup, { hasKey: hasApiKey, onKeySaved: handleKeySaved })), scanning && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: scanProgress }) })), loading && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: "Loading wishlist..." }) })), resolvingNames && !loading && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: "Resolving game names..." }) })), !loading && wishlist.length > 0 && (SP_JSX.jsxs(DFL.PanelSection, { title: filterDemoOnly ? `Demos (${demosFoundCount})` : `Wishlist (${displayItems.length})`, children: [SP_JSX.jsx("div", { style: containerStyle, children: pagedItems.map((item) => (SP_JSX.jsxs(DFL.Focusable, { style: itemContainerStyle, children: [SP_JSX.jsx("div", { style: gameNameStyle, title: item.name, children: item.name }), SP_JSX.jsxs("div", { style: { display: "flex", gap: "4px", alignItems: "center" }, children: [item.demoInfo ? (item.demoInfo.has_demo ? (SP_JSX.jsx(DemoButton, { demoInfo: item.demoInfo, gameName: item.name })) : (SP_JSX.jsx("span", { style: noDemoStyle, children: "No demo" }))) : hasScanned ? (SP_JSX.jsx("span", { style: noDemoStyle, children: "No demo" })) : (SP_JSX.jsx("span", { style: noDemoStyle, children: "\u2014" })), SP_JSX.jsx(GameStoreLinkButton, { appid: item.appid, gameName: item.name })] })] }, item.appid))) }), totalPages > 1 && (SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", justifyContent: "center", gap: "12px", padding: "8px 0" }, children: [SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.max(0, page - 1)), style: { ...pageBtnStyle, opacity: page === 0 ? 0.3 : 1 }, children: SP_JSX.jsx("div", { onClick: () => setPage(Math.max(0, page - 1)), children: "\u25C0 Prev" }) }), SP_JSX.jsxs("span", { style: { color: "rgba(255,255,255,0.5)", fontSize: "12px", alignSelf: "center" }, children: [page + 1, " / ", totalPages] }), SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.min(totalPages - 1, page + 1)), style: { ...pageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }, children: SP_JSX.jsx("div", { onClick: () => setPage(Math.min(totalPages - 1, page + 1)), children: "Next \u25B6" }) })] }))] }))] }));
}
// ---- Plugin Registration ----
var index = definePlugin(() => {
    console.log("Demo Finder plugin initializing");
    return {
        name: "Demo Finder",
        titleView: (SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsx(FaGamepad, {}), " Demo Finder"] }) })),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaGamepad, {}),
        onDismount() {
            console.log("Demo Finder unloading");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
