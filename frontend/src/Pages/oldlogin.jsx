// THIS FILE IS DEPRECATED - DO NOT USE
import { useState } from "react";

const API = "http://localhost:3000/auth"; // your backend URL

function LOGIN() {
  const [token, setToken] = useState("");

  // REGISTER
  const register = async (e) => {
    e.preventDefault();
    const body = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      phone: e.target.phone.value,
    };

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  };

  // LOGIN
  const login = async (e) => {
    e.preventDefault();
    const body = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.token) setToken(data.token);

    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Register</h2>
      <form onSubmit={register}>
        <input name="name" placeholder="Name" required />
        <input name="email" placeholder="Email" required />
        <input
          name="password"
          placeholder="Password"
          type="password"
          required
        />
        <input name="phone" placeholder="Phone (optional)" />
        <button type="submit">Register</button>
      </form>

      <hr />

      <h2>Login</h2>
      <form onSubmit={login}>
        <input name="email" placeholder="Email" required />
        <input
          name="password"
          placeholder="Password"
          type="password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {token && (
        <>
          <h3>JWT Token:</h3>
          <p
            style={{ wordBreak: "break-all", background: "#eee", padding: 10 }}
          >
            {token}
          </p>
        </>
      )}
    </div>
  );
}

export default oldLOGIN;
