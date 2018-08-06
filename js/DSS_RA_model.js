// DSS model for all RISK ANALYSIS calculations
// (Row references relate to DSS RISK ANALYSIS WITH GUIDANCE / FINANCIAL RISKS sheet)


class DSS_RA_model {
    constructor() {
        // Switch to turn on/off calculation log statements
        this.debug = true;
    }

    // Perform results calculation on project and update project data object with results
    resultsCalc(data) {
        // DATA is PROJECT object for RISK ANALYSIS
        this.data = data;
        // Calculate M values for each RISK (Mni and M and Ml and Mdash) (row 17 + 26 + 35 + 44)
        this.calcMvalues();
        // Calculate K value for CATEGORY (row 53)
        // this.calcK();
        // Calculate M values for each ALTERNATIVE in Category (row 56)
        // this.calcMalternatives();
        // Calculate M dash H value for CATEGORY (row 63)
        // this.calcMdashH();
        // Calculate Ml H value for CATEGORY (row 66)
        // this.calcMlH();
        // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
        // this.calcBeliefs();
        // Calculate level of ignorance associated with ALTERNATIVES of this CATEGORY (row 77)
        // this.calcIgnorance();

        // RESULTS PAGE calculations
        // Calculate array of M n,i relating to each category (summary sheet row 41 + 52 + 63 + 74)
        // this.calcAggregatedMvalues();
        // Calculate aggregated K value for PROJECT (summary sheet row 85)
        // this.calcAggregatedK();
        // Calculate aggregated M values for each ALTERNATIVE in PROJECT (summary sheet row 88)
        // this.calcAggregatedMalternatives();
        // Calculate aggregated M dash H value for PROJECT (summary sheet row 95)
        // this.calcAggregatedMdashH();
        // Calculate aggregated Ml H value for PROJECT (summary sheet row 98)
        // this.calcAggregatedMlH();
        // Calculate array of aggregated Beliefs relating to each ALTERNATIVE (summary sheet row 103)
        // this.calcAggregatedBeliefs();
        // Calculate aggregated level of ignorance associated with ALTERNATIVES of this PROJECT (summary sheet row 109)
        // this.calcAggregatedIgnorance();
    }

