import { expect, test } from "@playwright/test";

test.describe("Customer Profile Page Tests", () => {
  const mockUserId = "12345"; // Mock user ID for testing

  // Mock API responses before each test
  test.beforeEach(async ({ page }) => {
    // Mock API response for user details
    await page.route(
      `**/api/user/get-user-by-id/${mockUserId}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            name: "Nirajan Mahato",
            email: "nirajanmahato@gmail.com",
            avatar: null,
            address: "Kathmandu",
            createdAt: "2023-01-01T00:00:00.000Z",
          }),
        });
      }
    );

    // Mock API response for user books
    await page.route(`**/api/books/user/${mockUserId}`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          books: [
            { title: "Learn React", author: "Chai aur code Developer" },
            { title: "Mastering Node.js", author: "Appna college Backend" },
          ],
        }),
      });
    });

    // Navigate to the customer profile page
    await page.goto(`/customerprofile/${mockUserId}`);
  });

  //  Test: Verify user profile data is displayed correctly
  test("Should display user profile details", async ({ page }) => {
    await expect(page.locator("text=Nirajan Mahato")).toBeVisible();
    await expect(page.locator("text=nirajanmahato@gmail.com")).toBeVisible();
    await expect(page.locator("text=Kathmandu")).toBeVisible();
    await expect(page.locator("text=Member since: Jan 1, 2023")).toBeVisible();
  });

  //  Test: Display user's books
  test("Should display books associated with the user", async ({ page }) => {
    await expect(page.locator("text=Learn React")).toBeVisible();
    await expect(page.locator("text=Mastering Node.js")).toBeVisible();
  });

  //  Test: Show loading state while fetching data
  test("Should display a loading state", async ({ page }) => {
    // Simulate slow API response for testing loading screen
    await page.route(
      `**/api/user/get-user-by-id/${mockUserId}`,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            name: "Nirajan Mahato",
            email: "nirajanmahato@gmail.com",
          }),
        });
      }
    );

    await page.goto(`/customerprofile/${mockUserId}`);
    await expect(page.locator("text=Loading...")).toBeVisible();
  });

  //  Test: Display error message if user data fetch fails
  test("Should display error message on fetch failure", async ({ page }) => {
    // Simulate API failure
    await page.route(
      `**/api/user/get-user-by-id/${mockUserId}`,
      async (route) => {
        await route.abort();
      }
    );

    await page.goto(`/customerprofile/${mockUserId}`);
    await expect(
      page.locator("text=Failed to fetch user details.")
    ).toBeVisible();
  });

  //  Test: Block user button should be visible
  test("Should display Block User button", async ({ page }) => {
    await expect(
      page.locator("button", { hasText: "Block user" })
    ).toBeVisible();
  });
});
