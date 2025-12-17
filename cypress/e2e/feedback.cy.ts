// cypress/e2e/feedback.e2e.cy.ts

describe("Restaurant Feedback - Full Stack", () => {
  const testMessage = `Amazing food ${Date.now()}`;
  const testRating = 5;

  beforeEach(() => {
    // Log in via backend API to get authentication cookie
    cy.request({
      method: "POST",
      url: "http://localhost:3000/auth/login", // backend login route
      body: {
        email: "ramezmilad19@gmail.com", 
        password: "mm112233",   
      },
    });

    // Visit the homepage
    cy.visit("http://localhost:5173"); // frontend URL
  });

  it("allows user to add a restaurant feedback", () => {
    // Open the review form
    cy.contains("📝 Add Your Review").click();

    // Type the review message
    cy.get("section#recent-feedback textarea")
      .type(testMessage);

    // Click the rating star reliably
    cy.get("section#recent-feedback div.flex.justify-center.mb-4 svg")
      .eq(testRating - 1)
      .click({ force: true }); // force click in case React isn't detecting hover

    // Intercept POST request to backend
    cy.intercept("POST", "http://localhost:3000/feedback/addRestaurantFeedback").as("addFeedback");

    // Submit the review
    cy.contains("Submit Review").click();

    // Wait for backend response and assert
    cy.wait("@addFeedback").then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.response?.body.message).to.eq(testMessage);
      expect(interception.response?.body.rating).to.eq(testRating);
    });

    // Assert that the feedback appears on the page
    cy.contains(testMessage).should("be.visible");
  });
});
