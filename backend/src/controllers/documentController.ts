import { Request, Response } from 'express';
import fs from 'node:fs';
import { DocumentService } from '../services/documentService.js';
import { asyncHandler } from '../middleware/index.js';
import {
  DocumentParamsSchema,
  DocumentQuerySchema,
  DocumentCategorySchema,
  DocumentCreateSchema,
  DocumentUpdateSchema,
} from '../schemas/index.js';
import { prisma } from '../prisma.js';

const documentService = new DocumentService();

// Get documents with pagination and filters
export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder, ...filter } = await DocumentQuerySchema.parseAsync(req.query);
  const result = await documentService.getDocuments(filter, page, limit, sortBy, sortOrder);
  res.json(result);
});

// Get document statistics (repartition ontologique)
export const getDocumentStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await documentService.getStats();
  res.json(stats);
});

// Get documents by category (JURIDIQUE, FINANCE, SUIVI, TECHNIQUE, ADMIN)
export const getDocumentsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = DocumentCategorySchema.parse(req.params.category);
  const documents = await documentService.getDocumentsByCategory(category);
  res.json(documents);
});

// Get document by ID
export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await DocumentParamsSchema.parseAsync(req.params);
  const document = await documentService.getDocumentById(id);
  res.json(document);
});

// Create document
export const createDocument = asyncHandler(async (req: Request, res: Response) => {
  const data = await DocumentCreateSchema.parseAsync(req.body);
  const document = await prisma.document.create({
    data: {
      FileName: data.FileName,
      Title: data.Title,
      Category: data.Category,
      OntologyClass: data.OntologyClass,
      FilePath: data.FilePath,
      DocumentDate: data.DocumentDate ? new Date(data.DocumentDate) : null,
      Lot: data.Lot ?? null,
      Phase: data.Phase ?? null,
      ProjectID: data.ProjectID ?? null,
      TerritoryID: data.TerritoryID ?? null,
      SiteID: data.SiteID ?? null,
      MontantUSD: data.MontantUSD ?? null,
      Notes: data.Notes ?? null,
    },
  });
  res.status(201).json(document);
});

// Update document
export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await DocumentParamsSchema.parseAsync(req.params);
  const data = await DocumentUpdateSchema.parseAsync(req.body);

  const existing = await prisma.document.findUnique({ where: { DocumentID: id } });
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const updated = await prisma.document.update({
    where: { DocumentID: id },
    data: {
      FileName: data.FileName ?? existing.FileName,
      Title: data.Title ?? existing.Title,
      Category: data.Category ?? existing.Category,
      OntologyClass: data.OntologyClass ?? existing.OntologyClass,
      FilePath: data.FilePath ?? existing.FilePath,
      DocumentDate: data.DocumentDate ? new Date(data.DocumentDate) : existing.DocumentDate,
      Lot: data.Lot !== undefined ? data.Lot : existing.Lot,
      Phase: data.Phase !== undefined ? data.Phase : existing.Phase,
      ProjectID: data.ProjectID !== undefined ? data.ProjectID : existing.ProjectID,
      TerritoryID: data.TerritoryID !== undefined ? data.TerritoryID : existing.TerritoryID,
      SiteID: data.SiteID !== undefined ? data.SiteID : existing.SiteID,
      MontantUSD: data.MontantUSD !== undefined ? data.MontantUSD : existing.MontantUSD,
      Notes: data.Notes !== undefined ? data.Notes : existing.Notes,
    },
  });
  res.json(updated);
});

// Delete document
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await DocumentParamsSchema.parseAsync(req.params);
  const existing = await prisma.document.findUnique({ where: { DocumentID: id } });
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  await prisma.document.delete({ where: { DocumentID: id } });
  res.json({ success: true });
});

// Download the physical document from DOCUMENTS_ROOT
export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await DocumentParamsSchema.parseAsync(req.params);
  const document = await documentService.getDocumentById(id);
  const absolutePath = documentService.resolveFilePath(document.FilePath);

  if (!fs.existsSync(absolutePath)) {
    res.status(404).json({
      error: 'Fichier introuvable sur le disque',
      filePath: document.FilePath,
      hint: 'Verifier DOCUMENTS_ROOT (workspace GME_ASCAT_SPPE).',
    });
    return;
  }

  res.download(absolutePath, document.FileName);
});
