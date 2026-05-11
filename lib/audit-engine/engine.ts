import { AuditInputSchema, ToolEntrySchema } from "../schemas/audit";
import { AuditEngineResult, AuditRecommendation, OverlapInsight, RuleContext } from "./types";
import { calculateScore } from "./scoring";
import { 
  checkLLMOverlap, 
  checkCodingAssistantOverlap, 
  checkImageGenOverlap, 
  checkExcessSeats, 
  checkLowUsage 
} from "./rules";

export function runAuditEngine(input: AuditInputSchema): AuditEngineResult {
  const toolMap = new Map<string, ToolEntrySchema>();
  let totalSpend = 0;

  input.tools.forEach(tool => {
    toolMap.set(tool.toolId, tool);
    totalSpend += tool.monthlySpend;
  });

  const context: RuleContext = {
    input,
    totalSpend,
    toolMap
  };

  const recommendations: AuditRecommendation[] = [];
  const overlaps: OverlapInsight[] = [];

  // Single Overlap Checks
  const llmRes = checkLLMOverlap(context);
  if (llmRes.rec) recommendations.push(llmRes.rec);
  if (llmRes.overlap) overlaps.push(llmRes.overlap);

  const codeRes = checkCodingAssistantOverlap(context);
  if (codeRes.rec) recommendations.push(codeRes.rec);
  if (codeRes.overlap) overlaps.push(codeRes.overlap);

  const imgRes = checkImageGenOverlap(context);
  if (imgRes.rec) recommendations.push(imgRes.rec);
  if (imgRes.overlap) overlaps.push(imgRes.overlap);

  // Array Checks
  recommendations.push(...checkExcessSeats(context));
  recommendations.push(...checkLowUsage(context));

  // Deduplicate
  const uniqueRecs = Array.from(new Map(recommendations.map(r => [r.id, r])).values());
  const uniqueOverlaps = Array.from(new Map(overlaps.map(o => [o.tools.join('-'), o])).values());

  const score = calculateScore(uniqueRecs, uniqueOverlaps, context);
  
  const totalRecoverableSavings = uniqueRecs.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const monthlyWaste = totalRecoverableSavings; // Simplification for now

  const criticalIssueCount = uniqueRecs.filter(r => r.severity === "critical" || r.severity === "high").length;

  return {
    score,
    monthlyWaste,
    totalRecoverableSavings,
    criticalIssueCount,
    recommendations: uniqueRecs,
    overlaps: uniqueOverlaps,
    totalSpend,
    activeToolsCount: input.tools.length
  };
}
