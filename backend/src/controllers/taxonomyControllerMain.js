const { query } = require('../config/database');

const ok = (res, data) => res.json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });

const getKingdoms = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_kingdoms ORDER BY id', [])).rows);
const getKingdomById = async (req, res) => {
  const r = await query('SELECT * FROM taxonomic_kingdoms WHERE id = $1', [req.params.id]);
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Kingdom no encontrado' });
  return ok(res, r.rows[0]);
};
const createKingdom = async (req, res) => created(res, (await query('INSERT INTO taxonomic_kingdoms (name, description) VALUES ($1,$2) RETURNING *', [req.body.name, req.body.description || null])).rows[0]);

const getPhylums = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_phylums ORDER BY id', [])).rows);
const getPhylumsByKingdom = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_phylums WHERE kingdom_id = $1 ORDER BY id', [req.params.id])).rows);
const createPhylum = async (req, res) => created(res, (await query('INSERT INTO taxonomic_phylums (kingdom_id, name, description) VALUES ($1,$2,$3) RETURNING *', [req.body.kingdom_id, req.body.name, req.body.description || null])).rows[0]);

const getClasses = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_classes ORDER BY id', [])).rows);
const getClassesByPhylum = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_classes WHERE phylum_id = $1 ORDER BY id', [req.params.id])).rows);
const createClassTax = async (req, res) => created(res, (await query('INSERT INTO taxonomic_classes (phylum_id, name, description) VALUES ($1,$2,$3) RETURNING *', [req.body.phylum_id, req.body.name, req.body.description || null])).rows[0]);

const getOrders = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_orders ORDER BY id', [])).rows);
const getOrdersByClass = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_orders WHERE class_id = $1 ORDER BY id', [req.params.id])).rows);
const createOrder = async (req, res) => created(res, (await query('INSERT INTO taxonomic_orders (class_id, name, description) VALUES ($1,$2,$3) RETURNING *', [req.body.class_id, req.body.name, req.body.description || null])).rows[0]);

const getFamilies = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_families ORDER BY id', [])).rows);
const getFamiliesByOrder = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_families WHERE order_id = $1 ORDER BY id', [req.params.id])).rows);
const createFamily = async (req, res) => created(res, (await query('INSERT INTO taxonomic_families (order_id, name, description) VALUES ($1,$2,$3) RETURNING *', [req.body.order_id, req.body.name, req.body.description || null])).rows[0]);

const getGenera = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_genera ORDER BY id', [])).rows);
const getGeneraByFamily = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_genera WHERE family_id = $1 ORDER BY id', [req.params.id])).rows);
const createGenus = async (req, res) => created(res, (await query('INSERT INTO taxonomic_genera (family_id, name, description) VALUES ($1,$2,$3) RETURNING *', [req.body.family_id, req.body.name, req.body.description || null])).rows[0]);

const getSpecies = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_species ORDER BY id', [])).rows);
const getSpeciesByGenus = async (req, res) => ok(res, (await query('SELECT * FROM taxonomic_species WHERE genus_id = $1 ORDER BY id', [req.params.id])).rows);
const createSpecies = async (req, res) => created(res, (await query('INSERT INTO taxonomic_species (genus_id, name, common_name, description) VALUES ($1,$2,$3,$4) RETURNING *', [req.body.genus_id, req.body.name, req.body.common_name || null, req.body.description || null])).rows[0]);

const createFossilTaxonomy = async (req, res) => {
  const { kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id } = req.body;
  const r = await query(
    `INSERT INTO fossil_taxonomic_classification (fossil_id, kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (fossil_id) DO UPDATE
     SET kingdom_id = EXCLUDED.kingdom_id, phylum_id = EXCLUDED.phylum_id, class_id = EXCLUDED.class_id,
         order_id = EXCLUDED.order_id, family_id = EXCLUDED.family_id, genus_id = EXCLUDED.genus_id, species_id = EXCLUDED.species_id
     RETURNING *`,
    [req.params.fossilId, kingdom_id || null, phylum_id || null, class_id || null, order_id || null, family_id || null, genus_id || null, species_id || null]
  );
  return created(res, r.rows[0]);
};

const getFossilTaxonomy = async (req, res) => {
  const r = await query('SELECT * FROM fossil_taxonomic_classification WHERE fossil_id = $1', [req.params.fossilId]);
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Taxonomia no encontrada para el fosil' });
  return ok(res, r.rows[0]);
};

const updateFossilTaxonomy = createFossilTaxonomy;

module.exports = {
  getKingdoms,
  getKingdomById,
  createKingdom,
  getPhylums,
  getPhylumsByKingdom,
  createPhylum,
  getClasses,
  getClassesByPhylum,
  createClassTax,
  getOrders,
  getOrdersByClass,
  createOrder,
  getFamilies,
  getFamiliesByOrder,
  createFamily,
  getGenera,
  getGeneraByFamily,
  createGenus,
  getSpecies,
  getSpeciesByGenus,
  createSpecies,
  createFossilTaxonomy,
  getFossilTaxonomy,
  updateFossilTaxonomy,
};
