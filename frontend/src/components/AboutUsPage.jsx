
  const [counterValues, setCounterValues] = useState({
    students: 0,
    courses: 0,
    successRate: 0,
    countries: 0,
    certificates: 0,
    support: 0,
  });

  // Animated counter effect using imported counterTargets
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers = [];

    Object.keys(counterTargets).forEach((key) => {
      let current = 0;
      const target = counterTargets[key];
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounterValues((prev) => ({
          ...prev,
          [key]: Math.floor(current),
        }));
      }, stepDuration);

      timers.push(timer);
    });

    return () => timers.forEach((t) => clearInterval(t));
  }, []);

  // Helper to format display number per stat key
  const formatStatNumber = (key) => {
    if (key === "support") return "24/7";
    if (key === "successRate") return `${counterValues.successRate}%`;
    const val = counterValues[key] ?? 0;
    // certificates might be large -> show with commas and plus
    if (key === "certificates") return `${val.toLocaleString()}+`;
    return `${val.toLocaleString()}+`;
  };



          {/* Top-and-bottom vignette */}
          <div
            className={aboutUsStyles.heroVignette}
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.72) 100%)",
            }}
          />

      {/* Enhanced Values Principles Section */}
      <section className={aboutUsStyles.valuesSection}>
        <div className={aboutUsStyles.sectionGrid}>
          <div className={aboutUsStyles.valuesHeader}>
            <div className={aboutUsStyles.valuesBadge}>
              <ShieldUser className={aboutUsStyles.valuesBadgeIcon} />
              <span className={aboutUsStyles.valuesBadgeText}>
                Our Guiding Principles
              </span>
            </div>
            <h2 className={aboutUsStyles.valuesTitle}>
              Core Values That Define Us
            </h2>
            <p className={aboutUsStyles.valuesSubtitle}>
              The foundation of everything we do at LearnHub
            </p>
          </div>

          <div className={aboutUsStyles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={aboutUsStyles.valueCard}>
                <div
                  className={`${aboutUsStyles.valueGradient} ${value.color}`}
                ></div>

                <h3
                  className={aboutUsStyles.valueCardTitle}
                  title={value.title}
                >
                  {value.title}
                </h3>

                <p className={aboutUsStyles.valueCardDescription}>
                  {value.description}
                </p>

                <ul className={aboutUsStyles.valueFeatures}>
                  {value.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={aboutUsStyles.valueFeatureItem}
                    >
                      <div
                        className={`${aboutUsStyles.valueFeatureDot} ${value.color}`}
                      ></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div
                  className={`${aboutUsStyles.valueUnderline} ${value.color}`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>