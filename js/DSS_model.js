// DSS model for all calculations
// (Row references relate to DSS OUTSOURCING / FINANCIAL FACTORS sheet)


class DSS_model {
    constructor() {
        // Switch to turn on/off calculation log statements
        this.debug = false;
    }

    // Perform results calculation on problem and update problem data object with results
    resultsCalc(data) {
        // DATA is either PROBLEM object for DECISION MAKING or TODO ***** object for RISK ANALYSIS
        this.data = data;
        // Calculate M values for each CRITERION (Mni and M and Ml and Mdash) (row 17 + 26 + 35 + 44)
        this.calcMvalues();
        // Calculate K value for FACTOR (row 53)
        this.calcK();
        // Calculate M values for each ALTERNATIVE in Factor (row 56)
        this.calcMalternatives();
        // Calculate M dash H value for FACTOR (row 63)
        this.calcMdashH();
        // Calculate Ml H value for FACTOR (row 66)
        this.calcMlH();
        // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
        this.calcBeliefs();
        // Calculate level of ignorance associated with ALTERNATIVES of this FACTOR (row 77)
        this.calcIgnorance();

        // RESULTS PAGE calculations
        // Calculate array of M n,i relating to each factor (summary sheet row 41 + 52 + 63 + 74)
        this.calcAggregatedMvalues();
        // Calculate aggregated K value for PROJECT (summary sheet row 85)
        this.calcAggregatedK();
        // Calculate aggregated M values for each ALTERNATIVE in PROJECT (summary sheet row 88)
        this.calcAggregatedMalternatives();
        // Calculate aggregated M dash H value for PROJECT (summary sheet row 95)
        this.calcAggregatedMdashH();
        // Calculate aggregated Ml H value for PROJECT (summary sheet row 98)
        this.calcAggregatedMlH();
        // Calculate array of aggregated Beliefs relating to each ALTERNATIVE (summary sheet row 103)
        this.calcAggregatedBeliefs();
        // Calculate aggregated level of ignorance associated with ALTERNATIVES of this PROJECT (summary sheet row 109)
        this.calcAggregatedIgnorance();
    }

