const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create
const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      return res.render("posts/addPost", {
        error: "Please fill all the fields",
      });
    }
    //Find the user
    const userId = req.session.userAuth;
    // console.log(userId);
    const userFound = await User.findById(userId);
    // Create a post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound._id,
      image: req.file.path,
    });
    //push the post created into user the array of user posts
    userFound.posts.push(postCreated._id);
    //re save the user
    await userFound.save();

    res.redirect("/");
  } catch (error) {
    return res.render("posts/addPost", {
      error: error.message,
    });
  }
};

//all
const fetchPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments");
    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//details
const fetchPostCtrl = async (req, res, next) => {
  try {
    //get the if from params
    const id = req.params.id;
    //find the post
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");
    res.render("posts/postDetails", {
      post,
      error: "",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//delete
const deletePostCtrl = async (req, res, next) => {
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    //check if the post belong to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/postDetails", {
        error: "You are not authorized to delete this post",
        post,
      });
    }
    //delete post
    await Post.findByIdAndDelete(req.params.id);
    //redirect
    res.redirect("/");
  } catch (error) {
    return res.render("posts/postDetails", {
      error: error.message,
    });
  }
};

//update
const updatepostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    //check if the post belong to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/updatePost", {
        post: "",
        error: "You are not authorized to update this post",
      });
    }
    //check if user is updateing image
    if (req.file) {
      //update the post with image
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        { new: true }
      );
    } else {
      //update the post without image
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
        },
        { new: true }
      );
    }

    //redirect
    res.redirect("/");
  } catch (error) {
    return res.render("posts/updatePost", {
      post: "",
      error: error.message,
    });
  }
};
module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatepostCtrl,
};
