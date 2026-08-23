/* =========================================================
   Everest Pharma — shared behaviour
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavToggle();
  initHeaderScroll();
  initScrollTop();
  initHeroSlider();
  initScrollReveal();
  initStatCounters();
  initProductCatalogue();
  initProductModal();
  initContactForm();
});

/* ---------------------------------------------------------
   Theme toggle — light/dark mode with localStorage persistence
   --------------------------------------------------------- */
function initThemeToggle() {
  const html = document.documentElement;
  const body = document.body;
  const toggle = document.getElementById("themeToggle");
  
  if (!toggle) return;

  // Load saved theme or use system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  let initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  
  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      body.classList.remove("light-mode");
      html.style.colorScheme = "dark";
    } else {
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
  }

  // Apply initial theme
  applyTheme(initialTheme);

  // Toggle on button click
  toggle.addEventListener("click", () => {
    const current = body.classList.contains("dark-mode") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
}

/* ---------------------------------------------------------
   Hero photo slider — autoplay with dot navigation
   --------------------------------------------------------- */
function initHeroSlider() {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".hero-slide");
  const dots = slider.querySelectorAll(".hero-dot");
  if (slides.length < 2) return;

  let current = 0;
  let timer = null;

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function start() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stop() {
    clearInterval(timer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      stop();
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  start();
}

/* ---------------------------------------------------------
   Sticky header — tightens up and gains a shadow on scroll
   --------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const applyState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  applyState();
  window.addEventListener("scroll", applyState, { passive: true });
}

/* ---------------------------------------------------------
   Scroll-to-top button
   --------------------------------------------------------- */
function initScrollTop() {
  const button = document.getElementById("scrollTop");
  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > 420);
  };

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------
   Scroll reveal — fades + rises elements as they enter view.
   Add class="reveal" to any element; optionally set
   style="--d: 0.1s" on siblings for a staggered entrance.
   --------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Animated stat counters — counts up from 0 once visible.
   Expects markup like: <span class="stat-number" data-target="120" data-suffix="+">0</span>
   --------------------------------------------------------- */
function initStatCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.add("is-counting");
      }
    }
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Mobile nav toggle
   --------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const menu = toggle ? toggle.parentElement.querySelector(".nav-center") : null;
  if (!toggle || !links || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the menu when a link is tapped (useful on mobile).
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------------------------------------------------
   Product catalogue (products.html)
   Edit productData below to add / remove medicines.
   --------------------------------------------------------- */
const productData = [
  {
    name: "Everactive Tablets",
    generic: "Methylcobalamin, Multivitamin & Multi-Mineral Tablets",
    category: "Vitamins & Wellness",
    rx: false,
    form: "Tablet",
    tagline: "Recharge. Revitalize. Rejuvenate.",
    desc: "A broad vitamin, mineral and amino-acid blend designed to support energy, nerve health, immunity, bones, muscles, skin and everyday nutritional needs.",
    details: {
      composition: "Methylcobalamin with multivitamins, multi-minerals and amino acids.",
      benefits: [
        "Supports brain & nerve health",
        "Enhances energy & stamina",
        "Promotes immunity & antioxidant protection",
        "Strengthens bones & muscles",
        "Supports skin, hair & nail health",
        "Aids metabolic function and nutrient absorption"
      ],
      indications: [
        "General weakness or fatigue",
        "Nutritional deficiencies",
        "Recovery after illness or surgery",
        "Immunity support",
        "Hair loss, brittle nails or poor skin health",
        "Stressful lifestyle or aging"
      ]
    }
  },
  {
    name: "Everactive Syrup",
    generic: "Vitamin B-Complex with Glutamic Acid Syrup",
    category: "Vitamins & Wellness",
    rx: false,
    form: "Syrup",
    tagline: "Recharge. Rebuild. Refocus.",
    desc: "A B-complex and glutamic-acid syrup positioned for nerve function, energy production, metabolism, memory, learning and mental alertness.",
    details: {
      composition: "Vitamin B-complex with glutamic acid syrup.",
      benefits: [
        "Supports nerve function, energy production & metabolism",
        "Glutamic acid acts as a neurotransmitter",
        "Supports memory, learning & mental alertness"
      ],
      indications: [
        "Vitamin B-complex deficiency",
        "Fatigue & mental stress",
        "Neuro-muscular weakness",
        "Poor appetite in children",
        "Post-illness recovery",
        "Stress-related memory loss"
      ]
    }
  },
  {
    name: "Esprint-P",
    generic: "Aceclofenac 100mg + Paracetamol 325mg Tablets",
    category: "Antibiotics",
    rx: true,
    form: "Tablet",
    tagline: "Targeted Pain Relief.",
    desc: "A combination tablet positioned for the management of pain and inflammation.",
    details: {
      composition: "Aceclofenac 100mg + Paracetamol 325mg.",
      benefits: [
        "Helps relieve pain and inflammation",
        "Aceclofenac provides anti-inflammatory and analgesic action",
        "Paracetamol provides analgesic and antipyretic action"
      ],
      indications: [
        "Musculoskeletal pain",
        "Joint and inflammatory pain",
        "Dental and post-operative pain",
        "Other painful inflammatory conditions as directed by a healthcare professional"
      ]
    }
  },
  {
    name: "Evesprint-SP",
    generic: "Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg Tablets",
    category: "Antibiotics",
    rx: true,
    form: "Tablet",
    tagline: "Triple Action. Triple Relief.",
    desc: "A combination of aceclofenac, paracetamol and serratiopeptidase positioned for pain, inflammation and swelling.",
    details: {
      composition: "Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg.",
      benefits: [
        "Aceclofenac reduces inflammation and pain",
        "Paracetamol provides analgesic and antipyretic action",
        "Serratiopeptidase supports reduction in inflammatory swelling and faster tissue healing"
      ],
      indications: [
        "Low back pain, neck pain and sciatica",
        "Osteoarthritis and rheumatoid arthritis",
        "Dental pain and post-surgical pain",
        "ENT infections with swelling",
        "Sports injuries and soft tissue trauma"
      ]
    }
  },
  {
    name: "Ever Hep",
    generic: "Metadoxine 500mg + Silymarin 140mg + L-Ornithine L-Aspartate 150mg + Lecithin 200mg + L-Taurine 50mg + Pyridoxine HCl 6mg + Folic Acid 1.5mg Tablets",
    category: "Hepatology",
    rx: true,
    form: "Tablet",
    tagline: "Revive Your Liver, Renew Your Life.",
    desc: "A multi-ingredient liver-support formula presented for hepatoprotection, detoxification and metabolic restoration.",
    details: {
      composition: "Metadoxine 500mg + Silymarin 140mg + L-Ornithine L-Aspartate 150mg + Lecithin 200mg + L-Taurine 50mg + Pyridoxine HCl 6mg + Folic Acid 1.5mg.",
      benefits: [
        "Metadoxine supports alcohol clearance and reduction of hepatic fat accumulation",
        "Silymarin provides antioxidant and hepatoprotective support",
        "L-Ornithine L-Aspartate supports ammonia detoxification",
        "Lecithin supports liver membrane integrity and fat metabolism",
        "L-Taurine supports hepatocyte protection from oxidative stress",
        "Pyridoxine and folic acid support amino-acid metabolism and homocysteine management"
      ],
      indications: [
        "Alcoholic liver disease",
        "Fatty liver (NAFLD/NASH)",
        "Drug-induced hepatotoxicity",
        "Hepatic encephalopathy",
        "Chronic liver disorders & nutritional support"
      ]
    }
  },
  {
    name: "ZETARAFT",
    generic: "Sodium Alginate + Sodium Bicarbonate + Calcium Carbonate Oral Suspension",
    category: "Gastro Care",
    rx: false,
    form: "Oral suspension",
    tagline: "The Gentle Shield Against Acid.",
    desc: "A double-action anti-reflux antacid positioned for rapid symptom relief and longer-lasting acid control.",
    details: {
      composition: "Sodium Alginate + Sodium Bicarbonate + Calcium Carbonate.",
      benefits: [
        "Sodium alginate forms a viscous raft that floats on stomach contents",
        "Sodium bicarbonate and calcium carbonate neutralize excess gastric acid",
        "Together, the ingredients help prevent acid from entering the esophagus and neutralize existing acid"
      ],
      indications: [
        "Gastroesophageal reflux disease (GERD)",
        "Heartburn & acid indigestion",
        "Post-meal regurgitation",
        "Reflux during pregnancy (on physician advice)"
      ]
    }
  },
  {
    name: "ZETACID-40",
    generic: "Pantoprazole Gastro-Resistant Tablets IP 40mg",
    category: "Gastro Care",
    rx: true,
    form: "Tablet",
    tagline: "Target the Root. Silence the Burn.",
    desc: "A proton-pump inhibitor positioned for sustained acid suppression and mucosal healing.",
    details: {
      composition: "Pantoprazole 40mg.",
      benefits: [
        "Pantoprazole is a proton pump inhibitor (PPI)",
        "Irreversibly inhibits the H+/K+ ATPase enzyme in gastric parietal cells",
        "Reduces basal and stimulated acid secretion"
      ],
      indications: [
        "Gastroesophageal reflux disease (GERD)",
        "Erosive esophagitis",
        "Peptic ulcer disease",
        "Zollinger-Ellison syndrome",
        "Acid-related dyspepsia"
      ]
    }
  },
  {
    name: "ZETACID-DSR",
    generic: "Pantoprazole 40mg + Domperidone 10mg I.R. + Domperidone 20mg S.R. Tablet in Capsule Technology",
    category: "Gastro Care",
    rx: true,
    form: "Capsule technology",
    tagline: "Fast Relief Now. Sustained Relief Later.",
    desc: "Capsule-in-capsule technology combining acid suppression with immediate- and sustained-release domperidone.",
    details: {
      composition: "Pantoprazole 40mg + Domperidone 10mg I.R. + Domperidone 20mg S.R.",
      benefits: [
        "Pantoprazole suppresses gastric acid secretion at the source",
        "Long-lasting acid control (24 hrs)",
        "Domperidone 10mg I.R. is positioned for quick relief of nausea, bloating & early satiety",
        "The supplied material states action begins within 30 minutes",
        "The capsule-in-capsule approach combines immediate and sustained release"
      ],
      indications: [
        "Gastroesophageal reflux disease (GERD)",
        "Non-ulcer dyspepsia",
        "Functional dyspepsia with delayed gastric emptying",
        "Chronic gastritis, belching & bloating",
        "Nausea/vomiting associated with acid-peptic disorders"
      ]
    }
  },
  {
    name: "Gestgold",
    generic: "Natural Micronised Progesterone 200mg Soft Gelatin Capsules & 300mg (SR) Tablets",
    category: "Gynaecology",
    rx: true,
    form: "Soft gelatin capsule / SR tablet",
    tagline: "Trusted Hormonal Harmony. Naturally Delivered.",
    desc: "Natural micronised progesterone positioned for a healthy cycle and pregnancy support.",
    details: {
      composition: "Natural Micronised Progesterone 200mg soft gelatin capsules and 300mg sustained-release tablets.",
      benefits: [
        "Identical to endogenous human progesterone",
        "Binds to progesterone receptors in the uterus",
        "Prepares and stabilizes the endometrium for implantation",
        "Supports early pregnancy by maintaining uterine quiescence",
        "Micronisation enhances bioavailability, especially in oral and vaginal routes"
      ],
      indications: [
        "Luteal phase deficiency",
        "Threatened or recurrent miscarriage",
        "Assisted reproductive technologies (IVF/IUI)",
        "Preterm labor prevention",
        "Secondary amenorrhea",
        "Menstrual irregularities",
        "Hormone replacement therapy (HRT) in menopause"
      ]
    }
  },
  {
    name: "Irofirst",
    generic: "Ferrous Ascorbate 100mg + Folic Acid 1.5mg + Zinc 61.8mg Tablets",
    category: "Vitamins & Wellness",
    rx: false,
    form: "Tablet",
    tagline: "Build Blood. Boost Energy. Feel Alive.",
    desc: "Iron, folic acid and zinc supplementation positioned for stronger blood and nutritional support.",
    details: {
      composition: "Ferrous Ascorbate 100mg + Folic Acid 1.5mg + Zinc 61.8mg.",
      benefits: [
        "Ferrous ascorbate provides bioavailable iron with vitamin C support",
        "Folic acid supports red blood cell formation and fetal neural development",
        "Zinc supports immunity, healing and iron metabolism"
      ],
      indications: [
        "Iron deficiency anemia",
        "Nutritional anemia in pregnancy/lactation",
        "Post-surgical or chronic illness recovery",
        "Menstrual blood loss",
        "Teenage & adolescent anemia",
        "General fatigue & weakness"
      ]
    }
  },
  {
    name: "Pulmoend",
    generic: "Dextromethorphan HBr 10mg + Chlorpheniramine Maleate 2mg/5ml Syrup",
    category: "Pulmonology",
    rx: true,
    form: "Syrup",
    tagline: "Soothes the Cough. Clears the Air.",
    desc: "A cough suppressant and first-generation antihistamine combination positioned for dry cough and allergy symptoms.",
    details: {
      composition: "Dextromethorphan HBr 10mg + Chlorpheniramine Maleate 2mg/5ml.",
      benefits: [
        "Dextromethorphan is a centrally acting antitussive",
        "Suppresses dry, non-productive cough by acting on the cough center in the brain",
        "Chlorpheniramine maleate is a first-generation antihistamine",
        "Supports relief of sneezing, runny nose, watery eyes and allergic symptoms",
        "The supplied material notes a mild sedative effect that may aid restful sleep"
      ],
      indications: [
        "Dry & irritative cough",
        "Allergic rhinitis",
        "Common cold symptoms",
        "Sneezing & nasal congestion",
        "Night-time cough"
      ]
    }
  },
  {
    name: "Warkast",
    generic: "Montelukast Sodium 10mg + Levocetirizine Dihydrochloride 5mg Tablets",
    category: "Pulmonology",
    rx: true,
    form: "Tablet",
    tagline: "Breathe Easy. Live Freely.",
    desc: "A dual-action allergy combination positioned for allergic rhinitis and airway symptoms.",
    details: {
      composition: "Montelukast Sodium 10mg + Levocetirizine Dihydrochloride 5mg.",
      benefits: [
        "Montelukast blocks leukotriene-driven inflammation, swelling and bronchoconstriction",
        "Levocetirizine is a selective H1-antihistamine",
        "The supplied material describes minimal sedation with levocetirizine"
      ],
      indications: [
        "Allergic rhinitis",
        "Chronic urticaria",
        "Bronchial asthma",
        "Sneezing and nasal congestion",
        "Itching and watery eyes"
      ]
    }
  },
  {
    name: "ECEP-200",
    generic: "Cefpodoxime Proxetil 200mg Tablets",
    category: "Antibiotics",
    rx: true,
    form: "Tablet",
    tagline: "Fast Relief. Broad Protection. Clinical Confidence.",
    desc: "A cefpodoxime proxetil antibiotic positioned for broad-spectrum protection against common bacterial infections.",
    details: {
      composition: "Cefpodoxime Proxetil 200mg.",
      benefits: [
        "Cefpodoxime proxetil is presented as a third-generation cephalosporin",
        "Inhibits bacterial cell wall synthesis, leading to bacterial lysis and death",
        "Broad-spectrum activity against Gram-positive and Gram-negative organisms"
      ],
      indications: [
        "Upper & lower respiratory tract infections",
        "Community-acquired pneumonia",
        "Skin & soft tissue infections",
        "Urinary tract infections",
        "Tonsillitis, pharyngitis, sinusitis"
      ]
    }
  },
  {
    name: "ECEP",
    generic: "Cefpodoxime Oral Suspension IP",
    category: "Antibiotics",
    rx: true,
    form: "Oral suspension",
    tagline: "Safe. Effective. Made for Kids.",
    desc: "Cefpodoxime oral suspension positioned as broad-spectrum relief with a kid-friendly recovery focus.",
    details: {
      composition: "Cefpodoxime oral suspension IP.",
      benefits: [
        "Cefpodoxime is presented as a third-generation cephalosporin",
        "Inhibits bacterial cell wall synthesis and causes bacterial lysis",
        "Broad-spectrum activity against Gram-positive and Gram-negative bacteria",
        "Beta-lactamase stability is stated in the supplied material"
      ],
      indications: [
        "Acute otitis media",
        "Tonsillitis & pharyngitis",
        "Sinusitis",
        "Skin & soft tissue infections",
        "Pediatric UTI & LRTI"
      ]
    }
  },
  {
    name: "Evertend",
    generic: "Collagen Peptide Type II 60mg + Sodium Hyaluronate 30mg + L-Arginine 500mg + Chondroitin Sulphate 200mg + Vitamin D 100IU + Vitamin C 40mg Tablet",
    category: "Orthopedics",
    rx: false,
    form: "Tablet",
    tagline: "Restore, Rebuild & Revitalize your joints from within.",
    desc: "A joint-care combination featuring collagen peptide type II, sodium hyaluronate, chondroitin, L-arginine and vitamins.",
    details: {
      composition: "Collagen Peptide Type II 60mg + Sodium Hyaluronate 30mg + L-Arginine 500mg + Chondroitin Sulphate 200mg + Vitamin D 100IU + Vitamin C 40mg.",
      benefits: [
        "Collagen peptide type II supports cartilage matrix and joint flexibility",
        "Sodium hyaluronate lubricates joints and cushions movement",
        "L-arginine supports nitric oxide, blood flow and tissue repair",
        "Chondroitin sulphate supports cartilage and inflammation management",
        "Vitamin D supports calcium absorption and bone strength",
        "Vitamin C promotes collagen synthesis and antioxidant protection"
      ],
      indications: [
        "Osteoarthritis and joint stiffness",
        "Degenerative joint diseases",
        "Sports injuries and joint overuse",
        "Post-operative orthopedic recovery",
        "Bone & joint health maintenance"
      ]
    }
  },
  {
    name: "Rutoart",
    generic: "Trypsin 48mg + Bromelain 90mg + Rutoside Trihydrate 100mg Tablets",
    category: "Orthopedics",
    rx: true,
    form: "Tablet",
    tagline: "Heal Faster. Move Better.",
    desc: "A proteolytic enzyme and antioxidant combination positioned for inflammation, edema, swelling and recovery.",
    details: {
      composition: "Trypsin 48mg + Bromelain 90mg + Rutoside Trihydrate 100mg.",
      benefits: [
        "Trypsin is described as a proteolytic enzyme that breaks down inflammatory proteins",
        "Bromelain is a pineapple-derived enzyme that supports trypsin absorption and has anti-edema effects",
        "Rutoside trihydrate is presented as a bioflavonoid antioxidant that strengthens blood vessels and reduces capillary permeability",
        "Combined effect: anti-inflammatory + anti-edematous + antioxidant protection"
      ],
      indications: [
        "Post-operative inflammation & edema",
        "Sports injuries, sprains & strains",
        "Dental & orthopedic surgeries",
        "Varicose veins, thrombophlebitis",
        "Osteoarthritis & musculoskeletal pain"
      ]
    }
  },
  {
    name: "Ever D3",
    generic: "Cholecalciferol 60000 IU Tablets",
    category: "Vitamins & Wellness",
    rx: false,
    form: "Tablet",
    tagline: "The Power of Sunshine Packed in One Tablet.",
    desc: "Cholecalciferol supplementation positioned for vitamin D support, bone health, muscle strength and immune modulation.",
    details: {
      composition: "Cholecalciferol 60,000 IU.",
      benefits: [
        "Cholecalciferol is a precursor of the active form of vitamin D (calcitriol)",
        "Supports calcium and phosphate metabolism",
        "Supports bone mineralization, muscle strength and immune modulation"
      ],
      indications: [
        "Vitamin D3 deficiency",
        "Osteomalacia / rickets",
        "Osteoporosis & osteopenia",
        "Chronic fatigue & muscle weakness",
        "Immunity support"
      ]
    }
  }
];

let activeFilter = "all";
let activeSearch = "";

// Small line icons, one per therapy area — gives each category a
// recognizable silhouette instead of relying on color alone.
const CATEGORY_ICONS = {
  "Gastro Care": '<path d="M8 3c-1 3-3 4-3 8a7 7 0 0014 0c0-2-1-3-3-4-1.5-.6-2-1.5-2-3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="13.5" r="1.3" fill="currentColor" stroke="none"/>',
  "Hepatology": '<path d="M4 9.5c1-3 4-5.5 8-5.5 5 0 9 3 9 7.2 0 5-4 8.3-9 8.3-3 0-6-1-7-3-1-2 .2-3-.7-5-.6-1.2-.6-1.2.7-2z" stroke-linecap="round" stroke-linejoin="round"/>',
  "Antibiotics": '<rect x="3.5" y="10.3" width="17" height="7.2" rx="3.6" transform="rotate(-25 12 14)"/><path d="M12 2.5l1 2.6h2.6l-2 1.9.7 2.6-2.3-1.6-2.3 1.6.7-2.6-2-1.9h2.6z" fill="currentColor" stroke="none"/>',
  "Pulmonology": '<path d="M12 3v6" stroke-linecap="round"/><path d="M9 9c-2.2 0-4 2.2-4 5.2 0 2.8 1 5.8 3 5.8 1.5 0 2-1 2-2.8V9z" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 9c2.2 0 4 2.2 4 5.2 0 2.8-1 5.8-3 5.8-1.5 0-2-1-2-2.8V9z" stroke-linecap="round" stroke-linejoin="round"/>',
  "Antibiotics": '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9.5v5M9.5 12h5" stroke-linecap="round"/>',
  "Gynaecology": '<circle cx="12" cy="9" r="5.2"/><path d="M12 14.2V21M8.7 17.8h6.6" stroke-linecap="round"/>',
  "Vitamins & Wellness": '<path d="M5 19c0-7.2 4-13 13-14-1 8-6 13-13 14z" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.2 17.8c2-3 5-6 9.8-9" stroke-linecap="round"/>',
  "Orthopedics": '<path d="M8 5.5a3 3 0 10-4 4.5l4.5 4.5a3 3 0 104 4l-4.5-4.5A3 3 0 108 5.5z" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 18.5a3 3 0 104-4.5l-4.5-4.5a3 3 0 10-4-4l4.5 4.5A3 3 0 0016 18.5z" stroke-linecap="round" stroke-linejoin="round"/>',
};

function categoryIconSVG(category) {
  const inner = CATEGORY_ICONS[category] || '<circle cx="12" cy="12" r="8"/>';
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7">${inner}</svg>`;
}

// Shared IntersectionObserver reused for any element revealed after
// initial page load (e.g. product cards re-rendered on filter/search).
let sharedRevealObserver = null;
function getRevealObserver() {
  if (sharedRevealObserver || !("IntersectionObserver" in window)) return sharedRevealObserver;
  sharedRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          sharedRevealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
  );
  return sharedRevealObserver;
}

