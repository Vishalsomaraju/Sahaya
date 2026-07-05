import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { registerSchema, loginSchema } from '../utils/validation';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if phone or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: validatedData.phone },
          ...(validatedData.email ? [{ email: validatedData.email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Use a transaction to create User and Profile simultaneously
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          phone: validatedData.phone,
          email: validatedData.email,
          passwordHash,
          role: validatedData.role as Role
        }
      });

      if (user.role === 'PATIENT') {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date(validatedData.dateOfBirth!),
            gender: validatedData.gender!,
            villageSector: validatedData.villageSector!,
            guardianContact: validatedData.guardianContact
          }
        });
      } else if (user.role === 'ASHA') {
        await tx.ashaProfile.create({
          data: {
            userId: user.id,
            sector: validatedData.sector!,
            employeeId: validatedData.employeeId!
          }
        });
      } else if (user.role === 'DOCTOR') {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            specialization: validatedData.specialization!,
            licenseNumber: validatedData.licenseNumber!
          }
        });
      }

      return user;
    });

    // Generate JWT
    const token = jwt.sign(
      { id: result.id, role: result.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.id,
          name: result.name,
          role: result.role
        },
        token
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id, role } = req.user;

    let userProfile = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        patientProfile: role === 'PATIENT',
        ashaProfile: role === 'ASHA',
        doctorProfile: role === 'DOCTOR'
      }
    });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
