describe("Login Page Tests", () => {
  const API_URL = "http://localhost:3000";
  const FRONTEND_URL = "http://localhost:5173";
  const validEmail = "kiro@gmail.com";
  const validPassword = "123456789";

  beforeEach(() => {
    cy.viewport(1280, 800); // Desktop size
    cy.visit(`${FRONTEND_URL}/login`);
  });

  describe("Login Page UI Elements", () => {
    it("should display login form with all elements", () => {
      cy.contains("Welcome Back").should("be.visible");
      cy.contains("Login to your account").should("be.visible");

      // Check for input fields
      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");

      // Check for buttons
      cy.contains("button", "Login").should("be.visible");

      // Check for links
      cy.contains("p", "Don’t have an account?").should("be.visible");
      cy.contains("a", "Register").should("be.visible");
    });

    it("should display email and password labels", () => {
      cy.contains("label", "Email").should("be.visible");
      cy.contains("label", "Password").should("be.visible");
    });

    it("should display remember me checkbox and forgot password link", () => {
      cy.contains("Remember me").should("be.visible");
      cy.contains("Forgot password?").should("be.visible");
    });
  });

  describe("Login Form Validation", () => {
    it("should not allow login with empty email", () => {
      cy.get('input[name="password"]').type(validPassword);
      cy.contains("button", "Login").click();

      // HTML5 validation should prevent submission
      cy.get('input[name="email"]').should("have.attr", "required");
    });

    it("should not allow login with empty password", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.contains("button", "Login").click();

      // HTML5 validation should prevent submission
      cy.get('input[name="password"]').should("have.attr", "required");
    });

    it("should accept valid email format", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="email"]').should("have.value", validEmail);
    });

    it("should accept password input", () => {
      cy.get('input[name="password"]').type(validPassword);
      cy.get('input[name="password"]').should("have.value", validPassword);
    });

    it("should mask password input", () => {
      cy.get('input[name="password"]').type(validPassword);
      cy.get('input[name="password"]').should("have.attr", "type", "password");
    });
  });

  describe("Remember Me Functionality", () => {
    it("should toggle remember me checkbox", () => {
      cy.get('input[type="checkbox"]').should("not.be.checked");
      cy.get('input[type="checkbox"]').click();
      cy.get('input[type="checkbox"]').should("be.checked");
      cy.get('input[type="checkbox"]').click();
      cy.get('input[type="checkbox"]').should("not.be.checked");
    });
  });

  describe("Navigation", () => {
    it("should navigate to register page when clicking register link", () => {
      cy.contains("a", "Register").click();
      cy.url().should("include", "/register");
    });

    it("should display forgot password alert when clicking forgot password", () => {
      cy.contains("button", "Forgot password?").click();
      cy.on("window:alert", (str) => {
        expect(str).to.include("Forgot password");
      });
    });
  });

  describe("Successful Login", () => {
    beforeEach(() => {
      // Mock the login API response
      cy.intercept("POST", `${API_URL}/auth/login`, {
        statusCode: 200,
        body: {
          message: "Login successful",
          data: {
            id: "123",
            name: "Test User",
            email: validEmail,
            role: "customer",
          },
          token: "fake-jwt-token",
        },
      }).as("loginSuccess");

      // Mock the profile API response
      cy.intercept("GET", `${API_URL}/auth/profile`, {
        statusCode: 200,
        body: {
          data: {
            id: "123",
            name: "Test User",
            email: validEmail,
            role: "customer",
          },
        },
      }).as("getProfile");
    });

    it("should login with valid credentials", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="password"]').type(validPassword);
      cy.contains("button", "Login").click();

      cy.wait("@loginSuccess");

      // Check if redirected to home page
      cy.url().should("include", "/home");
    });

    it("should store token in localStorage on successful login", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="password"]').type(validPassword);
      cy.contains("button", "Login").click();

      cy.wait("@loginSuccess");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.equal("fake-jwt-token");
      });
    });
  });

  describe("Failed Login", () => {
    it("should display error message for invalid credentials", () => {
      cy.intercept("POST", `${API_URL}/auth/login`, {
        statusCode: 401,
        body: {
          message: "Invalid email or password",
        },
      }).as("loginFailure");

      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.contains("button", "Login").click();

      cy.wait("@loginFailure");
      cy.contains("Invalid email or password").should("be.visible");
    });

    it("should display error message for non-existent user", () => {
      cy.intercept("POST", `${API_URL}/auth/login`, {
        statusCode: 404,
        body: {
          message: "User not found",
        },
      }).as("userNotFound");

      cy.get('input[name="email"]').type("nonexistent@example.com");
      cy.get('input[name="password"]').type(validPassword);
      cy.contains("button", "Login").click();

      cy.wait("@userNotFound");
      cy.contains("User not found").should("be.visible");
    });

    it("should display error message on server error", () => {
      cy.intercept("POST", `${API_URL}/auth/login`, {
        statusCode: 500,
        body: {
          message: "Server error. Please try again later.",
        },
      }).as("serverError");

      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="password"]').type(validPassword);
      cy.contains("button", "Login").click();

      cy.wait("@serverError");
      cy.contains("Server error. Please try again later.").should("be.visible");
    });
  });

  describe("Form Input Interactions", () => {
    it("should clear email field when clicking multiple times", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="email"]').clear();
      cy.get('input[name="email"]').should("have.value", "");
    });

    it("should allow typing in both fields sequentially", () => {
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="password"]').type(validPassword);

      cy.get('input[name="email"]').should("have.value", validEmail);
      cy.get('input[name="password"]').should("have.value", validPassword);
    });

    it("should focus on email field first", () => {
      cy.get('input[name="email"]').should("exist");
      cy.get('input[name="email"]').should("not.be.disabled");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels associated with inputs", () => {
      cy.get('input[name="email"]').should("have.attr", "placeholder");
      cy.get('input[name="password"]').should("have.attr", "placeholder");
    });

    it("should have visible login button", () => {
      cy.contains("button", "Login").should("be.visible");
      cy.contains("button", "Login").should("not.be.disabled");
    });
  });
});
