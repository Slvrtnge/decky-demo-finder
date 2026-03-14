import decky
import aiohttp
import asyncio
import json as json_module
import os
import platform


def _build_user_agent() -> str:
    """Build a cross-platform User-Agent string."""
    system = platform.system()
    machine = platform.machine() or "x86_64"
    if system == "Linux":
        return (
            f"Mozilla/5.0 (X11; Linux {machine}) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    elif system == "Windows":
        return (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    elif system == "Darwin":
        return (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    return (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )


# Built once at module load; reused by all request methods.
_DEFAULT_HEADERS = {
    "User-Agent": _build_user_agent(),
    "Accept": "application/json, text/plain, */*",
}


def _get_settings_path() -> str:
    """Return the path to the plugin settings file."""
    settings_dir = decky.DECKY_PLUGIN_SETTINGS_DIR
    os.makedirs(settings_dir, exist_ok=True)
    return os.path.join(settings_dir, "settings.json")


def _load_settings() -> dict:
    """Load settings from disk."""
    path = _get_settings_path()
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json_module.load(f)
        except Exception:
            return {}
    return {}


def _save_settings(settings: dict) -> None:
    """Persist settings to disk."""
    path = _get_settings_path()
    with open(path, "w") as f:
        json_module.dump(settings, f, indent=2)


class Plugin:
    """
    Demo Finder - checks Steam wishlist items for available demos.
    Uses the Steam Store API to fetch app details and identify linked demos.
    Requires a Steam Web API key (free) to access wishlist data.
    """

    # ---- Settings management ----

    async def set_api_key(self, api_key: str) -> bool:
        """Save the user's Steam Web API key to plugin settings."""
        settings = _load_settings()
        settings["steam_api_key"] = api_key.strip()
        _save_settings(settings)
        decky.logger.info("Steam API key saved")
        return True

    async def get_api_key(self) -> str:
        """Load the user's Steam Web API key from plugin settings."""
        settings = _load_settings()
        return settings.get("steam_api_key", "")

    # ---- Wishlist fetching strategies ----

    async def _fetch_wishlist_with_key(self, session, steam_id: str, api_key: str):
        """
        Fetch wishlist via IWishlistService/GetWishlist/v1 with an API key.
        This is the primary strategy and the most reliable as of 2024+.
        Returns list of {appid, name} on success, or None on failure.
        """
        url = (
            "https://api.steampowered.com/IWishlistService/GetWishlist/v1/"
            f"?key={api_key}&steamid={steam_id}"
        )
        headers = dict(_DEFAULT_HEADERS)
        try:
            async with session.get(url, headers=headers) as resp:
                if resp.status == 403:
                    decky.logger.warning(
                        "GetWishlist returned 403 Forbidden — API key may be invalid"
                    )
                    return None
                if resp.status != 200:
                    decky.logger.warning(
                        f"GetWishlist (with key) returned status {resp.status}"
                    )
                    return None

                text = await resp.text()
                if not text or not text.strip():
                    decky.logger.warning("GetWishlist (with key) returned empty body")
                    return None

                data = json_module.loads(text)
                response = data.get("response", {})
                items = response.get("items", [])

                results = []
                for item in items:
                    appid = item.get("appid")
                    if appid is None:
                        continue
                    results.append({
                        "appid": int(appid),
                        "name": item.get("name", f"App {appid}"),
                    })

                decky.logger.info(
                    f"GetWishlist (with key) returned {len(results)} items"
                )
                return results if results else None

        except Exception as e:
            decky.logger.warning(f"GetWishlist (with key) failed: {e}")
            return None

    async def _fetch_wishlist_no_key(self, session, steam_id: str):
        """
        Try fetching wishlist via IWishlistService/GetWishlist/v1 without a key.
        This may work for some public wishlists but is unreliable since 2024.
        Returns list of {appid, name} on success, or None on failure.
        """
        url = (
            "https://api.steampowered.com/IWishlistService/GetWishlist/v1/"
            f"?steamid={steam_id}"
        )
        headers = dict(_DEFAULT_HEADERS)
        try:
            async with session.get(url, headers=headers) as resp:
                if resp.status != 200:
                    decky.logger.warning(
                        f"GetWishlist (no key) returned status {resp.status}"
                    )
                    return None

                text = await resp.text()
                if not text or not text.strip():
                    decky.logger.warning("GetWishlist (no key) returned empty body")
                    return None

                data = json_module.loads(text)
                response = data.get("response", {})
                items = response.get("items", [])

                results = []
                for item in items:
                    appid = item.get("appid")
                    if appid is None:
                        continue
                    results.append({
                        "appid": int(appid),
                        "name": item.get("name", f"App {appid}"),
                    })

                decky.logger.info(
                    f"GetWishlist (no key) returned {len(results)} items"
                )
                return results if results else None

        except Exception as e:
            decky.logger.warning(f"GetWishlist (no key) failed: {e}")
            return None

    async def _fetch_wishlist_store(self, session, steam_id: str):
        """
        Last-resort fallback: legacy store.steampowered.com endpoint.
        This endpoint has been deprecated since 2024 and may not return data.
        Returns list of {appid, name} on success, or None on failure.
        """
        all_items = []
        page = 0
        headers = {
            **_DEFAULT_HEADERS,
            "Referer": f"https://store.steampowered.com/wishlist/profiles/{steam_id}/",
        }

        try:
            while True:
                url = (
                    f"https://store.steampowered.com/wishlist/profiles/"
                    f"{steam_id}/wishlistdata/?p={page}"
                )
                async with session.get(url, headers=headers) as resp:
                    if resp.status != 200:
                        decky.logger.warning(
                            f"Store wishlist API returned status {resp.status}"
                        )
                        break

                    text = await resp.text()
                    if not text or not text.strip():
                        decky.logger.warning(
                            f"Store wishlist API returned empty body (page {page})"
                        )
                        break

                    data = json_module.loads(text)

                    # Steam returns an empty array or object when no more pages
                    if not data or (isinstance(data, list) and len(data) == 0):
                        break

                    if isinstance(data, dict):
                        if len(data) == 0:
                            break
                        for appid_str, info in data.items():
                            try:
                                appid = int(appid_str)
                            except ValueError:
                                continue
                            name = "Unknown"
                            if isinstance(info, dict):
                                name = info.get("name", "Unknown")
                            all_items.append({"appid": appid, "name": name})
                    else:
                        break

                    page += 1
                    if page > 20:
                        break

        except Exception as e:
            decky.logger.warning(f"Store wishlist fallback failed: {e}")

        if all_items:
            decky.logger.info(f"Store wishlist returned {len(all_items)} items")
        return all_items if all_items else None

    async def get_wishlist(self, steam_id: str):
        """
        Fetch the user's public wishlist from the Steam API.
        Tries authenticated request first (requires API key), then
        falls back to unauthenticated and legacy endpoints.
        Returns a list of { appid, name } objects, or an error string.
        """
        if not steam_id or not steam_id.strip():
            decky.logger.error("get_wishlist called with empty steam_id")
            return "NO_STEAM_ID"

        api_key = (_load_settings()).get("steam_api_key", "")

        decky.logger.info(
            f"Fetching wishlist for Steam ID: {steam_id} "
            f"(platform: {platform.system()}, "
            f"has_api_key: {bool(api_key)})"
        )

        async with aiohttp.ClientSession() as session:
            # Strategy 1: Authenticated request with API key (best method)
            if api_key:
                items = await self._fetch_wishlist_with_key(
                    session, steam_id, api_key
                )
                if items:
                    decky.logger.info(
                        f"Found {len(items)} wishlist items (with key)"
                    )
                    return items
                decky.logger.warning(
                    "Authenticated wishlist fetch failed — "
                    "API key may be invalid or wishlist may be private"
                )

            # Strategy 2: Unauthenticated request (may still work for some)
            items = await self._fetch_wishlist_no_key(session, steam_id)
            if items:
                decky.logger.info(
                    f"Found {len(items)} wishlist items (no key)"
                )
                return items

            # Strategy 3: Legacy store endpoint (deprecated since 2024)
            items = await self._fetch_wishlist_store(session, steam_id)
            if items:
                decky.logger.info(
                    f"Found {len(items)} wishlist items (legacy)"
                )
                return items

        if not api_key:
            decky.logger.error(
                "All wishlist strategies failed and no API key is configured."
            )
            return "NO_API_KEY"

        decky.logger.error(
            "All wishlist fetch strategies failed. "
            "Check that your API key is valid and your wishlist is public."
        )
        return "FETCH_FAILED"

    async def check_demo(self, appid: int) -> dict:
        """
        Check if a given app has a demo available by querying the Steam Store API.
        Returns { has_demo: bool, demo_appid: int | None, demo_url: str | None }
        """
        decky.logger.info(f"Checking demo for appid: {appid}")
        result = {
            "has_demo": False,
            "demo_appid": None,
            "demo_url": None,
            "app_url": f"https://store.steampowered.com/app/{appid}/"
        }

        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
                async with session.get(url) as resp:
                    if resp.status != 200:
                        decky.logger.error(f"Store API returned status {resp.status} for appid {appid}")
                        return result

                    data = await resp.json(content_type=None)

                    app_data = data.get(str(appid), {})
                    if not app_data.get("success", False):
                        decky.logger.warning(f"App details not found for appid {appid}")
                        return result

                    details = app_data.get("data", {})

                    # Check for demos in the app details
                    demos = details.get("demos", [])
                    if demos and len(demos) > 0:
                        demo_appid = demos[0].get("appid")
                        if demo_appid:
                            result["has_demo"] = True
                            result["demo_appid"] = int(demo_appid)
                            result["demo_url"] = f"https://store.steampowered.com/app/{demo_appid}/"
                            decky.logger.info(f"Found demo {demo_appid} for appid {appid}")
                            return result

                    # Also check fullgame field — if this IS a demo, link to the full game
                    fullgame = details.get("fullgame", {})
                    if fullgame and fullgame.get("appid"):
                        decky.logger.info(f"App {appid} is itself a demo for {fullgame.get('appid')}")

        except Exception as e:
            decky.logger.error(f"Error checking demo for appid {appid}: {e}")

        return result

    async def check_demos_batch(self, appids: list) -> dict:
        """
        Check multiple appids for demos in batch. 
        Returns a dict keyed by appid string with demo info.
        We throttle requests to avoid hitting Steam's rate limit.
        """
        results = {}
        
        for appid in appids:
            try:
                demo_info = await self.check_demo(int(appid))
                results[str(appid)] = demo_info
            except Exception as e:
                decky.logger.error(f"Error in batch check for {appid}: {e}")
                results[str(appid)] = {
                    "has_demo": False,
                    "demo_appid": None,
                    "demo_url": None,
                    "app_url": f"https://store.steampowered.com/app/{appid}/"
                }
            # Throttle: Steam rate-limits the store API
            await asyncio.sleep(0.3)

        return results

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Demo Finder plugin loaded!")

    # Called when the plugin is being stopped
    async def _unload(self):
        decky.logger.info("Demo Finder plugin unloaded!")

    # Called when the plugin is being uninstalled
    async def _uninstall(self):
        decky.logger.info("Demo Finder plugin uninstalled!")

    async def _migration(self):
        pass