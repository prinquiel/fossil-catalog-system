const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const processImage = async (filePath) => {
  try {
    const filename = path.basename(filePath);
    const dir = path.dirname(filePath);
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);

    const thumbnailPath = path.join(dir, `${nameWithoutExt}-thumb.jpg`);
    const optimizedPath = path.join(dir, `${nameWithoutExt}-optimized.jpg`);

    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    const stats = await fs.stat(filePath);
    const thumbStats = await fs.stat(thumbnailPath);
    const optStats = await fs.stat(optimizedPath);

    return {
      original: {
        path: filePath,
        size: stats.size,
      },
      thumbnail: {
        path: thumbnailPath,
        size: thumbStats.size,
      },
      optimized: {
        path: optimizedPath,
        size: optStats.size,
      },
    };
  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
};

const deleteImage = async (filePath) => {
  try {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);

    const stemOptimized = base.match(/^(.+)-optimized\.(jpg|jpeg|png|webp)$/i);
    if (stemOptimized) {
      const stem = stemOptimized[1];
      await fs.unlink(path.join(dir, `${stem}-optimized.jpg`)).catch(() => {});
      await fs.unlink(path.join(dir, `${stem}-thumb.jpg`)).catch(() => {});
      for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']) {
        await fs.unlink(path.join(dir, stem + ext)).catch(() => {});
      }
      return true;
    }

    await fs.unlink(filePath).catch(() => {});
    return true;
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};

module.exports = {
  processImage,
  deleteImage,
};
