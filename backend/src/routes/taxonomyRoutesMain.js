const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const c = require('../controllers/taxonomyControllerMain');

router.get('/kingdoms', c.getKingdoms);
router.get('/kingdoms/:id', c.getKingdomById);
router.post('/kingdoms', protect, c.createKingdom);

router.get('/phylums', c.getPhylums);
router.get('/phylums/kingdom/:id', c.getPhylumsByKingdom);
router.post('/phylums', protect, c.createPhylum);

router.get('/classes', c.getClasses);
router.get('/classes/phylum/:id', c.getClassesByPhylum);
router.post('/classes', protect, c.createClassTax);

router.get('/orders', c.getOrders);
router.get('/orders/class/:id', c.getOrdersByClass);
router.post('/orders', protect, c.createOrder);

router.get('/families', c.getFamilies);
router.get('/families/order/:id', c.getFamiliesByOrder);
router.post('/families', protect, c.createFamily);

router.get('/genera', c.getGenera);
router.get('/genera/family/:id', c.getGeneraByFamily);
router.post('/genera', protect, c.createGenus);

router.get('/species', c.getSpecies);
router.get('/species/genus/:id', c.getSpeciesByGenus);
router.post('/species', protect, c.createSpecies);

router.post('/fossil/:fossilId', protect, c.createFossilTaxonomy);
router.get('/fossil/:fossilId', c.getFossilTaxonomy);
router.put('/fossil/:fossilId', protect, c.updateFossilTaxonomy);

module.exports = router;
