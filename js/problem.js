// Stores all decision making project data
var Problem = {
    title: "",
    alternatives: [], // List of alternative suppliers
    categories: [], // List of project categories being assessed

    // SUMMARY PAGE RESULTS
    K: 0, // K value for category (row 53)
    Malt: [], // array of M values relating to each alternative (row 56)
    MdashH: 0, // M dash H value for category (row 63)
    MlH: 0, // Ml H value for category (row 66)
    Beliefs: [], // array of Beliefs relating to each Alternative (row 71)
    Ignorance: 0, // level of ignorance associated with Alternatives of this Category (row 77)
    IgnoranceSplit: 0       // level of ignorance (%) divided equallyt between number of alternatives
}

// Project categories being assessed
var Category = {
    name: "",
    criteria: [], // List of criteria associated with each category
    weight: 0, // Weight of each category (aggregated for summary tables)

    // RESULTS
    // Storage of results calculations for each Category
    K: 0, // K value for category (row 53)
    Malt: [], // array of M values relating to each alternative (row 56)
    MdashH: 0, // M dash H value for category (row 63)
    MlH: 0, // Ml H value for category (row 66)
    Beliefs: [], // array of Beliefs relating to each Alternative (row 71)
    Ignorance: 0, // level of ignorance associated with Alternatives of this Category (row 77)

    // SUMMARY PAGE RESULTS
    Mni: [], // array of M n,i relating to each category (summary sheet row 41)
    M: 0, // M for each category  (summary sheet row 52) - 1-sum(Mni)
    Ml: 0, // Ml for each category  (summary sheet row 63) - 1-Criterion weight
    Mdash: 0 // Mdash for each category  (summary sheet row 74) - Criterion weight * (1-(sum(alternative weights)))
}

// Criteria associated with a category
var Criterion = {
    name: "",
    weight: 0, // Weighting of criteria within Category
    alternativeWeights: [], // Weighting of criteria against each alternative supplier

    // RESULTS
    // Storage of results calculations for each Criterion
    // (Row references relate to DSS OUTSOURCING / FINANCIAL CATEGORIES sheet)
    Mni: [], // array of M n,i relating to each alternative (row 17) - alternative weight*Criterion weight
    M: 0, // M for each criterion (row 26) - 1-sum(Mni)
    Ml: 0, // Ml for each criterion (row 35) - 1-Criterion weight
    Mdash: 0 // Mdash for each criterion (row 44) - Criterion weight * (1-(sum(alternative weights)))
}
