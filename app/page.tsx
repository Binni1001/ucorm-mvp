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

  const pendingCount = reviews.filter((r) => r.status === "Pending").length;
  const resolvedCount = reviews.filter((r) => r.status === "Resolved").length;

  const responseTypes = [
    {
      key: "professional" as keyof AIResponse,
      label: "Professional",
      icon: "💼",
      accent: "from-slate-500 to-slate-700",
      bg: "bg-slate-50 dark:bg-slate-900/40",
      border: "border-slate-200 dark:border-slate-700",
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      key: "friendly" as keyof AIResponse,
      label: "Friendly",
      icon: "😊",
      accent: "from-sky-500 to-blue-600",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      border: "border-sky-200 dark:border-sky-800",
      badge: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    },
    {
      key: "apology" as keyof AIResponse,
      label: "Apology",
      icon: "🙏",
      accent: "from-amber-500 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
        }

        .dashboard-root {
          min-height: 100vh;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 50%);
          color: #e8e8f0;
          padding: 0 0 60px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 40px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(10,10,15,0.85);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }

        .brand-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          background: linear-gradient(90deg, #e8e8f0, #a5a5c5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-sub {
          font-size: 11px;
          color: rgba(168,168,200,0.5);
          font-weight: 400;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #e8e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .add-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        .add-btn:active { transform: translateY(0); }

        .content {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 24px 0;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 36px;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px 20px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(168,168,200,0.5);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #e8e8f0;
          line-height: 1;
        }

        .stat-value.pending { color: #fbbf24; }
        .stat-value.resolved { color: #34d399; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(168,168,200,0.5);
        }

        .section-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 22px 24px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .review-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .review-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(99,102,241,0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1);
        }

        .review-card:hover::before { opacity: 1; }

        .review-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .author-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(99,102,241,0.3);
        }

        .author-name {
          font-size: 15px;
          font-weight: 600;
          color: #e8e8f0;
          margin-bottom: 2px;
        }

        .stars {
          display: flex;
          gap: 2px;
          font-size: 12px;
        }

        .star-filled { color: #fbbf24; }
        .star-empty { color: rgba(255,255,255,0.15); }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .status-badge.pending {
          background: rgba(251,191,36,0.12);
          color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.2);
        }

        .status-badge.resolved {
          background: rgba(52,211,153,0.12);
          color: #34d399;
          border: 1px solid rgba(52,211,153,0.2);
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .review-text {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(200,200,220,0.75);
          margin-bottom: 16px;
        }

        .approved-box {
          background: rgba(52,211,153,0.06);
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .approved-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #34d399;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .approved-text {
          font-size: 13px;
          color: rgba(200,220,200,0.8);
          line-height: 1.6;
        }

        .generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 10px;
          color: #a5b4fc;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .generate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25));
          border-color: rgba(99,102,241,0.5);
          color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(99,102,241,0.2);
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(165,180,252,0.3);
          border-top-color: #a5b4fc;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .ai-responses {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ai-card {
          border-radius: 12px;
          border: 1px solid;
          padding: 14px 16px;
          transition: all 0.2s ease;
        }

        .ai-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }

        .ai-card.professional {
          background: rgba(100,116,139,0.08);
          border-color: rgba(100,116,139,0.2);
        }

        .ai-card.friendly {
          background: rgba(14,165,233,0.07);
          border-color: rgba(14,165,233,0.2);
        }

        .ai-card.apology {
          background: rgba(245,158,11,0.07);
          border-color: rgba(245,158,11,0.2);
        }

        .ai-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .ai-card-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .ai-card.professional .ai-card-label { color: #94a3b8; }
        .ai-card.friendly .ai-card-label { color: #38bdf8; }
        .ai-card.apology .ai-card-label { color: #fbbf24; }

        .ai-card-icon {
          font-size: 14px;
        }

        .approve-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          flex-shrink: 0;
        }

        .ai-card.professional .approve-btn {
          background: rgba(100,116,139,0.2);
          color: #cbd5e1;
        }

        .ai-card.professional .approve-btn:hover {
          background: rgba(100,116,139,0.35);
          transform: scale(1.03);
        }

        .ai-card.friendly .approve-btn {
          background: rgba(14,165,233,0.15);
          color: #7dd3fc;
        }

        .ai-card.friendly .approve-btn:hover {
          background: rgba(14,165,233,0.28);
          transform: scale(1.03);
        }

        .ai-card.apology .approve-btn {
          background: rgba(245,158,11,0.15);
          color: #fcd34d;
        }

        .ai-card.apology .approve-btn:hover {
          background: rgba(245,158,11,0.28);
          transform: scale(1.03);
        }

        .ai-response-text {
          font-size: 13px;
          line-height: 1.65;
          color: rgba(200,200,220,0.7);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.4;
        }

        .empty-text {
          font-size: 15px;
          color: rgba(168,168,200,0.4);
        }

        @media (max-width: 600px) {
          .topbar { padding: 20px 16px; }
          .content { padding: 24px 16px 0; }
          .stats-row { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .stat-value { font-size: 22px; }
        }
      `}</style>

      <div className="dashboard-root">
        {/* Top Bar */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-icon">⭐</div>
            <div>
              <div className="brand-title">UCOrm Dashboard</div>
              <div className="brand-sub">Review Management</div>
            </div>
          </div>

          <button onClick={insertTestReview} className="add-btn">
            <span>＋</span>
            Add Test Review
          </button>
        </div>

        <div className="content">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{reviews.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value pending">{pendingCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved</div>
              <div className="stat-value resolved">{resolvedCount}</div>
            </div>
          </div>

          {/* Section Header */}
          <div className="section-header">
            <span className="section-title">Reviews</span>
            <div className="section-line" />
          </div>

          {/* Reviews */}
          <div className="reviews-list">
            {reviews.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-text">No reviews yet. Add a test review to get started.</div>
              </div>
            )}

            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                {/* Header */}
                <div className="review-header">
                  <div className="author-row">
                    <div className="avatar">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="author-name">{review.author_name}</div>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={s <= review.rating ? "star-filled" : "star-empty"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className={`status-badge ${review.status === "Resolved" ? "resolved" : "pending"}`}>
                    <span className="status-dot" />
                    {review.status}
                  </span>
                </div>

                {/* Review Text */}
                <p className="review-text">{review.review_text}</p>

                {/* Approved Response */}
                {review.approved_response && (
                  <div className="approved-box">
                    <div className="approved-label">
                      <span>✓</span> Approved Response
                    </div>
                    <p className="approved-text">{review.approved_response}</p>
                  </div>
                )}

                {/* Generate Button */}
                {review.status === "Pending" && (
                  <button
                    onClick={() => generateAIResponse(review.id, review.review_text)}
                    disabled={loadingId === review.id}
                    className="generate-btn"
                  >
                    {loadingId === review.id ? (
                      <>
                        <span className="spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✦</span>
                        Generate AI
                      </>
                    )}
                  </button>
                )}

                {/* AI Generated Responses */}
                {aiResponses?.[review.id] && (
                  <div className="ai-responses">
                    {responseTypes.map(({ key, label, icon, ...styles }) => (
                      <div key={key} className={`ai-card ${key}`}>
                        <div className="ai-card-header">
                          <div className="ai-card-label">
                            <span className="ai-card-icon">{icon}</span>
                            {label}
                          </div>
                          <button
                            onClick={() => approveReview(review.id, aiResponses[review.id][key])}
                            className="approve-btn"
                          >
                            ✓ Approve
                          </button>
                        </div>
                        <p className="ai-response-text">{aiResponses[review.id][key]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}