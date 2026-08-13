/**
 * Paste this into your main Express app file (e.g. src/app.js or index.js)
 * AFTER middleware (cors, json) and BEFORE the 404 handler.
 *
 * If any line is missing, the frontend will show "Route not found".
 */

const express = require("express");
const app = express();

// ... your existing cors, express.json(), firebase init ...

app.use("/auth", require("./routes/auth"));
app.use("/tenant", require("./Modules/tenant"));

app.use("/items", require("./Modules/items"));
app.use("/inventory", require("./Modules/inventory"));
app.use("/brands", require("./Modules/brands"));
app.use("/products", require("./Modules/products"));
app.use("/stocks", require("./Modules/stocks"));
app.use("/vendors", require("./Modules/vendors"));
app.use("/customers", require("./Modules/customers"));
app.use("/invoices", require("./Modules/invoices"));
app.use("/estimates", require("./Modules/estimates"));
app.use("/employees", require("./Modules/employees"));
app.use("/payroll", require("./Modules/payroll"));
app.use("/reports", require("./Modules/reports"));

// 404 — must be LAST
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
