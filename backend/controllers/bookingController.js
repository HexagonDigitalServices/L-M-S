function buildFrontendBase(req) {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
}

/* ---------------- Authenticated: createBooking ----------------
   - requires Clerk session (getAuth)
*/
export const createBooking = async (req, res) => {
  try {
    const { userId } = getAuth(req) || {};
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

    const {
      courseId,
      courseName,
      teacherName = "",
      price,
      notes = "",
      email,
      studentName,
    } = req.body;

    if (!courseId || !courseName) return res.status(400).json({ success: false, message: "courseId and courseName required" });

    const numericPrice = safeNumber(price);
    if (numericPrice === null || numericPrice < 0) return res.status(400).json({ success: false, message: "price must be a valid number" });

    const bookingId = genBookingId();

    const resolvedStudentName = (studentName && String(studentName).trim()) ||
      (email && String(email).trim()) ||
      `User-${String(userId).slice(0, 8)}`;

    const basePayload = {
      bookingId,
      clerkUserId: userId,
      studentName: resolvedStudentName,
      course: courseId,
      courseName,
      teacherName,
      price: numericPrice,
      paymentMethod: "Online",
      paymentStatus: "Unpaid",
      notes,
      orderStatus: "Pending",
      createdAt: new Date(),
    };

    // Free course: create booking and mark as paid/confirmed immediately (also set paidAt)
    if (numericPrice === 0) {
      const booking = await Booking.create({
        ...basePayload,
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        paidAt: new Date(), // <-- mark paid time so frontend can rely on it
      });
      return res.status(201).json({ success: true, booking, checkoutUrl: null });
    }

    // For paid courses, require Stripe
    if (!stripe) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const base = buildFrontendBase(req);
    if (!base) {
      return res.status(500).json({
        success: false,
        message: "Frontend URL not determined. Set FRONTEND_URL or send an Origin header.",
      });
    }

    const successUrl = `${base}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/booking/cancel`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: courseName },
              unit_amount: Math.round(numericPrice * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { bookingId, courseId, clerkUserId: userId, studentName: resolvedStudentName },
      });
    } catch (stripeErr) {
      console.error("Stripe create session error:", stripeErr);
      const message = stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({ success: false, message: `Payment provider error: ${message}` });
    }

    try {
      const booking = await Booking.create({
        ...basePayload,
        sessionId: session.id,
        paymentIntentId: session.payment_intent || null,
      });
      return res.status(201).json({ success: true, booking, checkoutUrl: session.url || null });
    } catch (dbErr) {
      console.error("DB error saving booking after stripe session:", dbErr);
      return res.status(500).json({ success: false, message: "Failed to create booking record" });
    }
  } catch (err) {
    console.error("createBooking unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ---------------- GetStats ---------------- */
    const topCourses = await Booking.aggregate([
      { $group: { _id: "$courseName", count: { $sum: 1 }, revenue: { $sum: "$price" } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { courseName: "$_id", count: 1, revenue: 1, _id: 0 } },
    ]);