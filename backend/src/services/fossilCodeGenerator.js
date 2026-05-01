const { pool } = require('../config/database');

/**
 * Genera código único para fósil
 * Formato: CRI-[PROVINCIA]-[CANTON]-[CATEGORIA]-[ID]
 * Ejemplo: CRI-ALA-SRM-FOS-00001
 */
const generateFossilCode = async (provinceCode, cantonCode, category) => {
  try {
    // Validar códigos de provincia
    const validProvinces = ['SJO', 'ALA', 'GUA', 'CAR', 'HER', 'PUN', 'LIM'];
    if (!validProvinces.includes(provinceCode.toUpperCase())) {
      throw new Error('Código de provincia inválido');
    }

    // Validar categoría
    const validCategories = ['FOS', 'MIN', 'ROC', 'PAL'];
    if (!validCategories.includes(category.toUpperCase())) {
      throw new Error('Categoría inválida');
    }

    // Obtener el último número de secuencia para esta combinación
    const result = await pool.query(
      `SELECT unique_code FROM fossils WHERE unique_code LIKE $1 ORDER BY unique_code DESC LIMIT 1`,
      [`CRI-${provinceCode.toUpperCase()}-${cantonCode.toUpperCase()}-${category.toUpperCase()}-%`]
    );

    let nextNumber = 1;

    if (result.rows.length > 0) {
      // Extraer el número del último código
      const lastCode = result.rows[0].unique_code;
      const lastNumber = parseInt(lastCode.split('-').pop());
      nextNumber = lastNumber + 1;
    }

    // Formatear el número con ceros a la izquierda (5 dígitos)
    const formattedNumber = String(nextNumber).padStart(5, '0');

    // Generar código completo
    const uniqueCode = `CRI-${provinceCode.toUpperCase()}-${cantonCode.toUpperCase()}-${category.toUpperCase()}-${formattedNumber}`;

    return uniqueCode;
  } catch (error) {
    console.error('Error generando código de fósil:', error);
    throw error;
  }
};

module.exports = {
  generateFossilCode,
};