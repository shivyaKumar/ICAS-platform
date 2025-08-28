import { NextResponse } from "next/server";
import { getPool } from "@/utils/db"; // your existing MSSQL pool connector

// Create a new assessment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { framework, division, owner, assessmentDate } = body;

    const pool = await getPool();

    // Example DB insert query (adjust column names to match your DB schema)
    await pool.request()
      .input("framework", framework)
      .input("division", division)
      .input("owner", owner)
      .input("date", assessmentDate)
      .query(`
        INSERT INTO assessments (framework, division, owner, assessmentDate, status)
        VALUES (@framework, @division, @owner, @date, 'Pending')
      `);

    return NextResponse.json({ success: true, message: "Assessment created successfully" });
  } catch (err) {
    console.error("Error creating assessment:", err);
    return NextResponse.json({ success: false, message: "Failed to create assessment" }, { status: 500 });
  }
}

// Fetch all assessments (optional for Current/Completed pages)
export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM assessments ORDER BY createdAt DESC");
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Error fetching assessments:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch assessments" }, { status: 500 });
  }
}
