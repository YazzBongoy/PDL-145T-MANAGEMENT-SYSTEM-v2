import { Request, Response } from 'express';
import { normalizeBody } from '../utils/normalizeBody.js';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, unique + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|ppt|pptx|png|jpg|jpeg|gif|zip|rar|txt/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

const prisma = new PrismaClient();

// Get all documents
export async function getDocuments(req: Request, res: Response) {
  try {
    const { type, projectId, contractId } = req.query;
    
    const where: any = {};
    if (type) where.Type = type;
    if (projectId) where.ProjectID = parseInt(projectId as string);
    if (contractId) where.ContractID = parseInt(contractId as string);

    const documents = await prisma.document.findMany({
      where,
      include: {
        Project: {
          select: { ProjectID: true, Name: true }
        },
        Contract: {
          select: { ContractID: true, ContractNumber: true, Title: true }
        }
      },
      orderBy: { UploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

// Get document by ID
export async function getDocumentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { DocumentID: parseInt(id) },
      include: {
        Project: {
          select: { ProjectID: true, Name: true }
        },
        Contract: {
          select: { ContractID: true, ContractNumber: true, Title: true }
        }
      }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
}

// Create document
export async function createDocument(req: Request, res: Response) {
  try {
    const { name, type, url, projectID, contractID, size, mimeType } = normalizeBody(req.body);
    const projectId = projectID; const contractId = contractID;
    const userId = (req as any).user?.id || 1;

    const document = await prisma.document.create({
      data: {
        Name: name,
        Type: type,
        URL: url,
        ProjectID: projectId ? parseInt(projectId) : null,
        ContractID: contractId ? parseInt(contractId) : null,
        Size: size,
        MimeType: mimeType,
        UploadedBy: userId
      },
      include: {
        Project: {
          select: { ProjectID: true, Name: true }
        },
        Contract: {
          select: { ContractID: true, ContractNumber: true }
        }
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
}

// Update document
export async function updateDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, type, url } = normalizeBody(req.body);

    const document = await prisma.document.update({
      where: { DocumentID: parseInt(id) },
      data: {
        Name: name,
        Type: type,
        URL: url,
        UpdatedAt: new Date()
      }
    });

    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
}

// Delete document
export async function deleteDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.document.delete({
      where: { DocumentID: parseInt(id) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}

// Get project documents
export async function getProjectDocuments(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { type } = req.query;

    const where: any = { ProjectID: parseInt(projectId) };
    if (type) where.Type = type;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { UploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching project documents:', error);
    res.status(500).json({ error: 'Failed to fetch project documents' });
  }
}

// Get contract documents
export async function getContractDocuments(req: Request, res: Response) {
  try {
    const { contractId } = req.params;
    const { type } = req.query;

    const where: any = { ContractID: parseInt(contractId) };
    if (type) where.Type = type;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { UploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching contract documents:', error);
    res.status(500).json({ error: 'Failed to fetch contract documents' });
  }
}

// Upload file and create document record
export async function uploadDocument(req: Request, res: Response) {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { type, projectID, contractID, name } = normalizeBody(req.body);
    const userId = (req as any).user?.id || 1;
    const fileUrl = `/uploads/${file.filename}`;

    const document = await prisma.document.create({
      data: {
        Name: name || file.originalname,
        Type: type || 'AUTRE',
        URL: fileUrl,
        ProjectID: projectID ? parseInt(projectID) : null,
        ContractID: contractID ? parseInt(contractID) : null,
        Size: file.size,
        MimeType: file.mimetype,
        UploadedBy: userId,
      },
      include: {
        Project: { select: { ProjectID: true, Name: true } },
        Contract: { select: { ContractID: true, ContractNumber: true } },
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}
