import rulesData from '../data/rules.json';

// --- KNOWLEDGE BASE (CONCEPT MAPPING) ---
// Maps user terms to the 4 Core Domains and their Topics
const CONCEPTS = {
    // 1. DOMAINS (Broad Context)
    domain: {
        Workplace: ["hr", "boss", "manager", "company", "employer", "job", "office", "salary", "work", "resignation", "terminate", "bond"],
        Police: ["police", "cop", "station", "constable", "inspector", "arrest", "jail", "fir", "traffic", "challan", "fine"],
        College: ["college", "university", "campus", "professor", "student", "exam", "fees", "degree", "mark sheet", "attendance"],
        Documents: ["contract", "agreement", "bond", "lease", "rent", "landlord", "tenant", "sign", "paper", "refund", "return"]
    },

    // 2. TOPICS (Specific Issues)
    topic: {
        // Workplace
        Salary: ["salary", "pay", "money", "wages", "dues", "unpaid", "delay"],
        Overtime: ["overtime", "ot", "late", "extra hours", "weekend", "sunday", "holiday"],
        Termination: ["fire", "terminate", "resign", "quit", "notice", "leave job"],
        Bond: ["bond", "agreement", "training cost", "penalty"],

        // Police
        Search: ["search", "check", "phone", "bag", "pocket", "mobile"],
        Detention: ["detain", "custody", "hold", "station", "wait"],
        Arrest: ["arrest", "handcuff", "come with me"],

        // College
        Documents: ["certificate", "original", "mark sheet", "degree", "diploma"],
        Exam: ["exam", "test", "hall ticket", "admit card", "attendance"],

        // Documents/Consumer/Rent
        Contract: ["lock-in", "clause", "agreement", "sign"],
        Rent: ["deposit", "security", "refund", "deduct", "paint"],
        Refunds: ["refund", "return", "exchange", "money back"]
    },

    // 3. INTENTS (Action) - Kept for nuance, though less critical now
    intent: {
        force: ["force", "must", "compel", "threaten", "demand"],
        deny: ["deny", "refuse", "stop", "withhold", "block"],
        ask: ["can i", "is it legal", "allowed", "right"]
    }
};

/**
 * "Smart" Classification Engine
 * Maps natural language -> Rule Unit
 */
export const analyzeSituation = (text) => {
    if (!text) return { confidence: 0 };

    const cleanText = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const tokens = cleanText.split(/\s+/);

    let analysis = {
        detectedDomain: null,
        detectedTopics: [],
        confidence: 0,

        // Output
        feature: 'authority', // Default feature for rules
        category: null, // Mapped to Domain
        ruleId: null,
        rule: null, // The actual rule object
        suggestions: [] // Alternate rules
    };

    // --- STEP 1: DETECT DOMAIN ---
    let maxDomainScore = 0;
    Object.keys(CONCEPTS.domain).forEach(dKey => {
        let score = 0;
        CONCEPTS.domain[dKey].forEach(term => {
            if (cleanText.includes(term)) score += 2;
        });
        if (score > maxDomainScore) {
            maxDomainScore = score;
            analysis.detectedDomain = dKey;
        }
    });

    // --- STEP 2: DETECT TOPICS ---
    Object.keys(CONCEPTS.topic).forEach(tKey => {
        CONCEPTS.topic[tKey].forEach(term => {
            if (cleanText.includes(term)) {
                if (!analysis.detectedTopics.includes(tKey)) {
                    analysis.detectedTopics.push(tKey);
                }
            }
        });
    });

    // --- STEP 3: FIND MATCHING RULE ---
    // We score every rule in rules.json based on Domain + Topic + Keywords
    if (rulesData.rules) {
        const scoredRules = rulesData.rules.map(rule => {
            let score = 0;

            // Domain Match (High Weight)
            if (analysis.detectedDomain && rule.domain === analysis.detectedDomain) score += 10;

            // Topic Match (Med Weight)
            if (analysis.detectedTopics.includes(rule.topic)) score += 5;

            // Direct Keyword Match in Summary/Conditions (Low Weight but accumulation helps)
            const ruleText = (rule.summary + " " + rule.simple_explanation + " " + (rule.conditions || []).join(" ")).toLowerCase();
            tokens.forEach(token => {
                if (token.length > 3 && ruleText.includes(token)) score += 1;
            });

            return { rule, score };
        });

        // Filter and Sort
        const bestMatches = scoredRules.filter(r => r.score > 0).sort((a, b) => b.score - a.score);

        if (bestMatches.length > 0) {
            const winner = bestMatches[0];

            // Confidence Logic
            if (winner.score >= 10) analysis.confidence = 0.9;
            else if (winner.score >= 5) analysis.confidence = 0.6;
            else analysis.confidence = 0.3;

            if (analysis.confidence > 0.4) {
                analysis.rule = winner.rule;
                analysis.ruleId = winner.rule.rule_id;
                analysis.category = winner.rule.domain; // For UI categorization
                analysis.detectedDomain = winner.rule.domain; // Auto-correct domain if rule match is strong
            }

            // Suggestions (Next 2 matches)
            analysis.suggestions = bestMatches.slice(1, 4).map(m => m.rule);
        }
    }

    return analysis;
};
