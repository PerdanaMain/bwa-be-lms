import multer from "multer";

export const fileStorageCourse = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/courses");
  },
  filename: (req, file, cb) => {
    const extention = file.originalname.split(".")[1];
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${file.fieldname}-${uniqueId}.${extention}`);
  },
});

export const fileFilter = (req, file, cb) => {
  if (
    file.mimeType == "images/jpeg" ||
    file.mimeType == "images/png" ||
    file.mimeType == "images/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
