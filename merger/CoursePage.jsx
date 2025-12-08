const RatingStars = ({
  courseId,
  userRating = 0,
  avgRating = 0,
  totalRatings = 0,
  onRate,
}) => {
  const [hover, setHover] = useState(0);
  const base = userRating || Math.round(avgRating || 0);
  const display = hover || base;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", gap: 6 }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= display;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRate && onRate(courseId, idx);
              }}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
              style={{
                background: "transparent",
                border: "none",
                padding: 2,
                cursor: "pointer",
              }}
            >
              <StarIcon
                filled={filled}
                className={filled ? "text-yellow-400" : "text-gray-300"}
              />
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginLeft: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          {(avgRating || 0).toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          ({totalRatings || 0})
        </div>
      </div>
    </div>
  );
};

// Fetch public courses
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/course/public`)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Failed to fetch courses");
        }
        return res.json();
      })
      .then(async (json) => {
        if (!mounted) return;
        const raw = json.items || json.courses || [];
        // filter non-top (existing behavior)
        const regular = raw.filter((c) =>
          c.courseType ? c.courseType !== "top" : true
        );

        const mapped = regular.map((c) => ({
          id: String(c._id || c.id || ""),
          name: c.name,
          teacher: c.teacher || c.instructor || "",
          category: c.category || "",
          image: c.image || "",
          isFree:
            c.pricingType === "free" ||
            !c.price ||
            (!c.price.sale && !c.price.original),
          price:
            c.price ||
            (c.originalPrice
              ? { original: c.originalPrice, sale: c.price }
              : {}),
          avgRating:
            typeof c.avgRating === "number"
              ? c.avgRating
              : typeof c.rating === "number"
              ? c.rating
              : parseFloat(c.rating) || 0,
          totalRatings:
            typeof c.totalRatings === "number"
              ? c.totalRatings
              : c.ratingCount ?? 0,
          raw: c,
        }));

        setCourses(mapped);

        // if signed in, try to fetch my-rating per course (parallel)
        if (isSignedIn && mapped.length) {
          const promises = mapped.map(async (course) => {
            if (!course.id) return null;
            try {
              const headers = { "Content-Type": "application/json" };
              try {
                const token = await getToken().catch(() => null);
                if (token) headers.Authorization = `Bearer ${token}`;
              } catch (e) {}
              const r = await fetch(
                `${API_BASE}/api/course/${encodeURIComponent(
                  course.id
                )}/my-rating`,
                {
                  method: "GET",
                  headers,
                  credentials: "include",
                }
              );
              if (!r.ok) return null;
              const d = await r.json().catch(() => null);
              if (d && d.success && d.myRating)
                return { courseId: course.id, rating: d.myRating.rating };
            } catch (err) {
              return null;
            }
            return null;
          });

          const results = await Promise.all(promises);
          const map = {};
          results.forEach((it) => {
            if (it && it.courseId) map[it.courseId] = it.rating;
          });
          if (mounted && Object.keys(map).length) {
            setRatings((prev) => ({ ...prev, ...map }));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load courses:", err);
        if (mounted) setError(err.message || "Failed to load courses");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);


      // update course aggregates from server response if provided
      const avg = data.avgRating ?? data.course?.avgRating ?? data.avg ?? null;
      const total =
        data.totalRatings ?? data.course?.totalRatings ?? data.count ?? null;

      if (avg !== null || total !== null) {
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(courseId)
              ? {
                  ...c,
                  avgRating: typeof avg === "number" ? avg : c.avgRating,
                  totalRatings:
                    typeof total === "number" ? total : c.totalRatings,
                }
              : c
          )
        );
      }

      // persist user's rating locally
      setRatings((prev) => ({ ...prev, [courseId]: ratingValue }));
      toast.success("Thanks for rating!");
      return true;
