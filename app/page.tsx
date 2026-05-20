"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  status: string;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

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

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
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

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-700 p-5 rounded-xl"
          >
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

            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm">
              {review.status}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}