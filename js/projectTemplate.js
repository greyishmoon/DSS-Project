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
    zeroAssessment: [0, 0, 0], // 3 calculated results for zero risk impact
    costAssessment: [0, 0, 0], // 3 calculated results relating to project grades
    durationAssessment: [0, 0, 0], // 3 calculated results relating to project grades
    qualityAssessment: [0, 0, 0], // 3 calculated results relating to project grades

    // RESULTS
    // Storage of results calculations for each
    probability: 0, // Average for factors Coefficient of Project Features, Controllability + Dependency
    Mni: [], // array of M n,i relating to each alternative (row 17) - alternative weight*Criterion weight

}
