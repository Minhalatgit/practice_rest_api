const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register a User
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }


    const userAvailbale = await User.findOne({ email });

    if (userAvailbale) {
        res.status(400);
        throw new Error("User already exists");
    }

    //Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    console.log("Hashed password", hashPassword);

    const user = await User.create({
        username, email, password: hashPassword,
    });

    console.log("User created", user);


    if (user) {
        res.status(201).json({
            message: "Register the user",
            data: {
                _id: user.id,
                email: user.email,
            }
        });
    } else {
        res.status(400);
        throw new Error("User data is not valid");

    }
});

//@desc Login a User
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);

        throw new Error("All fields are mandatory");
    }

    const user = await User.findOne({ email });

    //comapre password with hashed password
    if (user && (await bcrypt.compare(password, user.password))) {

        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id,
            }
        },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1m"
            }
        );

        res.status(200).json({ accessToken });

    } else {
        res.status(400).json({ message: "Invalid credentials" });
    }

});


//@desc Get current user
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler((req, res) => {
    res.json({ message: "Current user info" });
});


module.exports = { registerUser, loginUser, currentUser };