    // Calculates the following M values:
    // Probability for each risk (T20,22,24,26) - Average for factors Coefficient of Project Features, Controllability + Dependency
    // M n,i for each risk relating to each alternative (row 17) - alternative weight*risk weight
    // M value for each risk (row 22 Column T) - 1-(sum Mni values)
    // Ml value for each risk (row 35) - 1-(RISK WEIGHT (convert from percentage)
    // Mdash value for each risk (row 44) - RISK WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
    calcMvalues() {
        console.log("CALC M VALUES >>>>>>>>>>>>>>>>>>>");
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug) console.log("\nCALC M - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            // Loop through each RISK of each CATEGORY - run calculations and update data model
            $.each(category.risks, function(index, risk) {



                // CALCULATE PROBABILITY for each RISK ////////////////////////////////////
                // Average for factors Coefficient of Project Features, Controllability + Dependency
                risk.probability = (risk.coefficient + risk.controllability + risk.dependency) / 3;

                if (_this.debug) console.log("\nRisk: " + risk.name + " " + risk.probability);
            });


            // // Loop through each RISK of each CATEGORY - run calculations and update data model
            // $.each(category.risk, function(index, risk) {
            //     // Clear MNI_results
            //     var MNI_result = [];
            //     // Temp array to store converted RISK WEIGHT
            //     var converted_alternative_weights = [];
            //     if (this.debug) console.log("Crit: " + risk.name);
            //
            //     // For each ALTERNATIVE run calculations and update data model
            //     $.each(data.alternatives, function(index, alternative) {
            //         // CALCULATE Mni for each RISK/ALTERNATIVE //////////////////
            //         var convert_alternative_weight = risk.alternativeWeights[index] * 0.01;
            //         // Temp store converted weight for later calculations
            //         converted_alternative_weights.push(convert_alternative_weight);
            //         // RISK WEIGHT * ALTERNATIVE WEIGHT (convert from percentages)
            //         var calc = ((risk.weight * 0.01) * convert_alternative_weight);
            //         // Add result to temp array, rounded to 3 decimal places
            //         MNI_result.push(calc);
            //     });
            //
            //     // update data model
            //     risk.Mni = MNI_result; // records Mni results
            //
            //     // CALCULATE M for each RISK ////////////////////////////////////
            //     // 1-(sum of MNI_results);
            //     var M_result = 1 - (MNI_result.reduce(_this.getSum));
            //     // update data model, rounded to 3 decimal places
            //     risk.M = M_result;
            //
            //     // CALCULATE Ml for each RISK ////////////////////////////////////
            //     // 1-(RISK WEIGHT (convert from percentage));
            //     risk.Ml = 1 - (risk.weight * 0.01);
            //
            //     // CALCULATE Mdash for each RISK ////////////////////////////////////
            //     // RISK WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
            //     var Mdash_result = (risk.weight * 0.01) * (1 - (converted_alternative_weights.reduce(_this.getSum)));
            //     risk.Mdash = Mdash_result;
            //
            //     if (this.debug) console.log("MNI: " + risk.Mni);
            //     if (this.debug) console.log("M: " + risk.M);
            //     if (this.debug) console.log("Ml: " + risk.Ml);
            //     if (this.debug) console.log("Mdash: " + risk.Mdash);
            // });
        });
    }

    // Calculate K value for each CATEGORY (row 53)
    calcK() {
        var _this = this;
        var data = this.data;
        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC K - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var risk_results = []; // capture results from each ALTERNATIVE loop - to be summed for final risk_result

            // Calculate weighting relationships
            // Loop for each ALTERNATIVE to capture risk data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (this.debug) console.log("Alternative loop: " + alternative);

                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)

                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexCrit, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.Mni[indexAlt] + risk.Ml + risk.Mdash;
                    risk_calcs.push(temp_calc);
                });

                if (this.debug) console.log("risk_calcs: " + risk_calcs);
                // Multiply all results from risk_calcs and push total to risk_results
                risk_results.push(risk_calcs.reduce(_this.getProduct));
                if (this.debug) console.log("risk_results: " + risk_results);
            });

            // Sum all subtotals from risk_results for single risk_results
            var risk_result = risk_results.reduce(_this.getSum);
            if (this.debug) console.log("risk_result: " + risk_result);

            // Calculate M value relationships
            var m_relationships = _this.calcCategoryMrealtionships(category);
            if (this.debug) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (risk_result - 2 * m_relationships)
            category.K = k_result.toFixedNumber(3);
            if (this.debug) console.log("k_result: " + category.K);
        });
    }

    // Calculate M values for each ALTERNATIVE in Category (row 56)
    calcMalternatives() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC Malt - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var risk_result = 0; // capture results from each ALTERNATIVE loop - use in final Malt calc
            var Malt_array = []; // stores Malt values to set category.Malt at end

            // loop for each ALTERNATIVE, calculate Malt (row 56) amd push to data.Malt array
            // Loop for each ALTERNATIVE to capture risk data
            $.each(data.alternatives, function(indexAlt, alternative) {
                if (this.debug) console.log("Alternative loop: " + alternative);

                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexCrit, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.Mni[indexAlt] + risk.Ml + risk.Mdash;
                    risk_calcs.push(temp_calc);
                });
                if (this.debug) console.log("risk_calcs: " + risk_calcs);
                // Multiply all results from risk_calcs and push total to risk_results
                risk_result = risk_calcs.reduce(_this.getProduct);
                if (this.debug) console.log("risk_result: " + risk_result);

                // Calculate Malt for this ALTERNATIVE and push to data.Malt
                var Malt_result = category.K * (risk_result - _this.calcCategoryMrealtionships(category));
                Malt_array.push(Malt_result);
            });
            category.Malt = Malt_array;
            if (this.debug) console.log("category.Malt: " + category.Malt);
        });
    }

    // Calculate M dash H value for CATEGORY (row 63)
    calcMdashH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC MdashH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for CATEGORY and set data.MdashH
            var MdashH_result = (category.K * (_this.calcCategoryMrealtionships(category) - _this.calcMlProduct(category)));
            category.MdashH = MdashH_result;
            if (this.debug) console.log("category.MdashH: " + category.MdashH);
        });
    }

    // Calculate Ml H value for CATEGORY (row 66)
    calcMlH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC calcMlH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MlH for CATEGORY and set data.MlH
            var MlH_result = (category.K * _this.calcMlProduct(category));
            category.MlH = MlH_result;
            if (this.debug) console.log("category.MdashH: " + category.MlH);
        });
    }

    // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
    calcBeliefs() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC Beliefs - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var belief_array = [];
            // Loop for each ALTERNATIVE, calculate belief and push to belief_array
            $.each(data.alternatives, function(indexAlt, alternative) {
                var belief_result = category.Malt[indexAlt] / (1 - category.MlH);
                belief_array.push(belief_result);
            });
            category.Beliefs = belief_array;

        });
    }

    // Calculate level of ignorance associated with ALTERNATIVES of this CATEGORY (row 77)
    calcIgnorance() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC Ignorance - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            var ignorance_result = category.MdashH / (1 - category.MlH);
            category.Ignorance = ignorance_result;
            if (this.debug) console.log("category.Ignorance: " + category.Ignorance);
        });

    }




    // RESULTS PAGE calculations
    // Calculate aggregated M values (summary sheet row 41)
    // M n,i for each category relating to each alternative (summary sheet row 41) - alternative belief*category weight
    // M value for each risk (summary sheet row 52) - 1-(sum Mni values)
    // Ml value for each risk (summary sheet row 63) - 1-(category weight (convert from percentage)
    // Mdash value for each risk (summary sheet row 74) - category weight * (1-(sum(alternative beliefs)))
    calcAggregatedMvalues() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (this.debug) console.log("\nCALC Aggregated M values - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

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

            if (this.debug) console.log("MNI: " + category.Mni);
            if (this.debug) console.log("M: " + category.M);
            if (this.debug) console.log("Ml: " + category.Ml);
            if (this.debug) console.log("Mdash: " + category.Mdash);
        });
    }

    // Calculate K value for each CATEGORY (summary sheet row 85)
    calcAggregatedK() {
        var _this = this;
        var data = this.data;

        var risk_results = []; // capture results from each ALTERNATIVE loop - to be summed for final risk_result
        var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result

        // Calculate weighting relationships
        // Loop for each ALTERNATIVE to capture risk data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (this.debug) console.log("\nCALC AGG K - Alternative loop: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var category_calcs = []; // Capture calc (Mni+Ml+Mdash)

            // Loop through all CATEGORIES, capture data, perform calculation and push to risk_calcs
            $.each(data.categories, function(index, category) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = category.Mni[indexAlt] + category.Ml + category.Mdash;
                category_calcs.push(temp_calc);
            });

            if (this.debug) console.log("risk_calcs: " + category_calcs);
            // Multiply all results from risk_calcs and push total to risk_results
            category_results.push(category_calcs.reduce(_this.getProduct));
            if (this.debug) console.log("risk_results: " + category_results);
        });

        // Sum all subtotals from risk_results for single risk_results
        var category_result = category_results.reduce(_this.getSum);
        if (this.debug) console.log("risk_result: " + category_result);

        // Calculate M value relationships
        var m_relationships = _this.calcProjectMrealtionships(data);
        if (this.debug) console.log("m_relationships: " + m_relationships);

        // Final K calculation
        var k_result = 1 / (category_result - 2 * m_relationships)
        data.K = k_result;
        if (this.debug) console.log("k_result: " + data.K);

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
        // Loop for each ALTERNATIVE to capture risk data
        $.each(data.alternatives, function(indexAlt, alternative) {
            if (this.debug) console.log("\nCALC Malt - Alternative: " + alternative + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var category_calcs = []; // Capture calc (Mni+Ml+Mdash)
            // For each RISK, capture data, perform calculation and push to risk_calcs
            $.each(data.categories, function(index, category) {
                var temp_calc; // Capture calc (Mni+Ml+Mdash)
                temp_calc = category.Mni[indexAlt] + category.Ml + category.Mdash;
                category_calcs.push(temp_calc);
            });
            if (this.debug) console.log("category_calcs: " + category_calcs);
            // Multiply all results from risk_calcs and push total to risk_results
            var category_result = category_calcs.reduce(_this.getProduct);
            if (this.debug) console.log("category_result: " + category_result);

            // Calculate Malt for this ALTERNATIVE and push to data.Malt
            var Malt_result = data.K * (category_result - _this.calcProjectMrealtionships(data));
            Malt_array.push(Malt_result);
        });
        data.Malt = Malt_array;
        if (this.debug) console.log("data.Malt: " + data.Malt);
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

        // Loop for each ALTERNATIVE to capture risk data
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
        data.IgnoranceSplit = data.Ignorance / data.alternatives.length;
    }



    // MINI FUNCTIONS
    // Repeat operations used in multiple calculations

    // Calculate relationships between Ml and Mdash values for each RISK in a CATEGORY and return the product
    // Used in calcK() and calcMalternatives()
    calcCategoryMrealtionships(category) {
        var _this = this;
        var m_results = []; // capture results from each RISK loop - to be multiplied for final m_result
        $.each(category.risks, function(indexCrit, risk) {
            m_results.push(risk.Ml + risk.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate relationships between Ml and Mdash values for each CATEGORY in a PROJECT and return the product
    // Used in calcK() and calcMalternatives()
    calcProjectMrealtionships(project) {
        var _this = this;
        var m_results = []; // capture results from each RISK loop - to be multiplied for final m_result
        $.each(project.categories, function(index, category) {
            m_results.push(category.Ml + category.Mdash);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each RISK) in a CATEGORY
    calcMlProduct(category) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each RISK - calc product for final calc
        // Loop through each RISK of each CATEGORY - calculate sum of Ml values from each RISK
        $.each(category.risks, function(index, risk) {
            Ml_values.push(risk.Ml);
        });
        return Ml_values.reduce(_this.getProduct);
    }

    // Calculate and return the product of all Ml values (one for each CATEGORY) in a PROJECT
    calcProjectMlProduct(project) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each RISK - calc product for final calc
        // Loop through each RISK of each CATEGORY - calculate sum of Ml values from each RISK
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


}

// // Call using .toFixedNumber(3) for 3 decimal places
// Number.prototype.toFixedNumber = function(x, base) {
//     var pow = Math.pow(base || 10, x);
//     return +(Math.round(this * pow) / pow);
// }
