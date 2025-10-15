import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address"
    ]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    validate: {
      validator: function(v) {
        return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(v);
      },
      message: props => "Password must contain uppercase, lowercase, number, and special character"
    }
  },
  role: {
    type: String,
    enum: {
      values: ["hr", "applicant"],
      message: "Role must be either 'hr' or 'applicant'"
    },
    required: [true, "Role is required"]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Optional compound index for faster queries
userSchema.index({ email: 1, role: 1 });

export default mongoose.model("User", userSchema);
