import { Prisma } from '@prisma/client';
import type { DocumentCategory } from '@prisma/client';
import path from 'node:path';
import { prisma } from '../prisma.js';

export interface DocumentFilter {
  category?: DocumentCategory;
  lot?: string;
  territoire?: string;
  siteId?: string;
  phase?: string;
  q?: string;
}

const RELATIONS = {
  Project: { select: { ProjectID: true, Name: true } },
  Territory: { select: { TerritoryID: true, Name: true } },
  Site: { select: { SiteID: true, Name: true, Type: true } },
} satisfies Prisma.DocumentInclude;

export class DocumentService {
  private buildWhere(filter: DocumentFilter): Prisma.DocumentWhereInput {
    const where: Prisma.DocumentWhereInput = {};

    if (filter.category) where.Category = filter.category;
    if (filter.lot) where.Lot = filter.lot;
    if (filter.phase) where.Phase = filter.phase;
    if (filter.siteId) where.SiteID = filter.siteId;
    if (filter.territoire) {
      where.Territory = { Name: { equals: filter.territoire, mode: 'insensitive' } };
    }
    if (filter.q) {
      where.OR = [
        { Title: { contains: filter.q, mode: 'insensitive' } },
        { FileName: { contains: filter.q, mode: 'insensitive' } },
        { Notes: { contains: filter.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async getDocuments(
    filter: DocumentFilter,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'DocumentDate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const where = this.buildWhere(filter);
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: RELATIONS,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(id: number) {
    const document = await prisma.document.findUnique({
      where: { DocumentID: id },
      include: RELATIONS,
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  async getDocumentsByCategory(category: DocumentCategory) {
    return await prisma.document.findMany({
      where: { Category: category },
      orderBy: { DocumentDate: 'desc' },
      include: RELATIONS,
    });
  }

  // Repartition documentaire (ontologie ascat) pour le tableau de bord
  async getStats() {
    const documents = await prisma.document.findMany({
      select: { Category: true, Phase: true, Territory: { select: { Name: true } } },
    });

    const byCategory: Record<string, number> = {};
    const byPhase: Record<string, number> = {};
    const byTerritory: Record<string, number> = {};

    for (const doc of documents) {
      byCategory[doc.Category] = (byCategory[doc.Category] ?? 0) + 1;
      const phase = doc.Phase ?? 'Hors phase';
      byPhase[phase] = (byPhase[phase] ?? 0) + 1;
      const territory = doc.Territory?.Name ?? 'Programme (transverse)';
      byTerritory[territory] = (byTerritory[territory] ?? 0) + 1;
    }

    return {
      total: documents.length,
      byCategory,
      byPhase,
      byTerritory,
    };
  }

  // Resout le chemin physique d'un document sous DOCUMENTS_ROOT (anti path-traversal)
  resolveFilePath(filePath: string): string {
    const root = path.resolve(process.env.DOCUMENTS_ROOT || path.resolve(process.cwd(), 'documents'));
    const resolved = path.resolve(root, filePath);

    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      throw new Error('Invalid document path');
    }

    return resolved;
  }
}
