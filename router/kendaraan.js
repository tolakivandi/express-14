const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const connection = require("../config/db");

// Konfigurasi multer untuk mengelola file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Menyimpan file upload ke folder "public/uploads"
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Menyimpan file dengan nama unik
  },
});

const fileFilter = (req, file, cb) => {
  // Mengecek jenis file yang diizinkan (hanya gambar JPEG atau PNG)
  const allowedFileTypes = [".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true); // Izinkan file
  } else {
    cb(new Error("Jenis file tidak diizinkan"), false); // Tolak file
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET - Mendapatkan daftar kendaraan
router.get("/", (req, res) => {
  connection.query("SELECT * FROM kendaraan", (err, rows) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Daftar Kendaraan",
      data: rows,
    });
  });
});

// POST - Menambahkan kendaraan baru
// POST - Menambahkan kendaraan baru
router.post(
  "/store",
  upload.single("gambar_kendaraan"),
  [
    body("no_pol").notEmpty(),
    body("nama_kendaraan").notEmpty(),
    body("id_transmisi").notEmpty().isInt(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { no_pol, nama_kendaraan, id_transmisi } = req.body;
    const gambar_kendaraan = req.file ? req.file.filename : null;

    const newData = {
      no_pol,
      nama_kendaraan,
      id_transmisi,
      gambar_kendaraan,
    };

    connection.query("INSERT INTO kendaraan SET ?", newData, (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
          error: err,
        });
      }

      return res.status(201).json({
        status: true,
        message: "Kendaraan telah ditambahkan",
        data: {
          id: result.insertId,
          ...newData,
        },
      });
    });
  }
);

// PUT - Mengupdate kendaraan berdasarkan nomor polisi
router.put("/kendaraan/:no_pol", (req, res) => {
  // Implementasi update kendaraan
  const { no_pol } = req.params;
  const { nama_kendaraan, id_transmisi } = req.body;

  connection.query(
    "UPDATE kendaraan SET nama_kendaraan = ?, id_transmisi = ? WHERE no_pol = ?",
    [nama_kendaraan, id_transmisi, no_pol],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: false,
          message: "Kendaraan tidak ditemukan",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Kendaraan telah diupdate",
        data: {
          no_pol,
          nama_kendaraan,
          id_transmisi,
        },
      });
    }
  );
});

// DELETE - Menghapus kendaraan berdasarkan nomor polisi
router.delete("/kendaraan/:no_pol", (req, res) => {
  // Implementasi delete kendaraan
  const { no_pol } = req.params;

  connection.query(
    "DELETE FROM kendaraan WHERE no_pol = ?",
    [no_pol],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: false,
          message: "Kendaraan tidak ditemukan",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Kendaraan telah dihapus",
      });
    }
  );
});

module.exports = router;
