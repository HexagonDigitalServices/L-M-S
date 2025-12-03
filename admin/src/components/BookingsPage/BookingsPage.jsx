
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page] = useState(1); // expose later for pagination
  const limit = 200;

  // debounce timer and abort controller
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const fetchBookings = async (search = "") => {
    setLoading(true);
    setError(null);

    // abort previous
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      q.set("limit", String(limit));
      q.set("page", String(page));

      const res = await fetch(`${API_BASE}/api/booking?${q.toString()}`, {
        method: "GET",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();
      if (data && data.success) {
        const normalized = (data.bookings || []).map((b, idx) => ({
          id: b._id || b.bookingId || String(idx),
          // userRef removed — use studentName field present in backend
          studentName: b.studentName || b.userName || "Unknown student",
          courseName: b.courseName || "Untitled course",
          price: b.price ?? 0,
          teacherName: b.teacherName || "Unknown teacher",
          purchaseDate: b.createdAt
            ? new Date(b.createdAt).toISOString().split("T")[0]
            : b.purchaseDate || "",
          raw: b,
        }));

        setBookings(normalized);
      } else {
        setBookings([]);
        setError(data?.message || "No data");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // aborted — ignore
      } else {
        console.error("fetchBookings error:", err);
        setError(err.message || "Failed to fetch bookings");
      }
    } finally {
      setLoading(false);
    }
  };

