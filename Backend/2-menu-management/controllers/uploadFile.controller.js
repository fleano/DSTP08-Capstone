const { Food } = require("../food_objects");
/*
const uploadFileCheck = (req, res, next) => {
  console.log(req.file)
    if (!req.file) {
    return res.status(400).json({
      error: 'Please provide a file in the "file" field.',
    });
  }
  next();
}*/
async function editFoodMiddleware(req, res, next) {
  //needs id
  const imageLink = req.file.filename;
  res.locals.errors = await Food.editFood(
    req.body.id,
    req.body.name,
    req.body.description,
    imageLink,
    req.body.price,
    req.body.discountedPrice,
    req.body.foodCategory,
    req.body.enabled,
    req.body.available,
    req.body.featured,
    req.body.unitCost,
  ); /*
        if (res.locals.errors) {
          return res.status(201).json(res.locals.errors);
        }
        else {
          next();
        }*/
  next();
}
async function addFoodMiddleware(req, res, next) {
  //wrapper
  const imageLink = req.file.filename;
  res.locals.errors = await Food.addFood(
    req.body.name,
    req.body.description,
    imageLink,
    req.body.price,
    req.body.discountedPrice,
    req.body.foodCategory,
    req.body.enabled,
    req.body.available,
    req.body.featured,
    req.body.unitCost,
  );
  if (res.locals.errors) {
    return res.status(400).json(res.locals.errors);
  } else {
    next();
  }
}
const uploadFileEnd = (req, res) => {
  //to be moved to uploadFileCheck
  if (!req.file) {
    return res.status(400).json({
      error: 'Please provide a file in the "file" field.',
    });
  }
  return res.status(201).json({
    message: "File uploaded successfully.",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    },
  });
};

module.exports = {
  uploadFileEnd,
  addFoodMiddleware,
  editFoodMiddleware,
};
