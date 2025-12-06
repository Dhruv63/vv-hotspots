from playwright.sync_api import sync_playwright, expect
import time

def test_photo_gallery(page):
    print("Navigating to page...")
    try:
        page.goto("http://localhost:3000/test-photo-gallery", timeout=60000)
    except Exception as e:
        print(f"Navigation failed: {e}")
        return

    print("Checking for title...")
    expect(page.get_by_text("Test Photo Gallery")).to_be_visible(timeout=30000)

    print("Checking for empty state text...")
    expect(page.get_by_text("No photos yet")).to_be_visible()

    print("Checking for upload button...")
    # The button text depends on my code.
    # "Upload Photo (+20 points)"
    expect(page.get_by_role("button", name="Upload Photo")).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/upload_button.png")
    print("Done.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_photo_gallery(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
