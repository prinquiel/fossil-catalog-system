const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const {
  getKingdoms,
  getPhylums,
  getClasses,
  getOrders,
  getFamilies,
  getGenera,
  getSpecies,
  getTaxonomyByFossil,
  setTaxonomyForFossil,
} = require('../controllers/taxonomyController');
const {
  createKingdom,
  createPhylum,
  createClassTax,
  createOrder,
  createFamily,
  createGenus,
  createSpecies,
} = require('../controllers/taxonomyControllerMain');

router.get('/kingdoms', getKingdoms);
router.post('/kingdoms', protect, createKingdom);
router.get('/phylums', getPhylums);
router.get('/phylums/kingdom/:kingdomId', getPhylums);
router.post('/phylums', protect, createPhylum);
router.get('/classes', getClasses);
router.get('/classes/phylum/:phylumId', getClasses);
router.post('/classes', protect, createClassTax);
router.get('/orders', getOrders);
router.get('/orders/class/:classId', getOrders);
router.post('/orders', protect, createOrder);
router.get('/families', getFamilies);
router.get('/families/order/:orderId', getFamilies);
router.post('/families', protect, createFamily);
router.get('/genera', getGenera);
router.get('/genera/family/:familyId', getGenera);
router.post('/genera', protect, createGenus);
router.get('/species', getSpecies);
router.get('/species/genus/:genusId', getSpecies);
router.post('/species', protect, createSpecies);

router.get('/fossil/:fossilId', getTaxonomyByFossil);
router.post('/fossil/:fossilId', protect, setTaxonomyForFossil);
router.put('/fossil/:fossilId', protect, setTaxonomyForFossil);

module.exports = router;
