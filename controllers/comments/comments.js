const Comment = require("../../model/comment/Comment");
const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create
const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    //create a comment
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post._id,
    });
    //push the comment into post
    post.comments.push(comment._id);
    //find the user
    const user = await User.findById(req.session.userAuth);
    //push the comment into user the array of user posts
    user.comments.push(comment._id);
    //disable validation
    //save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    //redirect
    res.redirect(`/api/v1/posts/${post._id}`);
  } catch (error) {
    next(appErr(error));
  }
};

//single
const commentDetailsCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.render("comments/updateComment.ejs", {
      comment,
      error: "",
    });
  } catch (error) {
    res.render("comments/updateComment.ejs", {
      error: error.message,
    });
  }
};

//delete
const deleteCommentCtrl = async (req, res, next) => {
  try {
    console.log(req.query);
    //find the comment
    const comment = await Comment.findById(req.params.id);
    //check if the comment belong to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not authorized to delete this comment", 403));
    }
    //delete comment
    await Comment.findByIdAndDelete(req.params.id);
    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    next(appErr(error));
  }
};

//Update
const updateCommentCtrl = async (req, res, next) => {
  try {
    //find the comment
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(appErr("Comment not found", 404));
    }
    //check if the comment belong to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not authorized to update this comment", 403));
    }

    //update the comment
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
      },
      { new: true }
    );
    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    next(appErr(error));
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
