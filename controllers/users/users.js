const bcrypt = require("bcryptjs");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//register
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // check if field is empty
  if (!fullname || !email || !password) {
    // return next(appErr("All fields are required", 400));
    return res.render("users/register", { error: "All fields are required" });
  }
  try {
    //1. check if user already exists(email)
    const userFound = await User.findOne({ email });
    //throw error
    if (userFound) {
      // return next(appErr("User already exists", 400));
      return res.render("users/register", { error: "Email already taken" });
    }
    //Hash password
    // const passwordHash = await bcrypt.hash(password, 10);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //register user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });
    //redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

//login
const loginCtrl = async (req, res, next) => {
  // console.log(req.session.login_user="yash");
  const { email, password } = req.body;
  if (!email || !password) {
    // return next(appErr("Email and password fields are required", 400));
    return res.render("users/login", {
      error: "Email and password fields are required",
    });
  }
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      //throw error
      // return next(appErr("Invalid login credentials", 400));
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }

    //verify password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      //throw error
      // return next(appErr("Invalid login credentials", 400));
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }
    //save the user into session
    req.session.userAuth = userFound._id;
    // res.json({
    //   status: "success",
    //   data: userFound,
    // });
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

//details
const userDetailsCtrl = async (req, res) => {
  try {
    //get userID from params
    const userID = req.params.id;
    //find the user
    const user = await User.findById(userID);
    //redirect
    res.render("users/updateUser.ejs", {
      user,
      error: "",
    });
  } catch (error) {
    res.render("users/updateUser.ejs", {
      error: error.message,
    });
  }
};
//profile
const profileCtrl = async (req, res) => {
  try {
    //get the login user
    const userID = req.session.userAuth;
    //find the user
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    res.render("users/profile.ejs", {
      user,
    });
  } catch (error) {
    res.json(error);
  }
};

//upload profile photo
const uploadProfilePhotoCtrl = async (req, res, next) => {
  // console.log(req.file.path);
  try {
    //check if file exists
    if (!req.file) {
      return res.render("users/uploadProfilePhoto", {
        error: "Please upload a image",
      });
    }
    //1.find the user to be updated
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    //2.check if user is found
    if (!userFound) {
      return res.render("users/uploadProfilePhoto", {
        error: "User not found",
      });
    }
    //3.update the profile image
    const userUpdated = await User.findByIdAndUpdate(
      userID,
      {
        profileImage: req.file.path,
      },
      { new: true }
    );
    // res.json({
    //   status: "success",
    //   data: userUpdated,
    // });

    //redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/profile", {
      error: error.message,
    });
  }
};

//upload cover image

const uploadCoverImgCtrl = async (req, res, next) => {
  try {
    //check if file exists
    if (!req.file) {
      return res.render("users/uploadCoverPhoto", {
        error: "Please upload a image",
      });
    }
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    if (!userFound) {
      return res.render("users/uploadCoverPhoto", {
        error: "User not found",
      });
    }
    const userUpdated = await User.findByIdAndUpdate(
      userID,
      {
        coverImage: req.file.path,
      },
      { new: true }
    );
    // res.json({
    //   status: "success",
    //   data: userUpdated,
    // });
    //redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/profile", {
      error: error.message,
    });
  }
};

//update password
const updatePasswordCtrl = async (req, res) => {
  const { password } = req.body;
  try {
    //check if password is updating the password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      //update the password
      const user = await User.findByIdAndUpdate(
        req.session.userAuth,
        {
          password: hashedPassword,
        },
        { new: true }
      );
      res.redirect("/api/v1/users/profile-page");
    } else {
      return res.render("users/updatePassword", {
        error: "Please provide all fields",
      });
    }
  } catch (error) {
    return res.render("users/updatePassword", {
      error: error.message,
    });
  }
};

//update user
const updateUserCtrl = async (req, res, next) => {
  const { fullname, email } = req.body;
  try {
    if (!fullname || !email) {
      return res.render("users/updateUser", {
        error: "Please provide all fields",
        user: "",
      });
    }
    //check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        // return next(appErr("Email already taken", 400));
        return res.render("users/updateUser", {
          error: "Email already taken",
          user: "",
        });
      }
    }
    //update the user
    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        fullname,
        email,
      },
      { new: true }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/updateUser", {
      error: error.message,
      user: "",
    });
  }
};

//logout
const logoutCtrl = async (req, res) => {
  try {
    //destroy the session
    // req.session.destroy();
    // res.redirect("/api/v1/users/login-page");
    req.session.destroy(() => {
      res.redirect("/api/v1/users/login");
    });
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverImgCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
};
