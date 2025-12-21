from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load from localhost
        page.goto("http://localhost:8000/index.html")

        # Wait for the game to initialize (ensure js/main.js executes)
        # We can wait for a specific element that is populated by JS, e.g., shop-controls buttons
        page.wait_for_selector("#shop-controls button", timeout=5000)

        # 1. Verify Default Theme (Normal)
        body = page.locator("body")
        expect(body).not_to_have_class("theme-unsettling")
        expect(body).not_to_have_class("theme-eldritch")
        page.screenshot(path="verification/theme_normal.png")
        print("Captured theme_normal.png")

        # 2. Verify 'unsettling' Theme (Job Level 6)
        # Check if window.gameState is available
        is_gamestate_available = page.evaluate("typeof window.gameState !== 'undefined'")
        if not is_gamestate_available:
            print("Error: window.gameState is not available")
            browser.close()
            return

        page.evaluate("window.gameState.jobLevel = 6")
        # Wait for tick (1000ms) or until class changes
        # We can use expect to wait
        expect(body).to_have_class("theme-unsettling", timeout=2000)

        page.screenshot(path="verification/theme_unsettling.png")
        print("Captured theme_unsettling.png")

        # 3. Verify 'eldritch' Theme (Job Level 8)
        page.evaluate("window.gameState.jobLevel = 8")
        expect(body).to_have_class("theme-eldritch", timeout=2000)

        page.screenshot(path="verification/theme_eldritch.png")
        print("Captured theme_eldritch.png")

        browser.close()

if __name__ == "__main__":
    run()
