"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

//1. INTERFACES
// Review data from Supabase
interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  status: string;
  approved_response?: string;
}
// AI-generated responses
interface AIResponse {
  professional: string;
  friendly: string;
  apology: string;
}

//2. STATES
export default function Home() {
  // Store reviews from database
  const [reviews, setReviews] = useState<Review[]>([]);
  // Store AI responses by review ID
  const [aiResponses, setAiResponses] = useState<Record<string, AIResponse>>({});

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  //3. FETCH REVIEWS
  // Fetch all reviews from Supabase
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setReviews(data || []);
    }
  };

  //4. INSERT SAMPLE REVIEW
  // Insert sample review into database
  const insertTestReview = async () => {
    const { error } = await supabase
      .from("reviews")
      .insert([
        {
          place_id: "test-place",
          author_name: "Duong",
          rating: 5,
          review_text: "Amazing hotel and great service!",
        },
      ]);

    if (error) {
      console.error(error);
      alert("Insert failed");
    } else {
      alert("Review inserted successfully!");
      fetchReviews();
    }
  };

  //5. GENERATE AI
  // Generate AI responses using OpenAI API
  const generateAIResponse = async (
    reviewId: string,
    reviewText: string
  ) => {
    try {
      setLoadingId(reviewId);

      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reviewText,
          }),
        }
      );

      const data = await response.json();

      setAiResponses((prev) => ({
        ...prev,
        [reviewId]: data,
      }));

      setLoadingId(null);
    } catch (error) {
      console.error(error);

      setLoadingId(null);

      alert(
        "Failed to generate AI response"
      );
    }
  };

  // Update review status to Resolved
  const approveReview = async (
    reviewId: string,
    responseText: string
  ) => {
    const { error } = await supabase
      .from("reviews")
      .update({
        status: "Resolved",
        approved_response: responseText,
      })
      .eq("id", reviewId);

    if (error) {
      console.error(error);
      alert("Failed to approve review");
    } else {
      // remove AI responses from UI
      setAiResponses((prev) => {
        const updated = { ...prev };

        delete updated[reviewId];

        return updated;
      });

      fetchReviews();
    }
  };

  // Load reviews on first render
  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">
            UCOrm Dashboard
          </h1>

          <button
            onClick={insertTestReview}
            className="bg-white text-black px-5 py-2 rounded-xl font-bold"
          >
            Add Test Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              No reviews found.
            </div>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-700 p-5 rounded-xl hover:border-blue-500 transition"
            >
              {/* Review Card */}
              <div className="flex justify-between mb-2">
                <h2 className="font-bold text-lg">
                  {review.author_name}
                </h2>

                <span className="text-yellow-400">
                  ⭐ {review.rating}
                </span>
              </div>

              <p className="text-gray-300 mb-3">
                {review.review_text}
              </p>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${review.status === "Resolved"
                  ? "bg-green-500 text-black"
                  : "bg-yellow-500 text-black"
                  }`}
              >
                {review.status}
              </span>

              {review.approved_response && (
                <div className="mt-3 bg-green-950 border border-green-500 p-3 rounded-lg">
                  <p className="font-bold text-green-400 mb-1">
                    Approved Response
                  </p>

                  <p>
                    {review.approved_response}
                  </p>
                </div>
              )}

              {review.status === "Pending" && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      generateAIResponse(
                        review.id,
                        review.review_text
                      )
                    }
                    disabled={loadingId === review.id}
                    className="bg-blue-500 px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loadingId === review.id
                      ? "Generating..."
                      : "Generate AI"}
                  </button>
                </div>)}

              {/* AI Generated Responses */}
              {aiResponses?.[review.id] && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="font-bold mb-1">
                      Professional
                    </p>
                    <button
                      onClick={() =>
                        approveReview(
                          review.id,
                          aiResponses[review.id]
                            .professional
                        )
                      }
                      className="mt-2 bg-green-500 text-black px-4 py-2 rounded-lg font-bold"
                    >
                      Approve
                    </button>
                    <p>
                      {
                        aiResponses[review.id]
                          .professional
                      }
                    </p>
                  </div>

                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="font-bold mb-1">
                      Friendly
                    </p>
                    <button
                      onClick={() =>
                        approveReview(
                          review.id,
                          aiResponses[review.id]
                            .friendly
                        )
                      }
                      className="mt-2 bg-green-500 text-black px-4 py-2 rounded-lg font-bold"
                    >
                      Approve
                    </button>
                    <p>
                      {
                        aiResponses?.[review.id]
                          .friendly
                      }
                    </p>
                  </div>

                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="font-bold mb-1">
                      Apology
                    </p>
                    <button
                      onClick={() =>
                        approveReview(
                          review.id,
                          aiResponses[review.id]
                            .apology
                        )
                      }
                      className="mt-2 bg-green-500 text-black px-4 py-2 rounded-lg font-bold"
                    >
                      Approve
                    </button>
                    <p>
                      {
                        aiResponses?.[review.id]
                          .apology
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}