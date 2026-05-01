import mongoose from "mongoose";


const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    projectName :{ 
      type : String,
      trim : true,
      required : true,
      default: "Untitled Project",
      maxlength: 30
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
  },
  { timestamps: true }
);

// auto-calculate scores
projectSchema.pre("save", function () {
  let projectTotal = 0;

  this.sections.forEach((section: any) => {
    let sectionTotal = 0;

    section.criteria.forEach((c: any) => {
      sectionTotal += c.score;
    });

    section.totalScore = sectionTotal;
    projectTotal += sectionTotal;
  });

  this.totalScore = projectTotal;
});


const Project =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);

export default Project;