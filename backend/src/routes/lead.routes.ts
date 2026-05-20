import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth';
import { createLeadValidator, updateLeadValidator } from '../validators/lead.validators';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/stats', getLeadStats);
router.get('/export/csv', exportLeadsCSV);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLeadValidator, validate, createLead);
router.put('/:id', updateLeadValidator, validate, updateLead);
router.delete('/:id', authorize('admin'), deleteLead);

export default router;
