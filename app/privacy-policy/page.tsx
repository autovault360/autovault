import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Shield,
  Database,
  Lock,
  Share2,
  Globe,
  Cookie,
  Clock,
  UserCheck,
  AlertCircle,
  FileText,
  Mail,
} from "lucide-react";

const sections = [
  {
    id: "information",
    icon: Database,
    title: "1. INFORMATION WE COLLECT",
    intro: "We may collect the following types of information:",
    subsections: [
      {
        subtitle: "Personal Information",
        items: ["Name", "Email address", "Phone number", "Business information", "Billing information"],
      },
      {
        subtitle: "Dealership & Business Data",
        items: [
          "Vehicle inventory",
          "Customer information",
          "CRM activity",
          "Sales and deal data",
          "Profit & loss reports",
          "Tax and accounting information",
          "Uploaded documents and files",
        ],
      },
      {
        subtitle: "Technical Information",
        items: [
          "IP address",
          "Browser type",
          "Device information",
          "Login activity",
          "Usage analytics",
          "Cookies and tracking data",
        ],
      },
    ],
  },
  {
    id: "usage",
    icon: Shield,
    title: "2. HOW WE USE YOUR INFORMATION",
    intro: "We use collected information to:",
    items: [
      "Provide and improve AutoVault services",
      "Manage dealership operations and CRM functionality",
      "Process subscriptions and billing",
      "Maintain platform security",
      "Generate analytics and reporting",
      "Provide customer support",
      "Communicate updates and important notices",
      "Improve platform performance and user experience",
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "3. DATA SECURITY",
    paragraphs: [
      "AutoVault implements commercially reasonable security measures designed to protect your information from unauthorized access, disclosure, or misuse.",
      "However, no system can guarantee complete security, and users acknowledge that use of the platform is at their own risk.",
      "Users are responsible for maintaining secure passwords and protecting account access.",
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "4. DATA SHARING",
    paragraphs: [
      "AutoVault does not sell user data.",
      "We may share information with trusted third-party providers necessary to operate the platform, including:",
      "We may also disclose information if required by law or to protect our legal rights.",
    ],
    items: [
      "Payment processors",
      "Cloud hosting providers",
      "Email service providers",
      "Analytics providers",
      "Accounting and integration partners",
    ],
  },
  {
    id: "third-party",
    icon: Globe,
    title: "5. THIRD-PARTY SERVICES",
    paragraphs: [
      "AutoVault may integrate with third-party applications and services. We are not responsible for the privacy practices or policies of third-party providers.",
      "Users should review the privacy policies of any connected third-party services.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "6. COOKIES & TRACKING TECHNOLOGIES",
    intro: "We may use cookies and similar technologies to:",
    items: [
      "Improve website functionality",
      "Remember user preferences",
      "Analyze traffic and usage patterns",
      "Enhance user experience",
    ],
    note: "Users may disable cookies through browser settings, though some features may not function properly.",
  },
  {
    id: "retention",
    icon: Clock,
    title: "7. DATA RETENTION",
    intro: "We retain information as long as necessary to:",
    items: [
      "Provide services",
      "Maintain business records",
      "Comply with legal obligations",
      "Resolve disputes",
      "Enforce agreements",
    ],
    note: "Users may request account deletion subject to legal and operational requirements.",
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "8. USER RIGHTS",
    intro: "Users may have the right to:",
    items: [
      "Access their personal information",
      "Request corrections",
      "Request deletion of certain data",
      "Opt out of certain communications",
    ],
    note: "Requests may be submitted through our support contact.",
  },
  {
    id: "children",
    icon: AlertCircle,
    title: "9. CHILDREN'S PRIVACY",
    paragraphs: [
      "AutoVault is not intended for individuals under the age of 18. We do not knowingly collect information from minors.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "10. CHANGES TO THIS POLICY",
    paragraphs: [
      "We may update this Privacy Policy periodically. Continued use of AutoVault after updates constitutes acceptance of the revised policy.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "11. CONTACT INFORMATION",
    contact: {
      name: "AutoVault360",
      email: "support@autovault360.com",
      website: "www.autovault360.com",
    },
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#020403] font-sans text-zinc-300 antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 md:px-16">
        <div className="space-y-4 text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase leading-[1.1]">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-zinc-500 font-normal tracking-wide">
            Effective Date: <span className="text-zinc-400">May 20, 2026</span>
          </p>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-6" />
          <p className="text-[14px] leading-relaxed text-zinc-400 max-w-2xl mx-auto mt-6">
            AutoVault360 ("AutoVault," "we," "our," or "us") respects your privacy and is committed to protecting the information you share with us. This Privacy Policy explains how we collect, use, store, and protect your information when you use the AutoVault platform, website, software, and services.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="group">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                  <section.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold tracking-wide text-white uppercase pt-2">
                  {section.title}
                </h2>
              </div>

              <div className="ml-14 space-y-4">
                {section.intro && (
                  <p className="text-[13px] leading-relaxed text-zinc-400">
                    {section.intro}
                  </p>
                )}

                {"subsections" in section && section.subsections && (
                  <div className="space-y-6">
                    {section.subsections.map((sub, i) => (
                      <div key={i} className="space-y-2">
                        <h3 className="text-[13px] font-semibold text-zinc-200">
                          {sub.subtitle}
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {sub.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-[13px] text-zinc-400">
                              <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {"items" in section && section.items && (
                  <ul className="space-y-1.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400">
                        <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {"paragraphs" in section && section.paragraphs && (
                  <div className="space-y-3">
                    {section.paragraphs.map((p, i) => (
                      <p key={i} className="text-[13px] leading-relaxed text-zinc-400">
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {"note" in section && section.note && (
                  <p className="text-[13px] leading-relaxed text-zinc-500 italic">
                    {section.note}
                  </p>
                )}

                {"contact" in section && section.contact && (
                  <div className="rounded-lg border border-zinc-900/60 bg-[#0c0e10]/40 p-4 space-y-2">
                    <p className="text-[13px] font-semibold text-zinc-200">
                      {section.contact.name}
                    </p>
                    <p className="text-[13px] text-zinc-400">
                      Email:{" "}
                      <a
                        href={`mailto:${section.contact.email}`}
                        className="text-primary hover:underline"
                      >
                        {section.contact.email}
                      </a>
                    </p>
                    <p className="text-[13px] text-zinc-400">
                      Website:{" "}
                      <a
                        href={`https://${section.contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {section.contact.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full border-t border-zinc-900/30 mt-8" />
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
