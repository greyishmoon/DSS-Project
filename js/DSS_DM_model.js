// DSS model for all DECISION MAKING calculations
// (Row references relate to DSS OUTSOURCING / FINANCIAL CATEGORIES sheet)


class DSS_DM_model {
    constructor() {
        // Switch to turn on/off calculation log statements
        this.debug = false;
    }

    // Perform results calculation on problem and update problem data object with results
    resultsCalc(data) {
        if (this.debug) console.log("\nCALCULATE RESULTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        // DATA is either PROBLEM object for DECISION MAKING
        this.data = data;
        // Calculate M values for each CRITERION (Mni and M and Ml and Mdash) (row 17 + 26 + 35 + 44)
        this.calcMvalues();
        // Calculate K value for CATEGORY (row 53)
        this.calcK();
        // Calculate M values for each ALTERNATIVE in Category (row 56)
        this.calcMalternatives();
        // Calculate M dash H value for CATEGORY (row 63)
        this.calcMdashH();
        // Calculate Ml H value for CATEGORY (row 66)
        this.calcMlH();
        // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
        this.calcBeliefs();
        // Calculate level of ignorance associated with ALTERNATIVES of this CATEGORY (row 77)
        this.calcIgnorance();

        // RESULTS PAGE calculations
        // Calculate array of M n,i relating to each category (summary sheet row 41 + 52 + 63 + 74)
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
        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC M - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Loop through each CRITERIA of each CATEGORY - run calculations and update data model
            $.each(category.criteria, function(index, criteria) {
                // Clear MNI_results
                var MNI_result = [];
                // Temp array to store converted CRITERIA WEIGHT
                var converted_alternative_weights = [];
                if (_this.debug) console.log("Crit: " + criteria.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>");

                // For each ALTERNATIVE run calculations and update data model
                $.each(data.alternatives, function(index, alternative) {
                    // CALCULATE Mni for each CRITERIA/ALTERNATIVE //////////////////
                    var convert_alternative_weight = _this.roundTo2(criteria.alternativeWeights[index] * 0.01);
                    // Round to 2 decimal places to remove JS floating point variations
                    convert_alternative_weight = _this.roundTo2(convert_alternative_weight);
                    // Temp store converted weight for later calculations
                    converted_alternative_weights.push(convert_alternative_weight);
                    // CRITERIA WEIGHT * ALTERNATIVE WEIGHT (convert from percentages)
                    var calc = _this.roundTo2((criteria.weight * 0.01) * convert_alternative_weight);
                    // Add result to temp array, rounded to 3 decimal places
                    MNI_result.push(calc);
                });

                // update data model
                criteria.Mni = MNI_result; // records Mni results

                // CALCULATE M for each CRITERIA ////////////////////////////////////
                // 1-(sum of MNI_results);
                var M_result = _this.roundTo2(1 - (MNI_result.reduce(_this.getSum)));
                // update data model, rounded to 3 decimal places
                criteria.M = M_result;

                // CALCULATE Ml for each CRITERIA ////////////////////////////////////
                // 1-(CRITERIA WEIGHT (convert from percentage));
                criteria.Ml = 1 - _this.roundTo2((criteria.weight * 0.01));

                // CALCULATE Mdash for each CRITERIA ////////////////////////////////////
                // CRITERIA WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
                var Mdash_result = _this.roundTo2((criteria.weight * 0.01)) * _this.roundTo2((1 - (converted_alternative_weights.reduce(_this.getSum))));
                criteria.Mdash = Mdash_result;

                if (_this.debug) console.log(">> MNI: " + criteria.Mni);
                if (_this.debug) console.log(">> M: " + criteria.M);
                if (_this.debug) console.log(">> Ml: " + criteria.Ml);
                if (_this.debug) console.log(">> Mdash: " + criteria.Mdash);
            });
        });
    }

