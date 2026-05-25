import { NextResponse } from "next/server";

export async function POST() {
  try {
    const mockReviews = [
      {
        author_name: "John Smith",
        rating: 5,
        review_text:
          "Amazing hotel with fantastic staff!",
      },
      {
        author_name: "Emily Johnson",
        rating: 4,
        review_text:
          "Very clean rooms and great location.",
      },
      {
        author_name: "Michael Brown",
        rating: 2,
        review_text:
          "The room was noisy and service was slow.",
      },
      {
        author_name: "Sophia Lee",
        rating: 5,
        review_text:
          "Excellent breakfast and friendly employees.",
      },
      {
        author_name: "David Wilson",
        rating: 3,
        review_text:
          "Average experience overall but decent value.",
      },
    ];

    return NextResponse.json(
      mockReviews
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to import reviews",
      },
      {
        status: 500,
      }
    );
  }
}