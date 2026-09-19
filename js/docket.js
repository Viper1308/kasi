/* ══════════════ THE DOCKET — exam prep tracker ══════════════
   This screen began life as a self-contained artifact (syllabus checklist,
   mock-score log with charts, and an error log, for CLAT 2027 and IIM
   Bangalore UGAT). It was built against the `window.storage` persistent-
   storage API, so rather than rewire its internals, the shim below gives
   it that exact API — backed by NEXUS's own Store — so the widget's code
   runs completely unmodified below this line.

   Because it rides on Store, its data now lives in the same 'pos:'
   namespace as everything else in NEXUS: it's included automatically in
   Settings → Back up data, restore, and Supabase sync, with no extra
   wiring needed.
   ================================================================== */
(function () {
  const PFX = 'docket.';
  window.storage = {
    get: (key) => {
      const v = Store.get(PFX + key, null);
      return Promise.resolve(v == null ? null : { key, value: v, shared: false });
    },
    set: (key, value) => {
      Store.set(PFX + key, value);
      return Promise.resolve({ key, value, shared: false });
    },
    delete: (key) => {
      const full = 'pos:' + PFX + key;
      const had = localStorage.getItem(full) != null;
      try { localStorage.removeItem(full); } catch (e) {}
      return Promise.resolve({ key, deleted: had, shared: false });
    },
    list: (prefix) => {
      const p = PFX + (prefix || '');
      const keys = Store.keys().filter(k => k.startsWith(p)).map(k => k.slice(PFX.length));
      return Promise.resolve({ keys, prefix: prefix || undefined, shared: false });
    }
  };
})();

