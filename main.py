import decky
import aiohttp
import asyncio
import json as json_module
import os
import platform
import stat
import time


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
    # Verify the directory is writable; attempt to fix if not.
    if not os.access(settings_dir, os.W_OK):
        decky.logger.warning(
            f"Settings directory is not writable: {settings_dir} — attempting chmod"
        )
        try:
            if platform.system() == "Windows":
                current = os.stat(settings_dir).st_mode
                os.chmod(settings_dir, current | stat.S_IWRITE)
            else:
                os.chmod(settings_dir, 0o755)
        except Exception as chmod_err:
            decky.logger.error(
                f"Could not fix permissions on settings directory {settings_dir}: {chmod_err}"
            )
    return os.path.join(settings_dir, "settings.json")


def _load_settings() -> dict:
    """Load settings from disk."""
    path = _get_settings_path()
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json_module.load(f)
        except Exception as e:
            decky.logger.error(f"Failed to load settings from {path}: {e}")
            return {}
    return {}


def _fix_readonly(path: str, is_dir: bool) -> None:
    """Best-effort attempt to remove read-only attribute from a path.

    Logs any failure but does not raise, so callers can proceed to attempt
    the write and let that operation surface the real error if needed.
    """
    try:
        if platform.system() == "Windows":
            current = os.stat(path).st_mode
            if not (current & stat.S_IWRITE):
                os.chmod(path, current | stat.S_IWRITE)
        else:
            if not os.access(path, os.W_OK):
                os.chmod(path, 0o755 if is_dir else 0o644)
    except Exception as chmod_err:
        decky.logger.error(
            f"Could not fix read-only permissions on {path}: {chmod_err}"
        )


def _save_settings(settings: dict) -> None:
    """Persist settings to disk."""
    path = _get_settings_path()
    settings_dir = os.path.dirname(path)
    # Attempt to fix read-only permissions on the directory and file before writing.
    _fix_readonly(settings_dir, is_dir=True)
    if os.path.exists(path):
        _fix_readonly(path, is_dir=False)
    try:
        with open(path, "w") as f:
            json_module.dump(settings, f, indent=2)
    except Exception as e:
        decky.logger.error(f"Failed to write settings to {path}: {e}")
        raise


