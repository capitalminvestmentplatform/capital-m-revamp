import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Others from "@/models/Others";

export async function GET() {
  try {
    await connectToDatabase();

    const data = await Others.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching PandaConnect others entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { others, email, clientCode } = await req.json();

    if (others == null || !email || !clientCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newEntry = new Others({
      others,
      email,
      clientCode,
    });

    await newEntry.save();

    return NextResponse.json(
      { message: "PandaConnect others created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating PandaConnect others:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const { others, id } = await req.json();

    // Find the existing entry to update based on clientCode and email or any other unique identifier
    const existingEntry = await Others.findById(id);
    if (!existingEntry) {
      return NextResponse.json(
        { error: "PandaConnect others entry not found" },
        { status: 404 }
      );
    }

    existingEntry.others = others;

    await existingEntry.save();

    return NextResponse.json(
      { message: "PandaConnect others updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating PandaConnect others:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
