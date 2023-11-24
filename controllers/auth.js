const bycrypt = require('brypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const Employee = require('../Database/employee')

export const employeeSignup = async (req, role, res) => {
  try {
    //Get employee from database with same name if any
    const validateEmployeename = async (name) => {
      let employee = await Employee.findOne({ name })
      return employee ? false : true
    }

    //Get employee from database with same email if any
    const validateEmail = async (email) => {
      let employee = await Employee.findOne({ email })
      return employee ? false : true
    }
    // Validate the name
    let nameNotTaken = await validateEmployeename(req.name)
    if (!nameNotTaken) {
      return res.status(400).json({
        message: `Employee name is already taken.`
      })
    }

    // validate the email
    let emailNotRegistered = await validateEmail(req.email)
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`
      })
    }

    // Hash password using bcrypt
    const password = await bcrypt.hash(req.password, 12)
    // create a new user
    const newEmployee = new Employee({
      ...req,
      password,
      role
    })

    await newEmployee.save()
    return res.status(201).json({
      message: 'Hurry! now you are successfully registred. Please nor login.'
    })
  } catch (err) {
    // Implement logger function if any
    return res.status(500).json({
      message: `${err.message}`
    })
  }
}

export const employeeLogin = async (req, role, res) => {
  let { name, password } = req

  // First Check if the user exist in the database
  const employee = await Employee.findOne({ name })
  if (!employee) {
    return res.status(404).json({
      message: 'Employee name is not found. Invalid login credentials.',
      success: false
    })
  }
  // We will check the if the employee is logging in via the route for his departemnt
  if (employee.role !== role) {
    return res.status(403).json({
      message: 'Please make sure you are logging in from the right portal.',
      success: false
    })
  }

  // That means the employee is existing and trying to signin fro the right portal
  // Now check if the password match
  let isMatch = await bcrypt.compare(password, employee.password)
  if (isMatch) {
    // if the password match Sign a the token and issue it to the employee
    let token = jwt.sign(
      {
        role: employee.role,
        name: employee.name,
        email: employee.email
      },
      process.env.APP_SECRET,
      { expiresIn: '3 days' }
    )

    let result = {
      name: employee.name,
      role: employee.role,
      email: employee.email,
      token: `Bearer ${token}`,
      expiresIn: 168
    }

    return res.status(200).json({
      ...result,
      message: 'You are now logged in.'
    })
  } else {
    return res.status(403).json({
      message: 'Incorrect password.'
    })
  }
}

export const employeeLogout = async (req, role, res) => {
  try {
    console.log('ini adalah tambahan code yang saya buat')
  } catch (error) {
    return error
  }
}
