const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    username = username.trim();
    email = email.trim().toLowerCase();

    const user = await userService.createUser({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    email = email.trim().toLowerCase();

    const user = await userService.login({ email, password });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
