/**
 * Migration script: Supabase → AWS RDS
 * Run: node scripts/migrate-supabase-to-rds.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://eftgkvtpvaixipazrjnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGdrdnRwdmFpeGlwYXpyam5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ1ODcwNCwiZXhwIjoyMDg5MDM0NzA0fQ.CGLtm-Gz9udPrNUZkZnPJDM_v-3wK-GO9LC5_Gpwhak";
const RDS_URL = "postgresql://aseka_admin:Aseka2026Dev@aseka-dev-db.cktabbrhafl9.ap-northeast-1.rds.amazonaws.com:5432/postgres?sslmode=require";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const prisma = new PrismaClient({ datasources: { db: { url: RDS_URL } } });

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// ── Migrate candidates ───────────────────────────────────────────────────────
async function migrateCandidates() {
  log("📋 Fetching candidates from Supabase...");
  const { data, error } = await supabase.from("candidates").select("*");
  if (error) { log(`❌ Error: ${error.message}`); return 0; }
  if (!data?.length) { log("⚠️  No candidates found"); return 0; }

  log(`Found ${data.length} candidates. Inserting into RDS...`);
  let success = 0, skip = 0;

  for (const row of data) {
    try {
      await prisma.candidates.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id:             row.id,
          name:           row.name,
          name_kana:      row.name_kana,
          email:          row.email,
          phone:          row.phone,
          gender:         row.gender,
          date_of_birth:  row.date_of_birth,
          nationality:    row.nationality,
          address:        row.address,
          visa_type:      row.visa_type,
          visa_expiry:    row.visa_expiry,
          jlpt:           row.jlpt,
          jlpt_actual:    row.jlpt_actual,
          height_cm:      row.height_cm,
          weight_kg:      row.weight_kg,
          skill:          row.skill,
          preferred_job:  row.preferred_job,
          work_hours:     row.work_hours,
          availability:   row.availability,
          marital_status: row.marital_status,
          dependents:     row.dependents != null ? String(row.dependents) : null,
          education:      row.education || [],
          work_history:   row.work_history || [],
          certifications: row.certifications || [],
          motivation:     row.motivation,
          self_pr:        row.self_pr,
          status:         row.status,
          match_job_id:   row.match_job_id,
          match_job_name: row.match_job_name,
          note:           row.note,
          cv_filename:    row.cv_filename,
          created_at:     row.created_at ? new Date(row.created_at) : undefined,
          updated_at:     row.updated_at ? new Date(row.updated_at) : undefined,
        },
      });
      success++;
    } catch (e) {
      log(`  ⚠️  Skip candidate ${row.id} (${row.name}): ${e.message}`);
      skip++;
    }
  }
  log(`✅ Candidates: ${success} migrated, ${skip} skipped`);
  return success;
}

// ── Migrate job_listings ─────────────────────────────────────────────────────
async function migrateJobs() {
  log("💼 Fetching job_listings from Supabase...");
  const { data, error } = await supabase.from("job_listings").select("*");
  if (error) { log(`❌ Error: ${error.message}`); return 0; }
  if (!data?.length) { log("⚠️  No jobs found"); return 0; }

  log(`Found ${data.length} jobs. Inserting into RDS...`);
  let success = 0, skip = 0;

  for (const row of data) {
    try {
      await prisma.job_listings.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id:               row.id,
          company:          row.company,
          industry:         row.industry,
          position_ja:      row.position_ja,
          position_vn:      row.position_vn,
          location:         row.location,
          salary:           row.salary,
          jlpt_min:         row.jlpt_min,
          count:            row.count ?? 1,
          status:           row.status,
          job_description:  row.job_description,
          requirements:     row.requirements,
          note:             row.note,
          created_at:       row.created_at ? new Date(row.created_at) : undefined,
          updated_at:       row.updated_at ? new Date(row.updated_at) : undefined,
        },
      });
      success++;
    } catch (e) {
      log(`  ⚠️  Skip job ${row.id} (${row.company}): ${e.message}`);
      skip++;
    }
  }
  log(`✅ Jobs: ${success} migrated, ${skip} skipped`);
  return success;
}

// ── Migrate contact_submissions ──────────────────────────────────────────────
async function migrateMessages() {
  log("✉️  Fetching contact_submissions from Supabase...");
  const { data, error } = await supabase.from("contact_submissions").select("*");
  if (error) { log(`❌ Error: ${error.message}`); return 0; }
  if (!data?.length) { log("⚠️  No messages found"); return 0; }

  log(`Found ${data.length} messages. Inserting into RDS...`);
  let success = 0, skip = 0;

  for (const row of data) {
    try {
      await prisma.contact_submissions.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id:         row.id,
          type:       row.type,
          name:       row.name,
          company:    row.company,
          email:      row.email,
          phone:      row.phone,
          service:    row.service,
          message:    row.message,
          status:     row.status,
          created_at: row.created_at ? new Date(row.created_at) : undefined,
        },
      });
      success++;
    } catch (e) {
      log(`  ⚠️  Skip message ${row.id}: ${e.message}`);
      skip++;
    }
  }
  log(`✅ Messages: ${success} migrated, ${skip} skipped`);
  return success;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log("🚀 Starting migration: Supabase → AWS RDS");
  log("─".repeat(50));

  const candidates = await migrateCandidates();
  const jobs       = await migrateJobs();
  const messages   = await migrateMessages();

  log("─".repeat(50));
  log(`🎉 Migration complete!`);
  log(`   Candidates: ${candidates}`);
  log(`   Jobs:       ${jobs}`);
  log(`   Messages:   ${messages}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Fatal:", e);
  prisma.$disconnect();
  process.exit(1);
});
