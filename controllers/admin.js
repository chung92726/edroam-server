import User from '../models/user'

export const currentAdmin = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (!user.role.includes('Admin')) {
      return res.status(403).send('Unauthorized')
    } else {
      res.json({ ok: true })
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }
}
