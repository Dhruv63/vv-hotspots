from playwright.sync_api import sync_playwright, expect
import time

def verify_map_config():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the verification page
        url = "http://localhost:3000/verify-map"
        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for map container to be visible
        # The container has an ID starting with map-container-
        # We can look for the class or just the Leaflet container

        # Check if the map wrapper div has style filter: none (default theme is cyberpunk)
        # We need to target the div that has the style prop.
        # In MapView, it is the root div with class 'relative w-full h-full...'

        map_wrapper = page.locator("div.relative.w-full.h-full.bg-muted.z-0")
        expect(map_wrapper).to_be_visible()

        # Check the style attribute
        style = map_wrapper.get_attribute("style")
        print(f"Map wrapper style: {style}")

        if "filter: none" in style:
            print("SUCCESS: Filter is none for default theme.")
        else:
            print(f"FAILURE: Unexpected filter style: {style}")

        # Take a screenshot
        page.screenshot(path="/home/jules/verification/map_verify.png")

        browser.close()

if __name__ == "__main__":
    verify_map_config()
