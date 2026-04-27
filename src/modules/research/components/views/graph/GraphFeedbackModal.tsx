import React, { useState } from "react";

import Image from "next/image";
import { supportApi } from "@/modules/settings";

interface GraphFeedbackModalProps {
  visible: boolean;
  setVisible: (val: boolean) => void;
  folderName: string;
  folderId: string;
  t: (key: string) => string;
}

export default function GraphFeedbackModal({
  visible,
  setVisible,
  folderName,
  folderId,
  t,
}: GraphFeedbackModalProps) {
  const [step, setStep] = useState<
    "initial" | "bad_reason" | "other_reason" | "thanks"
  >("initial");
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [textReason, setTextReason] = useState("");

  const closeFeedback = () => {
    setVisible(false);
    localStorage.setItem("insights_analyses_count", "0");
  };

  const submitFeedbackAndThank = async (
    currentRating: "good" | "bad" | null,
    currentReason: string | null,
    currentText: string,
  ) => {
    try {
      let message = `${t("insights.graph.feedback.step1Title").replace(/<br\s*\/?>/gi, " ")} (${
        folderName || folderId
      })\n`;
      message += `${
        currentRating === "good"
          ? t("insights.graph.feedback.useful")
          : t("insights.graph.feedback.notVery")
      }\n`;

      if (currentReason) {
        message += `${t("insights.graph.feedback.step2Title")}: ${currentReason}\n`;
      }
      if (currentText) {
        message += `${currentText}\n`;
      }

      await supportApi.submitFeedback(message);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }

    setStep("thanks");
    localStorage.setItem("insights_analyses_count", "0");

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setStep("initial");
        setRating(null);
        setReason(null);
        setTextReason("");
      }, 500);
    }, 3000);
  };

  const handleFeedback = (type: "good" | "bad") => {
    setRating(type);
    if (type === "bad") {
      setStep("bad_reason");
    } else {
      submitFeedbackAndThank(type, reason, textReason);
    }
  };

  const handleReason = (selectedReason: string) => {
    setReason(selectedReason);
    if (selectedReason === t("insights.graph.feedback.reasonOther")) {
      setStep("other_reason");
    } else {
      submitFeedbackAndThank(rating, selectedReason, textReason);
    }
  };

  const submitTextReason = () => {
    submitFeedbackAndThank(rating, reason, textReason);
  };

  if (!visible) return null;

  return (
    <div
      className={`feedback-modal ${step === "thanks" ? "feedback-thanks" : ""}`}
    >
      {step !== "thanks" && (
        <button className="feedback-close-btn" onClick={closeFeedback}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M1 11L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {step === "initial" && (
        <>
          <div
            className="feedback-title"
            dangerouslySetInnerHTML={{
              __html: t("insights.graph.feedback.step1Title"),
            }}
          />
          <div className="feedback-options">
            <div
              className="feedback-option"
              onClick={() => handleFeedback("good")}
            >
              <Image
                src="/feedback/happy.svg"
                alt={t("insights.graph.feedback.useful")}
                width={36}
                height={40}
              />
              <span>{t("insights.graph.feedback.useful")}</span>
            </div>
            <div
              className="feedback-option"
              onClick={() => handleFeedback("bad")}
            >
              <Image
                src="/feedback/sad.svg"
                alt={t("insights.graph.feedback.notVery")}
                width={36}
                height={40}
              />
              <span>{t("insights.graph.feedback.notVery")}</span>
            </div>
          </div>
        </>
      )}

      {step === "bad_reason" && (
        <>
          <div className="feedback-title tight">
            {t("insights.graph.feedback.step2Title")}
          </div>
          <div className="feedback-reasons-grid">
            <button
              className="reason-btn"
              onClick={() =>
                handleReason(t("insights.graph.feedback.reasonSuperficial"))
              }
            >
              {t("insights.graph.feedback.reasonSuperficial")}
            </button>
            <button
              className="reason-btn"
              onClick={() =>
                handleReason(t("insights.graph.feedback.reasonOffTopic"))
              }
            >
              {t("insights.graph.feedback.reasonOffTopic")}
            </button>
            <button
              className="reason-btn"
              onClick={() =>
                handleReason(t("insights.graph.feedback.reasonMissed"))
              }
            >
              {t("insights.graph.feedback.reasonMissed")}
            </button>
            <div className="reason-row-bottom">
              <button
                className="reason-btn"
                onClick={() =>
                  handleReason(
                    t("insights.graph.feedback.reasonHardToUnderstand"),
                  )
                }
              >
                {t("insights.graph.feedback.reasonHardToUnderstand")}
              </button>
              <button
                className="reason-btn"
                onClick={() =>
                  handleReason(t("insights.graph.feedback.reasonOther"))
                }
              >
                {t("insights.graph.feedback.reasonOther")}
              </button>
            </div>
          </div>
        </>
      )}

      {step === "other_reason" && (
        <>
          <div className="feedback-title tight">
            {t("insights.graph.feedback.step2Title")}
          </div>
          <div className="feedback-textarea-wrapper">
            <textarea
              value={textReason}
              onChange={(e) => setTextReason(e.target.value)}
              maxLength={250}
              placeholder={t("insights.graph.feedback.placeholder")}
              rows={5}
            ></textarea>
            <div className="feedback-counter">{textReason.length}/250</div>
          </div>
          <button className="primary-submit-btn" onClick={submitTextReason}>
            {t("insights.graph.feedback.send")}
          </button>
        </>
      )}

      {step === "thanks" && (
        <>
          <div className="feedback-thanks-title">
            {t("insights.graph.feedback.thanksTitle")}
          </div>
          <div
            className="feedback-thanks-subtitle"
            dangerouslySetInnerHTML={{
              __html: t("insights.graph.feedback.thanksSubtitle"),
            }}
          />
        </>
      )}
    </div>
  );
}
