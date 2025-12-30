from playwright.sync_api import sync_playwright

def verify_landing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop
        page_desktop = browser.new_page(viewport={"width": 1280, "height": 800})
        page_desktop.goto("http://localhost:3000")
        page_desktop.wait_for_load_state("networkidle")
        page_desktop.screenshot(path="verification/landing_desktop.png")
        print("Desktop screenshot taken.")

        # Mobile
        page_mobile = browser.new_page(viewport={"width": 375, "height": 812})
        page_mobile.goto("http://localhost:3000")
        page_mobile.wait_for_load_state("networkidle")
        page_mobile.screenshot(path="verification/landing_mobile.png")
        print("Mobile screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_landing()
