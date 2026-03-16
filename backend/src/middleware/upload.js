import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garantir que a pasta existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

// Filtrar tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.'), false);
  }
};

// Configurar upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});