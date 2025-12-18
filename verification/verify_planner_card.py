from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to page...")
            # Go to the verification page
            page.goto("http://localhost:3000/verify-planner-card", timeout=60000)

            print("Waiting for selector...")
            # Wait for content to load
            page.wait_for_selector("text=AI Day Planner", timeout=30000)

            # Wait a bit for fonts/gradients
            time.sleep(2)

            # Take screenshot of the sidebar/card
            page.screenshot(path="verification/verification.png")
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
