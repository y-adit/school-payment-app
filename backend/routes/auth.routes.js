const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth.controller');
router.get('/test', (req, res) => {
  res.json({ message: "Auth routes working" });
});
router.post('/register', registerUser); // Use this to create a user initially
router.post('/login', loginUser);
module.exports = router;