import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  Navigation,
  staticClasses,
  Focusable,
} from "@decky/ui";
import {
  callable,
  definePlugin,
  toaster,
} from "@decky/api";
import { useState, useEffect, useCallback, Fragment, FC } from "react";
import { FaGamepad, FaSearch, FaExternalLinkAlt, FaSyncAlt } from "react-icons/fa";

// ---- Backend callables ----
const getWishlist = callable<[steam_id: string], WishlistItem[]>("get_wishlist");
const checkDemosBatch = callable<[appids: number[]], Record<string, DemoInfo>>("check_demos_batch");

// ---- Types ----
interface WishlistItem {
  appid: number;
  name: string;
}

interface DemoInfo {
  has_demo: boolean;
  demo_appid: number | null;
  demo_url: string | null;
  app_url: string;
}

interface WishlistItemWithDemo extends WishlistItem {
  demoInfo?: DemoInfo;
}

const BATCH_SIZE = 10;
const ITEMS_PER_PAGE = 20;

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

// ---- Helpers ----
function getSteamId(): string {
  try {
    const id = (window as unknown as { App?: { m_CurrentUser?: { strSteamID?: string } } })
      .App?.m_CurrentUser?.strSteamID;
    if (id) return id;
  } catch (_e) { /* ignore */ }
  return "";
}

// ---- Sub-Components ----
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

// ---- Main Content ----
function Content() {
  const [wishlist, setWishlist] = useState<WishlistItemWithDemo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filterDemoOnly, setFilterDemoOnly] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasScanned(false);
    try {
      const steamId = getSteamId();
      if (!steamId) {
        setError("Could not detect your Steam ID. Make sure you are logged in.");
        setLoading(false);
        return;
      }
      const items = await getWishlist(steamId);
      if (!items || items.length === 0) {
        setError("Wishlist is empty or private. Set wishlist privacy to public in Steam settings.");
        setWishlist([]);
      } else {
        setWishlist(items.map((item) => ({ ...item })));
        setPage(0);
      }
    } catch (e) {
      setError(`Failed to load wishlist: ${e}`);
    }
    setLoading(false);
  }, []);

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
            updatedWishlist[idx] = { ...updatedWishlist[idx], demoInfo: results[appidStr] };
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

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const displayItems = filterDemoOnly
    ? wishlist.filter((item) => item.demoInfo?.has_demo)
    : wishlist;
  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const pagedItems = displayItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const demosFoundCount = wishlist.filter((item) => item.demoInfo?.has_demo).length;

  return (
    <Fragment>
      <PanelSection title="Wishlist Demo Finder">
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
      </PanelSection>

      {error && (
        <PanelSection><div style={{ ...statusStyle, color: "#ff6b6b" }}>{error}</div></PanelSection>
      )}
      {scanning && (
        <PanelSection><div style={statusStyle}>{scanProgress}</div></PanelSection>
      )}
      {loading && (
        <PanelSection><div style={statusStyle}>Loading wishlist...</div></PanelSection>
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