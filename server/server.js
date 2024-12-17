// server/server.js
const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./bagsociety-firebase-adminsdk-gy00r-497e191bf3.json"); // Replace with the correct path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();  // Use admin.firestore() instead of getFirestore()

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API Server");
});
app.post("/delete-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Step 1: Delete Firestore documents
    await db.collection("users").doc(email).delete();  // Correct method to delete a document
    await db.collection("userCart").doc(email).delete();  // Correct method to delete a document
    console.log(`Firestore documents for ${email} deleted.`);

    // Step 2: Get the user from Firebase Auth and delete
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`Firebase Authentication user ${email} deleted.`);

    res.status(200).json({ message: `User ${email} deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
