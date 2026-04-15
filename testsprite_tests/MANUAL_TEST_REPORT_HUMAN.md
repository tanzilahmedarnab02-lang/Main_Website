# Parlour Website Manual Test Report (Human-Friendly)

Date: 2026-04-15  
Environment: Local production preview (`http://localhost:3000`)  
Execution mode: Manual local run (TestSprite credit ছাড়া)  
Source tests: `testsprite_tests/TC*.py`

---

## 1) Quick Summary

- Total executed tests: **30**
- Passed: **3**
- Failed: **27**
- Timeout: **0**
- Important gap: `TC031` থেকে `TC041` পর্যন্ত test files নেই, তাই full 41 coverage এখনো হয়নি।

**এই মুহূর্তে overall status:** Core flow গুলো unstable, selectors brittle, কিছু test script syntax broken, এবং current assertions app-এর actual UI text এর সাথে mismatch করছে।

---

## 2) What Passed (Working Areas)

নিচের flow গুলো successful execute হয়েছে:

1. `TC013_View_hero_content_after_intro_completes.py`  
   - Hero content render হচ্ছে।

2. `TC020_Navigate_to_studio_work_section_from_drawer.py`  
   - Navigation drawer থেকে Studio section এ যাওয়া কাজ করছে।

3. `TC027_Open_and_close_the_See_All_Works_modal_via_close_control.py`  
   - Works modal open/close flow কাজ করছে।

---

## 3) What Failed (And Why)

### A) Major blocker: Locator timeout (Most failures)

অনেক test (`TC001`, `TC002`, `TC003`, `TC005`, `TC006`, `TC007`, `TC008`, `TC009`, `TC011`, `TC012`, `TC014`, `TC015`, `TC016`, `TC019`)  
একই pattern এ fail করেছে:

- Error type: `playwright._impl._errors.TimeoutError: Locator.click`
- Wait ছিল 5000ms, কিন্তু target element পাওয়া যায়নি।
- Tests absolute XPath use করেছে (`/html/body/...`) যা UI change হলেই ভেঙে যায়।

**Practical meaning:** App necessarily broken না-ও হতে পারে; tests fragile হওয়ায় element ধরতে পারছে না।

---

### B) Test script syntax errors (Immediate fix needed)

এই test file গুলো runnable-ই না:

- `TC023_Reserve_CTA_content_is_visible.py` (syntax error: trailing comma/assert format)
- `TC024_Services_catalog_content_renders_from_Supabase_and_remains_available_after_navigation_within_page.py` (syntax error)
- `TC028_View_about_section_dynamic_content.py` (syntax error: unmatched bracket)

**Practical meaning:** এগুলো app validation করে না; আগে script fix করতে হবে।

---

### C) Assertion/text mismatch failures

কিছু tests run হয়েছে কিন্তু expected text/app state মেলেনি:

- `TC017` (expected “Name is required” not found)
- `TC018` (expected booking form visibility assertion failed)
- `TC021` (expected “Main Site Content” assertion failed)
- `TC022` (expected “No services selected” assertion failed)
- `TC025` (expected footer “Contact” assertion failed)
- `TC026` (expected hero “Get started” assertion failed)
- `TC029` (expected archive counter “4/4” assertion failed)
- `TC030` (expected “Welcome” assertion failed)

**Practical meaning:** কিছু assertion likely outdated বা exact UI copy/text এর সাথে sync না।

---

## 4) Priority-Based Fix Plan (What to fix first)

## P0 - Must do first

1. `TC023`, `TC024`, `TC028` syntax fix।
2. Common Playwright timeout increase:
   - `context.set_default_timeout(5000)` -> at least `15000` বা `20000`
3. Intro/animation complete হওয়ার reliable wait add করা।

## P1 - Stability improvements

1. Absolute XPath বাদ দিয়ে stable selectors ব্যবহার:
   - `get_by_role`, `get_by_text`, `data-testid` preferred
2. Reusable helper add:
   - `wait_for_intro_end()`
   - `open_booking_form()`
   - `select_service_by_name()`
3. Page-ready check:
   - network/DOM ready + key element visible before click

## P2 - Assertion quality

1. UI-এর real copy/text এর সাথে assertions sync করা।
2. Exact string assertions এর বদলে semantic/partial validation।
3. Booking flow এ confirmation detection robust করা (heading + summary card + service list)।

---

## 5) Current Business Impact

- Booking-related automation largely unreliable right now.
- Regression testing trust কমে যাচ্ছে, কারণ অনেক fail app issue না হয়ে test fragility থেকে আসছে।
- Full release confidence এর জন্য test stabilization জরুরি।

---

## 6) Recommended Next Action (Practical)

1. First pass: সব failing tests না ছুঁয়ে কেবল framework-level stabilization patch দাও  
   (timeouts + helper waits + selector strategy)।
2. Second pass: syntax-broken + top booking tests (`TC001`, `TC002`, `TC003`, `TC007`, `TC015`) ঠিক করো।
3. Third pass: missing `TC031-TC041` তৈরি করে full suite complete করো।
4. তারপর clean rerun করে final release-grade report বের করো।

---

## 7) Artifact References

- Raw manual result JSON: `testsprite_tests/manual_test_results.json`
- Manual runner script: `testsprite_tests/manual_run_all.py`
- Individual test files: `testsprite_tests/TC*.py`

