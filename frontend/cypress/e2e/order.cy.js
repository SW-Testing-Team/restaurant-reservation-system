describe("Place Order Successfully", () => {
  const API_URL = "http://localhost:3000";
  const FRONTEND_URL = "http://localhost:5173";
  const validEmail = "kiro@gmail.com";
  const validPassword = "123456789";

  beforeEach(() => {
    // Log in via backend API to get authentication cookie
    cy.viewport(1280, 800);
    cy.request({
      method: "POST",
      url: "http://localhost:3000/auth/login", // backend login route
      body: {
        email: validEmail,
        password: validPassword,
      },
    });

    // Visit the homepage
    cy.visit("http://localhost:5173"); // frontend URL
  });

  it("should place a takeaway order successfully", () => {
    // Add item to cart
    cy.get("button").contains("Order Now").first().click();
    //cy.wait(2000);

    // Select takeaway
    cy.contains("button", "Takeaway").click();

    cy.get('img[alt="coca cola"]').click();
    // cy.get(
    //   '"w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"'
    // ).click();
    cy.contains("button", "Add to Cart").click();

    // Open cart
    //cy.get("button svg[class*='ShoppingCart']").click({ force: true });
    cy.get('[data-cy="cart-btn"]').click();
    //cy.wait(2000);

    cy.window().then((win) => {
      cy.stub(win.console, "log").as("consoleLog");
    });

    // Place order
    cy.contains("button", "Checkout").click();

    cy.get("@consoleLog").should("be.calledWith", "Order placed successfully!");

    // Success message should appear
    // cy.on("window:alert", (text) => {
    //   expect(text).to.match(
    //     /Order placed successfully!\s*Type:.*Total:\s*\$.*/
    //   );
    // });
  });
});
