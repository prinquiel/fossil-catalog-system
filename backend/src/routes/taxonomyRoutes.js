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

router.get('/kingdoms', getKingdoms);
router.get('/phylums', getPhylums);
router.get('/phylums/kingdom/:kingdomId', getPhylums);
router.get('/classes', getClasses);
router.get('/classes/phylum/:phylumId', getClasses);
router.get('/orders', getOrders);
router.get('/orders/class/:classId', getOrders);
router.get('/families', getFamilies);
router.get('/families/order/:orderId', getFamilies);
router.get('/genera', getGenera);
router.get('/genera/family/:familyId', getGenera);
router.get('/species', getSpecies);
router.get('/species/genus/:genusId', getSpecies);

router.get('/fossil/:fossilId', getTaxonomyByFossil);
router.post('/fossil/:fossilId', protect, setTaxonomyForFossil);
router.put('/fossil/:fossilId', protect, setTaxonomyForFossil);

module.exports = router;
