import decky
import aiohttp
import asyncio

class Plugin:
    """
    Demo Finder - checks Steam wishlist items for available demos.
    Uses the Steam Store API to fetch app details and identify linked demos.
    """

    async def get_steam_id(self) -> str:
        """
        Retrieve the current user's Steam ID from the Decky environment.
        The frontend will pass this in, but we can also try to read it from Steam files.
        """
        # This will be called from the frontend which has access to the SteamID
        return ""

    async def get_wishlist(self, steam_id: str) -> list:
        """
        Fetch the user's public wishlist from the Steam API.
        Returns a list of { appid, name } objects.
        """
        decky.logger.info(f"Fetching wishlist for Steam ID: {steam_id}")
        wishlist_url = f"https://store.steampowered.com/wishlist/profiles/{steam_id}/wishlistdata/?p=0&v=2"
        all_items = []
        page = 0

        try:
            async with aiohttp.ClientSession() as session:
                while True:
                    url = f"https://store.steampowered.com/wishlist/profiles/{steam_id}/wishlistdata/?p={page}&v=2"
                    async with session.get(url) as resp:
                        if resp.status != 200:
                            decky.logger.error(f"Wishlist API returned status {resp.status}")
                            break
                        
                        data = await resp.json(content_type=None)
                        
                        # Steam returns an empty array or object when no more pages
                        if not data or (isinstance(data, list) and len(data) == 0):
                            break
                        
                        # v2 returns a dict keyed by appid
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

                        # Safety: Steam wishlist pages usually have ~100 items
                        if page > 20:
                            break

        except Exception as e:
            decky.logger.error(f"Error fetching wishlist: {e}")

        decky.logger.info(f"Found {len(all_items)} wishlist items")
        return all_items

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