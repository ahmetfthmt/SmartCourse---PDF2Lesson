import { COOKIE_NAME } from "@shared/const";
import { GenerateCourseInputSchema } from "../shared/course";
import { generateCourse } from "./courseProvider";
import { parsePdfToMarkdown } from "./pdfParser";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  course: router({
    generate: publicProcedure.input(GenerateCourseInputSchema).mutation(async ({ input }) => {
      if (!input.pdfBase64.startsWith("data:application/pdf;base64,")) throw new Error("Yalnızca PDF dosyaları kabul edilir.");
      const encoded = input.pdfBase64.split(",")[1];
      if (!encoded) throw new Error("PDF verisi okunamadı.");
      const parsed = await parsePdfToMarkdown(Buffer.from(encoded, "base64"));
      const course = await generateCourse(input, parsed.markdownContent);
      return { course, parsedDocument: { pageCount: parsed.structuredJson.pageCount, titleSnippet: parsed.structuredJson.titleSnippet, sectionCount: parsed.structuredJson.sections.length } };
    }),
  }),
});

export type AppRouter = typeof appRouter;
