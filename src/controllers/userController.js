const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'username is required' });
    }

    const user = await userService.createUser(username);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register };
