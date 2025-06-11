const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'https://c3kanban.netlify.app',
    /\.netlify\.app$/,
    /\.onrender\.com$/
  ]
}));


// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/license", require("./routes/licenseRoutes"));

// MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
