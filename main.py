import decky
import aiohttp
import asyncio
import json as json_module
import urllib.parse

class Plugin:
    """
    Demo Finder - checks Steam wishlist items for available demos.
    Uses the Steam Store API to fetch app details and identify linked demos.
    """

    BROWSER_HEADERS = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; Valve Steam Deck) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
    }

    async def get_steam_id(self) -> str:
        """
        Retrieve the current user's Steam ID from the Decky environment.
        The frontend will pass this in, but we can also try to read it from Steam files.
        """
        # This will be called from the frontend which has access to the SteamID
        return ""

    # ---- Wishlist fetching strategies ----

    async def _fetch_wishlist_sorted_filtered(self, session, steam_id: str):
        """
        Try fetching wishlist via IWishlistService/GetWishlistSortedFiltered/v1.
        This is the endpoint Steam's own storefront uses.
        Returns list of {appid, name} on success, or None on failure.
        """
        PAGE_SIZE = 100
        all_results = []
        start_index = 0

        try:
            while True:
                input_data = {
                    "steamid": int(steam_id),
                    "context": {
                        "language": "english",
                        "elanguage": 0,
                        "country_code": "US",
                        "steam_realm": 1,
                    },
                    "data_request": {"include_basic_info": True},
                    "start_index": start_index,
                    "page_size": PAGE_SIZE,
                }
                url = (
                    "https://api.steampowered.com/IWishlistService/GetWishlistSortedFiltered/v1/"
                    f"?input_json={urllib.parse.quote(json_module.dumps(input_data))}"
                )
                async with session.get(url, headers=self.BROWSER_HEADERS) as resp:
                    if resp.status != 200:
                        decky.logger.warning(
                            f"GetWishlistSortedFiltered returned status {resp.status}"
                        )
                        return None

                    text = await resp.text()
                    if not text or not text.strip():
                        decky.logger.warning("GetWishlistSortedFiltered returned empty body")
                        return None

                    data = json_module.loads(text)
                    response = data.get("response", {})
                    items = response.get("items", [])

                    if not items:
                        break

                    for item in items:
                        appid = item.get("appid")
                        if appid is None:
                            continue
                        # Name may be nested in store_item or at top level
                        name = "Unknown"
                        store_item = item.get("store_item", {})
                        if isinstance(store_item, dict):
                            name = store_item.get("name", name)
                        if name == "Unknown":
                            name = item.get("name", name)
                        all_results.append({"appid": int(appid), "name": name})

                    # Check if there are more pages
                    if len(items) < PAGE_SIZE:
                        break
                    start_index += len(items)

            if all_results:
                decky.logger.info(
                    f"GetWishlistSortedFiltered returned {len(all_results)} items"
                )
            return all_results if all_results else None

        except Exception as e:
            decky.logger.warning(f"GetWishlistSortedFiltered failed: {e}")
            return None

    async def _fetch_wishlist_basic(self, session, steam_id: str):
        """
        Try fetching wishlist via IWishlistService/GetWishlist/v1.
        Simpler endpoint that returns appids (names may not be included).
        Returns list of {appid, name} on success, or None on failure.
        """
        input_data = {"steamid": int(steam_id)}
        url = (
            "https://api.steampowered.com/IWishlistService/GetWishlist/v1/"
            f"?input_json={urllib.parse.quote(json_module.dumps(input_data))}"
        )
        try:
            async with session.get(url, headers=self.BROWSER_HEADERS) as resp:
                if resp.status != 200:
                    decky.logger.warning(
                        f"GetWishlist returned status {resp.status}"
                    )
                    return None

                text = await resp.text()
                if not text or not text.strip():
                    decky.logger.warning("GetWishlist returned empty body")
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

                decky.logger.info(f"GetWishlist returned {len(results)} items")
                return results if results else None

        except Exception as e:
            decky.logger.warning(f"GetWishlist failed: {e}")
            return None

    async def _fetch_wishlist_store(self, session, steam_id: str):
        """
        Fallback: fetch wishlist via the legacy store.steampowered.com endpoint.
        Returns list of {appid, name} on success, or None on failure.
        """
        all_items = []
        page = 0
        headers = {
            **self.BROWSER_HEADERS,
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

    async def get_wishlist(self, steam_id: str) -> list:
        """
        Fetch the user's public wishlist from the Steam API.
        Tries multiple endpoints with graceful fallback.
        Returns a list of { appid, name } objects.
        """
        decky.logger.info(f"Fetching wishlist for Steam ID: {steam_id}")

        async with aiohttp.ClientSession() as session:
            # Strategy 1: New paginated/sorted API
            items = await self._fetch_wishlist_sorted_filtered(session, steam_id)
            if items:
                decky.logger.info(f"Found {len(items)} wishlist items")
                return items

            # Strategy 2: Simple wishlist API (appids, may lack names)
            items = await self._fetch_wishlist_basic(session, steam_id)
            if items:
                decky.logger.info(f"Found {len(items)} wishlist items")
                return items

            # Strategy 3: Legacy store endpoint
            items = await self._fetch_wishlist_store(session, steam_id)
            if items:
                decky.logger.info(f"Found {len(items)} wishlist items")
                return items

        decky.logger.error(
            "All wishlist fetch strategies failed. "
            "Ensure your Steam wishlist privacy is set to Public."
        )
        return []

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