import User from "../models/user"
const stripe = require("stripe")(process.env.STRIPE_SECRET)

export const currentAdmin = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select("-password").exec()
    if (!user.role.includes("Admin")) {
      return res.status(403).send("Unauthorized")
    } else {
      res.json({ ok: true })
    }
  } catch (err) {
    return res.status(403).send("Unauthorized")
  }
}

export const AllTransactions = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).select("-password").exec()
    if (!user.role.includes("Admin")) {
      return res.status(403).send("Unauthorized")
    }
  } catch (err) {
    return res.status(403).send("Unauthorized")
  }

  try {
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 100,
    })
    // console.log(balanceTransactions)
    while (balanceTransactions.has_more) {
      console.log("has more")
      const more = await stripe.balanceTransactions.list({
        limit: 100,
        starting_after:
          balanceTransactions.data[balanceTransactions.data.length - 1].id,
      })
      balanceTransactions.data.push(...more.data)
      balanceTransactions.has_more = more.has_more
    }
    // console.log(balanceTransactions.data)
    const filtered = balanceTransactions.data.filter((item) => {
      // console.log(item.reporting_category)
      return item.reporting_category == "platform_earning"
    })
    res.json(filtered)
  } catch (err) {
    console.log(err)
  }
}

export const approveIntructor = async (req, res) => {
  // console.log(req.auth)
  try {
    const updatedUser = User.findOneAndUpdate(
      { _id: req.auth._id, role: "Pending" }, // Specify the user ID and current role
      { $set: { role: "Instructor" } }, // Set the new role
      { new: true }
    ).select("-password")

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found or role is not pending" })
    }

    res.json(updatedUser)
  } catch (err) {
    res.status(500).json({ message: "Error occurred while updating user role" })
  }
}
