/**
 * DROP-IN replacement for Modules/tenant.js (or routes/tenant.js)
 * Ensures /tenant only returns THE authenticated user's tenant.
 */

const express = require("express");
const router = express.Router();
const db = require("../db/pool");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant context missing",
      });
    }

    const [rows] = await db.query(
      `SELECT *
       FROM tenants
       WHERE id = ?
         AND is_active = 1
       LIMIT 1`,
      [tenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GET Tenant Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch tenant",
    });
  }
});

module.exports = router;
