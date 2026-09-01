import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function QuizzesPage({ token }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [filter, setFilter] = useState({ category: "", isActive: "" });

  useEffect(() => {
    loadQuizzes();
  }, [filter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.isActive !== "") params.isActive = filter.isActive;

      const data = await api.getQuizzes(token, params);
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error(error);
      alert("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowModal(true);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await api.deleteQuiz(token, id);
      alert("Quiz deleted successfully");
      loadQuizzes();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete quiz");
    }
  };

  const handleModalClose = (success) => {
    setShowModal(false);
    setEditingQuiz(null);
    if (success) loadQuizzes();
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <span style={styles.spinner}></span>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Quiz Management</h1>
          <p style={styles.pageSubtitle}>
            Create and manage multilingual quizzes
          </p>
        </div>
        <button style={styles.btnPrimary} onClick={handleCreate}>
          + Create Quiz
        </button>
      </div>

      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="pest_disease">Pest & Disease</option>
          <option value="farming_practices">Farming Practices</option>
          <option value="market_knowledge">Market Knowledge</option>
          <option value="govt_schemes">Government Schemes</option>
        </select>

        <select
          style={styles.select}
          value={filter.isActive}
          onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div style={styles.quizList}>
        {quizzes.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No quizzes found</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} style={styles.quizCard}>
              <div style={styles.quizHeader}>
                <div>
                  <h3 style={styles.quizTitle}>
                    #{quiz.order} - {quiz.title.en}
                  </h3>
                  <p style={styles.quizMeta}>
                    {quiz.questions.length} questions •{" "}
                    {quiz.category.replace(/_/g, " ")} • Passing:{" "}
                    {quiz.passingScore}%
                  </p>
                </div>
                <div style={styles.quizActions}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: quiz.isActive ? "#e8f5e9" : "#ffebee",
                      color: quiz.isActive ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {quiz.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    style={styles.btnIcon}
                    onClick={() => handleEdit(quiz)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    style={styles.btnIcon}
                    onClick={() => handleDelete(quiz._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {quiz.description?.en && (
                <p style={styles.quizDescription}>{quiz.description.en}</p>
              )}

              <div style={styles.translationStatus}>
                <span style={styles.langBadge}>EN ✓</span>
                <span
                  style={{
                    ...styles.langBadge,
                    opacity: quiz.title.hi ? 1 : 0.4,
                  }}
                >
                  HI {quiz.title.hi ? "✓" : "✗"}
                </span>
                <span
                  style={{
                    ...styles.langBadge,
                    opacity: quiz.title.bho ? 1 : 0.4,
                  }}
                >
                  BHO {quiz.title.bho ? "✓" : "✗"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <QuizModal
          token={token}
          quiz={editingQuiz}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

function QuizModal({ token, quiz, onClose }) {
  const [formData, setFormData] = useState(
    quiz || {
      order: "",
      title: { en: "", hi: "", bho: "" },
      description: { en: "", hi: "", bho: "" },
      category: "pest_disease",
      passingScore: 60,
      isActive: true,
      questions: [],
    },
  );
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async (field, text, targetLang) => {
    if (!text?.trim()) {
      alert("Please enter English text first");
      return;
    }

    try {
      setTranslating(true);
      const data = await api.translateText(token, text, targetLang);
      setFormData((prev) => {
        const next = structuredClone(prev);
        const parts = field.split(".");

        if (!field.includes(".")) {
          next[field] = {
            ...(next[field] || {}),
            [targetLang]: data.translation,
          };
          return next;
        }

        let current = next;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
          if (current[key] === undefined) {
            const nextKey = parts[i + 1];
            current[key] = /^\d+$/.test(nextKey) ? [] : {};
          }
          current = current[key];
        }

        const lastPart = parts[parts.length - 1];
        const lastKey = /^\d+$/.test(lastPart) ? Number(lastPart) : lastPart;

        if (
          typeof current[lastKey] === "object" &&
          current[lastKey] !== null &&
          !Array.isArray(current[lastKey])
        ) {
          current[lastKey] = {
            ...current[lastKey],
            [targetLang]: data.translation,
          };
        } else {
          current[lastKey] = data.translation;
        }

        return next;
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: { en: "", hi: "", bho: "" },
          options: {
            en: ["", "", "", ""],
            hi: ["", "", "", ""],
            bho: ["", "", "", ""],
          },
          correctIndex: 0,
          explanation: { en: "", hi: "", bho: "" },
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, lang, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[lang][optIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.en ||
      !formData.order ||
      formData.questions.length === 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Farmers can use the app in English, Hindi, or Bhojpuri, so every
    // farmer-facing field must be filled in all three languages (the backend
    // rejects the quiz otherwise). Blank strings don't count.
    const filled = (s) => typeof s === "string" && s.trim().length > 0;
    const missing = [];
    for (const lang of ["en", "hi", "bho"]) {
      if (!filled(formData.title[lang])) missing.push(`Title (${lang})`);
    }
    formData.questions.forEach((q, i) => {
      for (const lang of ["en", "hi", "bho"]) {
        if (!filled(q.question?.[lang])) {
          missing.push(`Question ${i + 1} text (${lang})`);
        }
        const opts = q.options?.[lang] || [];
        if (
          opts.length !== (q.options?.en?.length || 0) ||
          !opts.every(filled)
        ) {
          missing.push(`Question ${i + 1} options (${lang})`);
        }
      }
    });
    if (missing.length > 0) {
      alert(
        `Translations are required in all languages before saving.\n\nMissing or blank:\n- ${missing.join(
          "\n- ",
        )}\n\nTip: use the "Generate" buttons to auto-translate from English, then review.`,
      );
      return;
    }

    try {
      setLoading(true);
      if (quiz) {
        await api.updateQuiz(token, quiz._id, formData);
        alert("Quiz updated successfully");
      } else {
        await api.createQuiz(token, formData);
        alert("Quiz created successfully");
      }
      onClose(true);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={() => onClose(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {quiz ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <button style={styles.closeBtn} onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.modalBody}>
            {/* Basic Info */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Order Number *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    style={styles.input}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="pest_disease">Pest & Disease</option>
                    <option value="farming_practices">Farming Practices</option>
                    <option value="market_knowledge">Market Knowledge</option>
                    <option value="govt_schemes">Government Schemes</option>
                  </select>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Passing Score (%)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingScore: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.input}
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Title *</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>English</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.title.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Hindi</label>
                  <button
                    type="button"
                    style={styles.btnSmall}
                    onClick={() =>
                      handleTranslate("title", formData.title.en, "hi")
                    }
                    disabled={translating}
                  >
                    {translating ? "..." : "Generate"}
                  </button>
                </div>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.title.hi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, hi: e.target.value },
                    })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Bhojpuri</label>
                  <button
                    type="button"
                    style={styles.btnSmall}
                    onClick={() =>
                      handleTranslate("title", formData.title.en, "bho")
                    }
                    disabled={translating}
                  >
                    {translating ? "..." : "Generate"}
                  </button>
                </div>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.title.bho}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, bho: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Description (Optional)</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>English</label>
                <textarea
                  style={{ ...styles.input, minHeight: "60px" }}
                  value={formData.description.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        en: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Hindi</label>
                  <button
                    type="button"
                    style={styles.btnSmall}
                    onClick={() =>
                      handleTranslate(
                        "description",
                        formData.description.en,
                        "hi",
                      )
                    }
                    disabled={translating}
                  >
                    {translating ? "..." : "Generate"}
                  </button>
                </div>
                <textarea
                  style={{ ...styles.input, minHeight: "60px" }}
                  value={formData.description.hi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        hi: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Bhojpuri</label>
                  <button
                    type="button"
                    style={styles.btnSmall}
                    onClick={() =>
                      handleTranslate(
                        "description",
                        formData.description.en,
                        "bho",
                      )
                    }
                    disabled={translating}
                  >
                    {translating ? "..." : "Generate"}
                  </button>
                </div>
                <textarea
                  style={{ ...styles.input, minHeight: "60px" }}
                  value={formData.description.bho}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        bho: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Questions */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  Questions ({formData.questions.length})
                </h3>
                <button
                  type="button"
                  style={styles.btnSmall}
                  onClick={handleAddQuestion}
                >
                  + Add Question
                </button>
              </div>

              {formData.questions.map((question, qIndex) => (
                <QuestionEditor
                  key={qIndex}
                  question={question}
                  index={qIndex}
                  onQuestionChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  onRemove={() => handleRemoveQuestion(qIndex)}
                  onTranslate={handleTranslate}
                  translating={translating}
                />
              ))}
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : quiz ? "Update Quiz" : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  onQuestionChange,
  onOptionChange,
  onRemove,
  onTranslate,
  translating,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hiOptions = Array.isArray(question.options?.hi)
    ? question.options.hi
    : ["", "", "", ""];
  const bhoOptions = Array.isArray(question.options?.bho)
    ? question.options.bho
    : ["", "", "", ""];

  return (
    <div style={styles.questionCard}>
      <div style={styles.questionHeader}>
        <h4 style={styles.questionNumber}>Question {index + 1}</h4>
        <div style={styles.questionActions}>
          <button
            type="button"
            style={styles.btnIcon}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "▼" : "▲"}
          </button>
          <button
            type="button"
            style={{ ...styles.btnIcon, color: "#c62828" }}
            onClick={onRemove}
            title="Remove"
          >
            🗑️
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={styles.questionBody}>
          {/* Question Text */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Question Text (English) *</label>
            <textarea
              style={{ ...styles.input, minHeight: "60px" }}
              value={question.question.en}
              onChange={(e) =>
                onQuestionChange(index, "question", {
                  ...question.question,
                  en: e.target.value,
                })
              }
              required
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Question Text (Hindi)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={() =>
                  onTranslate(
                    `questions.${index}.question`,
                    question.question.en,
                    "hi",
                  )
                }
                disabled={translating}
              >
                {translating ? "..." : "Generate"}
              </button>
            </div>
            <textarea
              style={{ ...styles.input, minHeight: "60px" }}
              value={question.question.hi}
              onChange={(e) =>
                onQuestionChange(index, "question", {
                  ...question.question,
                  hi: e.target.value,
                })
              }
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Question Text (Bhojpuri)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={() =>
                  onTranslate(
                    `questions.${index}.question`,
                    question.question.en,
                    "bho",
                  )
                }
                disabled={translating}
              >
                {translating ? "..." : "Generate"}
              </button>
            </div>
            <textarea
              style={{ ...styles.input, minHeight: "60px" }}
              value={question.question.bho}
              onChange={(e) =>
                onQuestionChange(index, "question", {
                  ...question.question,
                  bho: e.target.value,
                })
              }
            />
          </div>

          {/* Options */}
          <div style={styles.optionsSection}>
            <label style={styles.label}>Options (English) *</label>
            {question.options.en.map((opt, optIndex) => (
              <div key={optIndex} style={styles.optionRow}>
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={question.correctIndex === optIndex}
                  onChange={() =>
                    onQuestionChange(index, "correctIndex", optIndex)
                  }
                  style={styles.radio}
                />
                <input
                  type="text"
                  style={styles.input}
                  value={opt}
                  onChange={(e) =>
                    onOptionChange(index, optIndex, "en", e.target.value)
                  }
                  placeholder={`Option ${optIndex + 1}`}
                  required
                />
              </div>
            ))}
          </div>

          <div style={styles.optionsSection}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Options (Hindi)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={async () => {
                  for (let i = 0; i < question.options.en.length; i++) {
                    if (question.options.en[i]) {
                      await onTranslate(
                        `questions.${index}.options.hi.${i}`,
                        question.options.en[i],
                        "hi",
                      );
                    }
                  }
                }}
                disabled={translating}
              >
                {translating ? "..." : "Generate All"}
              </button>
            </div>
            {hiOptions.map((opt, optIndex) => (
              <input
                key={optIndex}
                type="text"
                style={{ ...styles.input, marginBottom: "8px" }}
                value={opt}
                onChange={(e) =>
                  onOptionChange(index, optIndex, "hi", e.target.value)
                }
                placeholder={`Option ${optIndex + 1} (Hindi)`}
              />
            ))}
          </div>

          <div style={styles.optionsSection}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Options (Bhojpuri)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={async () => {
                  for (let i = 0; i < question.options.en.length; i++) {
                    if (question.options.en[i]) {
                      await onTranslate(
                        `questions.${index}.options.bho.${i}`,
                        question.options.en[i],
                        "bho",
                      );
                    }
                  }
                }}
                disabled={translating}
              >
                {translating ? "..." : "Generate All"}
              </button>
            </div>
            {bhoOptions.map((opt, optIndex) => (
              <input
                key={optIndex}
                type="text"
                style={{ ...styles.input, marginBottom: "8px" }}
                value={opt}
                onChange={(e) =>
                  onOptionChange(index, optIndex, "bho", e.target.value)
                }
                placeholder={`Option ${optIndex + 1} (Bhojpuri)`}
              />
            ))}
          </div>

          {/* Explanation */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Explanation (English, Optional)</label>
            <textarea
              style={{ ...styles.input, minHeight: "50px" }}
              value={question.explanation.en}
              onChange={(e) =>
                onQuestionChange(index, "explanation", {
                  ...question.explanation,
                  en: e.target.value,
                })
              }
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Explanation (Hindi)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={() =>
                  onTranslate(
                    `questions.${index}.explanation`,
                    question.explanation.en,
                    "hi",
                  )
                }
                disabled={translating}
              >
                {translating ? "..." : "Generate"}
              </button>
            </div>
            <textarea
              style={{ ...styles.input, minHeight: "50px" }}
              value={question.explanation.hi}
              onChange={(e) =>
                onQuestionChange(index, "explanation", {
                  ...question.explanation,
                  hi: e.target.value,
                })
              }
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Explanation (Bhojpuri)</label>
              <button
                type="button"
                style={styles.btnSmall}
                onClick={() =>
                  onTranslate(
                    `questions.${index}.explanation`,
                    question.explanation.en,
                    "bho",
                  )
                }
                disabled={translating}
              >
                {translating ? "..." : "Generate"}
              </button>
            </div>
            <textarea
              style={{ ...styles.input, minHeight: "50px" }}
              value={question.explanation.bho}
              onChange={(e) =>
                onQuestionChange(index, "explanation", {
                  ...question.explanation,
                  bho: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2196f3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  quizList: {
    display: "grid",
    gap: "16px",
  },
  quizCard: {
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  quizTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
  },
  quizMeta: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  quizActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  quizDescription: {
    fontSize: "14px",
    color: "#555",
    margin: "0 0 12px 0",
  },
  translationStatus: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  langBadge: {
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "600",
    borderRadius: "4px",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  badge: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "12px",
  },
  btnIcon: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px",
  },
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSmall: {
    padding: "6px 12px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    overflow: "auto",
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1a1a1a",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  questionCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  questionNumber: {
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
  },
  questionActions: {
    display: "flex",
    gap: "8px",
  },
  questionBody: {
    paddingTop: "12px",
  },
  optionsSection: {
    marginBottom: "16px",
  },
  optionRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "8px",
  },
  radio: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "20px 24px",
    borderTop: "1px solid #e0e0e0",
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
