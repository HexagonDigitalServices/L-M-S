
  {
    paymentMethod: { type: String, enum: ["Online"], default: "Online" },

    // normalize to TitleCase if that's what your code expects
    paymentStatus: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
    paymentIntentId: { type: String, default: null },
    sessionId: { type: String, default: null },

    // make orderStatus values consistent + include "Confirmed"
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed", "Failed"],
      default: "Pending",
    },

    notes: { type: String, default: "" },
  },