class Plugin:
    """
    Demo Finder - checks Steam wishlist items for available demos.
    Uses the Steam Store API to fetch app details and identify linked demos.
    Requires a Steam Web API key (free) to access wishlist data.
    """

    # Cached app-name lookup: { appid (int): name (str) }
    _app_name_cache: dict = {}
    _app_name_cache_time: float = 0
    _APP_NAME_CACHE_TTL = 3600  # 1 hour
    _MAX_CONCURRENT_REQUESTS = 5

    # ---- App-name resolution ----

    async def _ensure_app_names_loaded(self, session):
        """
        Populate ``_app_name_cache`` from ISteamApps/GetAppList/v2 if
        the cache is empty or stale.  This is a single HTTP request that
        returns every public Steam app with its name.
        """
        now = time.time()
        if Plugin._app_name_cache and (now - Plugin._app_name_cache_time) < Plugin._APP_NAME_CACHE_TTL:
            return  # cache is fresh

        url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
        try:
            async with session.get(url, headers=_DEFAULT_HEADERS) as resp:
                if resp.status != 200:
                    decky.logger.warning(
                        f"GetAppList returned status {resp.status}"
                    )
                    return
                data = await resp.json(content_type=None)
                apps = data.get("applist", {}).get("apps", [])
                cache: dict = {}
                for app in apps:
                    aid = app.get("appid")
                    name = app.get("name")
                    if aid is not None and name:
                        cache[int(aid)] = name
                Plugin._app_name_cache = cache
                Plugin._app_name_cache_time = now
                decky.logger.info(
                    f"App-name cache loaded with {len(cache)} entries"
                )
        except Exception as e:
            decky.logger.warning(f"Failed to load app-name cache: {e}")

    def _apply_cached_names(self, items: list) -> None:
        """Overwrite placeholder names with real names from the cache."""
        for item in items:
            name = item.get("name", "")
            if not name or name.startswith("App ") or name == "Unknown":
                real = Plugin._app_name_cache.get(item["appid"])
                if real:
                    item["name"] = real

    async def _resolve_missing_names(self, session: "aiohttp.ClientSession", items: list) -> None:
        """
        For items that still carry placeholder names after the GetAppList cache
        lookup, fall back to querying the Steam Store appdetails API individually.
        This is the most reliable source of game names.

        Args:
            session: The active aiohttp.ClientSession to reuse for all requests.
            items:   The list of wishlist item dicts (mutated in-place).
        """
        missing = [
            item for item in items
            if not item.get("name") or item["name"].startswith("App ") or item["name"] == "Unknown"
        ]
        if not missing:
            return

        decky.logger.info(f"Resolving names for {len(missing)} items via appdetails")
        semaphore = asyncio.Semaphore(3)

        async def _fetch_name(item):
            appid = item["appid"]
            url = f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=us&l=english"
            async with semaphore:
                for attempt in range(3):
                    try:
                        async with session.get(url, headers=_DEFAULT_HEADERS) as resp:
                            if resp.status == 429 or resp.status >= 500:
                                wait = 1.0 * (2 ** attempt)
                                decky.logger.warning(
                                    f"appdetails returned {resp.status} for {appid}, "
                                    f"retrying in {wait:.0f}s (attempt {attempt + 1}/3)"
                                )
                                await asyncio.sleep(wait)
                                continue
                            if resp.status != 200:
                                decky.logger.warning(
                                    f"appdetails returned {resp.status} for {appid}"
                                )
                                await asyncio.sleep(0.3)
                                return
                            data = await resp.json(content_type=None)
                            app_data = data.get(str(appid), {})
                            if not app_data.get("success", False):
                                await asyncio.sleep(0.3)
                                return
                            details = app_data.get("data", {})
                            name = details.get("name")
                            if name:
                                item["name"] = name
                            await asyncio.sleep(0.3)
                            return
                    except Exception as e:
                        decky.logger.warning(f"Name resolution failed for appid {appid}: {e}")
                        # fall through to next attempt

        # Process in small batches with a delay between batches to avoid
        # overwhelming Steam's rate limits.
        batch_size = 10
        for i in range(0, len(missing), batch_size):
            batch = missing[i:i + batch_size]
            await asyncio.gather(*[_fetch_name(item) for item in batch], return_exceptions=True)
            if i + batch_size < len(missing):
                await asyncio.sleep(1.0)

        decky.logger.info("appdetails name resolution complete")

    # ---- Settings management ----

    async def set_api_key(self, api_key: str) -> bool:
        """Save the user's Steam Web API key to plugin settings."""
        try:
            settings = _load_settings()
            settings["steam_api_key"] = api_key.strip()
            _save_settings(settings)
            decky.logger.info("Steam API key saved")
            return True
        except Exception as e:
            decky.logger.error(f"set_api_key failed: {e}")
            raise

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
                        "date_added": item.get("date_added", 0),
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
                        "date_added": item.get("date_added", 0),
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
                            all_items.append({"appid": appid, "name": name, "date_added": 0})
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
        Returns a list of { appid, name, date_added } objects, or an error string.
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
            # Pre-load the app-name cache in parallel with the wishlist fetch
            # so name resolution is instant later.
            name_task = asyncio.ensure_future(
                self._ensure_app_names_loaded(session)
            )

            items = None

            # Strategy 1: Authenticated request with API key (best method)
            if api_key:
                items = await self._fetch_wishlist_with_key(
                    session, steam_id, api_key
                )
                if items:
                    decky.logger.info(
                        f"Found {len(items)} wishlist items (with key)"
                    )
                else:
                    decky.logger.warning(
                        "Authenticated wishlist fetch failed — "
                        "API key may be invalid or wishlist may be private"
                    )

            # Strategy 2: Unauthenticated request (may still work for some)
            if not items:
                items = await self._fetch_wishlist_no_key(session, steam_id)
                if items:
                    decky.logger.info(
                        f"Found {len(items)} wishlist items (no key)"
                    )

            # Strategy 3: Legacy store endpoint (deprecated since 2024)
            if not items:
                items = await self._fetch_wishlist_store(session, steam_id)
                if items:
                    decky.logger.info(
                        f"Found {len(items)} wishlist items (legacy)"
                    )

            # Wait for the name cache before resolving (with a timeout so a
            # slow/failing GetAppList request does not stall wishlist delivery).
            try:
                await asyncio.wait_for(name_task, timeout=10.0)
            except asyncio.TimeoutError:
                decky.logger.warning(
                    "App-name cache load timed out after 10s — skipping GetAppList name lookup"
                )
            except Exception as e:
                decky.logger.warning(f"App-name cache load failed: {e}")

            if items:
                self._apply_cached_names(items)
                await self._resolve_missing_names(session, items)
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
        Returns { has_demo, demo_appid, demo_url, app_url, release_date }
        """
        decky.logger.info(f"Checking demo for appid: {appid}")
        result = {
            "has_demo": False,
            "demo_appid": None,
            "demo_url": None,
            "app_url": f"https://store.steampowered.com/app/{appid}/",
            "release_date": None,
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

                    # Extract release date
                    rd = details.get("release_date", {})
                    if rd and rd.get("date"):
                        result["release_date"] = rd["date"]

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

    async def _check_demo_shared_session(self, session, appid: int, semaphore) -> dict:
        """
        Like check_demo but reuses an existing session and respects a
        concurrency semaphore for rate-limit-friendly parallelism.
        """
        result = {
            "has_demo": False,
            "demo_appid": None,
            "demo_url": None,
            "app_url": f"https://store.steampowered.com/app/{appid}/",
            "release_date": None,
            "name": None,
        }
        async with semaphore:
            try:
                url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
                async with session.get(url, headers=_DEFAULT_HEADERS) as resp:
                    if resp.status != 200:
                        return result
                    data = await resp.json(content_type=None)
                    app_data = data.get(str(appid), {})
                    if not app_data.get("success", False):
                        return result
                    details = app_data.get("data", {})

                    # Extract the game name from appdetails
                    name = details.get("name")
                    if name:
                        result["name"] = name

                    rd = details.get("release_date", {})
                    if rd and rd.get("date"):
                        result["release_date"] = rd["date"]

                    demos = details.get("demos", [])
                    if demos and len(demos) > 0:
                        demo_appid = demos[0].get("appid")
                        if demo_appid:
                            result["has_demo"] = True
                            result["demo_appid"] = int(demo_appid)
                            result["demo_url"] = f"https://store.steampowered.com/app/{demo_appid}/"
            except Exception as e:
                decky.logger.warning(f"Concurrent demo check failed for {appid}: {e}")
        return result

    async def check_demos_batch(self, appids: list) -> dict:
        """
        Check multiple appids for demos concurrently.
        Uses a semaphore to limit parallel requests and stay within
        Steam's rate limits while being significantly faster than
        sequential processing.
        """
        semaphore = asyncio.Semaphore(Plugin._MAX_CONCURRENT_REQUESTS)

        async with aiohttp.ClientSession() as session:
            async def _check(aid):
                return str(aid), await self._check_demo_shared_session(session, int(aid), semaphore)

            tasks = [_check(appid) for appid in appids]
            pairs = await asyncio.gather(*tasks, return_exceptions=True)

        results = {}
        for pair in pairs:
            if isinstance(pair, Exception):
                continue
            appid_str, demo_info = pair
            results[appid_str] = demo_info

        # Fill in any missing appids with default result
        for appid in appids:
            if str(appid) not in results:
                results[str(appid)] = {
                    "has_demo": False,
                    "demo_appid": None,
                    "demo_url": None,
                    "app_url": f"https://store.steampowered.com/app/{appid}/",
                    "release_date": None,
                    "name": None,
                }

        return results

    async def resolve_names_batch(self, appids: list) -> dict:
        """
        Resolve game names for a list of appids using the Steam Store appdetails
        API.  Returns a dict mapping appid (as string) to name.  Used by the
        frontend as a post-load name-resolution step for any remaining
        placeholder names.
        """
        semaphore = asyncio.Semaphore(3)

        async with aiohttp.ClientSession() as session:
            async def _fetch_name(appid):
                url = f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=us&l=english"
                async with semaphore:
                    for attempt in range(3):
                        try:
                            async with session.get(url, headers=_DEFAULT_HEADERS) as resp:
                                if resp.status == 429 or resp.status >= 500:
                                    wait = 1.0 * (2 ** attempt)
                                    decky.logger.warning(
                                        f"resolve_names_batch: status {resp.status} for {appid}, "
                                        f"retrying in {wait:.0f}s (attempt {attempt + 1}/3)"
                                    )
                                    await asyncio.sleep(wait)
                                    continue
                                if resp.status != 200:
                                    decky.logger.warning(
                                        f"resolve_names_batch: status {resp.status} for {appid}"
                                    )
                                    await asyncio.sleep(0.3)
                                    return str(appid), None
                                data = await resp.json(content_type=None)
                                app_data = data.get(str(appid), {})
                                if not app_data.get("success", False):
                                    await asyncio.sleep(0.3)
                                    return str(appid), None
                                details = app_data.get("data", {})
                                await asyncio.sleep(0.3)
                                return str(appid), details.get("name")
                        except Exception as e:
                            decky.logger.warning(f"Name fetch failed for appid {appid}: {e}")
                            # fall through to next attempt
                    return str(appid), None

            # Process in small batches to avoid overwhelming Steam's rate limits.
            batch_size = 10
            pairs = []
            for i in range(0, len(appids), batch_size):
                batch = appids[i:i + batch_size]
                batch_results = await asyncio.gather(
                    *[_fetch_name(appid) for appid in batch], return_exceptions=True
                )
                pairs.extend(batch_results)
                if i + batch_size < len(appids):
                    await asyncio.sleep(1.0)

        result = {}
        for pair in pairs:
            if isinstance(pair, Exception):
                continue
            if pair is None:
                continue
            appid_str, name = pair
            if name:
                result[appid_str] = name

        return result

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