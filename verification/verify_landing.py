from playwright.sync_api import sync_playwright

def verify_landing_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to verify responsive design
        context = browser.new_context(viewport={"width": 390, "height": 844}) # iPhone 12 Pro dimensions
        page = context.new_page()

        # Navigate to the landing page
        # Assuming the dev server is running on port 3000
        page.goto("http://localhost:3000")

        # Wait for the hero content to load (e.g., the H1 text)
        page.wait_for_selector("h1")

        # Take a full page screenshot
        page.screenshot(path="/home/jules/verification/landing_page_mobile.png", full_page=True)

        # Take a viewport screenshot for initial impact
        page.screenshot(path="/home/jules/verification/landing_page_mobile_viewport.png")

        browser.close()

if __name__ == "__main__":
    verify_landing_page()
