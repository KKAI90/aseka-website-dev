import { NextRequest, NextResponse } from "next/server";
import { getMypageCandidateId } from "@/lib/mypageAuth";
import { computeMypageJobList } from "@/lib/mypageJobMatching";

export async function GET(req: NextRequest) {
  const id = getMypageCandidateId(req);
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await computeMypageJobList(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The candidate's own view never needs to know *why* a job scored the way it did, or
  // which jobs staff manually included/excluded — strip that back out here so this stays
  // exactly the same shape it always was to the client. computeMypageJobList() also
  // returns candidateSummary, which this route never sent before — omit that too.
  const jobs = result.jobs.map(({ scoreBreakdown: _sb, overrideType: _ot, ...rest }) => rest);
  return NextResponse.json({ jobs });
}
