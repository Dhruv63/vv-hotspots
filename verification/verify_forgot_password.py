from playwright.sync_api import sync_playwright

def verify_forgot_password():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the forgot password page
        print("Navigating to /forgot-password...")
        page.goto("http://localhost:3000/forgot-password")

        # Wait for the heading to be visible
        page.wait_for_selector("h1:has-text('RESET PASSWORD')")
        print("Page loaded.")

        # Take a screenshot of the initial state
        page.screenshot(path="verification/forgot_password_initial.png")
        print("Initial screenshot taken.")

        # Fill in the email
        page.fill("input[type='email']", "test@example.com")

        # Click the submit button
        page.click("button[type='submit']")

        # Wait for loading state (button disabled or spinner)
        # The button text changes to "Sending Link..."
        page.wait_for_selector("button:has-text('Sending Link...')")
        print("Form submitted, loading state visible.")

        # Take a screenshot of the loading state
        page.screenshot(path="verification/forgot_password_loading.png")

        # Since we don't have a real backend, it might eventually fail or succeed depending on Supabase mock/config.
        # We can wait a bit to see if an error appears (since likely invalid credentials/config locally)
        try:
            # Wait for error message or success
            page.wait_for_selector(".text-destructive", timeout=5000)
            print("Error message appeared.")
            page.screenshot(path="verification/forgot_password_error.png")
        except:
            print("No error appeared within timeout (or success happened).")
            page.screenshot(path="verification/forgot_password_result.png")

        browser.close()

if __name__ == "__main__":
    verify_forgot_password()
