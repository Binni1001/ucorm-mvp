"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

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

const RESPONSE_TYPES: { key: keyof AIResponse; label: string; icon: string }[] = [
  { key: "professional", label: "Professional", icon: "💼" },
  { key: "friendly",     label: "Friendly",     icon: "😊" },
  { key: "apology",      label: "Apology",      icon: "🙏" },
];

//2. STATES
export default function Home() {
  // Store reviews from database
  const [reviews, setReviews] = useState<Review[]>([]);
  // Store AI responses by review ID
  const [aiResponses, setAiResponses] = useState<Record<string, AIResponse>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  //3. FETCH REVIEWS
  // Fetch all reviews from Supabase
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setReviews(data || []);
  };

  //4. INSERT SAMPLE REVIEW
  // Insert sample review into database
  const insertTestReview = async () => {
    const { error } = await supabase.from("reviews").insert([
      {
        place_id: "test-place",
        author_name: "Duong",
        rating: 5,
        review_text: "Amazing hotel and great service!",
      },
    ]);

    if (error) { console.error(error); alert("Insert failed"); }
    else { alert("Review inserted successfully!"); fetchReviews(); }
  };

  //5. GENERATE AI
  // Generate AI responses using OpenAI API
  const generateAIResponse = async (reviewId: string, reviewText: string) => {
    try {
      setLoadingId(reviewId);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewText }),
      });
      const data = await response.json();
      setAiResponses((prev) => ({ ...prev, [reviewId]: data }));
      setLoadingId(null);
    } catch (error) {
      console.error(error);
      setLoadingId(null);
      alert("Failed to generate AI response");
    }
  };

  //6. IMPORT REVIEWS
  const importReviews = async () => {
    try {
      const response = await fetch("/api/import-reviews", { method: "POST" });
      const data = await response.json();

      for (const review of data) {
        // Check duplicate review
        const { data: existingReview } = await supabase
          .from("reviews")
          .select()
          .eq("review_text", review.review_text)
          .single();

        // Skip if review already exists
        if (existingReview) continue;

        // Insert new review
        await supabase.from("reviews").insert([
          {
            place_id: "mock-place",
            author_name: review.author_name,
            rating: review.rating,
            review_text: review.review_text,
          },
        ]);
      }

      fetchReviews();
      alert("Reviews imported!");
    } catch (error) {
      console.error(error);
      alert("Import failed");
    }
  };

  // Update review status to Resolved
  const approveReview = async (reviewId: string, responseText: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ status: "Resolved", approved_response: responseText })
      .eq("id", reviewId);

    if (error) { console.error(error); alert("Failed to approve review"); }
    else {
      // Remove AI responses from UI
      setAiResponses((prev) => {
        const updated = { ...prev };
        delete updated[reviewId];
        return updated;
      });
      fetchReviews();
    }
  };

  // Load reviews on first render
  useEffect(() => { fetchReviews(); }, []);

  const pendingCount  = reviews.filter((r) => r.status === "Pending").length;
  const resolvedCount = reviews.filter((r) => r.status === "Resolved").length;

  return (
    <div className={styles.dashboardRoot}>

      {/* ── Topbar ── */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⭐</div>
          <div>
            <div className={styles.brandTitle}>UCOrm Dashboard</div>
            <div className={styles.brandSub}>Review Management</div>
          </div>
        </div>

        <div className={styles.topbarActions}>
          <button onClick={insertTestReview} className={styles.addBtn}>
            <span>＋</span> Add Test Review
          </button>
          <button onClick={importReviews} className={styles.importBtn}>
            <span>↓</span> Import Reviews
          </button>
        </div>
      </div>

      <div className={styles.content}>

        {/* ── Stats ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total</div>
            <div className={styles.statValue}>{reviews.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pending</div>
            <div className={`${styles.statValue} ${styles.pending}`}>{pendingCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Resolved</div>
            <div className={`${styles.statValue} ${styles.resolved}`}>{resolvedCount}</div>
          </div>
        </div>

        {/* ── Section Header ── */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Reviews</span>
          <div className={styles.sectionLine} />
        </div>

        {/* ── Reviews List ── */}
        <div className={styles.reviewsList}>
          {reviews.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>No reviews yet. Add a test review to get started.</div>
            </div>
          )}

          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>

              {/* Review Header */}
              <div className={styles.reviewHeader}>
                <div className={styles.authorRow}>
                  <div className={styles.avatar}>
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.authorName}>{review.author_name}</div>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s <= review.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                <span className={`${styles.statusBadge} ${review.status === "Resolved" ? styles.resolved : styles.pending}`}>
                  <span className={styles.statusDot} />
                  {review.status}
                </span>
              </div>

              {/* Review Text */}
              <p className={styles.reviewText}>{review.review_text}</p>

              {/* Approved Response */}
              {review.approved_response && (
                <div className={styles.approvedBox}>
                  <div className={styles.approvedLabel}><span>✓</span> Approved Response</div>
                  <p className={styles.approvedText}>{review.approved_response}</p>
                </div>
              )}

              {/* Generate Button */}
              {review.status === "Pending" && (
                <button
                  onClick={() => generateAIResponse(review.id, review.review_text)}
                  disabled={loadingId === review.id}
                  className={styles.generateBtn}
                >
                  {loadingId === review.id
                    ? <><span className={styles.spinner} /> Generating...</>
                    : <><span>✦</span> Generate AI</>
                  }
                </button>
              )}

              {/* AI Generated Responses */}
              {aiResponses?.[review.id] && (
                <div className={styles.aiResponses}>
                  {RESPONSE_TYPES.map(({ key, label, icon }) => (
                    <div key={key} className={`${styles.aiCard} ${styles[key]}`}>
                      <div className={styles.aiCardHeader}>
                        <div className={styles.aiCardLabel}>
                          <span className={styles.aiCardIcon}>{icon}</span>
                          {label}
                        </div>
                        <button
                          onClick={() => approveReview(review.id, aiResponses[review.id][key])}
                          className={styles.approveBtn}
                        >
                          ✓ Approve
                        </button>
                      </div>
                      <p className={styles.aiResponseText}>{aiResponses[review.id][key]}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}