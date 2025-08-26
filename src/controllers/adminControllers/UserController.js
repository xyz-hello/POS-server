import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../../models/index.js"; // adjust path to your Sequelize models
import { SUCCESS, ERROR, VALIDATION_MESSAGES } from "../../constant/constants.js";

// Validation regexes
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,14}$/;

// Role mapping
const roleMap = {
  SuperAdmin: 0,
  Admin: 1,
  Cashier: 2,
  Baker: 3,
};

// ===================
// Public Routes
// ===================

// Check if username exists
export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: "Username is required" });

  try {
    const user = await User.findOne({ where: { username } });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: ERROR.SERVER_ERROR });
  }
};

// Check if email exists
export const checkEmailAvailability = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ where: { email } });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================
// Protected Routes
// ===================

// Get all users
export const getUsers = async (req, res) => {
  try {
    const whereClause = { status: { [Op.ne]: "DELETED" } };

    if (req.user.user_type !== roleMap.SuperAdmin) {
      whereClause.customer_id = req.user.customer_id;
      whereClause.user_type = [roleMap.Cashier, roleMap.Baker];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "username", "email", "user_type", "status", "customer_id"],
    });

    res.status(200).json({
      success: true,
      data: users.map((user) => ({
        ...user.toJSON(),
        role: Object.keys(roleMap).find((key) => roleMap[key] === user.user_type) || "Unknown",
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password)
      return res.status(400).json({ message: "Missing required fields." });

    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email." });

    if (!passwordRegex.test(password))
      return res.status(400).json({
        message: "Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.",
      });

    const user_type = roleMap[role];
    if (user_type === undefined) return res.status(400).json({ message: "Invalid role." });

    // Check if username/email exists
    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existing) return res.status(409).json({ message: "Username or email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      user_type,
      password: hashedPassword,
      status: "ACTIVE",
      customer_id: req.user.customer_id || null,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user." });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const { username, email, role, password } = req.body;

    const targetUser = await User.findByPk(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    if (req.user.user_type !== roleMap.SuperAdmin && targetUser.customer_id !== req.user.customer_id)
      return res.status(403).json({ message: "Unauthorized to update this user." });

    if (!username || !email || !role)
      return res.status(400).json({ message: "Missing required fields." });

    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email." });

    const user_type = roleMap[role];
    if (user_type === undefined) return res.status(400).json({ message: "Invalid role." });

    const conflict = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
        id: { [Op.ne]: userId },
      },
    });
    if (conflict) return res.status(409).json({ message: "Username or email already in use." });

    if (password) {
      if (!passwordRegex.test(password))
        return res.status(400).json({
          message: "Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.",
        });
      targetUser.password = await bcrypt.hash(password, 10);
    }

    targetUser.username = username;
    targetUser.email = email;
    targetUser.user_type = user_type;

    await targetUser.save();

    res.json({ message: "User updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user." });
  }
};

// Soft delete user
export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const targetUser = await User.findByPk(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    if (req.user.user_type !== roleMap.SuperAdmin && targetUser.customer_id !== req.user.customer_id)
      return res.status(403).json({ message: "Unauthorized to delete this user." });

    targetUser.status = "DELETED";
    await targetUser.save();

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user." });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required." });

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.status = status;
    await user.save();

    res.status(200).json({ message: "User status updated successfully.", userId: id, status });
  } catch (error) {
    res.status(500).json({ message: "Internal server error while updating status." });
  }
};
