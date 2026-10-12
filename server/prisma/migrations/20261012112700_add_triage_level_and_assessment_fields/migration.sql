-- CreateEnum
CREATE TYPE "TriageLevel" AS ENUM ('EMERGENCY', 'VISIT_PHC', 'VIDEO_CONSULT', 'SELF_CARE');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "severity" TEXT,
ADD COLUMN     "triageLevel" "TriageLevel";

-- CreateIndex
CREATE INDEX "Assessment_triageLevel_idx" ON "Assessment"("triageLevel");
