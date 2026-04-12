const { pool } = require('../config/database');

const getKingdoms = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM taxonomic_kingdoms ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getKingdoms:', error);
    res.status(500).json({ success: false, error: 'Error al obtener reinos' });
  }
};

const getPhylums = async (req, res) => {
  try {
    const { kingdomId } = req.params;

    let query = `
      SELECT p.*, k.name as kingdom_name
      FROM taxonomic_phylums p
      LEFT JOIN taxonomic_kingdoms k ON p.kingdom_id = k.id
    `;

    const params = [];
    if (kingdomId) {
      query += ' WHERE p.kingdom_id = $1';
      params.push(kingdomId);
    }

    query += ' ORDER BY p.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getPhylums:', error);
    res.status(500).json({ success: false, error: 'Error al obtener filos' });
  }
};

const getClasses = async (req, res) => {
  try {
    const { phylumId } = req.params;

    let query = `
      SELECT c.*, p.name as phylum_name
      FROM taxonomic_classes c
      LEFT JOIN taxonomic_phylums p ON c.phylum_id = p.id
    `;

    const params = [];
    if (phylumId) {
      query += ' WHERE c.phylum_id = $1';
      params.push(phylumId);
    }

    query += ' ORDER BY c.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getClasses:', error);
    res.status(500).json({ success: false, error: 'Error al obtener clases' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { classId } = req.params;

    let query = `
      SELECT o.*, c.name as class_name
      FROM taxonomic_orders o
      LEFT JOIN taxonomic_classes c ON o.class_id = c.id
    `;

    const params = [];
    if (classId) {
      query += ' WHERE o.class_id = $1';
      params.push(classId);
    }

    query += ' ORDER BY o.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getOrders:', error);
    res.status(500).json({ success: false, error: 'Error al obtener órdenes' });
  }
};

const getFamilies = async (req, res) => {
  try {
    const { orderId } = req.params;

    let query = `
      SELECT f.*, o.name as order_name
      FROM taxonomic_families f
      LEFT JOIN taxonomic_orders o ON f.order_id = o.id
    `;

    const params = [];
    if (orderId) {
      query += ' WHERE f.order_id = $1';
      params.push(orderId);
    }

    query += ' ORDER BY f.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getFamilies:', error);
    res.status(500).json({ success: false, error: 'Error al obtener familias' });
  }
};

const getGenera = async (req, res) => {
  try {
    const { familyId } = req.params;

    let query = `
      SELECT g.*, f.name as family_name
      FROM taxonomic_genera g
      LEFT JOIN taxonomic_families f ON g.family_id = f.id
    `;

    const params = [];
    if (familyId) {
      query += ' WHERE g.family_id = $1';
      params.push(familyId);
    }

    query += ' ORDER BY g.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getGenera:', error);
    res.status(500).json({ success: false, error: 'Error al obtener géneros' });
  }
};

const getSpecies = async (req, res) => {
  try {
    const { genusId } = req.params;

    let query = `
      SELECT s.*, g.name as genus_name
      FROM taxonomic_species s
      LEFT JOIN taxonomic_genera g ON s.genus_id = g.id
    `;

    const params = [];
    if (genusId) {
      query += ' WHERE s.genus_id = $1';
      params.push(genusId);
    }

    query += ' ORDER BY s.name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getSpecies:', error);
    res.status(500).json({ success: false, error: 'Error al obtener especies' });
  }
};

const getTaxonomyByFossil = async (req, res) => {
  try {
    const { fossilId } = req.params;

    const result = await pool.query(
      `SELECT
        ftc.*,
        k.name as kingdom_name,
        p.name as phylum_name,
        c.name as class_name,
        o.name as order_name,
        f.name as family_name,
        g.name as genus_name,
        s.name as species_name,
        s.common_name as common_name
      FROM fossil_taxonomic_classification ftc
      LEFT JOIN taxonomic_kingdoms k ON ftc.kingdom_id = k.id
      LEFT JOIN taxonomic_phylums p ON ftc.phylum_id = p.id
      LEFT JOIN taxonomic_classes c ON ftc.class_id = c.id
      LEFT JOIN taxonomic_orders o ON ftc.order_id = o.id
      LEFT JOIN taxonomic_families f ON ftc.family_id = f.id
      LEFT JOIN taxonomic_genera g ON ftc.genus_id = g.id
      LEFT JOIN taxonomic_species s ON ftc.species_id = s.id
      WHERE ftc.fossil_id = $1`,
      [fossilId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Este fósil no tiene clasificación taxonómica asignada'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en getTaxonomyByFossil:', error);
    res.status(500).json({ success: false, error: 'Error al obtener clasificación' });
  }
};

const setTaxonomyForFossil = async (req, res) => {
  try {
    const { fossilId } = req.params;
    const { kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id } = req.body;

    const fossilCheck = await pool.query(
      'SELECT * FROM fossils WHERE id = $1 AND deleted_at IS NULL',
      [fossilId]
    );

    if (fossilCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fósil no encontrado' });
    }

    const existingCheck = await pool.query(
      'SELECT * FROM fossil_taxonomic_classification WHERE fossil_id = $1',
      [fossilId]
    );

    let result;

    if (existingCheck.rows.length > 0) {
      result = await pool.query(
        `UPDATE fossil_taxonomic_classification
         SET kingdom_id = $1,
             phylum_id = $2,
             class_id = $3,
             order_id = $4,
             family_id = $5,
             genus_id = $6,
             species_id = $7
         WHERE fossil_id = $8
         RETURNING *`,
        [kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id, fossilId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO fossil_taxonomic_classification
          (fossil_id, kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [fossilId, kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id]
      );
    }

    res.json({
      success: true,
      message: 'Clasificación taxonómica guardada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en setTaxonomyForFossil:', error);
    res.status(500).json({ success: false, error: 'Error al guardar clasificación' });
  }
};

module.exports = {
  getKingdoms,
  getPhylums,
  getClasses,
  getOrders,
  getFamilies,
  getGenera,
  getSpecies,
  getTaxonomyByFossil,
  setTaxonomyForFossil,
};
