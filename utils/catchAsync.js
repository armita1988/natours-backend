// eslint-disable-next-line arrow-body-style
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.log('*****💥ERROR💥*****', err);
      next(err);
    });
  };
};

module.exports = catchAsync;
