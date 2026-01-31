import { Request, Response } from 'express';
import HiringForm from '../models/HiringForm';
import Audit from '../models/Audit';
import { protect, authorize } from '../middleware/authMiddleware';

// Get all hiring forms
export const getAllHiringForms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    // Admins and HR can see all forms, recruiters only see active forms
    let query = {};
    if (userRole === 'recruiter') {
      query = { isActive: true };
    }
    
    const forms = await HiringForm.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(forms);
  } catch (error) {
    console.error('Get hiring forms error:', error);
    res.status(500).json({ error: 'Failed to get hiring forms' });
  }
};

// Get hiring form by ID
export const getHiringFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const form = await HiringForm.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!form) {
      return res.status(404).json({ error: 'Hiring form not found' });
    }
    
    // Check permissions - only admins/HR can see inactive forms
    if (!form.isActive && userRole === 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Get hiring form error:', error);
    res.status(500).json({ error: 'Failed to get hiring form' });
  }
};

// Create new hiring form
export const createHiringForm = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    // Only admins and HR can create forms
    if (userRole === 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const formData = req.body;
    
    // Validate required fields
    if (!formData.title || !formData.industry || !formData.requirements) {
      return res.status(400).json({ error: 'Title, industry, and requirements are required' });
    }
    
    // Generate slug if public
    if (formData.isPublic) {
      const baseSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure unique slug
      while (await HiringForm.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      formData.slug = slug;
    }
    
    const hiringForm = new HiringForm({
      ...formData,
      createdBy: userId,
      version: 1,
      isActive: true,
    });
    
    await hiringForm.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'HIRING_FORM_CREATE',
      entityType: 'HiringForm',
      entityId: hiringForm._id,
      entityName: formData.title,
      details: {
        after: {
          title: formData.title,
          industry: formData.industry,
          isPublic: formData.isPublic,
          slug: formData.slug
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json(hiringForm);
  } catch (error) {
    console.error('Create hiring form error:', error);
    res.status(500).json({ error: 'Failed to create hiring form' });
  }
};

// Update hiring form
export const updateHiringForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    // Only admins and HR can update forms
    if (userRole === 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const existingForm = await HiringForm.findById(id);
    if (!existingForm) {
      return res.status(404).json({ error: 'Hiring form not found' });
    }
    
    const updateData = req.body;
    const changes = [];
    
    // Track changes for audit
    for (const [key, newValue] of Object.entries(updateData)) {
      const oldValue = (existingForm as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
      }
    }
    
    // Create new version if major changes
    const majorFields = ['title', 'requirements', 'evaluationCategories', 'cutoffThreshold'];
    const hasMajorChanges = majorFields.some(field => updateData[field]);
    
    if (hasMajorChanges) {
      // Create new version
      const newForm = new HiringForm({
        ...existingForm.toObject(),
        ...updateData,
        _id: undefined, // Let MongoDB generate new ID
        version: existingForm.version + 1,
        parentForm: existingForm._id,
        createdBy: existingForm.createdBy,
        createdAt: existingForm.createdAt,
        updatedAt: new Date(),
        updatedBy: userId,
        changeLog: [
          ...(existingForm.changeLog || []),
          {
            version: existingForm.version + 1,
            changes,
            changedBy: userId,
            changedAt: new Date(),
            previousVersion: existingForm._id
          }
        ]
      });
      
      // Deactivate old version
      existingForm.isActive = false;
      await existingForm.save();
      
      await newForm.save();
      
      // Log audit
      await Audit.create({
        userId,
        userEmail,
        userRole,
        action: 'HIRING_FORM_UPDATE',
        entityType: 'HiringForm',
        entityId: newForm._id,
        entityName: newForm.title,
        details: {
          before: existingForm.toObject(),
          after: newForm.toObject(),
          context: { version: newForm.version, changes }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(newForm);
    } else {
      // Minor update, same version
      Object.assign(existingForm, updateData);
      existingForm.updatedBy = userId;
      await existingForm.save();
      
      // Log audit
      await Audit.create({
        userId,
        userEmail,
        userRole,
        action: 'HIRING_FORM_UPDATE',
        entityType: 'HiringForm',
        entityId: existingForm._id,
        entityName: existingForm.title,
        details: {
          before: existingForm.toObject(),
          after: updateData,
          context: { changes }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(existingForm);
    }
  } catch (error) {
    console.error('Update hiring form error:', error);
    res.status(500).json({ error: 'Failed to update hiring form' });
  }
};

// Delete hiring form
export const deleteHiringForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    // Only admins can delete forms
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const form = await HiringForm.findById(id);
    if (!form) {
      return res.status(404).json({ error: 'Hiring form not found' });
    }
    
    // Soft delete by deactivating
    form.isActive = false;
    await form.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'HIRING_FORM_DELETE',
      entityType: 'HiringForm',
      entityId: form._id,
      entityName: form.title,
      details: {
        before: form.toObject()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Hiring form deleted successfully' });
  } catch (error) {
    console.error('Delete hiring form error:', error);
    res.status(500).json({ error: 'Failed to delete hiring form' });
  }
};

// Get form versions
export const getFormVersions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const forms = await HiringForm.find({
      $or: [
        { _id: id },
        { parentForm: id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ version: 1 });
    
    res.json(forms);
  } catch (error) {
    console.error('Get form versions error:', error);
    res.status(500).json({ error: 'Failed to get form versions' });
  }
};

// Get public form by slug
export const getPublicForm = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const form = await HiringForm.findOne({ 
      slug, 
      isPublic: true, 
      isActive: true 
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Public form not found' });
    }
    
    // Return limited data for public view
    const publicForm = {
      title: form.title,
      description: form.description,
      industry: form.industry,
      location: form.location,
      employmentType: form.employmentType,
      requirements: form.requirements,
      responsibilities: form.responsibilities,
      qualifications: form.qualifications,
      skills: form.skills,
      experienceLevel: form.experienceLevel,
      salaryRange: form.salaryRange
    };
    
    res.json(publicForm);
  } catch (error) {
    console.error('Get public form error:', error);
    res.status(500).json({ error: 'Failed to get public form' });
  }
};

// Get active forms for evaluation
export const getActiveForms = async (req: Request, res: Response) => {
  try {
    const forms = await HiringForm.find({ 
      isActive: true 
    })
    .select('title industry department location employmentType requirements')
    .sort({ title: 1 });
    
    res.json(forms);
  } catch (error) {
    console.error('Get active forms error:', error);
    res.status(500).json({ error: 'Failed to get active forms' });
  }
};