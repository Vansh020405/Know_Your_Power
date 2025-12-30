import rulesData from '../data/rules.json';
import trafficData from '../data/traffic_scenarios.json';

// --- COMPREHENSIVE KNOWLEDGE BASE ---
const CONCEPTS = {
    domain: {
        Workplace: [
            "hr", "boss", "manager", "company", "employer", "job", "office", "salary",
            "work", "resignation", "terminate", "bond", "employment", "hiring", "fired",
            "joining", "ctc", "employee", "staff", "pf", "provident", "gratuity", "esic"
        ],
        Police: [
            "police", "cop", "station", "constable", "inspector", "arrest", "jail", "fir",
            "traffic", "challan", "fine", "signal", "light", "document", "papers", "warrant",
            "search", "detention", "custody", "lawyer", "bail", "cybercrime", "cyber", "online fraud"
        ],
        College: [
            "college", "university", "campus", "professor", "student", "exam", "fees",
            "degree", "mark sheet", "attendance", "ugc", "semester", "hostel", "admission",
            "ragging", "senior", "fresher"
        ],
        Documents: [
            "contract", "agreement", "bond", "lease", "rent", "landlord", "tenant",
            "sign", "paper", "refund", "return", "deposit", "cheque", "notice", "eviction",
            "consumer", "shop", "product", "defective", "warranty", "flight", "airline"
        ]
    },
    topic: {
        // WORKPLACE
        Salary: ["salary", "wages", "pay", "paying", "paid", "payment", "increment", "bonus", "ctc", "dues", "unpaid", "delay"],
        Overtime: ["overtime", "extra hours", "late night", "weekend", "shift", "hours", "extra work"],
        Resignation: ["resign", "resignation", "leaving", "quit", "notice period", "relieving", "experience letter", "clearance"],
        Termination: ["fired", "terminate", "termination", "sacked", "layoff", "pink slip", "let go", "removed", "force resign"],
        Bond: ["bond", "agreement", "penalty", "2 years", "1 year", "break bond", "training cost"],
        Maternity: ["maternity", "pregnant", "pregnancy", "mother", "child", "baby", "delivery", "newborn"],
        Harassment: ["harassment", "posh", "sexual", "touch", "abuse", "bullying", "mental torture", "toxic"],
        Gratuity: ["gratuity", "5 years", "pf", "provident fund", "retirement", "epf", "pension"],
        Leave: ["leave", "holiday", "sick leave", "casual leave", "vacation", "comp off", "time off"],

        // POLICE
        Arrest: ["arrest", "custody", "detain", "detained", "jail", "handcuff", "station", "lockup", "warrant"],
        Search: ["search", "check", "frisk", "pocket", "phone", "bag", "car", "vehicle", "inspect"],
        Traffic: ["license", "dl", "rc", "insurance", "helmet", "seatbelt", "driving", "pollution", "puc", "signal", "jump", "keys", "challan", "fine", "speed", "overspeeding"],
        Alcohol: ["alcohol", "drunk", "drink", "drinking", "breathalyzer", "wine", "beer", "liquor"],
        Towing: ["tow", "towing", "lift", "crane", "parking", "no parking", "impound"],
        Cybercrime: ["cyber", "online", "fraud", "scam", "hacking", "phishing", "bullying", "leak", "internet", "otp", "upi"],
        FIR: ["fir", "complaint", "report", "police station", "register", "file complaint"],

        // COLLEGE
        Fees: ["fees", "refund", "money back", "paid", "amount", "capitation", "donation", "fee hike"],
        Attendance: ["attendance", "75%", "75 percent", "absent", "medical", "shortage", "detained", "exam"],
        Ragging: ["ragging", "senior", "freshers", "abuse", "forcing", "torture", "bully"],
        Documents: ["certificate", "mark sheet", "marksheet", "degree", "original", "transcripts", "tc", "migration"],

        // CONSUMER/RENT
        Rent: ["rent", "deposit", "security", "landlord", "tenant", "evict", "vacate", "owner", "apartment", "flat", "house"],
        Privacy: ["privacy", "enter", "permission", "key", "room", "personal"],
        Consumer: ["consumer", "defective", "product", "warranty", "guarantee", "service", "shop", "store", "mrp", "price", "bill"],
        Shopping: ["return", "exchange", "refund", "receipt", "invoice", "purchase"],
        Flight: ["flight", "airline", "cancel", "delay", "airport", "ticket", "boarding"]
    }
};

const CLARIFICATION_RULE_POLICE = {
    rule_id: "police_clarify",
    title: "Police Interaction",
    summary: "Could you be more specific? Is this about Traffic, Arrest/Detention, Phone Search, or Filing a Complaint?",
    verdict: "DEPENDS",
    simple_explanation: "Different rules apply for traffic violations vs criminal arrests vs filing an FIR.",
    what_to_say: "I'll help you once I know the specific situation."
};

