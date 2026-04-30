import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  surveyDate: {
    type: Date,
    default: Date.now
  },

  institution: {
    name: String,
    address: String
  },

  status: {
    type: String,
    enum: ["draft", "completed"],
    default: "draft"
  },

  sections: [
    {
      code: String,
      name: String,

      targetDisabled: {
        disId: Number,
        disName: String
      },

      criteria: [
        {
          criteriaId: Number,
          itemLabel: String,
          refCode: String,
          score: {
            type: Number,
            enum: [0, 1, 2],
            default: 0
          }
        }
      ],

      totalScore: {
        type: Number,
        default: 0
      }
    }
  ],

  totalScore: {
    type: Number,
    default: 0
  }

}, { timestamps: true });


// 🔥 auto-calc
surveySchema.pre("save", async function () {
  let surveyTotal = 0;

  this.sections.forEach(section => {
    let sectionTotal = 0;

    section.criteria.forEach(c => {
      sectionTotal += c.score;
    });

    section.totalScore = sectionTotal;
    surveyTotal += sectionTotal;
  });

  this.totalScore = surveyTotal;
});
export default mongoose.models.Survey || mongoose.model("Survey", surveySchema);