import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000")
        
        # -> Click the floating 'Book Appointment' button to open the booking form.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'ADD SERVICES' button to open the services panel so we can choose at least one service.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[5]/div/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Services panel (click ADD SERVICES), select a service (Acrylic Nails), fill contact fields (Name, Email, Phone), fill a valid date (20-04-2026), then submit the booking and verify the confirmation ticket shows contact details, selected services, and total investment.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[5]/div/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[5]/div/div[2]/div/div[2]/div/div/div/div[2]/div/span').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Client E')
        
        # -> Fill the Email and Phone fields, set the date to 20-04-2026 (DD=20, MM=04, YYYY=2026), then submit the booking by clicking the booking button and verify the confirmation ticket shows contact details, chosen service(s), and total investment.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('client.e@example.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('+1 555 0105')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[4]/div/div/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('20')
        
        # -> Fill MM = '04' and YYYY = '2026', then submit the booking and verify the confirmation ticket displays contact details, selected services, and total investment.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[4]/div/div/div/input[2]').nth(0)
        await asyncio.sleep(3); await elem.fill('04')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/section[6]/div/div[2]/div[2]/div[4]/div/div/div/input[3]').nth(0)
        await asyncio.sleep(3); await elem.fill('2026')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/section[5]/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Acrylic Nails')]").nth(0).is_visible(), "The confirmation ticket should display the selected services, booking contact details, and a total investment summary after submitting the booking."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    