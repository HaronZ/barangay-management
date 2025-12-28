import { Request, Response, NextFunction } from 'express';
import * as personService from '../services/person.service.js';
import { createPersonSchema, createOfficialSchema } from '../utils/validation.js';

export const getAllPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;

        const result = await personService.getAllPersons(page, limit, search);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getPersonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await personService.getPersonById(id);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const createPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createPersonSchema.parse(req.body);
        const result = await personService.createPerson(validatedData);
        res.status(201).json({
            status: 'success',
            message: 'Person created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updatePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = createPersonSchema.partial().parse(req.body);
        const result = await personService.updatePerson(id, validatedData);
        res.json({
            status: 'success',
            message: 'Person updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await personService.deletePerson(id);
        res.json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

// Official endpoints
export const getOfficials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await personService.getOfficials();
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const makeOfficial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createOfficialSchema.parse(req.body);
        const result = await personService.makeOfficial(validatedData.personId, {
            position: validatedData.position,
            termStart: validatedData.termStart,
            termEnd: validatedData.termEnd,
        });
        res.status(201).json({
            status: 'success',
            message: 'Person is now an official',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const removeOfficial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { personId } = req.params;
        const result = await personService.removeOfficial(personId);
        res.json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

// Backward compatibility aliases (for frontend using old "resident" terminology)
export const getAllResidents = getAllPersons;
export const getResidentById = getPersonById;
export const createResident = createPerson;
export const updateResident = updatePerson;
export const deleteResident = deletePerson;