const Docket = (function(){

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#0B1120" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const CHART_PALETTE = ['#C9A227', '#8C3A3A', '#5B8C87', '#5C7AA6', '#7C9473', '#B06A3A'];

const GENERAL_ERRORS = [
  "Left a question blank unnecessarily",
  "Marked a guess despite negative-marking risk",
  "Mismanaged time across sections",
  "Second-guessed a correct first answer",
  "Bubbling / option-marking error",
  "Panicked under time pressure",
  "Spent too long on one question, lost pace"
];

/* ================= EXAM DEFINITIONS ================= */

const EXAMS = {

  clat: {
    label: "CLAT 2027",
    eyebrow: "CLAT 2027 · Consortium of NLUs",
    title: "CLAT 2027 Preparation Tracker",
    subhead: "Every syllabus topic across English, Quantitative Aptitude, Logical Reasoning, Legal Reasoning, and General Knowledge — tracked to completion.",
    meta: ["120 min · 120 Qs", "5 sections", "Undergraduate (5-yr law)"],
    storageKey: "exam-tracker-clat2027",
    driveUrl: "https://drive.google.com/drive/u/0/folders/1elwSkjiUs-C6Uf33GklEgH_Vp-UouuuZ",
    driveLabel: "Mock Papers Drive",
    sections: [
      { key: "english", code: "ENG", title: "English Language", groups: [
        { name: "Reading Comprehension — Passage Types", items: [
          "Literary & fiction excerpts", "Contemporary journalistic passages", "Academic / expository passages",
          "Historical & biographical passages", "Opinion / editorial passages", "Legal & policy-themed passages"
        ]},
        { name: "Comprehension Skills", items: [
          "Main idea & central theme identification", "Author's tone and viewpoint", "Author's purpose & intent",
          "Inference and implication questions", "Conclusion drawing from passage", "Summary-based questions",
          "Passage-based critical reasoning (assumptions)", "Strengthening / weakening arguments in a passage",
          "Identifying the author's argument structure"
        ]},
        { name: "Vocabulary in Context", items: [
          "Contextual meaning of words/phrases", "Synonyms within passage context", "Antonyms within passage context",
          "Idioms and phrasal expressions", "Figures of speech & rhetorical devices"
        ]},
        { name: "Grammar & Sentence Skills", items: [
          "Error spotting in context", "Fill in the blanks (grammar-based)", "Sentence correction",
          "Para/sentence rearrangement (cohesion & coherence)", "Cloze passage tests"
        ]}
      ]},
      { key: "quant", code: "QA", title: "Quantitative Aptitude", groups: [
        { name: "Data Interpretation (core focus)", items: [
          "Tabular data interpretation", "Bar graph interpretation", "Line graph interpretation",
          "Pie chart interpretation", "Mixed/combined DI sets", "Data sufficiency basics"
        ]},
        { name: "Arithmetic", items: [
          "Ratio & proportion", "Percentage", "Profit, loss & discount", "Averages",
          "Simple interest", "Compound interest", "Time, speed & distance", "Time & work",
          "Mixtures & alligation"
        ]},
        { name: "Numbers & Algebra", items: [
          "Number systems basics", "LCM & HCF", "Linear equations (elementary algebra)",
          "Basic surds & indices"
        ]},
        { name: "Geometry & Statistics", items: [
          "Mensuration — area & perimeter", "Mensuration — volume & surface area",
          "Statistics basics (mean, median, mode)", "Basic probability", "Basic permutation & combination"
        ]}
      ]},
      { key: "logical", code: "LR", title: "Logical Reasoning", groups: [
        { name: "Critical Reasoning", items: [
          "Identifying premises & conclusions", "Assumption identification", "Strengthening arguments",
          "Weakening arguments", "Inference-based questions", "Cause and effect reasoning",
          "Identifying logical fallacies", "Course of action questions", "Statement & assumption"
        ]},
        { name: "Passage-Based Logic", items: [
          "Logical sequencing of passage-based arguments", "Para jumbles / rearrangement",
          "Analogies within passages", "Identifying flaws in reasoning"
        ]},
        { name: "Classic Reasoning Topics", items: [
          "Syllogisms", "Analogies (word/figure)", "Blood relations", "Coding–decoding",
          "Number & letter series completion", "Direction sense", "Analytical puzzles (basic)"
        ]}
      ]},
      { key: "legal", code: "LGL", title: "Legal Reasoning", groups: [
        { name: "Core Methodology", items: [
          "Principle-fact application technique", "Handling unfamiliar/hypothetical principles",
          "Identifying legally relevant facts", "Distinguishing principle vs. exception"
        ]},
        { name: "Constitutional Law", items: [
          "Preamble & basic structure doctrine", "Fundamental Rights (Art. 12–35)",
          "Directive Principles of State Policy", "Fundamental Duties",
          "Centre–State relations & federalism", "Constitutional amendments (key ones)",
          "Emergency provisions", "Judicial review & writs"
        ]},
        { name: "Law of Torts", items: [
          "Negligence", "Defamation", "Nuisance", "Strict & absolute liability",
          "Vicarious liability", "Trespass & false imprisonment"
        ]},
        { name: "Contract Law", items: [
          "Offer & acceptance", "Consideration", "Capacity to contract",
          "Free consent (coercion, undue influence, fraud, misrepresentation)",
          "Void & voidable contracts", "Breach of contract & remedies",
          "Quasi-contracts", "Discharge of contract"
        ]},
        { name: "Criminal Law", items: [
          "Mens rea & actus reus", "General exceptions (IPC/BNS)", "Offences against the human body",
          "Offences against property", "Offences against women & children",
          "IPC to BNS transition — key changes", "Basics of criminal procedure (CrPC/BNSS)",
          "Basics of law of evidence (BSA)"
        ]},
        { name: "Other Law Areas", items: [
          "Family law basics (marriage, divorce, maintenance)", "Property law basics",
          "Company & business law basics", "Consumer protection law",
          "Environmental law", "International law & human rights basics",
          "Intellectual property rights basics", "Cyber law basics", "Arbitration & ADR basics"
        ]},
        { name: "Legal Maxims", items: [
          "Common Latin legal maxims", "Application of maxims to fact patterns"
        ]},
        { name: "Landmark Judgments", items: [
          "Kesavananda Bharati v. State of Kerala", "Maneka Gandhi v. Union of India",
          "K.S. Puttaswamy v. Union of India (Right to Privacy)", "Navtej Singh Johar v. Union of India",
          "Shreya Singhal v. Union of India", "Vishaka v. State of Rajasthan",
          "Indra Sawhney v. Union of India", "Minerva Mills v. Union of India",
          "S.R. Bommai v. Union of India", "Shayara Bano v. Union of India (Triple Talaq)",
          "M. Siddiq v. Mahant Suresh Das (Ayodhya verdict)", "Other recent landmark SC rulings"
        ]},
        { name: "Current Legal Developments", items: [
          "Bharatiya Nyaya Sanhita (BNS) — overview", "Bharatiya Nagarik Suraksha Sanhita (BNSS) — overview",
          "Bharatiya Sakshya Adhiniyam (BSA) — overview", "Recent amendments & bills in news",
          "Recent Supreme Court / High Court rulings in news"
        ]}
      ]},
      { key: "gk", code: "GK", title: "General Knowledge", isGk: true, groups: [
        { name: "Indian History", items: [
          "Ancient India (Indus Valley to Guptas)", "Medieval India (Delhi Sultanate, Mughals)",
          "Modern India (1757–1947)", "Freedom struggle & key movements", "Important committees & acts (colonial era)"
        ]},
        { name: "Geography", items: [
          "Indian physical geography (rivers, mountains, plateaus)", "Indian climate & monsoon system",
          "Natural resources & mineral belts of India", "World geography basics (continents, oceans, straits)",
          "Important world capitals & currencies"
        ]},
        { name: "Indian Polity (Static)", items: [
          "Structure of the Constitution & Schedules", "List of constitutional amendments",
          "Union & State legislature structure", "Judiciary structure (SC, HC, subordinate courts)",
          "Constitutional bodies (EC, UPSC, CAG, Finance Commission)", "Non-constitutional / statutory bodies (NITI Aayog, etc.)"
        ]},
        { name: "Indian Economy", items: [
          "Five-Year Plans — overview", "Budget terminology (fiscal deficit, revenue deficit, etc.)",
          "Economic Survey — key concepts", "Banking basics (RBI, monetary policy tools)",
          "Tax structure — GST basics", "Key economic indices (GDP, inflation, HDI)"
        ]},
        { name: "Science & Technology", items: [
          "General science (physics, chemistry, biology basics)", "Indian space programme (ISRO missions)",
          "Defence technology & missile systems", "Recent scientific discoveries in news",
          "Health & medicine in news"
        ]},
        { name: "Sports", items: [
          "Major tournaments & trophies (cricket, football, hockey, tennis)",
          "Sport-specific terminology", "Olympics & Asian Games — India's performance",
          "Sporting personalities in news"
        ]},
        { name: "Awards & Honours", items: [
          "Nobel Prizes — categories & recent winners", "Bharat Ratna & Padma awards",
          "Sahitya Akademi & Jnanpith awards", "National Film Awards",
          "Other major international awards"
        ]},
        { name: "Books & Authors", items: [
          "Classic Indian literary works & authors", "Recent notable book releases",
          "Autobiographies & memoirs in news"
        ]},
        { name: "International Organizations", items: [
          "United Nations — organs & agencies", "WTO, IMF, World Bank",
          "SAARC, ASEAN, G7, G20, BRICS", "Regional & bilateral groupings in news"
        ]},
        { name: "Government Schemes", items: [
          "Flagship central government schemes", "Sector-specific schemes (health, education, agriculture)",
          "Schemes in news (recent launches & revisions)"
        ]},
        { name: "Art & Culture", items: [
          "Classical dance forms of India", "UNESCO World Heritage Sites in India",
          "Important monuments & their history", "Major festivals — origin & significance",
          "Classical music traditions"
        ]},
        { name: "Defence & Security", items: [
          "Indian Armed Forces — structure", "Joint military exercises with other nations",
          "Border & security agencies (BSF, CRPF, etc.)"
        ]},
        { name: "States of India", items: [
          "States & capitals", "Chief Ministers & Governors (track current)",
          "State symbols (bird, animal, flower)", "Important state-specific facts"
        ]},
        { name: "Miscellaneous Static GK", items: [
          "National symbols of India", "'Firsts' in India and the world",
          "Important days & their themes", "Newly formed districts/UTs & renamed places"
        ]}
      ]}
    ],
    errorGroups: [
      { name: "English", items: [
        "Misread the question stem", "Misinterpreted passage's central argument",
        "Picked wrong contextual meaning of a word", "Misapplied a grammar rule",
        "Missed a qualifying word in the options (e.g. 'always', 'only')", "Ran out of time mid-passage",
        "Confused author's view with a view mentioned in the passage", "Over-thought a straightforward question"
      ]},
      { name: "Quantitative Aptitude", items: [
        "Calculation slip", "Misread a value from table/chart", "Used the wrong formula",
        "Rounding / approximation error", "Misunderstood what the question was asking",
        "Unit or ratio conversion error"
      ]},
      { name: "Logical Reasoning", items: [
        "Misread a premise or conclusion", "Missed a condition in a logic puzzle",
        "Confused strengthen vs. weaken", "Wrong assumption identified",
        "Silly logical slip under time pressure", "Overcomplicated a simple pattern"
      ]},
      { name: "Legal Reasoning", items: [
        "Misapplied the principle to the fact pattern", "Missed an exception within the principle",
        "Confused two similar legal maxims/principles", "Guessed on an unfamiliar principle instead of reading closely",
        "Let outside legal knowledge override the given principle", "Missed a keyword that changed the principle's scope"
      ]},
      { name: "General Knowledge", items: [
        "Confused two similar facts/dates", "Recalled outdated information",
        "Guessed without eliminating options", "Missed a recent current-affairs update",
        "Mixed up static GK categories"
      ]},
      { name: "Exam-Wide / Strategic", items: GENERAL_ERRORS }
    ]
  },

  iimb: {
    label: "IIM Bangalore UGAT",
    eyebrow: "IIMB UGAT 2027 · BSc (Hons.) Economics / Data Science",
    title: "IIM Bangalore UGAT Preparation Tracker",
    subhead: "Every syllabus topic across English Comprehension, Quantitative & Data Interpretation (full Class X–XII math portion), and Logical Reasoning — tracked to completion.",
    meta: ["120 min · 60 MCQs", "3 sections", "4-yr BSc (Hons.), Jigani campus"],
    storageKey: "exam-tracker-iimb-ugat",
    driveUrl: "https://drive.google.com/drive/u/0/folders/1elwSkjiUs-C6Uf33GklEgH_Vp-UouuuZ",
    driveLabel: "Mock Papers Drive",
    sections: [
      { key: "english", code: "ENG", title: "English Comprehension", groups: [
        { name: "Reading Comprehension", items: [
          "Long-form academic/expository passages", "Editorial & opinion passages",
          "Business & economics-themed passages", "Main idea & central argument",
          "Inference and implication questions", "Author's tone and purpose",
          "Passage-based vocabulary in context"
        ]},
        { name: "Vocabulary", items: [
          "Synonyms & antonyms", "Fill in the blanks (vocabulary-based)",
          "Idioms and phrasal verbs", "One-word substitution", "Word analogies"
        ]},
        { name: "Grammar & Sentence Skills", items: [
          "Error identification / spotting", "Sentence correction",
          "Sentence completion", "Para jumbles / sentence rearrangement", "Cloze test"
        ]},
        { name: "Verbal Reasoning", items: [
          "Critical reasoning within passages", "Statement-based inference",
          "Odd sentence out / paragraph coherence"
        ]}
      ]},
      { key: "quant", code: "QADI", title: "Quantitative & Data Interpretation", groups: [
        { name: "Class X Mathematics (NCERT)", items: [
          "Real numbers (Euclid's division lemma, HCF/LCM, irrationality)",
          "Polynomials (zeroes, relation to coefficients)",
          "Pair of linear equations in two variables",
          "Quadratic equations", "Arithmetic progressions",
          "Triangles (similarity, Pythagoras theorem)",
          "Coordinate geometry (distance, section formula, area)",
          "Introduction to trigonometry (ratios, identities)",
          "Applications of trigonometry (heights & distances)",
          "Circles (tangents)", "Areas related to circles",
          "Surface areas and volumes", "Statistics (mean, median, mode of grouped data)",
          "Probability"
        ]},
        { name: "Class XI Mathematics (NCERT)", items: [
          "Sets", "Relations and functions", "Trigonometric functions",
          "Complex numbers and quadratic equations", "Linear inequalities",
          "Permutations and combinations", "Binomial theorem",
          "Sequences and series", "Straight lines", "Conic sections",
          "Introduction to three-dimensional geometry", "Limits and derivatives",
          "Statistics", "Probability"
        ]},
        { name: "Class XII Mathematics (NCERT)", items: [
          "Relations and functions (advanced)", "Inverse trigonometric functions",
          "Matrices", "Determinants", "Continuity and differentiability",
          "Applications of derivatives", "Integrals", "Applications of integrals",
          "Differential equations", "Vector algebra", "Three-dimensional geometry",
          "Linear programming", "Probability (conditional, Bayes' theorem)"
        ]},
        { name: "Aptitude Arithmetic (MBA-style)", items: [
          "Ratio & proportion", "Percentage", "Profit, loss & discount", "Averages",
          "Simple interest & compound interest", "Time, speed & distance", "Time & work",
          "Mixtures & alligation", "Partnerships", "LCM & HCF (applied)"
        ]},
        { name: "Data Interpretation", items: [
          "Tabular data sets", "Bar graph interpretation", "Line graph interpretation",
          "Pie chart interpretation", "Caselet-based DI", "Data sufficiency"
        ]}
      ]},
      { key: "logical", code: "LR", title: "Logical Reasoning", groups: [
        { name: "Arrangement-Based Puzzles", items: [
          "Linear seating arrangement", "Circular seating arrangement",
          "Blood relation puzzles", "Distribution & grouping puzzles"
        ]},
        { name: "Symbolic & Pattern Reasoning", items: [
          "Coding–decoding", "Number and letter series", "Figure-based pattern reasoning",
          "Direction sense", "Analogies (verbal & figural)"
        ]},
        { name: "Argument-Based Reasoning", items: [
          "Syllogisms", "Statement & assumption", "Statement & conclusion",
          "Strengthening & weakening arguments", "Course of action questions",
          "Logical data sufficiency"
        ]},
        { name: "Critical & Analytical Reasoning", items: [
          "Cause and effect reasoning", "Identifying logical fallacies",
          "Visual/pattern-based analytical reasoning"
        ]}
      ]}
    ],
    errorGroups: [
      { name: "English Comprehension", items: [
        "Misread the question stem", "Misinterpreted passage's central argument",
        "Picked wrong contextual meaning of a word", "Misapplied a grammar rule",
        "Missed a qualifying word in the options", "Ran out of time mid-passage",
        "Para-jumble sequencing error"
      ]},
      { name: "Quantitative & Data Interpretation", items: [
        "Wrong formula/theorem applied", "Calculation slip", "Sign error in algebra",
        "Misread a value from a graph/table", "Couldn't identify which Class X–XII topic the question tested",
        "Data sufficiency misjudged", "Rounding / approximation error", "Ran out of time on a lengthy DI set"
      ]},
      { name: "Logical Reasoning", items: [
        "Missed a condition in an arrangement puzzle", "Misread a coding pattern",
        "Wrong assumption in a puzzle", "Overcomplicated a simple pattern",
        "Ran out of time on a single puzzle"
      ]},
      { name: "Exam-Wide / Strategic", items: GENERAL_ERRORS }
    ]
  }

  ,
  grade12: {
    label: "Grade 12 Commerce",
    eyebrow: "CBSE Class XII (2026–27) · Commerce",
    title: "Grade 12 Commerce Board Prep Tracker",
    subhead: "Every chapter and unit across Economics (Macroeconomics & Indian Economic Development), Applied Mathematics, English, Business Studies, and Accountancy — verified against CBSE's official 2026-27 curriculum (cbseacademic.nic.in, released 1 Apr 2026).",
    meta: ["5 subjects", "CBSE Board Exam · Feb–Mar 2027", "NCERT-aligned"],
    storageKey: "exam-tracker-grade12-commerce",
    driveUrl: "https://drive.google.com/drive/u/0/folders/1G4ulJJUi6kXdlQbH2NtqNEDgt4UTALwA",
    driveLabel: "Grade 12 Drive",
    sections: [

      { key: "macro", code: "ECO-M", title: "Economics — Introductory Macroeconomics", groups: [
        { name: "Unit 1 · National Income and Related Aggregates", items: [
          "What is Macroeconomics?", "Basic concepts: consumption goods, capital goods, final & intermediate goods",
          "Stocks and flows; gross investment and depreciation", "Circular flow of income (two-sector model)",
          "Methods of calculating National Income — Value Added, Expenditure, Income methods",
          "GNP, NNP, GDP, NDP — at market price and factor cost", "Real vs Nominal GDP",
          "GDP Deflator", "GDP and Welfare"
        ]},
        { name: "Unit 2 · Money and Banking", items: [
          "Money — meaning and functions", "Supply of money: currency + net demand deposits",
          "Money creation by the commercial banking system",
          "Central bank (RBI): bank of issue, govt's bank, banker's bank",
          "Credit control: Bank Rate, CRR, SLR, Repo & Reverse Repo Rate",
          "Open Market Operations, Margin requirement"
        ]},
        { name: "Unit 3 · Determination of Income and Employment", items: [
          "Aggregate demand and its components", "Propensity to consume and to save (average & marginal)",
          "Short-run equilibrium output", "Investment multiplier and its mechanism",
          "Full employment and involuntary unemployment",
          "Excess demand and deficient demand — meaning and correcting measures"
        ]},
        { name: "Unit 4 · Government Budget and the Economy", items: [
          "Government budget — meaning, objectives, components",
          "Revenue receipts vs capital receipts", "Revenue expenditure vs capital expenditure",
          "Balanced, surplus and deficit budget"
        ]},
        { name: "Unit 5 · Balance of Payments", items: [
          "Balance of payments account — meaning and components",
          "BoP surplus and deficit", "Foreign exchange rate: fixed, flexible, managed floating",
          "Determination of exchange rate in a free market", "Managed floating exchange rate system"
        ]}
      ]},

      { key: "ied", code: "ECO-I", title: "Economics — Indian Economic Development", groups: [
        { name: "Unit 6 · Development Experience (1947–90) & Economic Reforms since 1991", items: [
          "State of Indian economy on the eve of independence",
          "Indian economic system and common goals of Five Year Plans",
          "Agriculture: institutional aspects, new agricultural strategy",
          "Industry: IPR 1956; role & importance of SSI", "Foreign trade — main features, problems, policies",
          "Economic Reforms since 1991: liberalisation, privatisation, globalisation (LPG)",
          "Concepts of demonetisation and GST"
        ]},
        { name: "Unit 7 · Current Challenges facing Indian Economy", items: [
          "Human Capital Formation — how people become a resource",
          "Role of human capital in economic development", "Growth of the education sector in India",
          "Rural development — credit & marketing, role of cooperatives",
          "Agricultural diversification; alternative farming — organic farming",
          "Employment — growth & changes in workforce participation, formal/informal sectors",
          "Sustainable economic development — meaning, effects on resources & environment incl. global warming"
        ]},
        { name: "Unit 8 · Development Experience of India — A Comparison with Neighbours", items: [
          "India and Pakistan — comparative indicators", "India and China — comparative indicators",
          "Economic growth, population, sectoral development",
          "Other Human Development Indicators"
        ]}
      ]},

      { key: "appmath", code: "MATH", title: "Applied Mathematics", groups: [
        { name: "Unit 1 · Numbers, Quantification & Numerical Applications", items: [
          "Modulo arithmetic — definition and operations", "Congruence modulo",
          "Alligation and mixture; mean price of a mixture",
          "Boats and streams (upstream / downstream)", "Pipes and cisterns",
          "Races and games", "Numerical inequalities"
        ]},
        { name: "Unit 2 · Algebra", items: [
          "Matrices and types of matrices", "Equality, transpose, symmetric & skew-symmetric matrices",
          "Algebra of matrices — addition, multiplication, scalar multiplication",
          "Determinants — singular / non-singular matrix", "Inverse of a matrix using cofactors",
          "Solving simultaneous equations — Cramer's Rule and matrix inverse method (up to 3 variables)"
        ]},
        { name: "Unit 3 · Calculus", items: [
          "Derivatives up to second order; parametric & implicit differentiation",
          "Application of derivatives — rate of change of area/volume",
          "Marginal cost & marginal revenue using derivatives",
          "Increasing / decreasing functions", "Maxima and minima — first & second derivative test",
          "Indefinite integrals — substitution, partial fraction, by parts",
          "Definite integrals as area under the curve",
          "Application of integration — consumer & producer surplus",
          "Differential equations — order, degree, formulation, variable-separable solutions"
        ]},
        { name: "Unit 4 · Probability Distributions", items: [
          "Random variables and probability distribution", "Mathematical expectation",
          "Variance and standard deviation", "Binomial distribution — mean, variance, SD",
          "Poisson distribution — mean and variance", "Normal distribution — standard normal variate"
        ]},
        { name: "Unit 5 · Inferential Statistics", items: [
          "Population and sample; representative sampling",
          "Simple random & systematic random sampling", "Parameter, statistic, and statistical inference",
          "Central Limit Theorem (conceptual)", "t-Test — one sample, small group sample"
        ]},
        { name: "Unit 6 · Time-Based Data", items: [
          "Time series — meaning and definition",
          "Components: secular trend, seasonal, cyclical, irregular variation",
          "Fitting a straight-line trend", "Methods of measuring trend — moving average, least squares"
        ]},
        { name: "Unit 7 · Financial Mathematics", items: [
          "Perpetuity and sinking funds", "Valuation of bonds — present value approach",
          "Calculation of EMI — flat-rate & reducing-balance methods",
          "Compound Annual Growth Rate (CAGR)", "Linear method of depreciation"
        ]},
        { name: "Unit 8 · Linear Programming", items: [
          "LPP terminology — decision variables, constraints, objective function",
          "Mathematical formulation of LPP (up to 3 non-trivial constraints)",
          "Types of LPP — manufacturing, diet problem, etc.",
          "Graphical method of solution for two variables",
          "Feasible / infeasible regions; optimal feasible solution"
        ]}
      ]},

      { key: "english", code: "ENG", title: "English", groups: [
        { name: "Flamingo — Prose", items: [
          "The Last Lesson", "Lost Spring", "Deep Water", "The Rattrap", "Indigo",
          "Poets and Pancakes", "The Interview", "Going Places"
        ]},
        { name: "Flamingo — Poetry", items: [
          "My Mother at Sixty-Six", "Keeping Quiet", "A Thing of Beauty",
          "A Roadside Stand", "Aunt Jennifer's Tigers"
        ]},
        { name: "Vistas — Supplementary Reader", items: [
          "The Third Level", "The Tiger King", "Journey to the End of the Earth",
          "The Enemy", "On the Face of It", "Memories of Childhood"
        ]},
        { name: "Reading Skills", items: [
          "Unseen factual passage", "Unseen descriptive passage", "Unseen literary passage",
          "Case-based factual passage with verbal/visual inputs (charts, statistics)"
        ]},
        { name: "Creative Writing Skills", items: [
          "Notice writing", "Formal/informal invitation and reply",
          "Letter — job application with bio-data/resume", "Letter to the editor",
          "Article writing", "Report writing"
        ]}
      ]},

      { key: "bst", code: "BST", title: "Business Studies", groups: [
        { name: "Unit 1 · Nature and Significance of Management", items: [
          "Management — concept, objectives, importance", "Effectiveness and efficiency",
          "Management as science, art and profession", "Levels of management",
          "Functions of management — planning, organising, staffing, directing, controlling",
          "Coordination — concept, characteristics, importance"
        ]},
        { name: "Unit 2 · Principles of Management", items: [
          "Principles of management — concept and significance",
          "Fayol's principles of management", "Taylor's scientific management — principles and techniques"
        ]},
        { name: "Unit 3 · Business Environment", items: [
          "Business environment — concept and importance",
          "Dimensions: economic, social, technological, political, legal",
          "Demonetisation — concept and features"
        ]},
        { name: "Unit 4 · Planning", items: [
          "Planning — concept, importance, limitations", "Planning process",
          "Single-use and standing plans", "Objective, strategy, policy, procedure, method, rule, budget, programme"
        ]},
        { name: "Unit 5 · Organising", items: [
          "Organising — concept and importance", "Organising process",
          "Functional and divisional structure", "Formal and informal organisation",
          "Delegation — concept, elements, importance", "Decentralisation — concept and importance"
        ]},
        { name: "Unit 6 · Staffing", items: [
          "Staffing — concept and importance", "Staffing as part of HRM",
          "Staffing process", "Recruitment — sources, merits/demerits",
          "Selection process", "Training and development — on/off the job, vestibule, apprenticeship, internship"
        ]},
        { name: "Unit 7 · Directing", items: [
          "Directing — concept, importance, elements",
          "Motivation — concept, Maslow's hierarchy, financial & non-financial incentives",
          "Leadership — concept and styles (authoritative, democratic, laissez-faire)",
          "Communication — concept, formal/informal, barriers and how to overcome them"
        ]},
        { name: "Unit 8 · Controlling", items: [
          "Controlling — concept and importance",
          "Relationship between planning and controlling", "Steps in the process of control"
        ]},
        { name: "Unit 9 · Financial Management", items: [
          "Financial management — concept, role, objectives",
          "Investment, financing and dividend decisions", "Financial planning — concept and importance",
          "Capital structure — concept and factors affecting it",
          "Fixed and working capital — concept and factors affecting requirements"
        ]},
        { name: "Unit 10 · Financial Markets", items: [
          "Financial markets and money market — concept", "Capital market — primary and secondary",
          "Stock exchange — functions and trading procedure; demat account",
          "SEBI — objectives and functions"
        ]},
        { name: "Unit 11 · Marketing Management", items: [
          "Marketing — concept, functions, philosophies", "Marketing mix — concept and elements",
          "Product — branding, labelling, packaging", "Price — concept and factors determining price",
          "Physical distribution — components and channels",
          "Promotion — advertising, personal selling, sales promotion, public relations"
        ]},
        { name: "Unit 12 · Consumer Protection", items: [
          "Consumer protection — concept and importance",
          "Consumer Protection Act, 2019 — meaning of consumer, rights & responsibilities",
          "Who can file a complaint, redressal machinery, remedies available",
          "Role of consumer organisations and NGOs"
        ]}
      ]},

      { key: "acc", code: "ACC", title: "Accountancy", groups: [
        { name: "Unit 1 · Accounting for Partnership Firms", items: [
          "Partnership — features, Partnership Deed, Indian Partnership Act 1932 provisions",
          "Fixed vs fluctuating capital accounts", "Profit & Loss Appropriation Account, guarantee of profits",
          "Past adjustments (interest on capital/drawings, salary, profit-sharing ratio)",
          "Goodwill — meaning, factors, valuation (average profit, super profit, capitalisation)",
          "Change in profit-sharing ratio — sacrificing & gaining ratio, revaluation account",
          "Admission of a partner — goodwill treatment, revaluation, capital adjustment",
          "Retirement and death of a partner — goodwill, revaluation, capital adjustment, executor's account",
          "Dissolution of a partnership firm — realisation account and settlement of accounts"
        ]},
        { name: "Unit 2 · Accounting for Companies", items: [
          "Features and types of companies", "Share and share capital — nature and types",
          "Issue and allotment of equity & preference shares; over/under subscription",
          "Issue at par and at premium; calls in advance and arrears",
          "Private placement, ESOP, sweat equity", "Forfeiture and re-issue of shares",
          "Disclosure of share capital in the balance sheet",
          "Debentures — issue at par/premium/discount, issue for consideration other than cash",
          "Debentures as collateral security; writing off discount/loss on issue of debentures"
        ]},
        { name: "Unit 3 · Analysis of Financial Statements", items: [
          "Financial statements of a company — meaning, nature, uses, importance",
          "Statement of Profit & Loss and Balance Sheet (Schedule III format)",
          "Financial statement analysis — meaning, significance, objectives, limitations",
          "Comparative statements and common-size statements",
          "Liquidity ratios — current ratio, quick ratio",
          "Solvency ratios — debt-equity, total asset to debt, proprietary, interest coverage, debt to capital employed",
          "Activity ratios — inventory, trade receivables/payables, fixed asset, net asset, working capital turnover",
          "Profitability ratios — gross profit, operating, operating profit, net profit, return on investment"
        ]},
        { name: "Unit 4 · Cash Flow Statement", items: [
          "Meaning, objectives and benefits of cash flow statement",
          "Cash and cash equivalents; classification of activities",
          "Preparation as per AS-3 (Revised), indirect method",
          "Adjustments — depreciation, profit/loss on sale of assets, dividend, tax",
          "Bank overdraft & cash credit as short-term borrowings"
        ]}
      ]}

    ],
    errorGroups: [
      { name: "Economics", items: [
        "Confused Macro concept with IED concept", "Diagram not labelled correctly",
        "Numerical — wrong formula applied (multiplier, NI aggregates)",
        "Missed a key term's exact definition", "Ran out of time on a long-answer question"
      ]},
      { name: "Applied Mathematics", items: [
        "Calculation slip", "Wrong formula applied (financial maths / probability)",
        "Misread the LPP constraints", "Graph/diagram not drawn accurately",
        "Ran out of time on a lengthy numerical"
      ]},
      { name: "English", items: [
        "Misread the passage's central argument", "Missed the word limit",
        "Grammar/expression error in writing section", "Weak textual evidence in a literature answer"
      ]},
      { name: "Business Studies / Accountancy", items: [
        "Missed applying the correct principle/ratio to a case", "Journal/ledger posting error",
        "Wrong treatment of goodwill or revaluation", "Balance sheet didn't tally",
        "Case-study application weak despite knowing the theory"
      ]},
      { name: "Exam-Wide / Strategic", items: GENERAL_ERRORS }
    ]
  }

};

const GK_MONTHS = [
  { key: "jan", name: "January" }, { key: "feb", name: "February" }, { key: "mar", name: "March" },
  { key: "apr", name: "April" }, { key: "may", name: "May" }, { key: "jun", name: "June" },
  { key: "jul", name: "July" }, { key: "aug", name: "August" }, { key: "sep", name: "September" },
  { key: "oct", name: "October" }, { key: "nov", name: "November" }, { key: "dec", name: "December" }
];
const GK_MONTH_SUB = "National · Intl · Sports · Awards · Appointments · Schemes · Reports & Indices · Sci-Tech · Obituaries · Summits · Books";

/* ================= STATE ================= */

let currentExamKey = 'clat';
let currentView = 'syllabus'; // syllabus | mocklog | errorlog
let syllabusState = {};  // { examKey: { itemId: bool } }
let mockState = {};      // { examKey: [ {id,label,scores:{},total,accuracy,notes} ] }
let errorState = {};     // { examKey: { itemId: count } }
let saveTimer = null;

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function itemId(sectionKey, groupIdx, item) { return sectionKey + '__' + groupIdx + '__' + slug(item); }
function escapeAttr(str) { return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function getSyllabusState() {
  if (!syllabusState[currentExamKey]) syllabusState[currentExamKey] = {};
  return syllabusState[currentExamKey];
}

function countSectionTotals(section) {
  let total = 0;
  section.groups.forEach(g => total += g.items.length);
  if (section.isGk) total += GK_MONTHS.length;
  return total;
}

function countSectionChecked(section) {
  const st = getSyllabusState();
  let checked = 0;
  section.groups.forEach((g, gi) => {
    g.items.forEach(item => { if (st[itemId(section.key, gi, item)]) checked++; });
  });
  if (section.isGk) GK_MONTHS.forEach(m => { if (st['gk-month__' + m.key]) checked++; });
  return checked;
}

/* ---------- SYLLABUS VIEW ---------- */

function renderItemGrid(sectionKey, group, gi) {
  const st = getSyllabusState();
  let html = '<div class="item-grid">';
  group.items.forEach(item => {
    const id = itemId(sectionKey, gi, item);
    const checked = !!st[id];
    html += `<label class="item" data-id="${id}">
      <input type="checkbox" ${checked ? 'checked' : ''}>
      <span class="check">${CHECK_SVG}</span>
      <span class="item-label">${item}</span>
    </label>`;
  });
  html += '</div>';
  return html;
}

function renderSyllabusSection(section) {
  const total = countSectionTotals(section);
  const checked = countSectionChecked(section);
  const pct = total ? Math.round((checked / total) * 100) : 0;

  let groupsHtml = '';
  if (section.isGk) {
    const st = getSyllabusState();
    let monthsHtml = '<div class="month-grid">';
    GK_MONTHS.forEach(m => {
      const id = 'gk-month__' + m.key;
      const mchecked = !!st[id];
      monthsHtml += `<label class="month-card" data-id="${id}">
        <input type="checkbox" ${mchecked ? 'checked' : ''}>
        <div class="month-top"><span class="check">${CHECK_SVG}</span><span class="month-name">${m.name}</span></div>
        <div class="month-sub">${GK_MONTH_SUB}</div>
      </label>`;
    });
    monthsHtml += '</div>';
    groupsHtml += `<div class="group"><div class="group-name">Monthly Current Affairs Revision (Jan &ndash; Dec)</div>${monthsHtml}</div>`;
  }
  section.groups.forEach((g, gi) => {
    groupsHtml += `<div class="group"><div class="group-name">${g.name}</div>${renderItemGrid(section.key, g, gi)}</div>`;
  });

  return `<div class="section" data-section="${section.key}">
    <div class="section-head" data-toggle="${section.key}">
      <span class="section-code mono">${section.code}</span>
      <span class="section-title">${section.title}</span>
      <div class="section-progress-mini">
        <div class="mini-bar"><div class="mini-bar-fill" id="mini-fill-${section.key}" style="width:${pct}%"></div></div>
        <span class="mini-pct mono" id="mini-pct-${section.key}">${pct}%</span>
      </div>
      <span class="chevron">&#9656;</span>
    </div>
    <div class="section-content"><div class="section-content-inner">${groupsHtml}</div></div>
  </div>`;
}

function computeOverall() {
  const exam = EXAMS[currentExamKey];
  let total = 0, checked = 0;
  exam.sections.forEach(sec => { total += countSectionTotals(sec); checked += countSectionChecked(sec); });
  return { total, checked, pct: total ? Math.round((checked / total) * 100) : 0 };
}

function updateOverallUI() {
  const { total, checked, pct } = computeOverall();
  document.getElementById('overall-num').textContent = pct + '%';
  document.getElementById('overall-stat').textContent = checked + ' / ' + total + ' topics covered';
  document.getElementById('overall-bar-fill').style.width = pct + '%';
  const circumference = 251.2;
  document.getElementById('seal-fill').style.strokeDashoffset = circumference - (pct / 100) * circumference;
}

function updateSectionUI(sectionKey) {
  const exam = EXAMS[currentExamKey];
  const sec = exam.sections.find(s => s.key === sectionKey);
  if (!sec) return;
  const total = countSectionTotals(sec);
  const checked = countSectionChecked(sec);
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const fillEl = document.getElementById('mini-fill-' + sectionKey);
  const pctEl = document.getElementById('mini-pct-' + sectionKey);
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
}

function scheduleSyllabusSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await window.storage.set(EXAMS[currentExamKey].storageKey, JSON.stringify(getSyllabusState())); }
    catch (e) { console.error('Save failed', e); }
  }, 400);
}

