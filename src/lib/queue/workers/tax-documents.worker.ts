import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue/queues";

// 100 credits = $1; thresholds in credits
const US_THRESHOLD = 60000;  // $600
const CA_THRESHOLD = 50000;  // ~$500 CAD

export function startTaxDocumentsWorker() {
  const worker = new Worker(
    "tax-documents",
    async (job: Job) => {
      const taxYear: number = job.data.taxYear ?? new Date().getFullYear() - 1;
      const startDate = new Date(`${taxYear}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${taxYear}-12-31T23:59:59.999Z`);

      const earnings = await prisma.creditTransaction.groupBy({
        by: ["workerId"],
        where: {
          direction: "earn",
          state: "available",
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amountCredits: true },
      });

      let generated = 0;

      for (const row of earnings) {
        const totalCredits = row._sum?.amountCredits ?? 0;
        const workerRecord = await prisma.worker.findUnique({
          where: { id: row.workerId },
          select: { id: true, email: true, redditUsername: true, country: true },
        });
        if (!workerRecord) continue;

        const isUs = workerRecord.country?.toUpperCase() === "US";
        const isCa = workerRecord.country?.toUpperCase() === "CA";
        const threshold = isCa ? CA_THRESHOLD : US_THRESHOLD;

        if (!isUs && !isCa) continue;
        if (totalCredits < threshold) continue;

        const docType = isUs ? "1099-NEC" : "T4A";
        const amountDollars = totalCredits / 100;

        const existing = await prisma.taxDocument.findFirst({
          where: { workerId: workerRecord.id, year: taxYear },
        });
        if (existing) continue;

        await prisma.taxDocument.create({
          data: {
            workerId: workerRecord.id,
            year: taxYear,
            docType,
            storageUrl: "",  // populated by document generation service
            generatedAt: new Date(),
          },
        });
        generated++;

        await prisma.notification.create({
          data: {
            workerId: workerRecord.id,
            channel: "in_app",
            type: "tax_document_ready",
            title: `Your ${taxYear} ${docType} is ready`,
            body: `You earned $${amountDollars.toFixed(2)} in ${taxYear}. Your ${docType} is available in your dashboard.`,
          },
        });

        await emailQueue.add("tax-document-ready", {
          to: workerRecord.email,
          subject: `Your ${taxYear} ${docType} tax form is available`,
          template: "tax-document-ready",
          data: {
            username: workerRecord.redditUsername,
            taxYear,
            docType,
            amount: amountDollars.toFixed(2),
          },
        });
      }

      return { taxYear, generated };
    },
    { connection: redis }
  );

  worker.on("failed", (job, err) => {
    console.error(`[tax-documents] job ${job?.id} failed:`, err.message);
  });

  return worker;
}