    // Calculates the following M values:
    // M n,i for each criterion relating to each alternative (row 17) - alternative weight*Criterion weight
    // M value for each criterion (row 26) - 1-(sum Mni values)
    // Ml value for each criterion (row 35) - 1-(CRITERIA WEIGHT (convert from percentage)
    // Mdash value for each criterion (row 44) - CRITERIA WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
    calcMvalues() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC M - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Loop through each CRITERIA of each FACTOR - run calculations and update data model
            $.each(factor.criteria, function(index, criteria) {
                // Clear MNI_results
                var MNI_result = [];
                // Temp array to store converted CRITERIA WEIGHT
                var converted_alternative_weights = [];
                if (this.debug) console.log("Crit: " + criteria.name);

                // For each ALTERNATIVE run calculations and update data model
                $.each(data.alternatives, function(index, alternative) {
                    // CALCULATE Mni for each CRITERIA/ALTERNATIVE //////////////////
                    var convert_alternative_weight = criteria.alternativeWeights[index] * 0.01;
                    // Temp store converted weight for later calculations
                    converted_alternative_weights.push(convert_alternative_weight);
                    // CRITERIA WEIGHT * ALTERNATIVE WEIGHT (convert from percentages)
                    var calc = ((criteria.weight * 0.01) * convert_alternative_weight);
                    // Add result to temp array, rounded to 3 decimal places
                    MNI_result.push(calc);
                });

                // update data model
                criteria.Mni = MNI_result; // records Mni results

                // CALCULATE M for each CRITERIA ////////////////////////////////////
                // 1-(sum of MNI_results);
                var M_result = 1 - (MNI_result.reduce(_this.getSum));
                // update data model, rounded to 3 decimal places
                criteria.M = M_result;

                // CALCULATE Ml for each CRITERIA ////////////////////////////////////
                // 1-(CRITERIA WEIGHT (convert from percentage));
                criteria.Ml = 1 - (criteria.weight * 0.01);

                // CALCULATE Mdash for each CRITERIA ////////////////////////////////////
                // CRITERIA WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
                var Mdash_result = (criteria.weight * 0.01) * (1 - (converted_alternative_weights.reduce(_this.getSum)));
                criteria.Mdash = Mdash_result;

                if (this.debug) console.log("MNI: " + criteria.Mni);
                if (this.debug) console.log("M: " + criteria.M);
                if (this.debug) console.log("Ml: " + criteria.Ml);
                if (this.debug) console.log("Mdash: " + criteria.Mdash);
            });
        });
    }

    // Calculate K value for each FACTOR (row 53)
    calcK() {
        var _this = this;
        var data = this.data;
        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC K - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_results = []; // capture results from each ALTERNATIVE loop - to be summed for final criteria_result

            // Calculate weighting relationships
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (this.debug) console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)

                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(factor.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash;
                    criteria_calcs.push(temp_calc);
                });

                if (this.debug) console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_results.push(criteria_calcs.reduce(_this.getProduct));
                if (this.debug) console.log("criteria_results: " + criteria_results);
            });

            // Sum all subtotals from criteria_results for single criteria_results
            var criteria_result = criteria_results.reduce(_this.getSum);
            if (this.debug) console.log("criteria_result: " + criteria_result);

            // Calculate M value relationships
            var m_relationships = _this.calcFactorMrealtionships(factor);
            if (this.debug) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (criteria_result - 2 * m_relationships)
            factor.K = k_result.toFixedNumber(3);
            if (this.debug) console.log("k_result: " + factor.K);
        });
    }

    // Calculate M values for each ALTERNATIVE in Factor (row 56)
    calcMalternatives() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC Malt - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_result = 0; // capture results from each ALTERNATIVE loop - use in final Malt calc
            var Malt_array = []; // stores Malt values to set factor.Malt at end

            // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (this.debug) console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(factor.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash;
                    criteria_calcs.push(temp_calc);
                });
                if (this.debug) console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_result = criteria_calcs.reduce(_this.getProduct);
                if (this.debug) console.log("criteria_result: " + criteria_result);

                // Calculate Malt for this ALTERNATIVE and push to data.Malt
                var Malt_result = factor.K * (criteria_result - _this.calcFactorMrealtionships(factor));
                Malt_array.push(Malt_result);
            });
            factor.Malt = Malt_array;
            if (this.debug) console.log("factor.Malt: " + factor.Malt);
        });
    }

    // Calculate M dash H value for FACTOR (row 63)
    calcMdashH() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC MdashH - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for FACTOR and set data.MdashH
            var MdashH_result = (factor.K * (_this.calcFactorMrealtionships(factor) - _this.calcMlProduct(factor)));
            factor.MdashH = MdashH_result;
            if (this.debug) console.log("factor.MdashH: " + factor.MdashH);
        });
    }

    // Calculate Ml H value for FACTOR (row 66)
    calcMlH() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC calcMlH - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MlH for FACTOR and set data.MlH
            var MlH_result = (factor.K * _this.calcMlProduct(factor));
            factor.MlH = MlH_result;
            if (this.debug) console.log("factor.MdashH: " + factor.MlH);
        });
    }

    // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
    calcBeliefs() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC Beliefs - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var belief_array = [];
            var belief_percentages = [];
            // Loop for each ALTERNATIVE, calculate belief and push to belief_array
            $.each(data.alternatives, function(indexAlt, alternative) {
                var belief_result = factor.Malt[indexAlt] / (1 - factor.MlH);
                belief_array.push(belief_result);
                belief_percentages.push((belief_result * 100).toFixedNumber(1));
            });
            factor.Beliefs = belief_array;
            factor.BeliefPercentages = belief_percentages;
            if (this.debug) console.log("factor.Beliefs: " + factor.Beliefs);

        });
    }

    // Calculate level of ignorance associated with ALTERNATIVES of this FACTOR (row 77)
    calcIgnorance() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC Ignorance - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            var ignorance_result = factor.MdashH / (1 - factor.MlH);
            factor.Ignorance = ignorance_result;
            factor.IgnorancePercentage = (ignorance_result * 100).toFixedNumber(1);
            if (this.debug) console.log("factor.Ignorance: " + factor.Ignorance);
        });

    }




    // RESULTS PAGE calculations
    // Calculate aggregated M values (summary sheet row 41)
    // M n,i for each factor relating to each alternative (summary sheet row 41) - alternative belief*factor weight
    // M value for each criterion (summary sheet row 52) - 1-(sum Mni values)
    // Ml value for each criterion (summary sheet row 63) - 1-(factor weight (convert from percentage)
    // Mdash value for each criterion (summary sheet row 74) - factor weight * (1-(sum(alternative beliefs)))
    calcAggregatedMvalues() {
        var _this = this;
        var data = this.data;

        // Loop through all FACTORS
        $.each(data.factors, function(index, factor) {
            if (this.debug) console.log("\nCALC Aggregated M values - Factor: " + factor.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var aggMni_results = []; // capture agregated Mni values for each FACTOR (one per each solution)

            // Loop over each belief value for Mni
            for (var i = 0; i < factor.Beliefs.length; i++) {
                aggMni_results.push(factor.Beliefs[i] * (factor.Weight / 100));
            }
            factor.Mni = aggMni_results;

            // CALCULATE M for each FACTOR ////////////////////////////////////
            // 1-(sum Mni aggMni_results)
            var M_result = 1 - (aggMni_results.reduce(_this.getSum));
            // update data model, rounded to 3 decimal places
            factor.M = M_result;

            // CALCULATE Ml for each FACTOR ////////////////////////////////////
            // 1-(factor weight (convert from percentage)
            factor.Ml = 1 - (factor.Weight * 0.01);

            // CALCULATE Mdash for each FACTOR ////////////////////////////////////
            // factor weight * (1-(sum(alternative beliefs)))
            var Mdash_result = (factor.Weight * 0.01) * (1 - (factor.Beliefs.reduce(_this.getSum)));
            factor.Mdash = Mdash_result;

            if (this.debug) console.log("MNI: " + factor.Mni);
            if (this.debug) console.log("M: " + factor.M);
            if (this.debug) console.log("Ml: " + factor.Ml);
            if (this.debug) console.log("Mdash: " + factor.Mdash);
        });
    }

    // Calculate K value for each FACTOR (summary sheet row 85)
    calcAggregatedK() {
        var _this = this;
        var data = this.data;

        var criteria_results = []; // capture results from each ALTERNATIVE loop - to be summed for final criteria_result
        var factor_results = []; // capture results from each ALTERNATIVE loop - to be summed for final factor_result

        // Calculate weighting relationships
        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (this.debug) console.log("\nCALC AGG K - Alternative loop: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var factor_calcs = []; // Capture calc (Mni+Ml+Mdash)

            // Loop through all FACTORS, capture data, perform calculation and push to criteria_calcs
            $.each(data.factors, function(index, factor) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = factor.Mni[indexAlt] + factor.Ml + factor.Mdash;
                factor_calcs.push(temp_calc);
            });

            if (this.debug) console.log("criteria_calcs: " + factor_calcs);
            // Multiply all results from criteria_calcs and push total to criteria_results
            factor_results.push(factor_calcs.reduce(_this.getProduct));
            if (this.debug) console.log("criteria_results: " + factor_results);
        });

        // Sum all subtotals from criteria_results for single criteria_results
        var factor_result = factor_results.reduce(_this.getSum);
        if (this.debug) console.log("criteria_result: " + factor_result);

        // Calculate M value relationships
        var m_relationships = _this.calcProjectMrealtionships(data);
        if (this.debug) console.log("m_relationships: " + m_relationships);

        // Final K calculation
        var k_result = 1 / (factor_result - 2 * m_relationships)
        data.K = k_result.toFixedNumber(3);
        if (this.debug) console.log("k_result: " + data.K);

    }

    // Calculate aggregated M values for each FACTOR in PROJECT (summary sheet row 88)
    calcAggregatedMalternatives() {
        var _this = this;
        var data = this.data;

        var Malt_array = []; // stores Malt values to set factor.Malt at end

        //loop over alternatives (3 times)
        // loop over factors (5 times)
        // add (factor.Mni[indexFact] + factor.Ml + factor.Mdash) and push to factor_calcs array
        // Product of factor_calcs - put in factor_result
        // var Malt_result = data.K * (factor_result - _this.calcProjectMrealtionships(data));

        // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (this.debug) console.log("\nCALC Malt - Alternative: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var factor_calcs = []; // Capture calc (Mni+Ml+Mdash)
            // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
            $.each(data.factors, function(index, factor) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = factor.Mni[indexAlt] + factor.Ml + factor.Mdash;
                factor_calcs.push(temp_calc);
            });
            if (this.debug) console.log("factor_calcs: " + factor_calcs);
            // Multiply all results from criteria_calcs and push total to criteria_results
            var factor_result = factor_calcs.reduce(_this.getProduct);
            if (this.debug) console.log("factor_result: " + factor_result);

            // Calculate Malt for this ALTERNATIVE and push to data.Malt
            var Malt_result = data.K * (factor_result - _this.calcProjectMrealtionships(data));
            Malt_array.push(Malt_result);
        });
        data.Malt = Malt_array;
        if (this.debug) console.log("data.Malt: " + data.Malt);
    }

    // Calculate aggregated M dash H value for PROJECT (summary sheet row 95)
    calcAggregatedMdashH() {
        if (this.debug) console.log("\nCALC Aggregated MdashH - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var data = this.data;

        // Calculate MdashH for FACTOR and set data.MdashH
        data.MdashH = (data.K * (this.calcProjectMrealtionships(data) - this.calcProjectMlProduct(data)));
        if (this.debug) console.log("data.MdashH: " + data.MdashH);
    }

    // Calculate aggregated Ml H value for PROJECT (summary sheet row 98)
    calcAggregatedMlH() {
        if (this.debug) console.log("\nCALC Aggregated MlH - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var data = this.data;

        data.MlH = (data.K * (this.calcProjectMlProduct(data)));
        if (this.debug) console.log("data.MlH: " + data.MlH);
    }

    // Calculate array of aggregated Beliefs relating to each ALTERNATIVE (summary sheet row 103)
    calcAggregatedBeliefs() {
        if (this.debug) console.log("\nCALC Aggregated Beliefs - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var _this = this;
        var data = this.data;

        var belief_array = [];
        var belief_percentages = [];

        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(index, alternative) {

            var belief_result = (data.Malt[index] / (1 - data.MlH));
            belief_array.push(belief_result);
            belief_percentages.push((belief_result * 100).toFixedNumber(1));
        });
        data.Beliefs = belief_array;
        data.BeliefPercentages = belief_percentages;
        if (this.debug) console.log("data.Beliefs: " + data.Beliefs);
    }

    // Calculate aggregated level of ignorance associated with ALTERNATIVES of this PROJECT (summary sheet row 109)
    calcAggregatedIgnorance() {
        if (this.debug) console.log("\nCALC Aggregated Ignorance - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var data = this.data;
        data.Ignorance = data.MdashH / (1 - data.MlH);
        data.IgnorancePercentage = (data.Ignorance * 100).toFixedNumber(1)
        if (this.debug) console.log("data.Ignorance: " + data.Ignorance);
    }



    // MINI FUNCTIONS
    // Repeat operations used in multiple calculations

    // Calculate relationships between Ml and Mdash values for each CRITERIA in a FACTOR and return the product
    // Used in calcK() and calcMalternatives()
    calcFactorMrealtionships(factor) {
        var _this = this;
        var m_results = []; // capture results from each CRITERIA loop - to be multiplied for final m_result
        $.each(factor.criteria, function(indexCrit, criteria) {
            m_results.push(criteria.Ml + criteria.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate relationships between Ml and Mdash values for each FACTOR in a PROJECT and return the product
    // Used in calcK() and calcMalternatives()
    calcProjectMrealtionships(project) {
        var _this = this;
        var m_results = []; // capture results from each CRITERIA loop - to be multiplied for final m_result
        $.each(project.factors, function(index, factor) {
            m_results.push(factor.Ml + factor.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each CRITERION) in a FACTOR
    calcMlProduct(factor) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each CRITERION - calc product for final calc
        // Loop through each CRITERIA of each FACTOR - calculate sum of Ml values from each CRITERION
        $.each(factor.criteria, function(index, criteria) {
            Ml_values.push(criteria.Ml);
        });
        return Ml_values.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each FACTOR) in a PROJECT
    calcProjectMlProduct(project) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each CRITERION - calc product for final calc
        // Loop through each CRITERIA of each FACTOR - calculate sum of Ml values from each CRITERION
        $.each(project.factors, function(index, factor) {
            Ml_values.push(factor.Ml);
        });
        return Ml_values.reduce(_this.getProduct);
    }



    // HELPER FUNCTIONS

    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum); OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }

    // Return product of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getProduct); OR ARRAY_TO_BE_SUMMED.reduce(_this.getProduct); from within anonymous function
    getProduct(total, num) {
        return total * num;
    }


}

// Call using .toFixedNumber(3) for 3 decimal places
Number.prototype.toFixedNumber = function(x, base) {
    var pow = Math.pow(base || 10, x);
    return +(Math.round(this * pow) / pow);
}
