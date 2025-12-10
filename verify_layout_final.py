import time
from playwright.sync_api import Page, expect, sync_playwright

def verify_layout(page: Page):
    print("Navigating to verify-ui...")
    page.goto("http://localhost:3000/verify-ui")

    # Handle Onboarding if needed
    skip_btn = page.get_by_text("SKIP")
    if skip_btn.is_visible(timeout=3000):
        print("Skipping onboarding...")
        skip_btn.click()

    print("Waiting for map...")
    page.wait_for_selector(".leaflet-container", state="visible", timeout=30000)

    # 1. Check Default (All)
    print("Checking Default View...")
    # Target desktop sidebars specifically
    desktop_feed = page.locator("div.md\\:block").get_by_text("LIVE FEED")
    expect(desktop_feed).to_be_visible()

    desktop_list = page.locator("div.md\\:block").get_by_text("Hotspots")
    # HotspotList has a header "HOTSPOTS"
    desktop_list_header = page.locator("div.md\\:block").get_by_text("HOTSPOTS", exact=True)
    if not desktop_list_header.is_visible():
        # Maybe it's just "Hotspots" or inside a specific container
        # Let's check for a known hotspot name in the sidebar
        desktop_list_item = page.locator("div.md\\:block").get_by_text("Cyber Cafe Zero")
        expect(desktop_list_item).to_be_visible()
    else:
        expect(desktop_list_header).to_be_visible()

    page.screenshot(path="/home/jules/verification/layout_all.png")

    # 2. Switch to Map Only
    print("Switching to Map Only...")
    page.get_by_label("Filters").click()
    # Wait for drawer
    map_opt = page.get_by_text("Map Only")
    expect(map_opt).to_be_visible()
    map_opt.click()

    # Wait for transition
    time.sleep(1)

    # Verify
    print("Verifying Map Only...")
    # Check sidebar is hidden
    # Since we set w-0, it might still be visible but 0 width.
    # We can check the map width.
    map_box = page.locator(".leaflet-container").bounding_box()
    width = page.viewport_size['width']
    print(f"Map Width: {map_box['width']} / {width}")

    assert map_box['width'] > width * 0.95, f"Map should be full width (approx {width}), got {map_box['width']}"

    page.screenshot(path="/home/jules/verification/layout_map_only.png")

    # 3. Reload and Switch to Feed
    print("Reloading...")
    page.reload()

    skip_btn = page.get_by_text("SKIP")
    if skip_btn.is_visible(timeout=3000):
         skip_btn.click()

    page.wait_for_selector(".leaflet-container", state="visible", timeout=30000)

    print("Switching to Feed View...")
    page.get_by_label("Filters").click()
    feed_opt = page.get_by_text("Feed", exact=True)
    expect(feed_opt).to_be_visible()
    feed_opt.click()

    time.sleep(1)

    print("Verifying Feed View...")
    # Verify Feed is visible
    expect(desktop_feed).to_be_visible()

    # Verify Map is visible (implied by width check)
    map_box = page.locator(".leaflet-container").bounding_box()
    print(f"Map Width: {map_box['width']} / {width}")

    # Feed sidebar is usually 25% (lg) or 280px (md).
    # If lg (1280px), 25% is 320px. Map should be 75% = 960px.
    # Allow some margin.
    assert map_box['width'] > width * 0.70, f"Map too narrow: {map_box['width']}"
    assert map_box['width'] < width * 0.85, f"Map too wide: {map_box['width']}"

    page.screenshot(path="/home/jules/verification/layout_feed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        # Set localStorage
        context.add_init_script("window.localStorage.setItem('onboarding-complete', 'true');")

        page = context.new_page()
        try:
            verify_layout(page)
            print("SUCCESS")
        except Exception as e:
            print(f"FAILED: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
        finally:
            browser.close()
