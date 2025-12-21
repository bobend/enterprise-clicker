from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))

        page.goto("http://localhost:8000")

        # Wait for game to load
        page.wait_for_selector("#game-ticker")

        # 1. Verify readable numbers (Buy Amount should start with x1)
        # Check text in #shop-controls
        controls = page.locator("#shop-controls")
        # Wait for controls to be populated
        try:
            expect(controls).to_contain_text("Buy Amount")
        except:
             print("Waiting for Buy Amount text timed out.")

        print(f"Shop controls: {controls.inner_text()}")

        # 2. Verify Buy Max button exists
        # Click the MAX button
        try:
            page.get_by_role("button", name="MAX").click(timeout=5000)
            print("Clicked MAX button")
        except Exception as e:
            print(f"Could not click MAX button: {e}")
            # print html
            print(page.content())

        # Check if shop buttons update to reflect MAX logic
        # Since we have $0, cost should show cost of 1 but amount x1?
        # Logic says: if maxAffordable is 0, displayAmount is 1.

        # 3. Verify Micromanagement hidden (Intern level)
        micro = page.locator("#micromanagement-container")
        if micro.is_visible():
            print("Micromanagement visible (Unexpected for new game)")
        else:
            print("Micromanagement hidden (Correct)")

        # 4. Verify Executive Lounge Styling
        # We added !important to style.css. Let's take a screenshot.

        # Scroll to bottom
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        page.screenshot(path="verification/game_screen.png")
        print("Screenshot saved to verification/game_screen.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
