// Stores all decision making project data
var Problem = {
    title: "",
    alternatives: [], // List of alternative suppliers
    factors: [], // List of project factors being assessed

    // SUMMARY PAGE RESULTS
    K: 0, // K value for factor (row 53)
    Malt: [], // array of M values relating to each alternative (row 56)
    MdashH: 0, // M dash H value for factor (row 63)
    MlH: 0, // Ml H value for factor (row 66)
    Beliefs: [], // array of Beliefs relating to each Alternative (row 71)
    BeliefPercentages: [], // array of Beliefs stored as percentages
    Ignorance: 0, // level of ignorance associated with Alternatives of this Factor (row 77)
    IgnorancePercentage: 0 // level of ignorance stored as a percentage
}

// Project factors being assessed
var Factor = {
    name: "",
    criteria: [], // List of criteria associated with each factor
    Weight: 0, // Weight of each factor (for summary tables)

    // RESULTS
    // Storage of results calculations for each Factor
    K: 0, // K value for factor (row 53)
    Malt: [], // array of M values relating to each alternative (row 56)
    MdashH: 0, // M dash H value for factor (row 63)
    MlH: 0, // Ml H value for factor (row 66)
    Beliefs: [], // array of Beliefs relating to each Alternative (row 71)
    BeliefPercentages: [], // array of Beliefs stored as percentages
    Ignorance: 0, // level of ignorance associated with Alternatives of this Factor (row 77)
    IgnorancePercentage: 0, // level of ignorance stored as a percentage

    // SUMMARY PAGE RESULTS
    Mni: [], // array of M n,i relating to each factor (summary sheet row 41)
    M: 0, // M for each factor  (summary sheet row 52) - 1-sum(Mni)
    Ml: 0, // Ml for each factor  (summary sheet row 63) - 1-Criterion weight
    Mdash: 0 // Mdash for each factor  (summary sheet row 74) - Criterion weight * (1-(sum(alternative weights)))
}

// Criteria associated with a factor
var Criterion = {
    name: "",
    weight: 0, // Weighting of criteria within Factor
    alternativeWeights: [], // Weighting of criteria against each alternative supplier

    // RESULTS
    // Storage of results calculations for each Criterion
    // (Row references relate to DSS OUTSOURCING / FINANCIAL FACTORS sheet)
    Mni: [], // array of M n,i relating to each alternative (row 17) - alternative weight*Criterion weight
    M: 0, // M for each criterion (row 26) - 1-sum(Mni)
    Ml: 0, // Ml for each criterion (row 35) - 1-Criterion weight
    Mdash: 0 // Mdash for each criterion (row 44) - Criterion weight * (1-(sum(alternative weights)))
}
