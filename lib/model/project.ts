import mongoose from "mongoose";

/* =========================
   CRITERIA (USER ANSWER)
========================= */
const projectCriteriaSchema = new mongoose.Schema({
  criteriaId: {
    type: String,
    required: true,
  },

  // null = not answered
  score: {
    type: Number,
    enum: [0, 1, 2, null],
    default: null,
  },

  note: String,
});

/* =========================
   SECTION (GROUP)
========================= */
const projectSectionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },

  // ❌ removed name (comes from JSON standard)

  criteria: [projectCriteriaSchema],

  /* ===== SCORE ===== */
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  scorePercent: { type: Number, default: 0 },

  /* ===== PROGRESS ===== */
  answeredCriteria: { type: Number, default: 0 },
  totalCriteria: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
});

/* =========================
   PROJECT
========================= */
const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ JSON-based standard reference
    standardKey: {
      type: String,
      required : true,
      default: "inclusive-education-v1",
    },

    projectName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 30,
    },

    surveyDate: {
      type: Date,
      default: Date.now,
    },

    institution: {
      name: String,
      address: String,
    },

    /* ===== PAGE 1 DATA ===== */
    buildingType: {
      type: String,
      enum: ["single_floor", "multi_floor"],
      default: "single_floor",
    },

    toiletInfo: {
      count: { type: Number, default: 0 },

      arrangement: {
        type: String,
        enum: ["shared", "separate", "other"],
      },

      arrangementNote: {
        type: String,
        required: function (this: any) {
          return this.arrangement === "other";
        },
      },
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },

    sections: [projectSectionSchema],

    /* ===== PROJECT SCORE ===== */
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    scorePercent: { type: Number, default: 0 },

    /* ===== PROJECT PROGRESS ===== */
    answeredCriteria: { type: Number, default: 0 },
    totalCriteria: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* =========================
   PRE-SAVE CALCULATION
========================= */
projectSchema.pre("save", function () {
  if (!this.sections || this.sections.length === 0) {
    throw new Error("Project must have at least one section");
  }

  let projectTotalScore = 0;
  let projectMaxScore = 0;
  let projectAnswered = 0;
  let projectTotalCriteria = 0;

  this.sections.forEach((section: any) => {
    let sectionScore = 0;
    let sectionAnswered = 0;

    const sectionTotal = section.criteria.length;
    const sectionMax = sectionTotal * 2;

    section.criteria.forEach((c: any) => {
      if (c.score !== null && c.score !== undefined) {
        sectionScore += c.score;
        sectionAnswered++;
      }
    });

    /* ===== SECTION SCORE ===== */
    section.totalScore = sectionScore;
    section.maxScore = sectionMax;
    section.scorePercent = sectionMax > 0 ? Math.round((sectionScore / sectionMax) * 1000) / 10 : 0;

    /* ===== SECTION PROGRESS ===== */
    section.totalCriteria = sectionTotal;
    section.answeredCriteria = sectionAnswered;
    section.completionRate =
      sectionTotal > 0 ? (sectionAnswered / sectionTotal) * 100 : 0;

    /* ===== PROJECT ACCUMULATION ===== */
    projectTotalScore += sectionScore;
    projectMaxScore += sectionMax;
    projectAnswered += sectionAnswered;
    projectTotalCriteria += sectionTotal;
  });

  /* ===== PROJECT SCORE ===== */
  this.totalScore = projectTotalScore;
  this.maxScore = projectMaxScore;
  this.scorePercent =
    projectMaxScore > 0 ? (projectTotalScore / projectMaxScore) * 100 : 0;

  /* ===== PROJECT PROGRESS ===== */
  this.answeredCriteria = projectAnswered;
  this.totalCriteria = projectTotalCriteria;
  this.completionRate =
    projectTotalCriteria > 0
      ? (projectAnswered / projectTotalCriteria) * 100
      : 0;
});

/* =========================
   INDEXES
========================= */
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ standardKey: 1 });

/* =========================
   EXPORT
========================= */
export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);