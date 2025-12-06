const multer = require('multer'); 
const path = require('path');    
const utilityService = require('../services/utility.service');


exports.generateReport = (req, res) => {
    
    const mockReport = {
        title: "Raport General Evenimente",
        dateGenerated: new Date().toISOString().split('T')[0],
        totalEvents: 6,
        totalOrganizers: 3,
        registrationsInLastMonth: 120,
        topOrganizer: "Universitatea 'Ștefan cel Mare' din Suceava"
    };
    res.json(mockReport);
};

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



exports.uploadMaterial = [
  
    uploadMiddleware.single('material'), 
    
    
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                message: "Niciun fișier nu a fost încărcat. Asigurați-vă că folosiți 'multipart/form-data' și câmpul 'material'." 
            });
        }

        
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            status: "success",
            message: `Fișierul '${req.file.originalname}' a fost încărcat cu succes (stocat local).`,
            fileName: req.file.filename,
            path: fileUrl,
            mimeType: req.file.mimetype,
            size: req.file.size
        });
    }
];

exports.generateReport = (req, res) => {
    const reportData = utilityService.generateCentralReport();
    res.json(reportData);
};