    // Calculate K value for each CATEGORY (row 53)
    calcK() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC K - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_results = []; // capture results from each ALTERNATIVE loop - to be summed for final criteria_result
            var alternativeCount = data.alternatives.length; // Number of alternatives
            // Calculate weighting relationships
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (_this.debug) console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)

                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(category.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = _this.roundTo2(criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash);
                    criteria_calcs.push(temp_calc);
                });

                if (_this.debug) console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_results.push(criteria_calcs.reduce(_this.getProduct));
                if (_this.debug) console.log("criteria_results: " + criteria_results);
            });

            // Sum all subtotals from criteria_results for single criteria_results
            var criteria_result = criteria_results.reduce(_this.getSum);
            if (_this.debug) console.log("criteria_result: " + criteria_result);

            // Calculate M value relationships
            var m_relationships = _this.calcCategoryMrealtionships(category);
            if (_this.debug) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (criteria_result - (alternativeCount-1) * m_relationships)
            category.K = k_result.toFixedNumber(3);
            if (_this.debug) console.log(">> k_result: " + category.K);
        });
    }

    // Calculate M values for each ALTERNATIVE in Category (row 56)
    calcMalternatives() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC Malt - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var criteria_result = 0; // capture results from each ALTERNATIVE loop - use in final Malt calc
            var Malt_array = []; // stores Malt values to set category.Malt at end

            // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
            // Loop for each ALTERNATIVE to capture criteria data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (_this.debug) console.log("Alternative loop: " + alternative);

                var criteria_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
                $.each(category.criteria, function(indexCrit, criteria) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = _this.roundTo2(criteria.Mni[indexAlt] + criteria.Ml + criteria.Mdash);
                    criteria_calcs.push(temp_calc);
                });
                if (_this.debug) console.log("criteria_calcs: " + criteria_calcs);
                // Multiply all results from criteria_calcs and push total to criteria_results
                criteria_result = criteria_calcs.reduce(_this.getProduct);
                if (_this.debug) console.log("criteria_result: " + criteria_result);

                // Calculate Malt for this ALTERNATIVE and push to data.Malt
                var Malt_result = category.K * (criteria_result - _this.calcCategoryMrealtionships(category));
                Malt_array.push(Malt_result);
            });
            category.Malt = Malt_array;
            if (_this.debug) console.log(">> category.Malt: " + category.Malt);
        });
    }

    // Calculate M dash H value for CATEGORY (row 63)
    calcMdashH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC MdashH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for CATEGORY and set data.MdashH
            var MdashH_result = (category.K * (_this.calcCategoryMrealtionships(category) - _this.calcMlProduct(category)));
            category.MdashH = MdashH_result;
            if (_this.debug) console.log(">> category.MdashH: " + category.MdashH);
        });
    }

    // Calculate Ml H value for CATEGORY (row 66)
    calcMlH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC calcMlH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MlH for CATEGORY and set data.MlH
            var MlH_result = (category.K * _this.calcMlProduct(category));
            category.MlH = MlH_result;
            if (_this.debug) console.log(">> category.MdashH: " + category.MlH);
        });
    }

    // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
    calcBeliefs() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC Beliefs - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var belief_array = [];
            // Loop for each ALTERNATIVE, calculate belief and push to belief_array
            $.each(data.alternatives, function(indexAlt, alternative) {
                var belief_result = category.Malt[indexAlt] / (1 - category.MlH);
                belief_array.push(belief_result);
            });
            category.Beliefs = belief_array;
            if (_this.debug) console.log(">> category.Beliefs: " + category.Beliefs);
        });
    }

    // Calculate level of ignorance associated with ALTERNATIVES of this CATEGORY (row 77)
    calcIgnorance() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC Ignorance - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            var ignorance_result = category.MdashH / (1 - category.MlH);
            category.Ignorance = ignorance_result;
            if (_this.debug) console.log("category.Ignorance: " + category.Ignorance);
        });

    }




    // RESULTS PAGE calculations
    // Calculate aggregated M values (summary sheet row 41)
    // M n,i for each category relating to each alternative (summary sheet row 41) - alternative belief*category weight
    // M value for each criterion (summary sheet row 52) - 1-(sum Mni values)
    // Ml value for each criterion (summary sheet row 63) - 1-(category weight (convert from percentage)
    // Mdash value for each criterion (summary sheet row 74) - category weight * (1-(sum(alternative beliefs)))

    calcAggregatedMvalues() {
        var _this = this;
        var data = this.data;

        if (_this.debug) console.log("\n\n<<<<<<<<< RESULT PAGE CALCULATIONS >>>>>>>>>>>>>>>>>");
        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC Aggregated M values - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var aggMni_results = []; // capture agregated Mni values for each CATEGORY (one per each solution)

            // Loop over each belief value for Mni
            for (var i = 0; i < category.Beliefs.length; i++) {
                aggMni_results.push(category.Beliefs[i] * (category.weight / 100));
            }
            category.Mni = aggMni_results;

            // CALCULATE M for each CATEGORY ////////////////////////////////////
            // 1-(sum Mni aggMni_results)
            var M_result = 1 - (aggMni_results.reduce(_this.getSum));
            // update data model, rounded to 3 decimal places
            category.M = M_result;

            // CALCULATE Ml for each CATEGORY ////////////////////////////////////
            // 1-(category weight (convert from percentage)
            category.Ml = 1 - (category.weight * 0.01);

            // CALCULATE Mdash for each CATEGORY ////////////////////////////////////
            // category weight * (1-(sum(alternative beliefs)))
            var Mdash_result = (category.weight * 0.01) * (1 - (category.Beliefs.reduce(_this.getSum)));
            category.Mdash = Mdash_result;

            if (_this.debug) console.log("MNI: " + category.Mni);
            if (_this.debug) console.log("M: " + category.M);
            if (_this.debug) console.log("Ml: " + category.Ml);
            if (_this.debug) console.log("Mdash: " + category.Mdash);
        });
    }

    // Calculate K value for each CATEGORY (summary sheet row 85)
    calcAggregatedK() {
        var _this = this;
        var data = this.data;

        var criteria_results = []; // capture results from each ALTERNATIVE loop - to be summed for final criteria_result
        var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result
        var alternativeCount = data.alternatives.length; // Number of alternatives

        // Calculate weighting relationships
        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (_this.debug) console.log("\nCALC AGG K - Alternative loop: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var category_calcs = []; // Capture calc (Mni+Ml+Mdash)

            // Loop through all CATEGORIES, capture data, perform calculation and push to criteria_calcs
            $.each(data.categories, function(index, category) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = category.Mni[indexAlt] + category.Ml + category.Mdash;
                category_calcs.push(temp_calc);
            });

            if (_this.debug) console.log("criteria_calcs: " + category_calcs);
            // Multiply all results from criteria_calcs and push total to criteria_results
            category_results.push(category_calcs.reduce(_this.getProduct));
            if (_this.debug) console.log("criteria_results: " + category_results);
        });

        // Sum all subtotals from criteria_results for single criteria_results
        var category_result = category_results.reduce(_this.getSum);
        if (_this.debug) console.log("\ncriteria_result: " + category_result);

        // Calculate M value relationships
        var m_relationships = _this.calcProjectMrealtionships(data);
        if (_this.debug) console.log("m_relationships: " + m_relationships);

        // Final K calculation
        var k_result = 1 / (category_result - (alternativeCount-1) * m_relationships)
        data.K = k_result;
        if (_this.debug) console.log("k_result: " + data.K);

    }

    // Calculate aggregated M values for each CATEGORY in PROJECT (summary sheet row 88)
    calcAggregatedMalternatives() {
        var _this = this;
        var data = this.data;

        var Malt_array = []; // stores Malt values to set category.Malt at end

        //loop over alternatives (3 times)
        // loop over categories (5 times)
        // add (category.Mni[indexFact] + category.Ml + category.Mdash) and push to category_calcs array
        // Product of category_calcs - put in category_result
        // var Malt_result = data.K * (category_result - _this.calcProjectMrealtionships(data));

        // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (_this.debug) console.log("\nCALC Malt - Alternative: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var category_calcs = []; // Capture calc (Mni+Ml+Mdash)
            // For each CRITERIA, capture data, perform calculation and push to criteria_calcs
            $.each(data.categories, function(index, category) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = category.Mni[indexAlt] + category.Ml + category.Mdash;
                category_calcs.push(temp_calc);
            });
            if (_this.debug) console.log("category_calcs: " + category_calcs);
            // Multiply all results from criteria_calcs and push total to criteria_results
            var category_result = category_calcs.reduce(_this.getProduct);
            if (_this.debug) console.log("category_result: " + category_result);

            // Calculate Malt for this ALTERNATIVE and push to data.Malt
            var Malt_result = data.K * (category_result - _this.calcProjectMrealtionships(data));
            Malt_array.push(Malt_result);
        });
        data.Malt = Malt_array;
        if (_this.debug) console.log("data.Malt: " + data.Malt);
    }

    // Calculate aggregated M dash H value for PROJECT (summary sheet row 95)
    calcAggregatedMdashH() {
        if (this.debug) console.log("\nCALC Aggregated MdashH - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var data = this.data;

        // Calculate MdashH for CATEGORY and set data.MdashH
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

        // Loop for each ALTERNATIVE to capture criteria data
        $.each(data.alternatives, function(index, alternative) {

            var belief_result = (data.Malt[index] / (1 - data.MlH));
            belief_array.push(belief_result);
        });
        data.Beliefs = belief_array;
        if (this.debug) console.log("data.Beliefs: " + data.Beliefs);
    }

    // Calculate aggregated level of ignorance associated with ALTERNATIVES of this PROJECT (summary sheet row 109)
    calcAggregatedIgnorance() {
        if (this.debug) console.log("\nCALC Aggregated Ignorance - PROJECT - >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var data = this.data;
        data.Ignorance = data.MdashH / (1 - data.MlH);
        if (this.debug) console.log("data.Ignorance: " + data.Ignorance);

        // Calculate and save distributed ignorance divided by number of alternatives
        // For Distributed Ignorance table
        data.IgnoranceSplit = data.Ignorance/data.alternatives.length;
    }



    // MINI FUNCTIONS
    // Repeat operations used in multiple calculations

    // Calculate relationships between Ml and Mdash values for each CRITERIA in a CATEGORY and return the product
    // Used in calcK() and calcMalternatives()
    calcCategoryMrealtionships(category) {
        var _this = this;
        var m_results = []; // capture results from each CRITERIA loop - to be multiplied for final m_result
        $.each(category.criteria, function(indexCrit, criteria) {
            m_results.push(criteria.Ml + criteria.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate relationships between Ml and Mdash values for each CATEGORY in a PROJECT and return the product
    // Used in calcK() and calcMalternatives()
    calcProjectMrealtionships(project) {
        var _this = this;
        var m_results = []; // capture results from each CRITERIA loop - to be multiplied for final m_result
        $.each(project.categories, function(index, category) {
            m_results.push(category.Ml + category.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each CRITERION) in a CATEGORY
    calcMlProduct(category) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each CRITERION - calc product for final calc
        // Loop through each CRITERIA of each CATEGORY - calculate sum of Ml values from each CRITERION
        $.each(category.criteria, function(index, criteria) {
            Ml_values.push(criteria.Ml);
        });
        return Ml_values.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each CATEGORY) in a PROJECT
    calcProjectMlProduct(project) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each CRITERION - calc product for final calc
        // Loop through each CRITERIA of each CATEGORY - calculate sum of Ml values from each CRITERION
        $.each(project.categories, function(index, category) {
            Ml_values.push(category.Ml);
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

    // // Round to 2 decimal places to remove JS floating point variations
    roundTo2(num) {
        return +num.toFixedNumber(2);
    }

    // convert from percentage - return number rounded to 2 dp
    fromPercent(num) {
        return _this.roundTo2(num *  0.01);
    }


}

// // Call using .toFixedNumber(3) for 3 decimal places
// Number.prototype.toFixedNumber = function(x, base) {
//     var pow = Math.pow(base || 10, x);
//     return +(Math.round(this * pow) / pow);
// }
