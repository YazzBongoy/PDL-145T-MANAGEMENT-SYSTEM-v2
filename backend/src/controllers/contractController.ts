import { Request, Response } from 'express';
import { normalizeBody } from '../utils/normalizeBody.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all contracts
export async function getContracts(req: Request, res: Response) {
  try {
    const { status, projectId, enterpriseId } = req.query;
    
    const where: any = {};
    if (status) where.Status = status;
    if (projectId) where.ProjectID = parseInt(projectId as string);
    if (enterpriseId) where.EnterpriseID = parseInt(enterpriseId as string);

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        Enterprise: {
          select: {
            EnterpriseID: true,
            Name: true,
            Type: true
          }
        },
        Project: {
          select: {
            ProjectID: true,
            Name: true
          }
        },
        _count: {
          select: {
            PaymentSchedules: true,
            Documents: true
          }
        }
      },
      orderBy: { CreatedAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
}

// Get contract by ID
export async function getContractById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const contract = await prisma.contract.findUnique({
      where: { ContractID: parseInt(id) },
      include: {
        Enterprise: true,
        Project: true,
        PaymentSchedules: {
          orderBy: { DueDate: 'asc' }
        },
        Documents: {
          orderBy: { UploadedAt: 'desc' }
        }
      }
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
}

// Create contract
export async function createContract(req: Request, res: Response) {
  try {
    const {
      contractNumber,
      projectId,
      enterpriseId,
      title,
      totalAmount,
      startDate,
      endDate,
      advancePayment,
      retentionRate,
      penaltyRate,
      description
    } = req.body;

    const contract = await prisma.contract.create({
      data: {
        ContractNumber: contractNumber,
        ProjectID: parseInt(projectId),
        EnterpriseID: parseInt(enterpriseId),
        Title: title,
        TotalAmount: totalAmount,
        StartDate: new Date(startDate),
        EndDate: endDate ? new Date(endDate) : null,
        AdvancePayment: advancePayment || 0,
        RetentionRate: retentionRate || 5,
        PenaltyRate: penaltyRate || 0.1,
        Description: description
      },
      include: {
        Enterprise: {
          select: { EnterpriseID: true, Name: true }
        },
        Project: {
          select: { ProjectID: true, Name: true }
        }
      }
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
}

// Update contract
export async function updateContract(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      totalAmount,
      startDate,
      endDate,
      status,
      advancePayment,
      retentionRate,
      penaltyRate,
      description
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.Title = title;
    if (totalAmount !== undefined) updateData.TotalAmount = totalAmount;
    if (startDate !== undefined) updateData.StartDate = new Date(startDate);
    if (endDate !== undefined) updateData.EndDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.Status = status;
    if (advancePayment !== undefined) updateData.AdvancePayment = advancePayment;
    if (retentionRate !== undefined) updateData.RetentionRate = retentionRate;
    if (penaltyRate !== undefined) updateData.PenaltyRate = penaltyRate;
    if (description !== undefined) updateData.Description = description;

    const contract = await prisma.contract.update({
      where: { ContractID: parseInt(id) },
      data: updateData,
      include: {
        Enterprise: {
          select: { EnterpriseID: true, Name: true }
        },
        Project: {
          select: { ProjectID: true, Name: true }
        }
      }
    });

    res.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
}

// Delete contract
export async function deleteContract(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.contract.delete({
      where: { ContractID: parseInt(id) }
    });

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
}

// Get contracts for a project
export async function getProjectContracts(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    const contracts = await prisma.contract.findMany({
      where: { ProjectID: parseInt(projectId) },
      include: {
        Enterprise: {
          select: { EnterpriseID: true, Name: true, Type: true }
        },
        _count: {
          select: { PaymentSchedules: true }
        }
      },
      orderBy: { CreatedAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching project contracts:', error);
    res.status(500).json({ error: 'Failed to fetch project contracts' });
  }
}

// Get payment schedules for a contract
export async function getContractPaymentSchedules(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const schedules = await prisma.paymentSchedule.findMany({
      where: { ContractID: parseInt(id) },
      orderBy: { DueDate: 'asc' }
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
    res.status(500).json({ error: 'Failed to fetch payment schedules' });
  }
}

// Create payment schedule
export async function createPaymentSchedule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { description, amount, duedate } = normalizeBody(req.body);
    const dueDate = duedate;

    const schedule = await prisma.paymentSchedule.create({
      data: {
        ContractID: parseInt(id),
        Description: description,
        Amount: amount,
        DueDate: new Date(dueDate)
      }
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating payment schedule:', error);
    res.status(500).json({ error: 'Failed to create payment schedule' });
  }
}

// Update payment schedule
export async function updatePaymentSchedule(req: Request, res: Response) {
  try {
    const { scheduleId } = req.params;
    const { description, amount, duedate, paidamount, paiddate, status } = normalizeBody(req.body);
    const dueDate = duedate; const paidAmount = paidamount; const paidDate = paiddate;

    const updateData: any = {};
    if (description !== undefined) updateData.Description = description;
    if (amount !== undefined) updateData.Amount = amount;
    if (dueDate !== undefined) updateData.DueDate = new Date(dueDate);
    if (paidAmount !== undefined) updateData.PaidAmount = paidAmount;
    if (paidDate !== undefined) updateData.PaidDate = paidDate ? new Date(paidDate) : null;
    if (status !== undefined) updateData.Status = status;

    const schedule = await prisma.paymentSchedule.update({
      where: { ScheduleID: parseInt(scheduleId) },
      data: updateData
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error updating payment schedule:', error);
    res.status(500).json({ error: 'Failed to update payment schedule' });
  }
}

// Delete payment schedule
export async function deletePaymentSchedule(req: Request, res: Response) {
  try {
    const { scheduleId } = req.params;

    await prisma.paymentSchedule.delete({
      where: { ScheduleID: parseInt(scheduleId) }
    });

    res.json({ message: 'Payment schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment schedule:', error);
    res.status(500).json({ error: 'Failed to delete payment schedule' });
  }
}
