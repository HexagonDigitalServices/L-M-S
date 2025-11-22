const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "About", icon: BookMarked, href: "/about" },
  { name: "Faculty", icon: Users, href: "/faculty" },
  { name: "Contact", icon: Contact, href: "/contact" },
];

 // INSTANT token removal using Clerk logout event
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      console.log("Token removed instantly on Clerk logout event");
    };

    window.addEventListener("user:signed_out", handleLogout);
    return () => window.removeEventListener("user:signed_out", handleLogout);
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      if (scrollY > lastScrollY && scrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

