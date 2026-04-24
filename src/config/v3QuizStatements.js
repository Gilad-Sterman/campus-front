export const V3_QUIZ_STATEMENTS = {
  23: {
    title: "You’re doing great. Tell us more.",
    // description: "Tell us more."
  },
  30: {
    title: "🍾 Halfway there"
  },
  40: {
    title: "⏱️ Two sections left"
  },
  48: {
    title: " 🎉 Last one"
  },
  // We keep 68 as an optional final badge if needed, 
  // but since it's the last one we might just show it on the last question (58 or 61)
  // User didn't specify exactly where 68 should go, usually it's a "summary" before results.
  // We'll map it to 61 (the final vision question).
  // 61: {
  //   title: "We analyzed your responses.",
  //   description: "You will be able to see degree suggestions in your email. After you have had a chance to review, you can book a call with our concierge team."
  // }
};
