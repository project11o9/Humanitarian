// Compassionate Arabic-English content database for Humanitarian NGO
import { Story, Project, SecurityBadge } from "./types";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  quoteAr: string;
}

export const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1489632448347-4180a4241767?auto=format&fit=crop&q=80&w=1200",
    metric: "Volunteers active",
    metricVal: "140+",
    topic: "Ground Operations",
    topicAr: "العمليات الميدانية"
  },
  {
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200",
    metric: "Warm meals cooked",
    metricVal: "1.2M",
    topic: "Food Security Kitchens",
    topicAr: "مشاريع تأمين الغذاء"
  },
  {
    image: "https://images.unsplash.com/photo-1608555859503-a17e764e57bf?auto=format&fit=crop&q=80&w=1200",
    metric: "Protected families",
    metricVal: "4,800+",
    topic: "Winterization & Survival Kits",
    topicAr: "مخيمات الإيواء الشتوي"
  },
  {
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200",
    metric: "Fresh water daily",
    metricVal: "450K Liters",
    topic: "Clean Water Desalination",
    topicAr: "توزيع المياه والتحلية"
  }
];

export const STORIES: Story[] = [
  {
    id: "yousuf",
    name: "Yousuf Al-Banna",
    age: 9,
    location: "Temporary Camp Transit Centers",
    urgencyLevel: "Critical",
    quote: '"Under the winter wind, all my sisters and I had was drawing books. Now, volunteers brought us warm milk and safe soup."',
    narrative: "Displaced twice within three weeks, Yousuf was separated from his childhood room. Following critical winter storms, ground kitchens deployed high-nutrition meals and hot broth to Yousuf's families immediately.",
    needs: ["Nutrient Hot Milk", "Thermal Blankets", "High-Calorie Baby Formula"],
    imagePath: "/images/arab-food-support.jpg"
  },
  {
    id: "amina",
    name: "Amina Al-Masri & Toddlers",
    age: 34,
    location: "Buffer Zone Tents camp",
    urgencyLevel: "Critical",
    quote: '"Our collective courage is the only thermal shield keeping my shivering orphans alive against the elements."',
    narrative: "Amina spent ten wet nights unsheltered on sand flats. Direct donor sponsorship enabled local volunteer networks to deploy insulated, water-tight canvas shelters and thick floor isolation mats to rescue her family from critical hypothermia.",
    needs: ["Double-Insulated Tents", "Ground Mats", "Solar lanterns"],
    imagePath: "/images/arab-shelter-support.jpg"
  },
  {
    id: "laila",
    name: "Laila's Family Protection",
    age: 5,
    location: "Displaced Medical Clinic Outpost",
    urgencyLevel: "High",
    quote: '"When the volunteer doctors clean my cuts and hand me sterile fluids with a big sweet smile, I feel tomorrow is safe."',
    narrative: "Laila contracted gastrointestinal infection while drinking heavy sea-contaminated water. Her mother reached the mobile health outpost supported completely by our direct support network.",
    needs: ["Dehydration Salts", "Sterile Bandages", "Pediatric Pain Remedies"],
    imagePath: "/images/arab-medical-aid.jpg"
  },
  {
    id: "tariq",
    name: "Tariq Al-Najjar",
    age: 11,
    location: "Southern Sanitation Camps",
    urgencyLevel: "High",
    quote: '"Our water tanker arrived just as my little sister fell ill. Now we have sweet, cool, clean water to drink every single day."',
    narrative: "Tariq's camp had no potable water source for three weeks. Thanks to direct donor support, our team dispatched a 10,000-liter freshwater tanker truck to supply clean chlorinator barrels.",
    needs: ["Potable Water Tankers", "Filter Cartridges", "Hygienic Water Cans"],
    imagePath: "/images/arab-water-support.jpg"
  },
  {
    id: "miriam",
    name: "Baby Miriam's Specialized Lactose Nutrients",
    age: 1,
    location: "Central Transit Hub",
    urgencyLevel: "Critical",
    quote: '"As active volunteers handed us the specialized milk formula, I wept with pure relief. It saved my baby daughter."',
    narrative: "Deprived of specialized infant nutrients during border closures, Baby Miriam's health was failing. Live donor chat registry coordinates matched resources with our medical storage to deliver infant formula within 6 hours.",
    needs: ["Hypoallergenic Formula", "Immune Supplements", "Sterile Feeding Bottle"],
    imagePath: "/images/arab-family-relief.jpg"
  },
  {
    id: "kareem",
    name: "Baby Kareem's Essential Pediatric & Hygiene Safeguard",
    age: 2,
    location: "Al-Salam Camp Zone B",
    urgencyLevel: "Critical",
    quote: '"With basic sanitation products cut off, our infants faced severe dermatological crises. These hygiene kits returned health and safety to our tent."',
    narrative: "Living in densely packed camps with minimal hygiene infrastructure, Kareem’s family lacked antiseptic supplies and pediatric dermatology care. Rapid direct donor sponsorship dispatched essential clinical sanitation boxes within 8 hours.",
    needs: ["Antiseptic Cleansers", "Pediatric Creams", "Infant Hygiene Wipes"],
    imagePath: "/images/arab-hygiene-supplies.jpg"
  }
];

