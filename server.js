const express = require('express');
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve all static files from "public" directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Home route → load landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing_page.html"));
});

// ✅ Explicit route (optional) to load login page
app.get("/common_login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "common_login.html"));
});

// ✅ Read user data
async function readUsers(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading user file:", err);
    return [];
  }
}

// ✅ Login POST handler
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const customers = await readUsers(path.join(__dirname, "customers.json"));
  const vendors = await readUsers(path.join(__dirname, "vendors.json"));

  const customer = customers.find(
    (c) => c.email === email && c.password === password
  );

  if (customer) {
    return res.json({
      success: true,
      role: "customer",
      redirectTo: "/customer_dashboard.html",
    });
  }

  const vendor = vendors.find(
    (v) => v.email === email && v.password === password
  );

  if (vendor) {
    return res.json({
      success: true,
      role: "vendor",
      redirectTo: "/vendor_dashboard.html",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
