// scripts/seed-statements.js
/* eslint-disable no-console */
import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import User from "../models/User";
import Statement from "../models/Statement";
import { connectToDatabase } from "../lib/db";
import { uploadFileToCloudinary } from "../lib/upload";

// ---------- Config ----------
const STATEMENTS_BASE_DIR = "data/OneDrive_1_12-08-2025";

if (!STATEMENTS_BASE_DIR) throw new Error("Missing STATEMENTS_BASE_DIR");

const isDryRun = false;

// ---------- Helpers ----------

const MONTH_ALIASES = {
  january: "Jan",
  jan: "Jan",
  february: "Feb",
  feb: "Feb",
  march: "Mar",
  mar: "Mar",
  april: "Apr",
  apr: "Apr",
  may: "May",
  june: "Jun",
  jun: "Jun",
  july: "Jul",
  jul: "Jul",
  august: "Aug",
  aug: "Aug",
  september: "Sep",
  sept: "Sep",
  sep: "Sep",
  october: "Oct",
  oct: "Oct",
  november: "Nov",
  nov: "Nov",
  december: "Dec",
  dec: "Dec",
};

function parseFolderToMonthYear(folderName) {
  // Accepts "March - 2025", "Mar-2025", "mar 2025", etc.
  const cleaned = folderName.replace(/_/g, " ").trim();
  const m = cleaned.match(/([A-Za-z]+)\s*[- ]\s*(\d{4})/);
  if (!m)
    throw new Error(`Cannot parse month/year from folder: "${folderName}"`);
  const rawMonth = m[1].toLowerCase();
  const year = Number(m[2]);
  const month = MONTH_ALIASES[rawMonth];
  if (!month) throw new Error(`Unrecognized month in folder: "${folderName}"`);
  return { month, year };
}

function clientCodeFromName(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base ? base.toLowerCase() : null;
}

async function findUserIdByClientCode(clientCode) {
  // Ensure clientCode is saved lowercase in DB (as per your seeding)
  const user = await User.findOne({
    clientCode: clientCode.toUpperCase(),
  }).select("_id clientCode");
  return user?._id || null;
}

async function upsertStatement({ userId, month, year, pdfUrl }) {
  if (!userId)
    return { success: false, created: false, reason: "Missing userId" };

  const filter = { userId, month, year };
  const update = { $set: { pdf: pdfUrl } };
  const opts = { upsert: true, new: true, setDefaultsOnInsert: true };

  if (isDryRun) {
    console.log(`[DRY RUN] Would upsert Statement:`, { filter, update });
    return { success: true, created: false, dryRun: true };
  }

  // Check if already exists before update
  const existing = await Statement.findOne(filter);

  const doc = await Statement.findOneAndUpdate(filter, update, opts);

  const created = !existing && !!doc;
  return { success: !!doc, created, doc };
}

// ---------- Main ----------
async function main() {
  const baseDir = path.resolve(STATEMENTS_BASE_DIR);
  console.log(`Scanning base dir: ${baseDir}`);
  await connectToDatabase();
  // Readdirp: depth 1 folders (month-year), then PDFs inside them
  // We’ll first list folders, then inside each, list files (PDFs or any files).
  const dirents = await fs.readdir(baseDir, { withFileTypes: true });
  const folders = dirents.filter((d) => d.isDirectory()).map((d) => d.name);

  let processed = 0,
    skippedNoUser = 0,
    errors = 0;
  let count = 0;
  for (const folderName of folders) {
    let month, year;
    try {
      ({ month, year } = parseFolderToMonthYear(folderName));
      count += count;
    } catch (e) {
      console.warn(`Skipping folder "${folderName}": ${e.message}`);
      continue;
    }

    const folderPath = path.join(baseDir, folderName);
    console.log("folderPath", folderPath);
    // Recursively read files in this folder (flat is fine too)
    // inside your for (const folderName of folders) { month/year already parsed }
    const dirEntries = await fs.readdir(folderPath, { withFileTypes: true });
    const pdfEntries = dirEntries.filter(
      (d) => d.isFile() && /\.pdf$/i.test(d.name)
    );

    for (const d of pdfEntries) {
      const filePath = path.join(folderPath, d.name);

      const clientCode = clientCodeFromName(d.name);
      if (!clientCode) {
        console.warn(`Could not parse clientCode from "${d.name}". Skipping.`);
        continue;
      }

      const userId = await findUserIdByClientCode(clientCode);
      if (!userId) {
        skippedNoUser++;
        console.warn(
          `No user for clientCode "${clientCode}". Skipping: ${filePath}`
        );
        continue;
      }

      // Example usage inside your loop:
      const folderPathOnCloudinary = `capital-m/statements/${year}/${month}`;
      const publicId = `${clientCode}_${year}_${month}`;

      console.log(publicId, "folderPathOnCloudinary", folderPathOnCloudinary);
      const pdfUrl = await uploadFileToCloudinary(
        filePath,
        folderPathOnCloudinary,
        publicId
      );
      const result = await upsertStatement({ userId, month, year, pdfUrl });
      if (result.success && result.created) {
        console.log(`✅ Created new Statement for ${clientCode}`);
      } else if (result.success) {
        console.log(`♻ Updated existing Statement for ${clientCode}`);
      }
      processed++;
      console.log(
        `✔ ${clientCode.toUpperCase()} - ${userId} | ${month} ${year} ->`
      );
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Processed statements: ${processed}`);
  console.log(`Skipped (no user):   ${skippedNoUser}`);
  console.log(`Errors:               ${errors}`);

  console.log("Done.");
}

// Run
main().catch(async (e) => {
  console.error("Fatal error:", e);
  try {
  } catch {}
  process.exit(1);
});
