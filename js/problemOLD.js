// Stores all decision making project data
class Problem {
    constructor(title) {
        this.title = title;
        this.alternatives = [];         // List of alternative suppliers
        this.factors = [];              // List of project factors being assessed

        // SUMMARY PAGE RESULTS
        this.K = 0;                     // K value for factor (row 53)
        this.Malt = [];                 // array of M values relating to each alternative (row 56)
        this.MdashH = 0;                // M dash H value for factor (row 63)
        this.MlH = 0;                   // Ml H value for factor (row 66)
        this.Beliefs = [];              // array of Beliefs relating to each Alternative (row 71)
        this.BeliefPercentages = [];    // array of Beliefs stored as percentages
        this.Ignorance = 0;             // level of ignorance associated with Alternatives of this Factor (row 77)
        this.IgnorancePercentage = 0;   // level of ignorance stored as a percentage
    }
}

// Project factors being assessed
class Factor {
    constructor(name) {
        this.name = name;
        this.criteria = [];             // List of criteria associated with each factor
        this.Weight = 0;                // Weight of each factor (for summary tables)

        // RESULTS
        // Storage of results calculations for each Factor
        this.K = 0;                     // K value for factor (row 53)
        this.Malt = [];                 // array of M values relating to each alternative (row 56)
        this.MdashH = 0;                // M dash H value for factor (row 63)
        this.MlH = 0;                   // Ml H value for factor (row 66)
        this.Beliefs = [];              // array of Beliefs relating to each Alternative (row 71)
        this.BeliefPercentages = [];    // array of Beliefs stored as percentages
        this.Ignorance = 0;             // level of ignorance associated with Alternatives of this Factor (row 77)
        this.IgnorancePercentage = 0;   // level of ignorance stored as a percentage

        // SUMMARY PAGE RESULTS
        this.Mni = [];                  // array of M n,i relating to each factor (summary sheet row 41)
        this.M = 0;                     // M for each factor  (summary sheet row 52) - 1-sum(Mni)
        this.Ml = 0;                    // Ml for each factor  (summary sheet row 63) - 1-Criterion weight
        this.Mdash = 0;                 // Mdash for each factor  (summary sheet row 74) - Criterion weight * (1-(sum(alternative weights)))
    }
}

// Criteria associated with a factor
class Criterion {
    constructor(name) {
        this.name = name;
        this.weight = 0;                // Weighting of criteria within Factor
        this.alternativeWeights = [];   // Weighting of criteria against each alternative supplier

        // RESULTS
        // Storage of results calculations for each Criterion
        // (Row references relate to DSS OUTSOURCING / FINANCIAL FACTORS sheet)
        this.Mni = [];                  // array of M n,i relating to each alternative (row 17) - alternative weight*Criterion weight
        this.M = 0;                     // M for each criterion (row 26) - 1-sum(Mni)
        this.Ml = 0;                    // Ml for each criterion (row 35) - 1-Criterion weight
        this.Mdash = 0;                 // Mdash for each criterion (row 44) - Criterion weight * (1-(sum(alternative weights)))
    }
}