function attachSyllabusHandlers() {
  const container = document.getElementById('sections-container');
  container.querySelectorAll('.item, .month-card').forEach(label => {
    label.addEventListener('click', () => {
      const id = label.getAttribute('data-id');
      const input = label.querySelector('input');
      setTimeout(() => {
        getSyllabusState()[id] = input.checked;
        scheduleSyllabusSave();
        const sectionKey = label.closest('.section').getAttribute('data-section');
        updateSectionUI(sectionKey);
        updateOverallUI();
      }, 0);
    });
  });
  container.querySelectorAll('[data-toggle]').forEach(head => {
    head.addEventListener('click', () => {
      const sectionEl = head.closest('.section');
      const content = sectionEl.querySelector('.section-content');
      const isOpen = sectionEl.classList.contains('open');
      if (isOpen) { content.style.maxHeight = null; sectionEl.classList.remove('open'); }
      else { sectionEl.classList.add('open'); content.style.maxHeight = content.scrollHeight + 'px'; }
    });
  });
}

/* ---------- MOCK LOG VIEW (SPREADSHEET STYLE) ---------- */

function getMockEntries() {
  if (!mockState[currentExamKey]) mockState[currentExamKey] = [];
  return mockState[currentExamKey];
}

function parseNum(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function renderMockRow(entry, idx) {
  const exam = EXAMS[currentExamKey];
  let secCells = '';
  exam.sections.forEach(sec => {
    const val = (entry.scores && entry.scores[sec.key] !== undefined) ? entry.scores[sec.key] : '';
    secCells += `<td class="editable-cell num-cell"><input type="number" step="any" value="${escapeAttr(val)}" data-id="${entry.id}" data-field="section" data-sec="${sec.key}" placeholder="—"></td>`;
  });
  return `<tr data-id="${entry.id}">
    <td class="row-num mono">${idx + 1}</td>
    <td class="editable-cell"><input type="text" value="${escapeAttr(entry.label)}" data-id="${entry.id}" data-field="label" placeholder="Mock ${idx + 1}"></td>
    ${secCells}
    <td class="editable-cell num-cell total-cell"><input type="number" step="any" value="${escapeAttr(entry.total)}" data-id="${entry.id}" data-field="total" placeholder="—"></td>
    <td class="editable-cell num-cell"><input type="number" step="any" value="${escapeAttr(entry.accuracy)}" data-id="${entry.id}" data-field="accuracy" placeholder="—"></td>
    <td class="editable-cell"><input type="text" value="${escapeAttr(entry.notes)}" data-id="${entry.id}" data-field="notes" placeholder="Notes"></td>
    <td class="del-cell"><button class="del-btn" data-del="${entry.id}">×</button></td>
  </tr>`;
}

function renderMockTable() {
  const exam = EXAMS[currentExamKey];
  const entries = getMockEntries();
  const headCells = exam.sections.map(sec => `<th>${sec.code}</th>`).join('');
  const rows = entries.map((entry, idx) => renderMockRow(entry, idx)).join('');
  return `<div class="mock-table-wrap">
    <table class="mock-table">
      <thead><tr><th>#</th><th>Mock</th>${headCells}<th>Total</th><th>Acc %</th><th>Notes</th><th></th></tr></thead>
      <tbody id="mock-tbody">${rows}</tbody>
    </table>
    <div class="add-row-btn-wrap"><button class="add-row-btn" id="add-row-btn">+ Add Mock Row</button></div>
  </div>`;
}

function buildLineChartSVG(series, xCount, title) {
  const W = 680, H = 220, padL = 40, padR = 16, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  let allVals = [];
  series.forEach(s => s.values.forEach(v => { if (v !== null) allVals.push(v); }));
  let maxV = allVals.length ? Math.max(...allVals) : 10;
  let minV = allVals.length ? Math.min(0, Math.min(...allVals)) : 0;
  if (maxV === minV) maxV = minV + 10;
  maxV = maxV + (maxV - minV) * 0.12;

  function xPos(i) { return xCount <= 1 ? padL + plotW / 2 : padL + (plotW * (i / (xCount - 1))); }
  function yPos(v) { return padT + plotH - ((v - minV) / (maxV - minV)) * plotH; }

  let gridlines = '';
  for (let g = 0; g <= 4; g++) {
    const val = minV + (maxV - minV) * (g / 4);
    const y = yPos(val);
    gridlines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(201,162,39,0.12)" stroke-width="1"/>`;
    gridlines += `<text x="${padL - 6}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9" fill="#8792A8" font-family="JetBrains Mono, monospace">${Math.round(val)}</text>`;
  }

  let xLabels = '';
  const step = xCount > 16 ? Math.ceil(xCount / 10) : 1;
  for (let i = 0; i < xCount; i++) {
    if (i % step !== 0 && i !== xCount - 1) continue;
    xLabels += `<text x="${xPos(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#8792A8" font-family="JetBrains Mono, monospace">${i + 1}</text>`;
  }

  let paths = '';
  series.forEach(s => {
    let d = ''; let started = false; let dots = '';
    s.values.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = xPos(i), y = yPos(v);
      d += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      started = true;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${s.color}" stroke="#0B1120" stroke-width="1"/>`;
    });
    if (d.trim()) paths += `<path d="${d.trim()}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    paths += dots;
  });

  const legend = series.map(s => `<span class="chart-legend-item"><span class="chart-dot" style="background:${s.color}"></span>${s.name}</span>`).join('');

  return `<div class="chart-block">
    <div class="chart-title">${title}</div>
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="xMidYMid meet">${gridlines}${paths}${xLabels}</svg>
    <div class="chart-legend">${legend}</div>
  </div>`;
}

function renderMockCharts() {
  const exam = EXAMS[currentExamKey];
  const entries = getMockEntries();
  if (entries.length === 0) {
    return '<div class="empty-state">Log a few mocks in the sheet above to see your score trend here.</div>';
  }
  const n = entries.length;
  const totalsSeries = [{ name: 'Total Score', color: '#E7C158', values: entries.map(e => parseNum(e.total)) }];
  const overallChart = buildLineChartSVG(totalsSeries, n, 'Overall Score Trend');

  const sectionSeries = exam.sections.map((sec, i) => ({
    name: sec.title,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
    values: entries.map(e => parseNum(e.scores && e.scores[sec.key]))
  }));
  const sectionalChart = buildLineChartSVG(sectionSeries, n, 'Sectional Score Trend');

  return overallChart + sectionalChart;
}

function renderMockLogView() {
  return `<div id="mock-table-container">${renderMockTable()}</div>
    <div id="mock-charts-container">${renderMockCharts()}</div>`;
}

async function ensureMocksLoaded(examKey) {
  if (mockState[examKey]) return;
  try {
    const r = await window.storage.get(EXAMS[examKey].storageKey + '-mocks');
    mockState[examKey] = (r && r.value) ? JSON.parse(r.value) : [];
  } catch (e) { mockState[examKey] = []; }
}

async function saveMocks() {
  try { await window.storage.set(EXAMS[currentExamKey].storageKey + '-mocks', JSON.stringify(getMockEntries())); }
  catch (e) { console.error('Save mocks failed', e); }
}

let mockSaveTimer = null;
function scheduleMockSave() {
  if (mockSaveTimer) clearTimeout(mockSaveTimer);
  mockSaveTimer = setTimeout(saveMocks, 500);
}

let chartRedrawTimer = null;
function scheduleChartRedraw() {
  if (chartRedrawTimer) clearTimeout(chartRedrawTimer);
  chartRedrawTimer = setTimeout(() => {
    const el = document.getElementById('mock-charts-container');
    if (el) el.innerHTML = renderMockCharts();
  }, 350);
}

function refreshMockTableAndCharts() {
  const tableContainer = document.getElementById('mock-table-container');
  if (tableContainer) tableContainer.innerHTML = renderMockTable();
  const chartsContainer = document.getElementById('mock-charts-container');
  if (chartsContainer) chartsContainer.innerHTML = renderMockCharts();
}

function attachMockLogHandlers() {
  const tableContainer = document.getElementById('mock-table-container');
  if (!tableContainer) return;

  tableContainer.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.matches('input[data-id]')) return;
    const id = el.getAttribute('data-id');
    const field = el.getAttribute('data-field');
    const entry = getMockEntries().find(x => x.id === id);
    if (!entry) return;
    if (field === 'section') {
      const sec = el.getAttribute('data-sec');
      if (!entry.scores) entry.scores = {};
      entry.scores[sec] = el.value;
    } else {
      entry[field] = el.value;
    }
    scheduleMockSave();
    scheduleChartRedraw();
  });

  tableContainer.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      const id = delBtn.getAttribute('data-del');
      mockState[currentExamKey] = getMockEntries().filter(x => x.id !== id);
      saveMocks();
      refreshMockTableAndCharts();
      return;
    }
    const addBtn = e.target.closest('#add-row-btn');
    if (addBtn) {
      const newEntry = { id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6), label: '', scores: {}, total: '', accuracy: '', notes: '' };
      getMockEntries().push(newEntry);
      saveMocks();
      refreshMockTableAndCharts();
    }
  });
}

/* ---------- ERROR LOG VIEW ---------- */

function getErrorState() {
  if (!errorState[currentExamKey]) errorState[currentExamKey] = {};
  return errorState[currentExamKey];
}

function renderErrorLogView() {
  const exam = EXAMS[currentExamKey];
  const st = getErrorState();
  let html = '';
  exam.errorGroups.forEach((g, gi) => {
    let items = '';
    g.items.forEach((label, ii) => {
      const id = 'err__' + gi + '__' + ii + '__' + slug(label);
      const count = st[id] || 0;
      items += `<div class="error-item" data-id="${id}">
        <div class="error-label">${label}</div>
        <div class="error-controls">
          <button class="tally-btn" data-op="-1" data-id="${id}">–</button>
          <span class="tally-count mono" id="tally-${id}">${count}</span>
          <button class="tally-btn" data-op="1" data-id="${id}">+</button>
        </div>
      </div>`;
    });
    html += `<div class="error-group"><div class="group-name">${g.name}</div><div class="error-grid">${items}</div></div>`;
  });
  return html;
}

async function ensureErrorsLoaded(examKey) {
  if (errorState[examKey]) return;
  try {
    const r = await window.storage.get(EXAMS[examKey].storageKey + '-errors');
    errorState[examKey] = (r && r.value) ? JSON.parse(r.value) : {};
  } catch (e) { errorState[examKey] = {}; }
}

let errorSaveTimer = null;
function scheduleErrorSave() {
  if (errorSaveTimer) clearTimeout(errorSaveTimer);
  errorSaveTimer = setTimeout(async () => {
    try { await window.storage.set(EXAMS[currentExamKey].storageKey + '-errors', JSON.stringify(getErrorState())); }
    catch (e) { console.error('Save errors failed', e); }
  }, 400);
}

function attachErrorLogHandlers() {
  const container = document.getElementById('sections-container');
  container.querySelectorAll('.tally-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const op = parseInt(btn.getAttribute('data-op'), 10);
      const st = getErrorState();
      st[id] = Math.max(0, (st[id] || 0) + op);
      document.getElementById('tally-' + id).textContent = st[id];
      scheduleErrorSave();
    });
  });
}

/* ---------- MASTER RENDER ---------- */

async function renderCurrentView() {
  const exam = EXAMS[currentExamKey];
  const container = document.getElementById('sections-container');
  const statsBar = document.getElementById('stats-bar');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-exam') === currentExamKey));
  document.querySelectorAll('.subtab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === currentView));

  document.getElementById('ep-eyebrow').textContent = exam.eyebrow;
  document.getElementById('ep-title').textContent = exam.title;
  document.getElementById('ep-subhead').textContent = exam.subhead;
  document.getElementById('ep-meta').innerHTML = exam.meta.map(m => `<span class="chip mono">${m}</span>`).join('');
  const driveLink = document.getElementById('drive-link');
  if (driveLink) {
    if (exam.driveUrl) {
      driveLink.href = exam.driveUrl;
      driveLink.textContent = '📁 ' + (exam.driveLabel || 'Drive Folder') + ' ↗';
      driveLink.style.display = '';
    } else {
      driveLink.style.display = 'none';
    }
  }

  if (currentView === 'syllabus') {
    statsBar.style.display = '';
    container.innerHTML = exam.sections.map(renderSyllabusSection).join('');
    updateOverallUI();
    attachSyllabusHandlers();
  } else if (currentView === 'mocklog') {
    statsBar.style.display = 'none';
    await ensureMocksLoaded(currentExamKey);
    container.innerHTML = renderMockLogView();
    attachMockLogHandlers();
  } else if (currentView === 'errorlog') {
    statsBar.style.display = 'none';
    await ensureErrorsLoaded(currentExamKey);
    container.innerHTML = renderErrorLogView();
    attachErrorLogHandlers();
  }
}

async function loadSyllabusState(examKey) {
  if (syllabusState[examKey]) return;
  try {
    const r = await window.storage.get(EXAMS[examKey].storageKey);
    syllabusState[examKey] = (r && r.value) ? JSON.parse(r.value) : {};
  } catch (e) { syllabusState[examKey] = {}; }
}

async function switchExam(examKey) {
  currentExamKey = examKey;
  currentView = 'syllabus';
  await loadSyllabusState(examKey);
  renderCurrentView();
}

function switchView(view) {
  currentView = view;
  renderCurrentView();
}

function attachTopNavHandlers() {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchExam(btn.getAttribute('data-exam'))));
  document.querySelectorAll('.subtab-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.getAttribute('data-view'))));
  document.getElementById('reset-btn').addEventListener('click', async () => {
    const exam = EXAMS[currentExamKey];
    if (!confirm('Reset syllabus progress for ' + exam.label + '? This cannot be undone.')) return;
    syllabusState[currentExamKey] = {};
    try { await window.storage.set(exam.storageKey, JSON.stringify({})); } catch (e) {}
    renderCurrentView();
  });
}

async function init() {
  attachTopNavHandlers();
  await loadSyllabusState('clat');
  renderCurrentView();
}

/* ---------- section-progress reader, used by the Dashboard's tracker ----------
   Reads straight from Store (same place window.storage ultimately writes to),
   so it stays accurate without needing an exam tab to be open or Docket.init()
   to have run yet. Accepts one section key or an array (so e.g. Grade 12's two
   Economics sections can be reported as a single combined "Economics" figure). */
function sectionProgress(examKey, sectionKeyOrKeys) {
  const exam = EXAMS[examKey];
  if (!exam) return { total: 0, checked: 0, pct: 0 };
  const wanted = Array.isArray(sectionKeyOrKeys) ? sectionKeyOrKeys : [sectionKeyOrKeys];
  let st = {};
  try {
    const raw = Store.get('docket.' + exam.storageKey, null);
    if (raw) st = JSON.parse(raw);
  } catch (e) { st = {}; }
  let total = 0, checked = 0;
  exam.sections.filter(s => wanted.includes(s.key)).forEach(sec => {
    sec.groups.forEach((g, gi) => {
      total += g.items.length;
      g.items.forEach(item => { if (st[itemId(sec.key, gi, item)]) checked++; });
    });
    if (sec.isGk) {
      total += GK_MONTHS.length;
      GK_MONTHS.forEach(m => { if (st['gk-month__' + m.key]) checked++; });
    }
  });
  return { total, checked, pct: total ? Math.round((checked / total) * 100) : 0 };
}

return { init, sectionProgress };
})();
