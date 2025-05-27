// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ROUTES
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/orders", require("./routes/orderRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/stats", require("./routes/statsRoutes"));
// app.use("/api/notifications", require("./routes/notificationRoutes"));
// app.use("/api/activity", require("./routes/activityRoutes"));

// // MONGODB CONNECTION
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     app.listen(5000, () =>
//       console.log("Server running on http://localhost:5000")
//     );
//   })
//   .catch((err) => console.error(err));



const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));

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
