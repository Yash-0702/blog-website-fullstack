// truncate

const truncatePost = (post) => {
  if (post.length > 150) {
    return post.substring(0, 150) + "...";
  }
  return post;
};

module.exports = {
  truncatePost,
};