function initProductCatalogue() {
  const grid = document.getElementById("productGrid");
  if (!grid) return; // Not on the products page

  renderProducts();

  const filterBar = document.getElementById("filterBar");
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderProducts();
  });

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    activeSearch = e.target.value.trim().toLowerCase();
    renderProducts();
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const noResults = document.getElementById("noResults");

  const filtered = productData.filter((p) => {
    const matchesCategory = activeFilter === "all" || p.category === activeFilter;
    const matchesSearch =
      activeSearch === "" ||
      p.name.toLowerCase().includes(activeSearch) ||
      p.generic.toLowerCase().includes(activeSearch);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = filtered.map(productCardHTML).join("");
  noResults.classList.toggle("show", filtered.length === 0);

  // Each card fades + rises in with a small stagger so a filter change
  // feels alive rather than an instant swap.
  const observer = getRevealObserver();
  const cards = grid.querySelectorAll(".product-card");
  cards.forEach((card, i) => {
    card.style.setProperty("--d", `${Math.min(i * 0.05, 0.4)}s`);
    if (observer) {
      observer.observe(card);
    } else {
      card.classList.add("is-visible");
    }
  });

  grid.querySelectorAll(".product-detail-btn").forEach((button) => {
    button.addEventListener("click", () => openProductDetails(button.dataset.product));
  });
}

function openProductDetails(name) {
  const product = productData.find((p) => p.name === name);
  const modal = document.getElementById("productModal");
  if (!product || !modal) return;

  const title = modal.querySelector("[data-modal-title]");
  const subtitle = modal.querySelector("[data-modal-subtitle]");
  const content = modal.querySelector("[data-modal-content]");

  title.textContent = product.name;
  subtitle.textContent = product.tagline || product.generic;
  const details = product.details || {};
  content.innerHTML = `
    <div class="detail-block">
      <span class="detail-label">Composition</span>
      <p>${escapeHTML(details.composition || product.generic)}</p>
    </div>
    ${details.benefits?.length ? `<div class="detail-block"><span class="detail-label">Key information</span><ul>${details.benefits.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>` : ""}
    ${details.indications?.length ? `<div class="detail-block"><span class="detail-label">Applications listed in client material</span><ul>${details.indications.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>` : ""}
  `;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProductDetails() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function initProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", closeProductDetails));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductDetails();
  });
}

function productCardHTML(p) {
  return `
    <article class="product-card reveal">
      <div class="product-card-header">
        <div class="product-card-top">
          <span class="product-category"><span class="category-icon">${categoryIconSVG(p.category)}</span>${escapeHTML(p.category)}</span>
          <span class="rx-tag">${p.rx ? "Rx only" : "OTC"}</span>
        </div>
      </div>
      <div class="product-card-body">
        <h3>${escapeHTML(p.name)}</h3>
        <p class="product-generic">${escapeHTML(p.generic)}</p>
        <p class="desc">${escapeHTML(p.desc)}</p>
        <div class="product-meta">
          <span>${escapeHTML(p.form)}</span>
          <button class="product-detail-btn" type="button" data-product="${escapeHTML(p.name)}">View details</button>
        </div>
      </div>
    </article>
  `;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   Contact form validation (contact.html)
   --------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton ? submitButton.textContent.trim() : "Send message";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot: silently reject obvious bot submissions.
    if (form._honey && form._honey.value.trim() !== "") return;

    const fields = {
      name: {
        el: form.name,
        validate: (v) => v.trim().length >= 2,
        msg: "Please enter your full name."
      },
      email: {
        el: form.email,
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        msg: "Please enter a valid email address."
      },
      reason: {
        el: form.reason,
        validate: (v) => v !== "",
        msg: "Please choose a reason for contact."
      },
      message: {
        el: form.message,
        validate: (v) => v.trim().length >= 10,
        msg: "Please enter at least 10 characters."
      }
    };

    let isValid = true;

    Object.entries(fields).forEach(([key, field]) => {
      const wrapper = document.getElementById(`field-${key}`);
      const errorEl = wrapper?.querySelector(".field-error");
      const passed = field.validate(field.el.value);

      wrapper?.classList.toggle("has-error", !passed);
      if (errorEl) errorEl.textContent = passed ? "" : field.msg;
      if (!passed) isValid = false;
    });

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.className = "form-status show";
      return;
    }

    const reasonText = form.reason.options[form.reason.selectedIndex].text;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim() || "Not provided";
    const message = form.message.value.trim();

    // FormSubmit provides the email delivery backend for this static site.
    // The first live submission to this address requires the owner to confirm
    // the activation email from FormSubmit.
    const payload = {
      name,
      email,
      phone,
      reason: reasonText,
      message,
      _subject: `New Website Enquiry — ${reasonText}`,
      _template: "table",
      _captcha: "true",
      _replyto: email,
      _cc: "theeverestpharma@gmail.com",
      _url: window.location.href
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
    }

    status.textContent = "Sending your message…";
    status.className = "form-status show";

    try {
      const response = await fetch("https://formsubmit.co/ajax/info@theeverestpharma.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to send the message.");
      }

      status.innerHTML =
        '<svg class="check-pop" width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:-3px; margin-right:6px;"><circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.6"/><path d="M7 12.5l3 3 7-7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "Message sent successfully. Our team will get back to you soon.";
      status.className = "form-status show success";
      form.reset();
    } catch (error) {
      console.error("Contact form submission failed:", error);
      status.textContent = "We couldn't send your message right now. Please email info@theeverestpharma.com directly.";
      status.className = "form-status show error";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
    }
  });
}
