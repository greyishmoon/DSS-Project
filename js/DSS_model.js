// DSS model for all calculations
// (Row references relate to DSS OUTSOURCING / FINANCIAL FACTORS sheet)


class DSS_model {
    constructor() {}

    // Perform results calculation on problem and update problem data object with results
    resultsCalc(data) {
        // DATA is either PROBLEM object for DECISION MAKING or TODO ***** object for RISK ANALYSIS
        this.data = data;
        // Calculate M values for each CRITERION
        this.calcMvalues();
        // Calculate K value for FACTOR
        this.calcK();
        // Calculate M values for each ALTERNATIVE in Factor
        this.calcMalternatives();
    }

    // Calculates the following values:
    // M n,i for each criterion relating to each alternative (row 17) - alternative weight*Criterion weight
    // M value for each criterion (row 26) - 1-(sum Mni values)
    // Ml value for each criterion (row 35) - 1-(CRITERIA WEIGHT (convert from percentage)
    // Mdash value for each criterion (row 44) - CRITERIA WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
    calcMvalues() {
        var _this = this;
        var data = this.data;
        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            console.log("\nCALC M - Factor: "  + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            // Loop through each CRITERIA of each FACTOR - run calculations and update data model
            $.each(factor.criteria, function(index, criteria) {
                // Clear MNI_results
                var MNI_result = [];
                // Temp array to store converted CRITERIA WEIGHT
                var converted_alternative_weights = [];
                console.log("Crit: " + criteria.name);
                // For each ALTERNATIVE run calculations and update data model
                $.each(data.alternatives, function(index, alternative) {
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
        var data = this.data;
        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            console.log("\nCALC K - Factor: "  + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_results = []; // capture results from each ALTERNATIVE loop - to be summed for final criteria_result
            // Calculate weighting relationships
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(factor.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash;
                    criteria_calcs.push(temp_calc);
                });
                console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_results.push(criteria_calcs.reduce(_this.getProduct));
                console.log("criteria_results: " + criteria_results);
            });

            // Sum all subtotals from criteria_results for single criteria_results
            var criteria_result = criteria_results.reduce(_this.getSum);
            console.log("criteria_result: " + criteria_result);

            // Calculate M value relationships
            var m_relationships = _this.calcMrealtionships(factor);
            console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / ( criteria_result - 2 * m_relationships)
            factor.K = k_result.toFixedNumber(3);
            console.log("k_result: " + factor.K);
        });
    }

    // Calculate M values for each ALTERNATIVE in Factor
    calcMalternatives() {
        var _this = this;
        var data = this.data;
        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            console.log("\nCALC Malt - Factor: "  + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_result = 0; // capture results from each ALTERNATIVE loop - use in final Malt calc

            // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(factor.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash;
                    criteria_calcs.push(temp_calc);
                });
                console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_result = criteria_calcs.reduce(_this.getProduct);
                console.log("criteria_result: " + criteria_result);

                // Calculate Malt for this ALTERNATIVE and push to data.Malt
                var Malt_result = factor.K * (criteria_result - _this.calcMrealtionships(factor));
                factor.Malt.push(Malt_result.toFixedNumber(3));

            });
            console.log("factor.Malt: " + factor.Malt);
        });
    }

    // Calculate relationships between Ml and Mdash values for each CRITERIA in a FACTOR and return the product
    // Used in calcK() and calcMalternatives()
    calcMrealtionships(factor) {
        var _this = this;
        var m_results = [];     // capture results from each CRITERIA loop - to be multiplied for final m_result
        $.each(factor.criteria, function(indexCrit, criteria) {
            m_results.push(criteria.Ml + criteria.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }



    // HELPER FUNCTIONS
    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum);
    // OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }

    // Return product of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum);
    // OR ARRAY_TO_BE_SUMMED.reduce(_this.getProduct); from within anonymous function
    getProduct(total, num) {
        return total * num;
    }


}

// Round number to x decimal places (and return a number not a string)
Number.prototype.toFixedNumber = function(x, base) {
    var pow = Math.pow(base || 10, x);
    return +(Math.round(this * pow) / pow);
}
