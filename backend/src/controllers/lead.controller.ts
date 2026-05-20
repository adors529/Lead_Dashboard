import { Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Lead, ILeadDocument } from '../models/Lead';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest, LeadFilters } from '../types';

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user?.id });
    sendSuccess(res, 'Lead created successfully', lead, 201);
  } catch (error) {
    sendError(res, 'Failed to create lead', 500);
  }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search, sort = 'latest', page = 1, limit = 10 }: LeadFilters = req.query as LeadFilters;

    const query: FilterQuery<ILeadDocument> = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (req.user?.role === 'sales') {
      query.createdBy = req.user.id;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Lead.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendSuccess(res, 'Leads fetched successfully', leads, 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    sendError(res, 'Failed to fetch leads', 500);
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      sendError(res, 'Forbidden: Access denied', 403);
      return;
    }

    sendSuccess(res, 'Lead fetched successfully', lead);
  } catch (error) {
    sendError(res, 'Failed to fetch lead', 500);
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      sendError(res, 'Forbidden: Access denied', 403);
      return;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    sendSuccess(res, 'Lead updated successfully', updatedLead);
  } catch (error) {
    sendError(res, 'Failed to update lead', 500);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      sendError(res, 'Forbidden: Access denied', 403);
      return;
    }

    await lead.deleteOne();
    sendSuccess(res, 'Lead deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete lead', 500);
  }
};

export const exportLeadsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: FilterQuery<ILeadDocument> = {};
    if (req.user?.role === 'sales') query.createdBy = req.user.id;

    const leads = await Lead.find(query).populate('createdBy', 'name email').lean();

    const csvHeader = 'Name,Email,Status,Source,Notes,Created At\n';
    const csvRows = leads.map((lead) =>
      [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${lead.notes || ''}"`,
        `"${new Date(lead.createdAt).toLocaleDateString()}"`,
      ].join(',')
    );

    const csvContent = csvHeader + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csvContent);
  } catch (error) {
    sendError(res, 'Failed to export leads', 500);
  }
};

export const getLeadStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchStage: Record<string, unknown> = {};
    if (req.user?.role === 'sales') {
      matchStage.createdBy = new mongoose.Types.ObjectId(req.user.id);
    }

    const [total, byStatus, bySource] = await Promise.all([
      Lead.countDocuments(matchStage),
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((s: { _id: string; count: number }) => [s._id, s.count]));
    const sourceMap = Object.fromEntries(bySource.map((s: { _id: string; count: number }) => [s._id, s.count]));

    sendSuccess(res, 'Stats fetched', {
      total,
      byStatus: {
        New: statusMap['New'] || 0,
        Contacted: statusMap['Contacted'] || 0,
        Qualified: statusMap['Qualified'] || 0,
        Lost: statusMap['Lost'] || 0,
      },
      bySource: {
        Website: sourceMap['Website'] || 0,
        Instagram: sourceMap['Instagram'] || 0,
        Referral: sourceMap['Referral'] || 0,
      },
    });
  } catch {
    sendError(res, 'Failed to fetch stats', 500);
  }
};