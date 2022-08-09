exports.getPrivateData = (req, res, next) => {
  res.status(200).json({
    success: "true",
    data: "Successfully got acess to the data",
  });
};
