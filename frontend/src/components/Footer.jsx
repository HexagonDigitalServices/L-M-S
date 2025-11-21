import {
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Shield,
  HandHelping,
} from "lucide-react";

const iconMap = {
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Shield,
  HandHelping,
};


        {/* subtle grid overlay, reduce opacity on small screens */}
        <div className={footerBackgroundStyles.gridOverlay}>
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>


          <div className={footerStyles.socialContainer}>
            <div className={footerStyles.socialIconsContainer}>
              {socialIcons.map((social, index) => {
                const IconComponent = iconMap[social.iconKey] || Twitter;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    className={footerStyles.socialIconLink}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* subtle hover overlay only matters on pointer devices */}
                    <div
                      className={`${footerStyles.socialIconContainer} ${social.bgColor}`}
                    >
                      <div className={footerStyles.socialIconInner}>
                        <IconComponent className={footerStyles.socialIcon} />
                      </div>

                      {/* small tooltip on hover for pointer devices; hidden on touch by default */}
                      <div className={footerStyles.socialTooltip}>
                        {social.name}
                        <div className={footerStyles.socialTooltipArrow} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>