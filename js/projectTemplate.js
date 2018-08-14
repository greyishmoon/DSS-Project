const Project = {
    type: "risk_analysis",
    name: "", // string - project name
    cost: 0, // int - project cost in £
    categories: [], // array of category objects
    grades: [1, 2, 3], // 3 percentages to be applied to impact assessment for whole project - default 1,2,3

    // SUMMARY PAGE
    K_obj: [0, 0, 0], // Array to hold project level K values (one for each area) (summary sheet row 86)
    Malt_obj: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of (post K calc) M alt values for each grade in each area (0% - 3%) (summary sheet row 89)
    MdashH_obj: [0, 0, 0], // MdashH for each area @ project level (summary sheet row 98)
    MlH_obj: [0, 0, 0], // MlH for each area @ project level (summary sheet row 101)
    Beliefs_obj: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of Beliefs values for each grade (0% - 3%) for each area in project  (Summary page row 104)
    Ignorance_obj: [0, 0, 0], // Ignorance value for each area in project  (Summary page row 112)
    RiskLevels_obj: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 133)

    // RESULTS PAGE
    ProjectWeights: [33, 33, 34], // Weights for 3 areas (objectives) (Cost, Duration, Quality) for whole project - captured on Results page
    Mni_proj: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of M n,i summarising all risks in category, for each area (Cost, Duration, Quality) for each grade (0% - 3%)   (Summary page row 167)
    M_proj: [0, 0, 0], // M for each area @ project level  (Summary page row 174) - 1-sum(Mni) (where Mni is results from each area)
    Ml_proj: [0, 0, 0], // Ml for each area @ objective level (Summary sheet row 181) - 1-Criterion weight
    Mdash_proj: [0, 0, 0], // Mdash for each area @ objective level (summary sheet row 188) - Criterion weight * (1-(sum(alternative weights)))

    K_proj: 0, // Project level K value (summary sheet row 195)
    Malt_proj: [0, 0, 0, 0], // array of (post K calc) M alt values for each grade in each area (0% - 3%) (summary sheet row 197)
    MdashH_proj: 0, // MdashH for each area @ project level (summary sheet row 206)
    MlH_proj: 0, // MlH for each area @ project level (summary sheet row 209)
    Beliefs_proj: [0, 0, 0, 0], // array of Beliefs values for each grade (0% - 3%) for each area in project  (Summary page row 214)
    Ignorance_proj: 0, // Ignorance value for each area in project  (Summary page row 222)
    RiskLevels_proj: [0, 0, 0], // Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 238)
    costImpact_proj: 0, // Potential cost impact of AVERAGE risk level on project (Summary page row 245)
}

const Category = {
    name: "", // string - category name
    risks: [], // array of risk objects
    zeroAggregate: [0, 0, 0], // 3 aggregated results for zero risk impact
    costAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    durationAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    qualityAggregate: [0, 0, 0], // 3 aggregated results relating to project grades
    AreaWeights: [33, 33, 34], // Weights for 3 areas (objectives) (Cost, Duration, Quality) - captured on Risk Assessment page

    // RISK ASSESSMENT PAGE
    K: [0, 0, 0], // K value for each area in category (row 64)
    Malt: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of (post K calc) M alt values  relating to each area (Cost, Duration, Quality) for each grade (0% - 3%)  (row 66)
    MdashH: [0, 0, 0], // M dash H value for each area in category (row 75)
    MlH: [0, 0, 0], // Ml H value for each area in category (row 78)
    Beliefs: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of Beliefs values relating to each area (Cost, Duration, Quality) for each grade (0% - 3%)  (row 83)
    Ignorance: [0, 0, 0], // Ignorance value for each area in category (row 91)
    Mni_Cat: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of M n,i summarising all risks in category, for each area (Cost, Duration, Quality) for each grade (0% - 3%)   (row 135)
    M_Cat: [0, 0, 0], // M for each area  (row 142) - 1-sum(Mni)
    Ml_Cat: [0, 0, 0], // Ml for category  (row 149) - 1-Criterion weight
    Mdash_Cat: [0, 0, 0], // Mdash for category  (row 156) - Criterion weight * (1-(sum(alternative weights)))
    K_cat: 0, // K result for category (aggregated risks) (row 163)
    Malt_cat: [0, 0, 0, 0], // array of (post K calc) M alt values for each grade (0% - 3%) (row 165)
    MdashH_cat: 0, // M dash H result for category (row 174)
    Ml_cat: 0, // Ml result for category (row 177)
    Beliefs_cat: [0, 0, 0, 0], // array of Beliefs values for each grade (0% - 3%) for category (row 182)
    Ignorance_cat: 0, // Ignorance value for category (row 190)
    RiskLevels_cat: [0, 0, 0], // Risk levels for category - [MINIMUM, MAXIMUM, AVERAGE] (row 205)
    costImpact_cat: 0, // Potential cost impact of AVERAGE risk level on project

    // SUMMARY PAGE
    CategoryWeight: 0, // Array to hold project level category weight (Summary page row 28)
    Mni_obj: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // array of M n,i summarising all risks in category, for each area (Cost, Duration, Quality) for each grade (0% - 3%)   (Summary page row 42)
    M_obj: [0, 0, 0], // M for each area @ objective level  (Summary page row 53) - 1-sum(Mni) (where Mni is results from each category)
    Ml_obj: [0, 0, 0], // Ml for each area @ objective level (Summary sheet row 64) - 1-Criterion weight
    Mdash_obj: [0, 0, 0], // Mdash for each area @ objective level (summary sheet row 75) - Criterion weight * (1-(sum(alternative weights)))


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

    // RISK ASSESSMENT PAGE
    // Note - FACTORS = Coefficient of Project Features, Controllability + Dependency - static categories for all risks
    // Note - GRADES = 3
    // Note - AREA = 3 areas of assessment (also called Objectives) - Cost, Duration, Quality
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
