
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const handleSubmit = (e) => {

    setIsSubmitting(true);
    const whatsappMessage =
      `Name: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Phone: ${formData.phone}%0A` +
      `Subject: ${formData.subject}%0A` +
      `Message: ${formData.message}`;

    const whatsappUrl = `https://wa.me/918299431275?text=${whatsappMessage}`;
    window.open(whatsappUrl, "_blank");

  };

  const isFormValid =
    formData.name &&
    formData.email &&
    validatePhone(formData.phone) &&
    formData.subject &&
    formData.message;


              <form
                onSubmit={handleSubmit}
                className={contactStyles.formElements}
              >

                {/* Phone */}
                <div className={contactStyles.formGroup}>
                  <label className={contactStyles.label}>
                    <Phone
                      className={`${contactStyles.labelIcon} ${contactStyles.colors.green.icon}`}
                    />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    maxLength={10}
                    className={`${contactStyles.input} ${
                      contactStyles.colors.green.focus
                    } ${contactStyles.colors.green.hover} ${
                      phoneError ? contactStyles.inputError : ""
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {phoneError && (
                    <p className={contactStyles.errorText}>{phoneError}</p>
                  )}
                </div>

                {/* Subject */}
                <div className={contactStyles.formGroup}>
                  <label className={contactStyles.label}>
                    <MessageSquare
                      className={`${contactStyles.labelIcon} ${contactStyles.colors.purple.icon}`}
                    />
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`${contactStyles.select} ${contactStyles.colors.purple.focus}`}
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Project Collaboration">
                      Project Collaboration
                    </option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>


          {/* Animation Section */}
          <div className={contactStyles.animationContainer}>
            <div className={contactStyles.animationWrapper}>
              <DotLottieReact
                src="https://lottie.host/9ccf026c-11e9-417a-9a9d-0169bc83e49d/sMK5FavyPC.lottie"
                loop
                autoplay
                style={{
                  width: "100%",
                  height: "500px",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))",
                }}
              />
            </div>
          </div>

