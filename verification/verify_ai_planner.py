from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to AI Planner...")
    # Retry logic for startup
    for i in range(10):
        try:
            page.goto("http://localhost:3000/ai-planner", timeout=5000)
            break
        except Exception as e:
            print(f"Attempt {i+1} failed: {e}")
            time.sleep(2)

    try:
        page.wait_for_selector("h1:has-text('AI Day Planner')", timeout=30000)

        # Take screenshot of initial state
        page.screenshot(path="verification/ai_planner_initial.png")
        print("Initial screenshot taken")

        # Fill form
        page.fill("input[type='number']", "4")
        page.select_option("select", "Solo")
        page.fill("input[placeholder*='Vasai Railway Station']", "Virar Station")

        # Click generate
        page.click("button:has-text('Generate Itinerary')")

        # Wait for results (2s delay + buffer)
        page.wait_for_timeout(3000)
        page.wait_for_selector("h2:has-text('Your Itinerary')")

        # Take screenshot of results
        page.screenshot(path="verification/ai_planner_results.png")
        print("Results screenshot taken")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
