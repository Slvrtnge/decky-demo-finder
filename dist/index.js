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
const routerHook = api.routerHook;
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
}function FaEye (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"},"child":[]}]})(props);
}function FaEyeSlash (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"},"child":[]}]})(props);
}function FaExternalLinkAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"},"child":[]}]})(props);
}function FaChevronUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"},"child":[]}]})(props);
}function FaChevronDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"},"child":[]}]})(props);
}

// ---- Backend callables ----
const getWishlist = callable("get_wishlist");
const checkDemosBatch = callable("check_demos_batch");
const setApiKey = callable("set_api_key");
const getApiKey = callable("get_api_key");
const resolveNamesBatch = callable("resolve_names_batch");
const saveDemoCache = callable("save_demo_cache");
const loadDemoCache = callable("load_demo_cache");
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
const fullPageStyle = {
    display: "flex", flexDirection: "column",
    width: "100%", height: "100vh",
    background: "#1b2838", color: "#fff",
    overflow: "hidden",
    boxSizing: "border-box",
    paddingTop: "58px",
};
const fullPageHeaderStyle = {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0, background: "rgba(0,0,0,0.3)", flexWrap: "wrap",
};
const fullPageTitleStyle = {
    fontSize: "22px", fontWeight: "bold",
    display: "flex", alignItems: "center", gap: "10px",
    flex: 1, whiteSpace: "nowrap",
};
const fullPageBtnStyle = {
    padding: "6px 14px", borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.12)", color: "#fff",
    cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap",
};
const fullPageActiveBtnStyle = {
    ...fullPageBtnStyle,
    background: "rgba(100,180,255,0.25)",
    border: "1px solid rgba(100,180,255,0.6)",
};
const fullPageGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(186px, 1fr))",
    gap: "12px", padding: "16px 24px 24px 24px",
    overflowY: "auto", flex: 1,
    minHeight: 0,
    alignContent: "start",
};
const fullPageCardStyle = {
    borderRadius: "6px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden", cursor: "pointer",
    display: "flex", flexDirection: "column",
};
const fullPageCardImgStyle = {
    width: "100%", height: "auto",
    aspectRatio: "460 / 215",
    objectFit: "cover", display: "block",
    background: "rgba(0,0,0,0.3)",
};
const fullPageCardBodyStyle = {
    padding: "4px 8px", flex: 1,
    display: "flex", flexDirection: "row", gap: "6px",
    alignItems: "center",
    marginTop: "-2%",
};
const fullPageDemoBadgeStyle = {
    display: "inline-flex", alignItems: "center", gap: "3px",
    padding: "2px 6px", borderRadius: "3px", fontSize: "9px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #1a9fff 0%, #0070d1 100%)",
    color: "#fff", flexShrink: 0, marginLeft: "2%",
};
const fullPageStatusStyle = {
    textAlign: "center", padding: "32px", fontSize: "14px",
    color: "rgba(255,255,255,0.5)", width: "100%",
};
const fullPagePaginationStyle = {
    display: "flex", justifyContent: "center", alignItems: "center",
    gap: "16px", padding: "16px 12px", marginTop: "12px",
    marginBottom: "16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
};
const fullPageButtonGroupStyle = {
    display: "flex", gap: "12px", alignItems: "center",
};
const FULL_PAGE_ITEMS_PER_PAGE = 24;
// ---- Persisted state (survives component unmount/remount) ----
let cachedWishlist = [];
let cachedHasScanned = false;
let cachedFilterDemoOnly = false;
let cachedDemoResults = {};
let cachedDemoCacheLoaded = false;
let cachedSortBy = "alpha";
/** Capsule / header image URLs harvested from Steam wishlistdata. */
let capsuleImageCache = {};
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
/** Wrap a promise with a timeout (in ms). Rejects with an Error on timeout. */
function withTimeout(promise, ms, label = "operation") {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
        promise.then((val) => { clearTimeout(timer); resolve(val); }, (err) => { clearTimeout(timer); reject(err); });
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
                    const rec = info;
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
/**
 * For games that ended up with no image after a scan (demoInfo.header_image is
 * null/empty and capsuleImageCache has no entry), use Decky's fetchNoCors
 * (which proxies through the user's authenticated Steam session) to call
 * appdetails and extract header_image or the first screenshot thumbnail.
 * Results are written into capsuleImageCache so the grid re-renders with images.
 *
 * @param items - The full wishlist after scanning.
 * @param setCacheVersion - A state setter to trigger re-render after cache updates.
 */
async function resolveImagelessGames(items, setCacheVersion) {
    const imageless = items.filter((item) => !item.demoInfo?.header_image && !capsuleImageCache[String(item.appid)]);
    if (imageless.length === 0)
        return 0;
    console.log(`[Demo Finder] Image resolution pass: ${imageless.length} games have no image, fetching via fetchNoCors`);
    const BATCH = 4;
    const DELAY_MS = 1500;
    let resolved = 0;
    for (let i = 0; i < imageless.length; i += BATCH) {
        const batch = imageless.slice(i, i + BATCH);
        await Promise.all(batch.map(async (item) => {
            try {
                const url = `https://store.steampowered.com/api/appdetails?appids=${item.appid}&cc=us&l=english`;
                const resp = await fetchNoCors(url, { headers: { "Accept": "application/json" } });
                if (!resp.ok)
                    return;
                const data = await resp.json();
                const appEntry = data?.[String(item.appid)];
                if (!appEntry?.success)
                    return;
                const details = appEntry.data ?? {};
                const headerImage = details.header_image;
                if (headerImage) {
                    capsuleImageCache[String(item.appid)] = headerImage;
                    resolved++;
                    console.log(`[Demo Finder] Image resolution: resolved header_image for ${item.appid}`);
                    return;
                }
                // Try constructing a direct header.jpg URL from the Fastly CDN (always 460×215)
                const fastlyHeaderUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.appid}/header.jpg`;
                capsuleImageCache[String(item.appid)] = fastlyHeaderUrl;
                resolved++;
                console.log(`[Demo Finder] Image resolution: using Fastly header.jpg for ${item.appid}`);
                // Keep screenshot thumbnails as a last resort (handled by onError fallback chain)
            }
            catch (e) {
                console.warn(`[Demo Finder] Image resolution: fetchNoCors failed for ${item.appid}:`, e);
            }
        }));
        // Trigger re-render after each batch so images appear incrementally
        setCacheVersion((v) => v + 1);
        if (i + BATCH < imageless.length) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
    }
    console.log(`[Demo Finder] Image resolution pass complete: recovered ${resolved}/${imageless.length} images`);
    return resolved;
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
    const [saving, setSaving] = SP_REACT.useState(false);
    const [keyValue, setKeyValue] = SP_REACT.useState("");
    const [showKey, setShowKey] = SP_REACT.useState(false);
    const wrapperRef = SP_REACT.useRef(null);
    // Read the actual DOM input value — handles Steam Deck virtual keyboard
    // which may set the value without firing React onChange events.
    const getInputValue = SP_REACT.useCallback(() => {
        const input = wrapperRef.current?.querySelector("input");
        if (input && input.value)
            return input.value;
        return keyValue;
    }, [keyValue]);
    // Attach native event listeners to catch input that React's synthetic
    // event system misses (e.g. Steam Deck virtual keyboard with bIsPassword).
    // Also poll as a final safety net in case no events fire at all.
    SP_REACT.useEffect(() => {
        const el = wrapperRef.current;
        if (!el)
            return;
        const input = el.querySelector("input");
        if (!input)
            return;
        const sync = () => setKeyValue(input.value);
        input.addEventListener("input", sync);
        input.addEventListener("change", sync);
        const id = setInterval(() => {
            if (input.value !== keyValue)
                setKeyValue(input.value);
        }, 400);
        return () => {
            input.removeEventListener("input", sync);
            input.removeEventListener("change", sync);
            clearInterval(id);
        };
    }, [keyValue]);
    const handleSave = async () => {
        const value = getInputValue().trim();
        if (!value) {
            toaster.toast({ title: "Demo Finder", body: "Please enter an API key first." });
            return;
        }
        setSaving(true);
        try {
            await setApiKey(value);
        }
        catch (e) {
            console.error("[Demo Finder] Failed to save API key:", e);
            toaster.toast({ title: "Demo Finder", body: "Failed to save API key. Please try again." });
            setSaving(false);
            return;
        }
        toaster.toast({ title: "Demo Finder", body: "API key saved! Refreshing wishlist..." });
        setKeyValue("");
        const input = wrapperRef.current?.querySelector("input");
        if (input)
            input.value = "";
        try {
            onKeySaved();
        }
        catch (_e) { /* best-effort post-save callback */ }
        setSaving(false);
    };
    const openKeyPage = () => {
        DFL.Navigation.NavigateToExternalWeb(API_KEY_HELP_URL);
        DFL.Navigation.CloseSideMenus();
    };
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "Steam API Key Setup", children: [SP_JSX.jsx("div", { style: helpTextStyle, children: hasKey
                    ? "✅ API key is configured. You can update it below if needed."
                    : "⚠️ A Steam Web API key is required to access your wishlist. It's free to register." }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: openKeyPage, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaKey, { size: 12 }), " Get Your Free API Key"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { ref: wrapperRef, children: SP_JSX.jsx(DFL.TextField, { label: "Steam Web API Key", value: keyValue, onChange: (e) => setKeyValue(e.target.value), bIsPassword: !showKey }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setShowKey(!showKey), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [showKey ? SP_JSX.jsx(FaEyeSlash, { size: 12 }) : SP_JSX.jsx(FaEye, { size: 12 }), showKey ? "Hide Key" : "Show Key"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSave, disabled: saving, children: saving ? "Saving..." : "Save API Key" }) }), SP_JSX.jsx("div", { style: helpTextStyle, children: "Go to steamcommunity.com/dev/apikey to register a key. Enter any domain name (e.g. \"localhost\"). Your wishlist must also be set to Public." })] }));
};
function detectControllerType(id) {
    const lower = id.toLowerCase();
    if (lower.includes("054c") || // Sony vendor ID
        lower.includes("playstation") ||
        lower.includes("dualshock") ||
        lower.includes("dualsense"))
        return "playstation";
    if (lower.includes("045e") || // Microsoft vendor ID
        lower.includes("xbox") ||
        lower.includes("xinput") ||
        lower.includes("28de") || // Valve vendor ID
        lower.includes("steam") ||
        lower.includes("valve"))
        return "xbox";
    return "unknown";
}
function getBumperLabels(type) {
    if (type === "xbox")
        return { prev: "LB", next: "RB" };
    // PlayStation and unknown default to L1/R1 (Steam Deck uses L1/R1 labeling)
    return { prev: "L1", next: "R1" };
}
// ---- Bumper Navigation Hook ----
function useBumperNavigation(setPage, totalPages) {
    const totalPagesRef = SP_REACT.useRef(totalPages);
    SP_REACT.useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);
    SP_REACT.useEffect(() => {
        const prevButtons = { 4: false, 5: false };
        const interval = setInterval(() => {
            const gamepads = navigator.getGamepads?.();
            if (!gamepads)
                return;
            for (const gp of gamepads) {
                if (!gp)
                    continue;
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
function useControllerLabels() {
    const [labels, setLabels] = SP_REACT.useState({ prev: "L1", next: "R1" });
    SP_REACT.useEffect(() => {
        const interval = setInterval(() => {
            const gamepads = navigator.getGamepads?.();
            if (!gamepads)
                return;
            for (const gp of gamepads) {
                if (!gp)
                    continue;
                const type = detectControllerType(gp.id);
                const newLabels = getBumperLabels(type);
                setLabels((cur) => cur.prev === newLabels.prev && cur.next === newLabels.next ? cur : newLabels);
                return;
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);
    return labels;
}
// ---- Full-Page Wishlist with Demo Integration ----
const FullPageWishlistWithDemos = () => {
    const [wishlist, setWishlist] = SP_REACT.useState(cachedWishlist);
    const [hasScanned, setHasScanned] = SP_REACT.useState(cachedHasScanned);
    const [filterDemoOnly, setFilterDemoOnly] = SP_REACT.useState(cachedFilterDemoOnly);
    const [scanning, setScanning] = SP_REACT.useState(false);
    const [scanProgress, setScanProgress] = SP_REACT.useState("");
    const [sortBy, setSortBy] = SP_REACT.useState(cachedSortBy);
    const [page, setPage] = SP_REACT.useState(0);
    // Incremented whenever capsuleImageCache is updated outside of React state
    // so that image-less cards re-render after the async resolution pass.
    const [, setCacheVersion] = SP_REACT.useState(0);
    const bumperLabels = useControllerLabels();
    // Sync back to module-level cache
    SP_REACT.useEffect(() => { cachedWishlist = wishlist; }, [wishlist]);
    SP_REACT.useEffect(() => { cachedHasScanned = hasScanned; }, [hasScanned]);
    SP_REACT.useEffect(() => { cachedFilterDemoOnly = filterDemoOnly; }, [filterDemoOnly]);
    SP_REACT.useEffect(() => { cachedSortBy = sortBy; }, [sortBy]);
    const parseSteamDate = (d) => {
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
                return db - da;
            });
        }
        return sorted;
    }, [wishlist, filterDemoOnly, sortBy]);
    const totalPages = Math.ceil(sortedFilteredItems.length / FULL_PAGE_ITEMS_PER_PAGE);
    const pagedItems = sortedFilteredItems.slice(page * FULL_PAGE_ITEMS_PER_PAGE, (page + 1) * FULL_PAGE_ITEMS_PER_PAGE);
    const demosFoundCount = wishlist.filter((item) => item.demoInfo?.has_demo).length;
    useBumperNavigation(setPage, totalPages);
    const nextSortMode = (mode) => {
        if (mode === "alpha")
            return "date_added";
        if (mode === "date_added")
            return "release_date";
        return "alpha";
    };
    const cycleSortMode = () => {
        setSortBy((prev) => nextSortMode(prev));
        setPage(0);
    };
    const sortLabel = {
        alpha: "A → Z",
        date_added: "Date Added",
        release_date: "Release Date",
    };
    const scanForDemos = async () => {
        if (wishlist.length === 0)
            return;
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
                const results = await withTimeout(checkDemosBatch(batch), 120000, `Batch ${i + 1}/${totalBatches}`);
                for (const appidStr of Object.keys(results)) {
                    const idx = updatedWishlist.findIndex((item) => String(item.appid) === appidStr);
                    if (idx !== -1) {
                        const demoResult = results[appidStr];
                        const resolvedName = demoResult.name;
                        if (resolvedName && isPlaceholderName(updatedWishlist[idx])) {
                            updatedWishlist[idx] = { ...updatedWishlist[idx], name: resolvedName, demoInfo: demoResult };
                        }
                        else {
                            updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
                        }
                        cachedDemoResults[appidStr] = demoResult;
                    }
                }
            }
            catch (e) {
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
        }
        catch (e) {
            console.warn("[Demo Finder] Failed to persist demo cache:", e);
        }
        // Fix 3: Targeted retry for games that have demoInfo but no header_image
        const imagelessAfterScan = updatedWishlist.filter((item) => item.demoInfo && !item.demoInfo.header_image && !capsuleImageCache[String(item.appid)]);
        if (imagelessAfterScan.length > 0 && imagelessAfterScan.length <= 50) {
            console.log(`[Demo Finder] Retrying ${imagelessAfterScan.length} image-less games after cooldown...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            try {
                const retryResults = await withTimeout(checkDemosBatch(imagelessAfterScan.map((item) => item.appid)), 120000, "image retry pass");
                let recovered = 0;
                for (const [appidStr, demoResult] of Object.entries(retryResults)) {
                    if (demoResult.header_image) {
                        const idx = updatedWishlist.findIndex((item) => String(item.appid) === appidStr);
                        if (idx !== -1) {
                            updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
                        }
                        cachedDemoResults[appidStr] = demoResult;
                        recovered++;
                    }
                }
                if (recovered > 0) {
                    setWishlist([...updatedWishlist]);
                    console.log(`[Demo Finder] Image retry pass recovered ${recovered} image(s)`);
                }
            }
            catch (e) {
                console.warn("[Demo Finder] Image retry pass failed:", e);
            }
        }
        // Fix 1: Frontend fetchNoCors image resolution for any still-imageless games
        resolveImagelessGames(updatedWishlist, setCacheVersion).catch((e) => console.warn("[Demo Finder] Frontend image resolution pass failed:", e));
    };
    const openGame = (appid, gameName) => {
        DFL.Navigation.NavigateToExternalWeb(`https://store.steampowered.com/app/${appid}/`);
        toaster.toast({ title: "Demo Finder", body: `Opening store page for ${gameName}` });
    };
    const openDemo = (demoInfo, gameName) => {
        if (demoInfo.demo_appid) {
            DFL.Navigation.NavigateToExternalWeb(demoInfo.demo_url || `https://store.steampowered.com/app/${demoInfo.demo_appid}/`);
            toaster.toast({ title: "Demo Finder", body: `Opening demo for ${gameName}` });
        }
    };
    return (SP_JSX.jsxs("div", { style: fullPageStyle, children: [SP_JSX.jsx("style", { children: focusHighlightCSS }), SP_JSX.jsxs("div", { style: fullPageHeaderStyle, children: [SP_JSX.jsxs("div", { style: fullPageTitleStyle, children: [SP_JSX.jsx(FaGamepad, { size: 22 }), " Demo Finder", wishlist.length > 0 && (SP_JSX.jsxs("span", { style: { fontSize: "14px", fontWeight: "normal", color: "rgba(255,255,255,0.5)" }, children: ["\u2014 ", wishlist.length, " games", hasScanned && `, ${demosFoundCount} with demos`] }))] }), wishlist.length > 0 && (SP_JSX.jsxs(DFL.Focusable, { style: fullPageButtonGroupStyle, "flow-children": "horizontal", children: [SP_JSX.jsxs("span", { style: { color: "rgba(255,255,255,0.6)", fontSize: "12px", alignSelf: "center", whiteSpace: "nowrap" }, children: ["Current Sort Method: ", sortLabel[sortBy]] }), SP_JSX.jsx(DFL.Focusable, { onActivate: cycleSortMode, children: SP_JSX.jsxs("div", { style: fullPageBtnStyle, onClick: cycleSortMode, children: [SP_JSX.jsx(FaSortAlphaDown, { size: 12, style: { marginRight: "6px" } }), sortLabel[nextSortMode(sortBy)]] }) }), hasScanned && demosFoundCount > 0 && (SP_JSX.jsx(DFL.Focusable, { onActivate: () => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }, children: SP_JSX.jsx("div", { style: filterDemoOnly ? fullPageActiveBtnStyle : fullPageBtnStyle, onClick: () => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }, children: filterDemoOnly ? `🎮 Demos Only (${demosFoundCount})` : `All Games (${wishlist.length})` }) })), SP_JSX.jsx(DFL.Focusable, { onActivate: scanning ? undefined : scanForDemos, children: SP_JSX.jsxs("div", { style: { ...fullPageBtnStyle, opacity: scanning ? 0.6 : 1 }, onClick: scanning ? undefined : scanForDemos, children: [SP_JSX.jsx(FaSearch, { size: 12, style: { marginRight: "6px" } }), scanning ? scanProgress || "Scanning..." : hasScanned ? "Re-scan" : `Scan ${wishlist.length} Games`] }) })] }))] }), wishlist.length === 0 ? (SP_JSX.jsxs("div", { style: fullPageStatusStyle, children: [SP_JSX.jsx("div", { style: { fontSize: "18px", marginBottom: "8px" }, children: "\uD83C\uDFAE" }), SP_JSX.jsx("div", { children: "No wishlist loaded." }), SP_JSX.jsx("div", { style: { fontSize: "12px", marginTop: "8px", color: "rgba(255,255,255,0.4)" }, children: "Open the Demo Finder in the Quick Access menu (\u2630) to load your wishlist." })] })) : (SP_JSX.jsxs(DFL.Focusable, { style: fullPageGridStyle, "flow-children": "grid", children: [scanning && (SP_JSX.jsx("div", { style: fullPageStatusStyle, children: scanProgress || "Scanning for demos..." })), !scanning && pagedItems.map((item) => (SP_JSX.jsxs(DFL.Focusable, { style: fullPageCardStyle, focusWithinClassName: "demo-finder-card-focus", onActivate: () => openGame(item.appid, item.name), children: [SP_JSX.jsx("img", { src: item.demoInfo?.header_image || capsuleImageCache[String(item.appid)] || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/header.jpg`, alt: item.name, style: fullPageCardImgStyle, onError: (e) => {
                                    const img = e.currentTarget;
                                    const cdnBase = `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/`;
                                    const sharedBase = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.appid}/`;
                                    const cfBase = `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/`;
                                    const fastlyBase = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.appid}/`;
                                    const fallbacks = [
                                        `${fastlyBase}header.jpg`,
                                        `${cdnBase}header.jpg`,
                                        `${sharedBase}header.jpg`,
                                        `${cfBase}header.jpg`,
                                        `${cdnBase}capsule_616x353.jpg`,
                                        `${sharedBase}capsule_616x353.jpg`,
                                        `${cdnBase}library_600x900.jpg`,
                                        `${sharedBase}library_600x900.jpg`,
                                        `${cdnBase}hero_capsule.jpg`,
                                        `${sharedBase}hero_capsule.jpg`,
                                        `${cdnBase}header_292x136.jpg`,
                                        `${sharedBase}header_292x136.jpg`,
                                        `${cdnBase}library_hero.jpg`,
                                        `${sharedBase}library_hero.jpg`,
                                        `${cdnBase}capsule_231x87.jpg`,
                                        `${sharedBase}capsule_231x87.jpg`,
                                        `${cdnBase}capsule_sm_120.jpg`,
                                        `${sharedBase}capsule_sm_120.jpg`,
                                    ];
                                    let next = parseInt(img.dataset.fbIdx ?? "-1", 10) + 1;
                                    // Skip any fallback whose base URL matches the currently-failed src
                                    const curBase = img.src.split("?")[0];
                                    while (next < fallbacks.length && curBase === fallbacks[next])
                                        next++;
                                    if (next < fallbacks.length) {
                                        img.dataset.fbIdx = String(next);
                                        img.src = fallbacks[next];
                                    }
                                    else {
                                        // All Steam CDN URLs exhausted — show placeholder
                                        img.style.display = "none";
                                        const placeholder = img.parentElement?.querySelector(".img-placeholder");
                                        if (placeholder)
                                            placeholder.style.display = "flex";
                                    }
                                } }), SP_JSX.jsx("div", { className: "img-placeholder", style: {
                                    display: "none", width: "100%", aspectRatio: "460 / 215",
                                    background: "linear-gradient(135deg, rgba(27,40,56,0.9) 0%, rgba(15,25,40,0.9) 100%)",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: "11px", color: "rgba(255,255,255,0.35)",
                                    textAlign: "center", padding: "8px", boxSizing: "border-box",
                                    overflow: "hidden", textOverflow: "ellipsis",
                                }, children: SP_JSX.jsx(FaGamepad, { size: 20, style: { opacity: 0.3 } }) }), SP_JSX.jsxs("div", { style: fullPageCardBodyStyle, children: [item.demoInfo ? (item.demoInfo.has_demo ? (SP_JSX.jsx(DFL.Focusable, { style: { display: "contents" }, onActivate: () => { openDemo(item.demoInfo, item.name); }, children: SP_JSX.jsxs("div", { style: fullPageDemoBadgeStyle, onClick: (e) => { e.stopPropagation(); openDemo(item.demoInfo, item.name); }, children: [SP_JSX.jsx(FaGamepad, { size: 9 }), " Play Demo"] }) })) : (SP_JSX.jsx("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.3)" }, children: "No demo" }))) : !hasScanned ? (SP_JSX.jsx("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.2)" }, children: "\u2014" })) : (SP_JSX.jsx("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.3)" }, children: "No demo" })), item.demoInfo?.release_date && (SP_JSX.jsx("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.4)", marginLeft: item.demoInfo.release_date !== "To Be Announced" ? "11%" : "9%" }, children: item.demoInfo.release_date }))] })] }, item.appid))), !scanning && totalPages > 1 && (SP_JSX.jsxs(DFL.Focusable, { style: { ...fullPagePaginationStyle, gridColumn: "1 / -1" }, children: [SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.max(0, page - 1)), style: { ...fullPageBtnStyle, opacity: page === 0 ? 0.3 : 1 }, children: SP_JSX.jsxs("div", { onClick: () => setPage(Math.max(0, page - 1)), children: [bumperLabels.prev, " \u25C0 Prev"] }) }), SP_JSX.jsxs("span", { style: { color: "rgba(255,255,255,0.5)", fontSize: "13px" }, children: [page + 1, " / ", totalPages] }), SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.min(totalPages - 1, page + 1)), style: { ...fullPageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }, children: SP_JSX.jsxs("div", { onClick: () => setPage(Math.min(totalPages - 1, page + 1)), children: ["Next \u25B6 ", bumperLabels.next] }) })] }))] }))] }));
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
    const [sortBy, setSortBy] = SP_REACT.useState(cachedSortBy);
    const [optionsCollapsed, setOptionsCollapsed] = SP_REACT.useState(false);
    // Incremented whenever capsuleImageCache is updated outside of React state
    // so that image-less cards re-render after the async resolution pass.
    const [, setCacheVersion] = SP_REACT.useState(0);
    const bumperLabels = useControllerLabels();
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
    SP_REACT.useEffect(() => { cachedSortBy = sortBy; }, [sortBy]);
    // Ref to the latest scanForDemos so loadWishlist can call it without stale closure
    const scanForDemosRef = SP_REACT.useRef(null);
    const scanForDemos = SP_REACT.useCallback(async (itemsParam) => {
        const items = itemsParam ?? wishlist;
        if (items.length === 0)
            return;
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
                const results = await withTimeout(checkDemosBatch(batch), 120000, `Batch ${i + 1}/${totalBatches}`);
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
                        cachedDemoResults[appidStr] = demoResult;
                    }
                }
            }
            catch (e) {
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
        }
        catch (e) {
            console.warn("[Demo Finder] Failed to persist demo cache:", e);
        }
        // Fix 3: Targeted retry for games that have demoInfo but no header_image
        const imagelessAfterScan = updatedWishlist.filter((item) => item.demoInfo && !item.demoInfo.header_image && !capsuleImageCache[String(item.appid)]);
        if (imagelessAfterScan.length > 0 && imagelessAfterScan.length <= 50) {
            console.log(`[Demo Finder] Retrying ${imagelessAfterScan.length} image-less games after cooldown...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            try {
                const retryResults = await withTimeout(checkDemosBatch(imagelessAfterScan.map((item) => item.appid)), 120000, "image retry pass");
                let recovered = 0;
                for (const [appidStr, demoResult] of Object.entries(retryResults)) {
                    if (demoResult.header_image) {
                        const idx = updatedWishlist.findIndex((item) => String(item.appid) === appidStr);
                        if (idx !== -1) {
                            updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: demoResult };
                        }
                        cachedDemoResults[appidStr] = demoResult;
                        recovered++;
                    }
                }
                if (recovered > 0) {
                    setWishlist([...updatedWishlist]);
                    console.log(`[Demo Finder] Image retry pass recovered ${recovered} image(s)`);
                }
            }
            catch (e) {
                console.warn("[Demo Finder] Image retry pass failed:", e);
            }
        }
        // Fix 1: Frontend fetchNoCors image resolution for any still-imageless games
        resolveImagelessGames(updatedWishlist, setCacheVersion).catch((e) => console.warn("[Demo Finder] Frontend image resolution pass failed:", e));
    }, [wishlist]);
    // Keep the ref current
    SP_REACT.useEffect(() => { scanForDemosRef.current = scanForDemos; }, [scanForDemos]);
    const loadWishlist = SP_REACT.useCallback(async () => {
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
            let resolvedItems = items.map((item) => ({ ...item }));
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
            // After wishlist is fully loaded and names are resolved:
            // apply cached demo results (if any), otherwise auto-scan.
            if (Object.keys(cachedDemoResults).length > 0) {
                const withDemo = resolvedItems.map((item) => {
                    const demoInfo = cachedDemoResults[String(item.appid)];
                    if (demoInfo)
                        return { ...item, demoInfo };
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
            }
            else {
                // No cached results — auto-scan
                await scanForDemosRef.current?.(resolvedItems);
            }
        }
        catch (e) {
            setError(`Failed to load wishlist: ${e}`);
            setLoading(false);
            setResolvingNames(false);
        }
    }, [checkApiKey]);
    SP_REACT.useEffect(() => {
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
            // If the startup scan already populated the cache, use it directly
            if (cachedWishlist.length > 0) {
                setWishlist([...cachedWishlist]);
                if (cachedHasScanned) {
                    setHasScanned(true);
                    const demosFound = cachedWishlist.filter((i) => i.demoInfo?.has_demo).length;
                    if (demosFound > 0) {
                        setFilterDemoOnly(true);
                        setOptionsCollapsed(true);
                    }
                }
                return;
            }
            // Fall back to the normal load flow
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
    const nextSortMode = (mode) => {
        if (mode === "alpha")
            return "date_added";
        if (mode === "date_added")
            return "release_date";
        return "alpha";
    };
    const cycleSortMode = () => {
        setSortBy((prev) => nextSortMode(prev));
        setPage(0);
    };
    const sortLabel = {
        alpha: "A → Z",
        date_added: "Date Added",
        release_date: "Release Date",
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
        DFL.Navigation.Navigate("/demo-finder-wishlist");
    };
    return (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx("style", { children: focusHighlightCSS }), SP_JSX.jsxs(DFL.PanelSection, { title: "Wishlist Demo Finder", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: openFullPage, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaGamepad, { size: 14 }), " Open Full Wishlist View"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setOptionsCollapsed(!optionsCollapsed), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [optionsCollapsed ? SP_JSX.jsx(FaChevronDown, { size: 12 }) : SP_JSX.jsx(FaChevronUp, { size: 12 }), optionsCollapsed ? "Show Options" : "Hide Options"] }) }) }), !optionsCollapsed && (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: loadWishlist, disabled: loading || scanning, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSyncAlt, { size: 14 }), loading ? "Loading..." : "Refresh Wishlist"] }) }) }), wishlist.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => scanForDemos(), disabled: scanning || loading, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSearch, { size: 14 }), scanning ? "Scanning..." : hasScanned ? `Re-scan ${wishlist.length} Games` : `Scan ${wishlist.length} Games for Demos`] }) }) })), hasScanned && demosFoundCount > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => { setFilterDemoOnly(!filterDemoOnly); setPage(0); }, children: filterDemoOnly ? `Show All (${wishlist.length})` : `Show Only Demos (${demosFoundCount})` }) })), wishlist.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: cycleSortMode, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaSortAlphaDown, { size: 14 }), "Sort: ", sortLabel[nextSortMode(sortBy)]] }) }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setShowSetup(!showSetup), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }, children: [SP_JSX.jsx(FaKey, { size: 12 }), showSetup ? "Hide Setup" : (hasApiKey ? "Update Steam API Key" : "⚠️ Set Up Steam API Key")] }) }) })] }))] }), error && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: { ...statusStyle, color: "#ff6b6b" }, children: error }) })), showSetup && (SP_JSX.jsx(ApiKeySetup, { hasKey: hasApiKey, onKeySaved: handleKeySaved })), scanning && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: scanProgress }) })), loading && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: "Loading wishlist..." }) })), resolvingNames && !loading && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx("div", { style: statusStyle, children: "Resolving game names..." }) })), !loading && wishlist.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsxs("div", { style: { color: "rgba(255,255,255,0.6)", fontSize: "12px", textAlign: "center", padding: "4px 0" }, children: ["Current Sort Method: ", sortLabel[sortBy]] }) })), !loading && wishlist.length > 0 && (SP_JSX.jsxs(DFL.PanelSection, { title: filterDemoOnly ? `Demos (${demosFoundCount})` : `Wishlist (${displayItems.length})`, children: [SP_JSX.jsx("div", { style: containerStyle, children: pagedItems.map((item) => (SP_JSX.jsxs(DFL.Focusable, { style: itemContainerStyle, focusWithinClassName: "demo-finder-item-focus", children: [SP_JSX.jsx("div", { style: gameNameStyle, title: item.name, children: item.name }), SP_JSX.jsxs("div", { style: { display: "flex", gap: "4px", alignItems: "center" }, children: [item.demoInfo ? (item.demoInfo.has_demo ? (SP_JSX.jsx(DemoButton, { demoInfo: item.demoInfo, gameName: item.name })) : (SP_JSX.jsx("span", { style: noDemoStyle, children: "No demo" }))) : hasScanned ? (SP_JSX.jsx("span", { style: noDemoStyle, children: "No demo" })) : (SP_JSX.jsx("span", { style: noDemoStyle, children: "\u2014" })), SP_JSX.jsx(GameStoreLinkButton, { appid: item.appid, gameName: item.name })] })] }, item.appid))) }), totalPages > 1 && (SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", justifyContent: "center", gap: "12px", padding: "8px 0 12px 0" }, children: [SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.max(0, page - 1)), style: { ...pageBtnStyle, opacity: page === 0 ? 0.3 : 1 }, focusWithinClassName: "demo-finder-page-btn-focus", children: SP_JSX.jsxs("div", { onClick: () => setPage(Math.max(0, page - 1)), children: [bumperLabels.prev, " \u25C0 Prev"] }) }), SP_JSX.jsxs("span", { style: { color: "rgba(255,255,255,0.5)", fontSize: "12px", alignSelf: "center" }, children: [page + 1, " / ", totalPages] }), SP_JSX.jsx(DFL.Focusable, { onActivate: () => setPage(Math.min(totalPages - 1, page + 1)), style: { ...pageBtnStyle, opacity: page >= totalPages - 1 ? 0.3 : 1 }, focusWithinClassName: "demo-finder-page-btn-focus", children: SP_JSX.jsxs("div", { onClick: () => setPage(Math.min(totalPages - 1, page + 1)), children: ["Next \u25B6 ", bumperLabels.next] }) })] }))] }))] }));
}
// ---- Startup scan (runs in background when plugin initializes) ----
async function startupScan() {
    try {
        // Load demo cache from disk (once)
        if (!cachedDemoCacheLoaded) {
            cachedDemoCacheLoaded = true;
            try {
                const cache = await loadDemoCache();
                if (cache && Object.keys(cache).length > 0) {
                    cachedDemoResults = cache;
                    console.log(`[Demo Finder] Startup: loaded ${Object.keys(cache).length} cached demo results from disk`);
                }
            }
            catch (e) {
                console.warn("[Demo Finder] Startup: failed to load demo cache:", e);
            }
        }
        // Check for API key
        let apiKey;
        try {
            apiKey = await getApiKey();
        }
        catch (e) {
            console.warn("[Demo Finder] Startup: failed to get API key:", e);
            return;
        }
        if (!apiKey) {
            console.log("[Demo Finder] Startup: no API key configured, skipping scan");
            return;
        }
        // Retry getting the Steam ID (may not be ready immediately on boot)
        let steamId = "";
        const maxRetries = 15;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            steamId = getSteamId();
            if (steamId)
                break;
            console.log(`[Demo Finder] Startup: Steam ID not available yet, retrying in 2s (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (!steamId) {
            console.warn("[Demo Finder] Startup: could not get Steam ID after retries, skipping scan");
            return;
        }
        // Fetch wishlist
        let wishlistResult;
        try {
            wishlistResult = await getWishlist(steamId);
        }
        catch (e) {
            console.warn("[Demo Finder] Startup: failed to fetch wishlist:", e);
            return;
        }
        if (typeof wishlistResult === "string" || !Array.isArray(wishlistResult) || wishlistResult.length === 0) {
            console.warn("[Demo Finder] Startup: wishlist empty or error:", wishlistResult);
            return;
        }
        const items = wishlistResult.map((item) => ({ ...item }));
        // If we already have cached demo results for all items, just apply them
        if (Object.keys(cachedDemoResults).length > 0) {
            cachedWishlist = items.map((item) => {
                const demoInfo = cachedDemoResults[String(item.appid)];
                return demoInfo ? { ...item, demoInfo } : item;
            });
            cachedHasScanned = true;
            const demosFound = cachedWishlist.filter((i) => i.demoInfo?.has_demo).length;
            console.log(`[Demo Finder] Startup: applied cached results — ${demosFound} demo(s) found`);
            if (demosFound > 0) {
                cachedFilterDemoOnly = true;
                toaster.toast({
                    title: "Demo Finder",
                    body: `Found ${demosFound} demo${demosFound !== 1 ? "s" : ""} in your wishlist!`,
                });
            }
            return;
        }
        // Otherwise run a full batch scan
        const appids = items
            .map((i) => i.appid)
            .filter((appid) => !cachedDemoResults[String(appid)]?.definitive);
        const totalBatches = Math.ceil(appids.length / BATCH_SIZE);
        console.log(`[Demo Finder] Startup: scanning ${appids.length} games in ${totalBatches} batch(es)`);
        for (let b = 0; b < totalBatches; b++) {
            const batch = appids.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
            try {
                const results = await checkDemosBatch(batch);
                for (const [appidStr, demoResult] of Object.entries(results)) {
                    cachedDemoResults[appidStr] = demoResult;
                }
            }
            catch (e) {
                console.error(`[Demo Finder] Startup: batch ${b + 1} failed:`, e);
            }
        }
        // Apply results to wishlist
        cachedWishlist = items.map((item) => {
            const demoInfo = cachedDemoResults[String(item.appid)];
            return demoInfo ? { ...item, demoInfo } : item;
        });
        cachedHasScanned = true;
        // Persist cache to disk
        try {
            await saveDemoCache(cachedDemoResults);
        }
        catch (e) {
            console.warn("[Demo Finder] Startup: failed to persist demo cache:", e);
        }
        const demosFound = cachedWishlist.filter((i) => i.demoInfo?.has_demo).length;
        console.log(`[Demo Finder] Startup scan complete — ${demosFound} demo(s) found in ${items.length} games`);
        if (demosFound > 0) {
            cachedFilterDemoOnly = true;
            toaster.toast({
                title: "Demo Finder",
                body: `Background scan complete! Found ${demosFound} demo${demosFound !== 1 ? "s" : ""} in your wishlist.`,
            });
        }
        // Fix 3: Targeted retry for image-less games after cooldown
        const imagelessAfterStartup = cachedWishlist.filter((item) => item.demoInfo && !item.demoInfo.header_image && !capsuleImageCache[String(item.appid)]);
        if (imagelessAfterStartup.length > 0 && imagelessAfterStartup.length <= 50) {
            console.log(`[Demo Finder] Startup: retrying ${imagelessAfterStartup.length} image-less games after cooldown...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            try {
                const retryResults = await checkDemosBatch(imagelessAfterStartup.map((item) => item.appid));
                let recovered = 0;
                for (const [appidStr, demoResult] of Object.entries(retryResults)) {
                    if (demoResult.header_image) {
                        cachedDemoResults[appidStr] = demoResult;
                        recovered++;
                    }
                }
                if (recovered > 0) {
                    // Re-apply updated results to cachedWishlist
                    cachedWishlist = cachedWishlist.map((item) => {
                        const demoInfo = cachedDemoResults[String(item.appid)];
                        return demoInfo ? { ...item, demoInfo } : item;
                    });
                    console.log(`[Demo Finder] Startup: image retry pass recovered ${recovered} image(s)`);
                }
            }
            catch (e) {
                console.warn("[Demo Finder] Startup: image retry pass failed:", e);
            }
        }
    }
    catch (e) {
        console.error("[Demo Finder] Startup scan failed:", e);
    }
}
// ---- Plugin Registration ----
var index = definePlugin(() => {
    console.log("Demo Finder plugin initializing");
    // Register full-page wishlist route
    routerHook.addRoute("/demo-finder-wishlist", FullPageWishlistWithDemos, { exact: true });
    // Kick off background scan ~5s after plugin loads to let Steam fully initialize
    setTimeout(() => { startupScan(); }, 5000);
    return {
        name: "Demo Finder",
        titleView: (SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsx(FaGamepad, {}), " Demo Finder"] }) })),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaGamepad, {}),
        onDismount() {
            console.log("Demo Finder unloading");
            routerHook.removeRoute("/demo-finder-wishlist");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
