import { Request, Response, NextFunction } from 'express';
import * as certificateService from '../services/certificate.service.js';
import { createCertificateSchema } from '../utils/validation.js';
import { CertificateType, CertificateStatus } from '../generated/prisma/client.js';

export const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as CertificateStatus | undefined;
        const type = req.query.type as CertificateType | undefined;

        const result = await certificateService.getAllCertificates(page, limit, status, type);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getCertificateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await certificateService.getCertificateById(id);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const createCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createCertificateSchema.parse(req.body);
        const result = await certificateService.createCertificate(validatedData);
        res.status(201).json({
            status: 'success',
            message: 'Certificate request created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCertificateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, remarks, issuedBy } = req.body;
        const result = await certificateService.updateCertificateStatus(id, {
            status,
            remarks,
            issuedBy,
        });
        res.json({
            status: 'success',
            message: 'Certificate status updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getCertificatesByResident = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { residentId } = req.params;
        const result = await certificateService.getCertificatesByResident(residentId);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
