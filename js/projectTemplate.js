const Project = {
    type: "risk_analysis",
    name: "", // string - project name
    cost: 0, // int - project cost in £
    categories: [], // array of category objects
    grades: [1, 2, 3] // 3 percentages to be applied to impact assessment for whole project - default 1,2,3
}

const Category = {
    name: "", // string - category name
    risks: [], // array of risk objects
    zeroAggregate: [0, 0, 0], // 3 aggregated results for zero risk impact
    costAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    durationAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    qualityAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    // RESULTS
    // RISK ASSESSMENT PAGE (Used on)
    K: [0, 0, 0], // K value for each area in category (row 64)
    Malt: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],// array of (post K calc) M alt values relating to each area (nested array [0-2]) for each grade (Malt [0-3]  (row 66) - (Cost, Duration, Quality)
    MdashH: [0, 0, 0], // M dash H value for each area in category (row 75)
    MlH: [0, 0, 0], // Ml H value for each area in category (row 78)
    Beliefs: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]], // array of Beliefs values relating to each area (nested array [0-2]) for each grade (Malt [0-3]  (row 66) - (Cost, Duration, Quality) (row 83)
    Ignorance: [0, 0, 0] // Ignorance value for each area in category (row 91)
}

const Risk = {
    name: "", // string - risk name
    weight: 0, // 0 - 100
    occurrence: 0, // 0 - 100
    coefficient: 0, // 0 - 100
    controllability: 0, // 0 - 100
    dependency: 0, // 0 - 100
    costImpact: [0, 0, 0], // 3 percentages relating to project grades
    durationImpact: [0, 0, 0], // 3 percentages relating to project grades
    qualityImpact: [0, 0, 0], // 3 percentages relating to project grades


    // RESULTS
    // RISK ASSESSMENT PAGE (Used on)
    // Note - FACTORS = Coefficient of Project Features, Controllability + Dependency - static categories for all risks
    // Note - GRADES = 3
    // Note - AREA = 3 areas of assessment - Cost, Duration, Quality
    probability: 0, // Average for factors
    WeightedCost: [0, 0, 0, 0], // array of weighted risk values relating to each grade (row 19) - (1%, 2% + 3%)
    WeightedDuration: [0, 0, 0, 0], // array of weighted risk values relating to each grade (row 19) - (1%, 2% + 3%)
    WeightedQuality: [0, 0, 0, 0], // array of weighted risk values relating to each grade (row 19) - (1%, 2% + 3%)
    MniCost: [0, 0, 0, 0], // array of M n,i relating to each grade (row 29) - (0%, 1%, 2% + 3%)
    MniDuration: [0, 0, 0, 0], // array of M n,i relating to each grade (row 29) - (0%, 1%, 2% + 3%)
    MniQuality: [0, 0, 0, 0], // array of M n,i relating to each grade (row 29) - (0%, 1%, 2% + 3%)
    M: [0, 0, 0], // array of M values relating to each area (row 37) - (Cost, Duration, Quality)
    Ml: 0, // Ml for each risk (row 46) - 1-risk weight (SAME FOR EACH AREA)
    Mdash: [0, 0, 0] // Mdash for each area for risk (row 55) - Criterion weight * (1-(sum(weighted values (including zero))))

}