const CLARIFICATION_RULE_WORKPLACE = {
    rule_id: "work_clarify",
    title: "Workplace Issue",
    summary: "I see this is work-related. Is it about Salary, Termination, Harassment, or Benefits?",
    verdict: "DEPENDS",
    simple_explanation: "Workplace laws are specific to the issue (e.g., Payment of Wages Act vs POSH Act vs PF Act).",
    what_to_say: "Please tell me whether this is about: not getting paid, being fired, harassment, or benefits like PF/gratuity."
};

/**
 * ENHANCED AI Classification Engine
 * Maps natural language -> Specific Legal Rule
 */
export const analyzeSituation = (text) => {
    if (!text || text.trim().length < 2) return { confidence: 0 };

    const rawLower = text.toLowerCase();
    const cleanText = rawLower.replace(/[!$%^&*;:{}=\-_`~()]/g, "");
    const tokens = cleanText.split(/\s+/);

    let analysis = {
        detectedDomain: null,
        detectedTopics: [],
        confidence: 0,
        feature: 'authority',
        category: null,
        ruleId: null,
        rule: null,
        suggestions: []
    };

    // STEP 1: DETECT DOMAIN & TOPICS
    let domainScores = {};
    Object.keys(CONCEPTS.domain).forEach(d => domainScores[d] = 0);

    // Domain keyword matching
    Object.keys(CONCEPTS.domain).forEach(dKey => {
        CONCEPTS.domain[dKey].forEach(term => {
            if (tokens.includes(term) || rawLower.includes(term)) {
                domainScores[dKey] += 2;
            }
        });
    });

    // Topic keyword matching (with smart multi-word and suffix handling)
    Object.keys(CONCEPTS.topic).forEach(tKey => {
        CONCEPTS.topic[tKey].forEach(term => {
            // Multi-word terms need exact phrase match
            if (term.includes(' ')) {
                if (rawLower.includes(term)) {
                    if (!analysis.detectedTopics.includes(tKey)) analysis.detectedTopics.push(tKey);
                }
            } else if (term.length > 3) {
                // Longer words can use substring matching (handles "paying" vs "pay")
                if (rawLower.includes(term)) {
                    if (!analysis.detectedTopics.includes(tKey)) analysis.detectedTopics.push(tKey);
                }
            } else {
                // Short words need exact token match
                if (tokens.includes(term)) {
                    if (!analysis.detectedTopics.includes(tKey)) analysis.detectedTopics.push(tKey);
                }
            }
        });
    });

    // Determine best domain
    const bestDomainEntry = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0];
    if (bestDomainEntry[1] > 0) {
        analysis.detectedDomain = bestDomainEntry[0];
    } else {
        // Intelligent domain inference from topics
        if (analysis.detectedTopics.includes('Rent') || analysis.detectedTopics.includes('Consumer')) {
            analysis.detectedDomain = 'Documents';
        }
        if (analysis.detectedTopics.includes('Salary') || analysis.detectedTopics.includes('Maternity')) {
            analysis.detectedDomain = 'Workplace';
        }
        if (analysis.detectedTopics.includes('Traffic') || analysis.detectedTopics.includes('FIR')) {
            analysis.detectedDomain = 'Police';
        }
        if (analysis.detectedTopics.includes('Attendance') || analysis.detectedTopics.includes('Ragging')) {
            analysis.detectedDomain = 'College';
        }
    }

    // EXPLICIT QUERY MATCHERS - Bypass clarification for specific well-defined queries
    const explicitMatchers = [
        { patterns: ['phone search', 'phone check', 'check phone', 'check my phone', 'show phone', 'see phone'], topic: 'Search' },
        { patterns: ['rc check', 'rc', 'registration certificate', 'show rc', 'rc paper'], topic: 'Traffic' },
        { patterns: ['license check', 'dl check', 'driving license', 'show license', 'driving licence'], topic: 'Traffic' },
        { patterns: ['insurance check', 'show insurance', 'vehicle insurance'], topic: 'Traffic' },
        { patterns: ['salary delay', 'salary late', 'unpaid salary', 'salary not paid'], topic: 'Salary' },
        { patterns: ['forced resign', 'force resign', 'forced resignation'], topic: 'Termination' },
        { patterns: ['experience letter', 'relieving letter', 'service certificate'], topic: 'Termination' },
        { patterns: ['maternity leave', 'pregnancy leave'], topic: 'Maternity' },
        { patterns: ['ragging', 'senior ragging', 'torture'], topic: 'Ragging' },
        { patterns: ['fir', 'file fir', 'register fir', 'complaint'], topic: 'FIR' },
        { patterns: ['arrest', 'arrested', 'detention', 'detain'], topic: 'Arrest' },
        { patterns: ['bond break', 'training bond', 'employment bond'], topic: 'Bond' }
    ];

    for (const matcher of explicitMatchers) {
        for (const pattern of matcher.patterns) {
            if (rawLower.includes(pattern)) {
                if (!analysis.detectedTopics.includes(matcher.topic)) {
                    analysis.detectedTopics.push(matcher.topic);
                }
                // Also infer domain from topic if not set
                if (!analysis.detectedDomain) {
                    if (['Search', 'Traffic', 'FIR', 'Arrest', 'Alcohol', 'Towing', 'Cybercrime'].includes(matcher.topic)) {
                        analysis.detectedDomain = 'Police';
                    } else if (['Salary', 'Overtime', 'Resignation', 'Termination', 'Bond', 'Maternity', 'Harassment', 'Gratuity', 'Leave'].includes(matcher.topic)) {
                        analysis.detectedDomain = 'Workplace';
                    } else if (['Fees', 'Attendance', 'Ragging', 'Documents'].includes(matcher.topic)) {
                        analysis.detectedDomain = 'College';
                    }
                }
                break;
            }
        }
    }

    // Debug logging
    console.log('AI Analysis:', {
        input: text.substring(0, 50),
        detectedDomain: analysis.detectedDomain,
        detectedTopics: analysis.detectedTopics
    });

    // CLARITY GATE: Domain without Topic = Ask for clarification
    // BUT: Skip if we just added a topic via explicit matchers
    if (analysis.detectedDomain && analysis.detectedTopics.length === 0) {
        if (analysis.detectedDomain === 'Police') {
            return { ...analysis, confidence: 0.9, rule: CLARIFICATION_RULE_POLICE, verdict: 'DEPENDS' };
        }
        if (analysis.detectedDomain === 'Workplace') {
            return { ...analysis, confidence: 0.9, rule: CLARIFICATION_RULE_WORKPLACE, verdict: 'DEPENDS' };
        }
    }

    // STEP 2: TRAFFIC SCENARIO CHECK (Special Module)
    const isTrafficContext =
        analysis.detectedTopics.includes('Traffic') ||
        (analysis.detectedDomain === 'Police' && (rawLower.includes('car') || rawLower.includes('bike') || rawLower.includes('road') || rawLower.includes('stop')));

    if (isTrafficContext) {
        const scenario = trafficData.scenarios.find(s => {
            const hasKeyword = s.keywords && s.keywords.some(k => rawLower.includes(k));
            const hasPhrase = s.police_says && s.police_says.some(phrase => rawLower.includes(phrase.toLowerCase()));
            return hasPhrase || (hasKeyword && analysis.detectedTopics.includes('Traffic'));
        });

        if (scenario) {
            return {
                ...analysis,
                confidence: 0.95,
                feature: 'scenario',
                category: 'Traffic Module',
                rule: scenario,
                type: 'scenario'
            };
        }
    }

    // STEP 3: COMPREHENSIVE RULE MATCHING
    if (rulesData.rules) {
        const scoredRules = rulesData.rules.map(rule => {
            let score = 0;

            // Domain Match (+10)
            if (analysis.detectedDomain && rule.domain === analysis.detectedDomain) {
                score += 10;
            } else if (analysis.detectedDomain) {
                score -= 5; // Wrong domain penalty
            }

            // Topic Match (+20) - Very high weight
            if (analysis.detectedTopics.includes(rule.topic)) {
                score += 20;

                // CRITICAL: If BOTH domain AND topic match (from explicit matchers), 
                // give MASSIVE bonus to ensure this rule wins
                if (analysis.detectedDomain && rule.domain === analysis.detectedDomain) {
                    score += 50; // This ensures exact matches always win
                }
            }

            // Keyword overlap in rule text
            const ruleText = (
                rule.summary + " " +
                rule.simple_explanation + " " +
                (rule.conditions || []).join(" ") + " " +
                (rule.examples || []).join(" ")
            ).toLowerCase();

            tokens.forEach(t => {
                if (t.length > 3 && ruleText.includes(t)) score += 1;
            });

            // Bonus for topic name appearing in query
            if (rule.topic && rawLower.includes(rule.topic.toLowerCase())) score += 5;

            return { rule, score };
        });

        const sortedRules = scoredRules.filter(r => r.score > 0).sort((a, b) => b.score - a.score);

        if (sortedRules.length > 0) {
            const winner = sortedRules[0];

            // Confidence Scoring
            if (winner.score >= 25) analysis.confidence = 0.95;      // Domain + Topic + keywords
            else if (winner.score >= 15) analysis.confidence = 0.75; // Topic match + some keywords
            else if (winner.score >= 10) analysis.confidence = 0.50; // Domain match only
            else analysis.confidence = 0.3;

            if (analysis.confidence >= 0.45) {
                analysis.rule = winner.rule;
                analysis.ruleId = winner.rule.rule_id;
                analysis.category = winner.rule.domain;
                if (winner.score > 15) analysis.detectedDomain = winner.rule.domain;
            }

            analysis.suggestions = sortedRules.slice(1, 4).map(r => r.rule);
        }
    }

    return analysis;
};
