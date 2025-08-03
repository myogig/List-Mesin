import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPmMachineSchema, insertMachineNoteSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PM Machine CRUD routes
  app.get("/api/pm-machines", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let machines;
      
      if (search && typeof search === 'string') {
        machines = await storage.searchPmMachines(search);
      } else {
        machines = await storage.getAllPmMachines();
      }
      
      res.json(machines);
    } catch (error) {
      console.error("Error fetching PM machines:", error);
      res.status(500).json({ message: "Failed to fetch PM machines" });
    }
  });

  app.get("/api/pm-machines/:idMsn", isAuthenticated, async (req, res) => {
    try {
      const { idMsn } = req.params;
      const machine = await storage.getPmMachineByIdMsn(idMsn);
      
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      res.json(machine);
    } catch (error) {
      console.error("Error fetching PM machine:", error);
      res.status(500).json({ message: "Failed to fetch PM machine" });
    }
  });

  app.post("/api/pm-machines", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPmMachineSchema.parse(req.body);
      
      // Check if machine with this idMsn already exists
      const existingMachine = await storage.getPmMachineByIdMsn(validatedData.idMsn);
      if (existingMachine) {
        return res.status(400).json({ message: "Machine with this ID already exists" });
      }
      
      const machine = await storage.createPmMachine(validatedData);
      res.json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating PM machine:", error);
      res.status(500).json({ message: "Failed to create PM machine" });
    }
  });

  app.put("/api/pm-machines/:idMsn", isAuthenticated, async (req, res) => {
    try {
      const { idMsn } = req.params;
      const validatedData = insertPmMachineSchema.partial().parse(req.body);
      
      const existingMachine = await storage.getPmMachineByIdMsn(idMsn);
      if (!existingMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      const machine = await storage.updatePmMachine(idMsn, validatedData);
      res.json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating PM machine:", error);
      res.status(500).json({ message: "Failed to update PM machine" });
    }
  });

  app.delete("/api/pm-machines/:idMsn", isAuthenticated, async (req, res) => {
    try {
      const { idMsn } = req.params;
      const { deleteAll } = req.query;
      
      const existingMachine = await storage.getPmMachineByIdMsn(idMsn);
      if (!existingMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      await storage.deletePmMachineData(idMsn, deleteAll === 'true');
      res.json({ message: "Machine data deleted successfully" });
    } catch (error) {
      console.error("Error deleting PM machine:", error);
      res.status(500).json({ message: "Failed to delete PM machine" });
    }
  });

  // Excel export route
  app.get("/api/pm-machines/export/excel", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let machines;
      
      if (search && typeof search === 'string') {
        machines = await storage.searchPmMachines(search);
      } else {
        machines = await storage.getAllPmMachines();
      }

      const worksheet = XLSX.utils.json_to_sheet(machines.map(machine => ({
        'No': machine.no,
        'Id Msn': machine.idMsn,
        'Alamat': machine.alamat,
        'Pengelola': machine.pengelola,
        'Periode PM': machine.periodePM || '',
        'Tgl Selesai PM': machine.tglSelesaiPM || '',
        'Status': machine.status,
        'Teknisi': machine.teknisi
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PM Data");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename=pm-data.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting PM machines:", error);
      res.status(500).json({ message: "Failed to export PM machines" });
    }
  });

  // Excel import route
  app.post("/api/pm-machines/import/excel", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const importedMachines = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as any;
          const machineData = {
            idMsn: row['Id Msn'] || row['idMsn'],
            alamat: row['Alamat'] || row['alamat'],
            pengelola: row['Pengelola'] || row['pengelola'],
            periodePM: row['Periode PM'] || row['periodePM'] || null,
            tglSelesaiPM: row['Tgl Selesai PM'] || row['tglSelesaiPM'] || null,
            status: row['Status'] || row['status'] || 'Outstanding',
            teknisi: row['Teknisi'] || row['teknisi']
          };

          const validatedData = insertPmMachineSchema.parse(machineData);
          
          // Check if machine already exists
          const existingMachine = await storage.getPmMachineByIdMsn(validatedData.idMsn);
          if (existingMachine) {
            // Update existing machine
            const updated = await storage.updatePmMachine(validatedData.idMsn, validatedData);
            importedMachines.push(updated);
          } else {
            // Create new machine
            const created = await storage.createPmMachine(validatedData);
            importedMachines.push(created);
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        }
      }

      res.json({
        message: `Import completed. ${importedMachines.length} machines processed.`,
        imported: importedMachines.length,
        errors: errors
      });
    } catch (error) {
      console.error("Error importing PM machines:", error);
      res.status(500).json({ message: "Failed to import PM machines" });
    }
  });

  // Machine Notes routes
  app.get("/api/machine-notes/:idMsn", isAuthenticated, async (req, res) => {
    try {
      const { idMsn } = req.params;
      const note = await storage.getMachineNote(idMsn);
      res.json(note || { idMsn, content: '', createdAt: new Date() });
    } catch (error) {
      console.error("Error fetching machine note:", error);
      res.status(500).json({ message: "Failed to fetch machine note" });
    }
  });

  app.post("/api/machine-notes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMachineNoteSchema.parse(req.body);
      const note = await storage.upsertMachineNote(validatedData);
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error saving machine note:", error);
      res.status(500).json({ message: "Failed to save machine note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
