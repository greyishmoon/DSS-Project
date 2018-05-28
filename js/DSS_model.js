// DSS model for all calculations
// (Row references relate to DSS OUTSOURCING / FINANCIAL FACTORS sheet)


class DSS_model {
    constructor() {}

    // Perform results calculation on problem and update problem data object with results
    problemCalc(problem) {
        this.problem = problem;
        // Calculate M values for each Criterion
        this.calcMvalues();
        // Calculate K value for FACTOR
        this.calcK();
    }

    // Calculates the following values:
    // M n,i for each criterion relating to each alternative (row 17) - alternative weight*Criterion weight
    // M value for each criterion (row 26) - 1-(sum Mni values)
    calcMvalues() {
        var _this = this;
        var problem = this.problem;
        // Loop through all FACTORS
        $.each(problem.factors, function(index, factor) {
            console.log("Factor: " + factor.name);
            // Loop through each CRITERIA of each FACTOR - run calculations and update data model
            $.each(factor.criteria, function(index, criteria) {
                // Clear MNI_results
                var MNI_result = [];
                // Temp array to store converted CRITERIA WEIGHT
                var converted_alternative_weights = [];
                console.log("Crit: " + criteria.name);
                // For each ALTERNATIVE run calculations and update data model
                $.each(problem.alternatives, function(index, alternative) {
                    // CALCULATE Mni for each CRITERIA/ALTERNATIVE //////////////////
                    var convert_alternative_weight = criteria.alternativeWeights[index] * 0.01;
                    // Temp store converted weight for later calculations
                    converted_alternative_weights.push(convert_alternative_weight);
                    // CRITERIA WEIGHT * ALTERNATIVE WEIGHT (convert from percentages)
                    var calc = ((criteria.weight * 0.01) * convert_alternative_weight);
                    // Add result to temp array, rounded to 3 decimal places
                    MNI_result.push(calc.toFixedNumber(3));
                });
                // update data model
                criteria.Mni = MNI_result; // records Mni results

                // CALCULATE M for each CRITERIA ////////////////////////////////////
                // 1-(sum of MNI_results);
                var M_result = 1 - (MNI_result.reduce(_this.getSum));
                // update data model, rounded to 3 decimal places
                criteria.M = M_result.toFixedNumber(3);

                // CALCULATE Ml for each CRITERIA ////////////////////////////////////
                // 1-(CRITERIA WEIGHT (convert from percentage));
                criteria.Ml = 1 - (criteria.weight * 0.01);

                // CALCULATE Mdash for each CRITERIA ////////////////////////////////////
                // CRITERIA WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
                var Mdash_result = (criteria.weight * 0.01) * (1 - (converted_alternative_weights.reduce(_this.getSum)));
                criteria.Mdash = Mdash_result.toFixedNumber(3);

                console.log("MNI: " + criteria.Mni);
                console.log("M: " + criteria.M);
                console.log("Ml: " + criteria.Ml);
                console.log("Mdash: " + criteria.Mdash);
            });
        });
    }

    // Calculate K value for each FACTOR
    calcK() {

        var _this = this;
        var problem = this.problem;
        // Loop through all FACTORS
        $.each(problem.factors, function(index, factor) {
            console.log("CALC K >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            console.log("Factor: " + factor.name);
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(problem.alternatives, function(indexAlt, alternative) {
                console.log("Alternative loop: " + alternative);
                var criteria_results = [];      // capture results from each ALTERNATIVE loop - to be summed for final calc
                var criteria_calcs = [];    // Capture calc (Mni+Ml+Mdash)
                // For each CRITERIA, capture data, perform calculation and push to
                $.each(factor.criteria, function(indexCrit, criteria) {
                    var temp_calc = 0;
                });

            });

        });

    }

    // HELPER FUNCTIONS
    // Return sum of sumArray -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum);
    // OR RRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }
}

// Round number to x decimal places (and return a number not a string)
Number.prototype.toFixedNumber = function(x, base) {
    var pow = Math.pow(base || 10, x);
    return +(Math.round(this * pow) / pow);
}
