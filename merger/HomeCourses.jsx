
      .then((json) => {
        if (!mounted) return;
        const items = (json && (json.items || json.courses || [])) || [];
        const mapped = items.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          teacher: c.teacher,
          image: c.image,
          price: c.price || {
            original: c.price?.original,
            sale: c.price?.sale,
          },
          isFree:
            c.pricingType === "free" ||
            !c.price ||
            (c.price && !c.price.sale && !c.price.original),
          // prefer avgRating / totalRatings from backend if available
          avgRating:
            typeof c.avgRating !== "undefined" ? c.avgRating : c.rating || 0,
          totalRatings:
            typeof c.totalRatings !== "undefined"
              ? c.totalRatings
              : c.ratingCount || 0,
          courseType: c.courseType || "regular",
        }));



      const submitRatingToServer = async (courseId, ratingValue) => {
    try {
      const headers = { "Content-Type": "application/json" };
      // try to get Clerk JWT token if available (works with Clerk)
      try {
        if (getToken) {
          const token = await getToken().catch(() => null);
          if (token) headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // ignore token errors and fall back to credentials include
      }

      const res = await fetch(`${API_BASE}/api/course/${courseId}/rate`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ rating: ratingValue }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok && !data.success) {
        const msg =
          (data && (data.message || data.error)) ||
          `Failed to rate (${res.status})`;
        throw new Error(msg);
      }

      // Expect server to return new avg & total (controller examples above do)
      // Some servers return { success: true, avgRating, totalRatings }
      const avg =
        data.avgRating ??
        data.course?.avgRating ??
        data.course?.avgRating ??
        data.course?.avgRating ??
        data.course?.avgRating;
      const total =
        data.totalRatings ??
        data.course?.ratingCount ??
        data.course?.ratingCount ??
        data.course?.ratingCount;

      // update UI with returned aggregates (fallback to previous if missing)
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                avgRating: typeof avg === "number" ? avg : c.avgRating,
                totalRatings:
                  typeof total === "number" ? total : c.totalRatings,
              }
            : c
        )
      );

      // store user's rating locally so UI reflects selection
      setUserRatings((prev) => ({ ...prev, [courseId]: ratingValue }));

      toast.success("Thanks for your rating!");
      return { success: true, avg, total };
    } catch (err) {
      console.error("submitRatingToServer:", err);
      toast.error(err.message || "Failed to submit rating");
      return { success: false, error: err };
    }
  };


  "⭐"

  const renderInteractiveStars = (course) => {
    // if signed in and user rated, show their rating; otherwise show rounded avg
    const userRating = userRatings[course.id] || 0;
    const hover = hoverRatings[course.id] || 0;
    // when logged in prefer user's rating for filled stars, else show rounded avg
    const baseDisplay = userRating || Math.round(course.avgRating || 0);
    const displayRating = hover || baseDisplay;

    return (
      <div
        className={homeCoursesStyles.starsContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={homeCoursesStyles.interactiveStars}>
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            const filled = idx <= displayRating;
            return (
              <button
                key={i}
                aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
                onClick={(e) => handleSetRating(e, course.id, idx)}
                onMouseEnter={() =>
                  setHoverRatings((s) => ({ ...s, [course.id]: idx }))
                }
                onMouseLeave={() =>
                  setHoverRatings((s) => ({ ...s, [course.id]: 0 }))
                }
                className={`${homeCoursesStyles.starButton} ${
                  filled
                    ? homeCoursesStyles.starButtonActive
                    : homeCoursesStyles.starButtonInactive
                }`}
                style={{ background: "transparent" }}
              >
                <Star
                  size={16}
                  fill={filled ? "currentColor" : "none"}
                  stroke="currentColor"
                  className={homeCoursesStyles.starIcon}
                />
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginLeft: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {(course.avgRating || 0).toFixed(1)}
          </span>
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            ({course.totalRatings || 0})
          </span>
        </div>
      </div>
    );
  };
