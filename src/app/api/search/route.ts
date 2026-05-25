import { NextRequest, NextResponse } from "next/server";

const OPENALEX_URL = "https://api.openalex.org";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const filter = searchParams.get("filter") || "";

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  // Sanitize input
  const sanitized = query.replace(/[<>\"'%;()&+]/g, "").trim().slice(0, 200);

  try {
    let url = `${OPENALEX_URL}/works?search=${encodeURIComponent(sanitized)}&page=${page}&per-page=10&sort=relevance_score:desc`;

    if (filter) {
      url += `&filter=${filter}`;
    }

    // Request useful fields only
    url += "&select=id,title,abstract_inverted_index,authorships,publication_year,primary_location,cited_by_count,open_access,doi,topics";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "V44V/1.0 (research platform; mailto:v44v@example.com)",
      },
      next: { revalidate: 300 }, // cache 5 mins
    });

    if (!response.ok) {
      throw new Error(`OpenAlex error: ${response.status}`);
    }

    const data = await response.json();

    // Decode abstract from inverted index
    const results = data.results.map((work: any) => {
      let abstract = "";
      if (work.abstract_inverted_index) {
        const wordPositions: { word: string; pos: number }[] = [];
        for (const [word, positions] of Object.entries(work.abstract_inverted_index as Record<string, number[]>)) {
          (positions as number[]).forEach((pos) => {
            wordPositions.push({ word, pos });
          });
        }
        wordPositions.sort((a, b) => a.pos - b.pos);
        abstract = wordPositions.map((wp) => wp.word).join(" ");
      }

      return {
        id: work.id,
        title: work.title || "Untitled",
        abstract: abstract.slice(0, 400) || "No abstract available.",
        authors: work.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean) || [],
        year: work.publication_year,
        journal: work.primary_location?.source?.display_name || null,
        citations: work.cited_by_count || 0,
        openAccess: work.open_access?.is_oa || false,
        doi: work.doi || null,
        topics: work.topics?.slice(0, 2).map((t: any) => t.display_name) || [],
      };
    });

    return NextResponse.json({
      results,
      total: data.meta?.count || 0,
      page: parseInt(page),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}