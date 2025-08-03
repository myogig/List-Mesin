import {
  users,
  pmMachines,
  machineNotes,
  type User,
  type UpsertUser,
  type PmMachine,
  type InsertPmMachine,
  type MachineNote,
  type InsertMachineNote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, max } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // PM Machine operations
  getAllPmMachines(): Promise<PmMachine[]>;
  getPmMachineByIdMsn(idMsn: string): Promise<PmMachine | undefined>;
  createPmMachine(data: InsertPmMachine): Promise<PmMachine>;
  updatePmMachine(idMsn: string, data: Partial<InsertPmMachine>): Promise<PmMachine>;
  deletePmMachineData(idMsn: string, deleteAll: boolean): Promise<void>;
  searchPmMachines(query: string): Promise<PmMachine[]>;
  getNextMachineNumber(): Promise<number>;
  
  // Machine Notes operations
  getMachineNote(idMsn: string): Promise<MachineNote | undefined>;
  upsertMachineNote(data: InsertMachineNote): Promise<MachineNote>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // PM Machine operations

  async getAllPmMachines(): Promise<PmMachine[]> {
    return await db.select().from(pmMachines).orderBy(pmMachines.no);
  }

  async getPmMachineByIdMsn(idMsn: string): Promise<PmMachine | undefined> {
    const [machine] = await db.select().from(pmMachines).where(eq(pmMachines.idMsn, idMsn));
    return machine;
  }

  async createPmMachine(data: InsertPmMachine): Promise<PmMachine> {
    const nextNo = await this.getNextMachineNumber();
    const [machine] = await db
      .insert(pmMachines)
      .values({ ...data, no: nextNo })
      .returning();
    return machine;
  }

  async updatePmMachine(idMsn: string, data: Partial<InsertPmMachine>): Promise<PmMachine> {
    const [machine] = await db
      .update(pmMachines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pmMachines.idMsn, idMsn))
      .returning();
    return machine;
  }

  async deletePmMachineData(idMsn: string, deleteAll: boolean): Promise<void> {
    if (deleteAll) {
      await db.delete(pmMachines).where(eq(pmMachines.idMsn, idMsn));
    } else {
      await db
        .update(pmMachines)
        .set({ 
          periodePM: null, 
          tglSelesaiPM: null, 
          status: "Outstanding",
          updatedAt: new Date()
        })
        .where(eq(pmMachines.idMsn, idMsn));
    }
  }

  async searchPmMachines(query: string): Promise<PmMachine[]> {
    return await db
      .select()
      .from(pmMachines)
      .where(
        or(
          ilike(pmMachines.pengelola, `%${query}%`),
          ilike(pmMachines.periodePM, `%${query}%`),
          ilike(pmMachines.status, `%${query}%`)
        )
      )
      .orderBy(pmMachines.no);
  }

  async getNextMachineNumber(): Promise<number> {
    const [result] = await db.select({ maxNo: max(pmMachines.no) }).from(pmMachines);
    return (result.maxNo || 0) + 1;
  }

  // Machine Notes operations

  async getMachineNote(idMsn: string): Promise<MachineNote | undefined> {
    const [note] = await db
      .select()
      .from(machineNotes)
      .where(eq(machineNotes.idMsn, idMsn))
      .orderBy(desc(machineNotes.updatedAt));
    return note;
  }

  async upsertMachineNote(data: InsertMachineNote): Promise<MachineNote> {
    const existingNote = await this.getMachineNote(data.idMsn);
    
    if (existingNote) {
      const [note] = await db
        .update(machineNotes)
        .set({ content: data.content, updatedAt: new Date() })
        .where(eq(machineNotes.idMsn, data.idMsn))
        .returning();
      return note;
    } else {
      const [note] = await db
        .insert(machineNotes)
        .values(data)
        .returning();
      return note;
    }
  }
}

export const storage = new DatabaseStorage();
