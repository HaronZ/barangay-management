import { Request, Response, NextFunction } from 'express';
import * as householdService from '../services/household.service.js';
import { createHouseholdSchema } from '../utils/validation.js';

export const getAllHouseholds = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await householdService.getAllHouseholds(page, limit);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getHouseholdById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await householdService.getHouseholdById(id);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const createHousehold = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createHouseholdSchema.parse(req.body);
        const result = await householdService.createHousehold(validatedData);
        res.status(201).json({
            status: 'success',
            message: 'Household created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateHousehold = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = createHouseholdSchema.partial().parse(req.body);
        const result = await householdService.updateHousehold(id, validatedData);
        res.json({
            status: 'success',
            message: 'Household updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteHousehold = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await householdService.deleteHousehold(id);
        res.json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};
