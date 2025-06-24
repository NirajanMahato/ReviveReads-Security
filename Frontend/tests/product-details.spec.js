import { expect, test } from "@playwright/test";

test.describe("Product Details Page Tests", () => {
  const mockBookId = "book123";
  const mockSellerId = "seller123";

  // Mock API responses before each test
  test.beforeEach(async ({ page }) => {
    // Mock response for book details
    await page.route(
      `**/api/book/get-book-by-id/${mockBookId}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            title: "Mastering React",
            price: 500,
            condition: "New",
            genre: "Technology",
            description: "An advanced guide to mastering React.js.",
            images: ["image1.jpg", "image2.jpg"],
            createdAt: "2023-01-01T00:00:00.000Z",
            delivery: true,
            seller: {
              _id: mockSellerId,
              name: "Nirajan Mahato",
              email: "nirajanmahato@gmail.com",
              avatar: null,
              address: "Kathmandu",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
          }),
        });
      }
    );

    // Mock response for seller details
    await page.route(
      `**/api/user/get-user-by-id/${mockSellerId}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            name: "Nirajan Mahato",
            email: "nirajanmahato@gmail.com",
            address: "Kathmandu",
          }),
        });
      }
    );

    // Navigate to the product details page
    await page.goto(`/products/${mockBookId}`);
  });

  //  Test: Display book details correctly
  test("Should display book details", async ({ page }) => {
    await expect(page.locator("text=Mastering React")).toBeVisible();
    await expect(page.locator("text=रू. 500")).toBeVisible();
    await expect(page.locator("text=New")).toBeVisible();
    await expect(page.locator("text=Technology")).toBeVisible();
    await expect(
      page.locator("text=An advanced guide to mastering React.js.")
    ).toBeVisible();
  });

  //  Test: Seller details should be displayed correctly
  test("Should display seller information", async ({ page }) => {
    await expect(page.locator("text=Nirajan Mahato")).toBeVisible();
    await expect(page.locator("text=Kathmandu")).toBeVisible();
    await expect(page.locator("text=Member since: Jan 1, 2023")).toBeVisible();
  });

  //  Test: Book saving functionality
  test("Should save book when Save button is clicked", async ({ page }) => {
    await page.route("**/api/user/add-to-favorites", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ message: "Book saved successfully!" }),
      });
    });

    await page.click('button:has-text("Save")');
    await expect(page.locator("text=Book saved successfully!")).toBeVisible();
  });

  //  Test: Opening chat modal
  test("Should open chat modal on clicking Chat Now", async ({ page }) => {
    await page.click('button:has-text("Chat Now")');
    await expect(page.locator("text=Chat with Nirajan Mahato")).toBeVisible();
  });

  //  Test: Handle loading state
  test("Should show loading state initially", async ({ page }) => {
    await page.route(
      `**/api/book/get-book-by-id/${mockBookId}`,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            title: "Mastering React",
            price: 500,
          }),
        });
      }
    );

    await page.goto(`/products/${mockBookId}`);
    await expect(page.locator("text=Loading...")).toBeVisible();
  });

  //  Test: Handle error state
  test("Should display an error message when product details fail to load", async ({
    page,
  }) => {
    await page.route(
      `**/api/book/get-book-by-id/${mockBookId}`,
      async (route) => {
        await route.abort();
      }
    );

    await page.goto(`/products/${mockBookId}`);
    await expect(
      page.locator("text=Error loading product details.")
    ).toBeVisible();
  });

  //  Test: Image switch on thumbnail click
  test("Should change main image on thumbnail click", async ({ page }) => {
    await page.click(`img[alt="Book Image 2"]`);
    const mainImage = page.locator('img[alt="book"]');
    await expect(mainImage).toHaveAttribute(
      "src",
      `/api/uploads/books/image2.jpg`
    );
  });
});
