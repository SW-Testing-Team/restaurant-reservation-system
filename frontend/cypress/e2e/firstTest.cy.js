describe("Desktop view test", () => {
  beforeEach(() => {
    cy.viewport(1280, 800); // Desktop size
  });

  it("shows desktop layout", () => {
    cy.visit("http://localhost:5173");
    cy.contains("button", "Login").click();
  });
});