export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Ground Humanitarian Kitchen Corridor",
    location: "Crisis Camps / مطابخ الإغاثة العاجلة",
    target: 1500000,
    raised: 1120000,
    status: "Critical Need",
    description: "Sustaining raw ingredients and gas cooking logistics to cook hot rice meals, protein broths, and fresh bread for displaced families."
  },
  {
    id: "proj-2",
    name: "Clean Water Desalination Pipeline",
    location: "Southern Transit Buffer / محطة تصفية المياه",
    target: 800000,
    raised: 645000,
    status: "Active",
    description: "Operating mobile reverse-osmosis water pumping trucks to deliver clean drinkable water to secondary canvas schools."
  },
  {
    id: "proj-3",
    name: "Pediatric First-Aid Clinics",
    location: "Frontline Camps / عيادات الطوارئ للأطفال",
    target: 1200000,
    raised: 1050000,
    status: "Active",
    description: "Funding essential sterile surgery kits, antiseptic gauze, rehydration formulas, and baby formula powders for direct medical aid."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Dr. Bashir Al-Hassan",
    role: "Volunteer Pediatrician, Mobile Clinic 04",
    quote: "Working with this network is life-saving logic. There are no payment forms at the clinic doors; every item comes directly from the live donor chat allocation.",
    quoteAr: "العمل مع شبكة الإغاثة هذه ينقذ الأرواح حرفياً. لا توجد رسوم طبيب ولا بيع أدوية؛ كل عبوة شاش أو مسكن تأتي مباشرة عبر تبرعات الداعمين."
  },
  {
    id: "t-2",
    name: "Sahar Al-Obeid",
    role: "Ground Field Coordinator (Food distribution)",
    quote: "Dignity is when we don't present refugees with coupons or complex red-tape. Your prompt response fuels hot soup trucks directly into dusty emergency camps.",
    quoteAr: "الكرامة هي عدم إجبار النازحين على طوابير الانتظار الطويلة. دعمكم المباشر عبر الغرف الإنسانية يحرك شاحنات الطعام الساخنة فوراً."
  }
];

export const SECURITY_BADGES: SecurityBadge[] = [
  {
    title: "FCRA Certified & Transparent NGO",
    description: "Strict alignment with nonprofit statutory codes and direct allocation monitoring."
  },
  {
    title: "Slightest Administrative Carriage Costs",
    description: "92% of your sponsored resource goes cleanly and safely to on-the-ground cargo logistics."
  },
  {
    title: "100% Secure Chat Integrity",
    description: "All uploaded document receipts and financial details are protected via enterprise security parameters."
  }
];

// PREDEFINED DONATION TEMPLATES USED BY THE SUPPORT TEAM
export interface DonationTemplate {
  id: string;
  title: string;
  shortLabel: string;
  text: string;
}

export const DONATION_TEMPLATES: DonationTemplate[] = [
  {
    id: "bank-details",
    title: "🏢 share direct bank transfer credentials",
    shortLabel: "Bank Details",
    text: `شكراً لاختياركم دعم مهمتنا الإنسانية ومساندة الأطفال والعائلات النازحة.

Donation Account Details (Domestic Transfer):
-------------------------------------------
Account Name:   Bait Al-Rahma Humanitarian Initiative
Bank Name:      Citizen Cooperative Bank Ltd.
Account Number: 91402284711204
IFSC Code:      CCBL0008434
Reference ID:   [Unique Ref: %REF%]

After payment, please upload your payment confirmation receipt here. We will instantly verify and dispatch an 80G tax receipt.`
  },
  {
    id: "swift-international",
    title: "🌍 share international wire (swift/wire)",
    shortLabel: "SWIFT Transfer",
    text: `Thank you for your global solidarity in aiding displaced civilians.

International Aid Remittance Details (SWIFT):
--------------------------------------------
Beneficiary Name:  Bait Al-Rahma Humanitarian Trust
Bank Name:         Standard Chartered Global Commerce
SWIFT Code:        SCBLINBBXXX
Account Number:    51804104289
Remittance Routing: NGO Emergency Disaster Assistance
Reference Code:    [Global Ref: %REF%]

Please share a screenshot or transaction wire copy in this chat so our accounts desk can generate your tax exemption receipt.`
  },
  {
    id: "tax-information",
    title: "📄 explain tax exemption & receipts policy",
    shortLabel: "Tax Policy",
    text: `مرحباً بك، يسعدنا إعلامك أن جميع التبرعات معفاة من الضرائب.

Tax Exemption Receipt Policy:
---------------------------
- Indian Citizens: Covered under Section 80G (55% saving).
- US & Global Citizens: Managed through our registered 510(c)(3) fiscal sponsors.
- Receipts are generated automatically within 12 hours of payment voucher verification in this secure chat channel. Thank you for your kindness.`
  },
  {
    id: "thank-acknowledgement",
    title: "✅ confirm payment receipt is approved & thank",
    shortLabel: "Approve Voucher",
    text: `الحمد لله، تم تأكيد استلام حوالتكم بنجاح.

Payment Voucher Confirmed!
--------------------------
We have successfully verified your dynamic donation transfer corresponding to code %REF%. 

Our humanitarian field team will allocate 100% of these funds immediately to secure critical baby formula, sterile clinic packets, and warm blankets for the refugee family in Beit Lahia. Your official tax certificate is being generated and will be sent to your email. 

جزاك الله خيراً — Thank you for saving lives today.`
  }
];
