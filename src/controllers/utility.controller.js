const multer = require('multer'); 
const path = require('path'); 
const utilityService = require('../services/utility.service'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadMiddleware = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadMaterial = [
    uploadMiddleware.single('material'), 
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                message: "Niciun fișier nu a fost încărcat." 
            });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            status: "success",
            message: `Fișierul a fost încărcat cu succes.`,
            path: fileUrl,
        });
    }
];

const generateReport = async (req, res) => {
    try {
        const reportData = await utilityService.generateCentralReport();
        res.json(reportData);
    } catch (error) {
        console.error("Eroare la generarea raportului:", error);
        res.status(500).json({ message: "Eroare internă la generarea raportului." });
    }
};

module.exports = {
    uploadMaterial,
    generateReport
};