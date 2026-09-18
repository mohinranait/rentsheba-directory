import { NextResponse } from "next/server";

// Get an individual listing
export async function GET(
  _request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  const { id } = await _context.params;

  return NextResponse.json(
    {
      success: true,
      message: "Listing fetched successfully",
      data: { id },
    },
    { status: 200 },
  );
}

// Update a listing
export async function PATCH(
  request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  const { id } = await _context.params;
  const body = await request.json();

  return NextResponse.json(
    {
      success: true,
      message: "Listing updated successfully",
      data: { id, ...body },
    },
    { status: 200 },
  );
}

// Delete a listing
export async function DELETE(
  _request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  const { id } = await _context.params;

  return NextResponse.json(
    {
      success: true,
      message: "Listing deleted successfully",
      data: { id },
    },
    { status: 200 },
  );
}
