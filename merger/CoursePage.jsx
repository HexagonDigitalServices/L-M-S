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