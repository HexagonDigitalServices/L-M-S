const fmtCurrency = (n) => {
  if (n == null) return "₹0";
  const num = Number(n);
  if (Number.isNaN(num)) return "₹0";
  return `₹${num}`;
};


  const [searchTerm, setSearchTerm] = useState("");

  const [statsData, setStatsData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const iconMap = {
    Users,
    ShoppingCart,
    BookMarked,
    BadgeIndianRupee,
  };

  const buildStats = (backendStats) => {
    const totalBookings = backendStats?.totalBookings ?? 0;
    const totalRevenue = backendStats?.totalRevenue ?? 0;
    const bookingsLast7Days = backendStats?.bookingsLast7Days ?? 0;
    const topCourses = backendStats?.topCourses ?? [];

    return [
      {
        title: "Total Bookings",
        value: totalBookings,
        icon: iconMap.Users,
        color: "indigo",
      },
      {
        title: "Revenue",
        value: fmtCurrency(totalRevenue),
        icon: iconMap.BadgeIndianRupee,
        color: "green",
      },
      {
        title: "Bookings (7d)",
        value: bookingsLast7Days,
        icon: iconMap.ShoppingCart,
        color: "yellow",
      },
      {
        title: "Top Courses",
        value: (topCourses && topCourses.length) || 0,
        icon: iconMap.BookMarked,
        color: "purple",
      },
    ];
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchStats = () =>
      fetch(`${API_BASE}/api/booking/stats`)
        .then((r) => r.json())
        .then((j) =>
          j.success ? j.stats : Promise.reject(j.message || "Stats error")
        );

    const fetchCourses = () =>
      fetch(`${API_BASE}/api/course`)
        .then((r) => r.json())
        .then((j) =>
          j.success ? j.courses : Promise.reject(j.message || "Course error")
        );

    Promise.all([fetchStats(), fetchCourses()])
      .then(([stats, courses]) => {
        if (!mounted) return;

        const topLookup = {};
        Array.isArray(stats?.topCourses) &&
          stats.topCourses.forEach((t) => {
            if (!t) return;
            const name = t.courseName || "";
            topLookup[name] = {
              purchases: Number(t.count || 0),
              revenue: Number(t.revenue || 0),
            };
          });

        const mapped = (courses || []).map((c) => {
          const id = c._id ?? c.id ?? c.courseId ?? "";
          const name = c.name ?? c.title ?? "Untitled Course";
          const image = c.image ?? "";
          const instructor = c.teacher ?? c.instructor ?? "Unknown";
          const metrics = topLookup[name] || { purchases: 0, revenue: 0 };
          const students = metrics.purchases || (c.students ?? 0);
          const purchases = metrics.purchases || (c.purchases ?? 0);
          const earnings = metrics.revenue ?? c.earnings ?? 0;

          let priceDisplay = "Free";
          if (c.price && (c.price.sale || c.price.original)) {
            const sale = c.price.sale != null ? Number(c.price.sale) : null;
            const orig =
              c.price.original != null ? Number(c.price.original) : null;
            priceDisplay =
              sale != null
                ? fmtCurrency(sale)
                : orig != null
                ? fmtCurrency(orig)
                : "Free";
          } else if (c.pricingType && c.pricingType !== "free") {
            priceDisplay = "₹0";
          }

          return {
            id,
            image,
            name,
            instructor,
            students,
            price: priceDisplay,
            purchases,
            earnings: fmtCurrency(earnings),
          };
        });

        setStatsData(buildStats(stats));
        setCoursesData(mapped);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        if (mounted) setError(String(err) || "Failed to load dashboard data");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const stats = statsData || [
    { title: "Total Bookings", value: 0, icon: iconMap.Users, color: "indigo" },
    {
      title: "Revenue",
      value: "₹0",
      icon: iconMap.BadgeIndianRupee,
      color: "green",
    },
    {
      title: "Bookings (7d)",
      value: 0,
      icon: iconMap.ShoppingCart,
      color: "yellow",
    },
    {
      title: "Top Courses",
      value: 0,
      icon: iconMap.BookMarked,
      color: "purple",
    },
  ];

  const filteredCourses = coursesData.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor || "").toLowerCase().includes(searchTerm.toLowerCase())
  );


              <thead className={dashboardStyles.tableHead}>
                <tr>
                  <th className={dashboardStyles.tableHeader}>Course</th>
                  <th className={dashboardStyles.tableHeader}>Students</th>
                  <th className={dashboardStyles.tableHeader}>Price</th>
                  <th className={dashboardStyles.tableHeader}>Purchases</th>
                  <th className={dashboardStyles.tableHeader}>Earnings</th>
                </tr>
              </thead>