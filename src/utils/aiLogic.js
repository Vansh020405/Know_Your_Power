import rulesData from '../data/rules.json';
import trafficData from '../data/traffic_scenarios.json';

// --- KNOWLEDGE BASE (CONCEPT MAPPING) ---
// Maps user terms to the 4 Core Domains and their Topics
const CONCEPTS = {
    // ... existing concepts ...
    domain: {
        Workplace: ["hr", "boss", "manager", "company", "employer", "job", "office", "salary", "work", "resignation", "terminate", "bond"],
        Police: ["police", "cop", "station", "constable", "inspector", "arrest", "jail", "fir", "traffic", "challan", "fine", "signal", "light", "document", "papers"],
        College: ["college", "university", "campus", "professor", "student", "exam", "fees", "degree", "mark sheet", "attendance"],
        Documents: ["contract", "agreement", "bond", "lease", "rent", "landlord", "tenant", "sign", "paper", "refund", "return"]
    },
    // ... rest of concepts ...
    topic: {
        // ...
        Traffic: ["id", "identity", "license", "papers", "rc", "insurance", "helmet", "seatbelt", "driving", "driving license", "dl", "key", "chabi"],
        // ...
    },
    // ...
};

// ... CLARIFICATION_RULE_POLICE ...

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

    // --- STEP 2.4: TRAFFIC SCENARIO MATCH (NEW MODULE) ---
    // Takes precedence for Traffic/Police interactions 
    const isPoliceContext = analysis.detectedDomain === 'Police' || analysis.detectedTopics.includes('Traffic') || cleanText.includes('traffic') || cleanText.includes('police');

    if (isPoliceContext) {
        const scenario = trafficData.scenarios.find(s => {
            // Check keywords
            const hasKeyword = s.keywords && s.keywords.some(k => cleanText.includes(k));
            // Check explicit phrases (fuzzy match)
            const hasPhrase = s.police_says && s.police_says.some(phrase => {
                const p = phrase.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
                return cleanText.includes(p);
            });
            return hasPhrase || (hasKeyword && analysis.detectedTopics.includes('Traffic'));
        });

        if (scenario) {
            return {
                ...analysis,
                confidence: 0.95,
                feature: 'scenario',
                category: 'Traffic Module',
                rule: scenario,
                type: 'scenario' // UI Tag
            };
        }
    }

    // --- STEP 2.5: CLARITY GATE (The "Stop" Logic) ---
    const hasSpecificAction = analysis.detectedTopics.length > 0;

    // If Domain is Police but NO specific action/topic was detected
    if (analysis.detectedDomain === 'Police' && !hasSpecificAction) {
        return {
            ...analysis,
            confidence: 1.0, // High confidence that we need clarification
            rule: CLARIFICATION_RULE_POLICE,
            ruleId: CLARIFICATION_RULE_POLICE.rule_id,
            category: 'Police',
            verdict: 'DEPENDS'
        };
    }

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

            // Confidence Logic - REFINED
            // Score 10 (Domain only) is NOT enough for high confidence anymore.
            // We need at least Domain + Topic (15) or Domain + Strong Keywords.
            if (winner.score >= 15) analysis.confidence = 0.9;
            else if (winner.score > 10) analysis.confidence = 0.6; // Has some extra keywords
            else analysis.confidence = 0.4; // Domain match only -> Soft match

            // Only set the rule if confidence is decent
            if (analysis.confidence >= 0.4) {
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
