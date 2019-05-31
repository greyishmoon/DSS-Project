// DSS model for all RISK ANALYSIS calculations
// (Row references relate to DSS RISK ANALYSIS WITH GUIDANCE / FINANCIAL RISKS sheet)


class DSS_RA_model {
    constructor() {
        // Switch to turn on/off all calculation log statements
        this.debug = false;
        // Int to activate specific calculation log statments
        // 1 = calcMvalues, 2 = calcK, 3 - calcMalternatives, 4 = calcMdashH, 5 = calcMlH, 6 = calcBeliefs,  7 = calcAggregatedMvalues, 8 = calcAggregatedK, 9 = calcAggregatedMalternatives, 10 = calcAggregatedMdashH, 11 = calcAggregatedMlH, 12 = calcAggregatedBeliefs, 13 = calcAggregatedIgnorance, 14 = calcRiskLevels, 15 = calcObjectiveMvalues, 16 = calcObjectiveK, 17 = calcObjectiveMalternatives, 18 = calcObjectiveMdashH, 19 = calcObjectiveMlH, 20 = calcObjectiveBeliefs, 21 = calcObjectiveRiskLevels, 22 = calcProjectMvalues, 23 = calcProjectK, 24 = calcProjectMalternatives, 25 = calcProjectMdashH, 26 = calcProjectMlH, 27 = calcProjectBeliefs, 28 = calcProjectRiskLevels
        this.debugCalc = 0;
    }

    // Perform results calculation on project and update project data object with results
    resultsCalc(data) {
        // DATA is PROJECT object for RISK ANALYSIS
        this.data = data;
        // Calculate M values for each RISK (Mni and M and Ml and Mdash) (row 17 + 26 + 35 + 44)
        this.calcMvalues();
        // Calculate K value for CATEGORY (row 53)
        this.calcK();
        // Calculate M values for each ALTERNATIVE in Category (row 66)
        this.calcMalternatives();
        // Calculate M dash H value for CATEGORY (row 63)
        this.calcMdashH();
        // Calculate Ml H value for CATEGORY (row 66)
        this.calcMlH();
        // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
        this.calcBeliefs();

        // RISK ASSESSMENT PAGE calculations
        // Calculate array of M n,i relating to each category (row 135 + 142 + 149 + 156)
        this.calcAggregatedMvalues();
        // Calculate K value for each CATEGORY (row 163)
        this.calcAggregatedK();
        // Calculate aggregated M values for each CATEGORY (row 165)
        this.calcAggregatedMalternatives();
        // Calculate aggregated M dash H value for each CATEGORY (row 174)
        this.calcAggregatedMdashH();
        // Calculate aggregated Ml H value for each CATEGORY (row 177)
        this.calcAggregatedMlH();
        // Calculate array of aggregated Beliefs for each GRADE in CATEGORY (row 182)
        this.calcAggregatedBeliefs();
        // Calculate aggregated level of ignorance CATEGORY (row 190)
        this.calcAggregatedIgnorance();
        // Calculate risk levels for CATEGORY (row 205)
        this.calcRiskLevels();

        // SUMMARY PAGE calculations
        // Calculate arrays of M values relating to each category at objective level (Summary page rows 53, 64 + 75)
        this.calcObjectiveMvalues();
        // Calculate K value for each AREA @ Project level(Summary page row 86)
        this.calcObjectiveK();
        // Calculate Malt values for each GRADE in each AREA (Summary page row 89)
        this.calcObjectiveMalternatives();
        // Calculate Mdash values for each each AREA (Summary page row 98)
        this.calcObjectiveMdashH();
        // Calculate MlH values for each each AREA (Summary page row 101)
        this.calcObjectiveMlH();
        // Calculate array of  Beliefs for each GRADE in each AREA (Summary page row 104)
        this.calcObjectiveBeliefs();
        // Calculate Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 133)
        this.calcObjectiveRiskLevels();

        // RESULTS PAGE calculations
        // Calculate arrays of M values relating to each category at project level (Summary page rows 167, 174 + 181)
        this.calcProjectMvalues();
        // Calculate K value for each AREA @ Project level(Summary page row 195)
        this.calcProjectK();
        // Calculate Malt values for each GRADE in each AREA (Summary page row 197)
        this.calcProjectMalternatives();
        // Calculate Mdash values for each each AREA (Summary page row 206)
        this.calcProjectMdashH();
        // Calculate MlH values for each each AREA (Summary page row 209)
        this.calcProjectMlH();
        // Calculate array of  Beliefs for each GRADE in each AREA (Summary page row 214)
        this.calcProjectBeliefs();
        // Calculate Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 238)
        this.calcProjectRiskLevels();
    }

    // Calculates the following M values:
    // Probability for each risk (T20,22,24,26) - Average for factors Coefficient of Project Features, Controllability + Dependency
    // M n,i for each risk relating to each alternative (row 29) - alternative weight*risk weight
    // M value for each risk (row 22 Column T) - 1-(sum Mni values)
    // Ml value for each risk (row 35) - 1-(RISK WEIGHT (convert from percentage)
    // Mdash value for each risk (row 44) - RISK WEIGHT * (1-(sum(ALTERNATIVE WEIGHTS)))
    calcMvalues() {
        var _this = this;
        var data = this.data;

        if (_this.debug || _this.debugCalc === 1) console.log("CALC M VALUES >>>>>>>>>>>>>>>>>>>");
        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 1) console.log("\nCALC M - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            // Loop through each RISK of CATEGORY - run calculations and update data model
            $.each(category.risks, function(index, risk) {
                if (_this.debug || _this.debugCalc === 1) console.log("\nRISK >>>: " + risk.name);
                // CALCULATE MNI for each RISK ////////////////////////////////////
                // Average for factors Coefficient of Project Features, Controllability + Dependency
                risk.probability = (_this.fromPercent(risk.coefficient) + _this.fromPercent(risk.controllability) + _this.fromPercent(risk.dependency)) / 3;
                // CALCULATE individual distributed ASSESSMENTS for each RISK ////////////////////////////////////
                var WeightedZero = (1 - _this.fromPercent(risk.occurrence) * risk.probability);
                risk.WeightedCost[0] = WeightedZero;
                risk.WeightedDuration[0] = WeightedZero;
                risk.WeightedQuality[0] = WeightedZero;
                // Zero Mni value  - same for each GRADE in RISK - assign to element 0 of each weighted array
                var MniZero = (1 - _this.fromPercent(risk.occurrence) * risk.probability) * _this.fromPercent(risk.weight);
                risk.MniCost[0] = MniZero;
                risk.MniDuration[0] = MniZero;
                risk.MniQuality[0] = MniZero;
                // Loop over 3 project grade (1%, 2% + 3%) and add to arrays in alements 1-3 (element 0 is o% value)
                for (var i = 1; i < 4; i++) {
                    // CALCULATE WEIGHTED RISK (sub calc for later)
                    risk.WeightedCost[i] = _this.fromPercent(risk.occurrence) * risk.probability * _this.fromPercent(risk.costImpact[i - 1]);
                    risk.WeightedDuration[i] = _this.fromPercent(risk.occurrence) * risk.probability * _this.fromPercent(risk.durationImpact[i - 1]);
                    risk.WeightedQuality[i] = _this.fromPercent(risk.occurrence) * risk.probability * _this.fromPercent(risk.qualityImpact[i - 1])

                    // CALCULATE MNI values
                    risk.MniCost[i] = risk.WeightedCost[i] * _this.fromPercent(risk.weight);
                    risk.MniDuration[i] = risk.WeightedDuration[i] * _this.fromPercent(risk.weight);
                    risk.MniQuality[i] = risk.WeightedQuality[i] * _this.fromPercent(risk.weight);

                }
                if (_this.debug || _this.debugCalc === 1) console.log("Weighted Values: " + risk.WeightedCost + ": " + risk.WeightedDuration + ": " + risk.WeightedQuality);
                if (_this.debug || _this.debugCalc === 1) console.log("Mni Values: " + risk.MniCost + ": " + risk.MniDuration + ": " + risk.MniQuality);

                // CALCULATE M for each GRADE in RISK ////////////////////////////////////
                // 1-(sum of MNI_results) (MniZero + MniCost + MniDuration + MniQuality);
                risk.M[0] = 1 - ((risk.MniCost.reduce(_this.getSum)));
                risk.M[1] = 1 - ((risk.MniDuration.reduce(_this.getSum)));
                risk.M[2] = 1 - ((risk.MniQuality.reduce(_this.getSum)));
                if (_this.debug || _this.debugCalc === 1) console.log("M values: " + risk.M);

                // CALCULATE Ml for each RISK (same for each grade) ////////////////////////////////////
                // 1-(RISK WEIGHT (convert from percentage));
                risk.Ml = 1 - _this.fromPercent(risk.weight);
                if (_this.debug || _this.debugCalc === 1) console.log("Ml: " + risk.Ml);

                // CALCULATE Mdash for each GRADE in RISK ////////////////////////////////////
                // RISK WEIGHT * (1-(sum(GRADE WEIGHTS (inc zero))))
                // COST Mdash (risk.Mdash[0])
                risk.Mdash[0] = _this.fromPercent(risk.weight) * (1 - (risk.WeightedCost.reduce(_this.getSum)));
                risk.Mdash[1] = _this.fromPercent(risk.weight) * (1 - (risk.WeightedDuration.reduce(_this.getSum)));
                risk.Mdash[2] = _this.fromPercent(risk.weight) * (1 - (risk.WeightedQuality.reduce(_this.getSum)));
                if (_this.debug || _this.debugCalc === 1) console.log("Mdash values: " + risk.Mdash);
            });
        });
    }

    // Calculate K value for each GRADE in RISK (row 64)
    calcK() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 2) console.log("CALC K VALUES >>>>>>>>>>>>>>>>>>>");
        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 2) console.log("\nCALC K - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate weighting relationships for COST CATEGORY >>>>>>
            var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                if (_this.debug || _this.debugCalc === 2) console.log("GRADE LOOP: " + indexGrade);
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexCrit, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniCost[indexGrade] + risk.Ml + risk.Mdash[0];
                    risk_calcs.push(temp_calc);
                });
                if (_this.debug || _this.debugCalc === 2) console.log("risk_calcs: " + risk_calcs);
                // Multiply all results from risk_calcs and push total to risk_results
                risk_results.push(risk_calcs.reduce(_this.getProduct));
                if (_this.debug || _this.debugCalc === 2) console.log("risk_results: " + risk_results);
            }
            // Sum all subtotals from risk_results for single risk_results
            var risk_result = risk_results.reduce(_this.getSum);
            if (_this.debug || _this.debugCalc === 2) console.log("risk_result: " + risk_result);

            // Calculate M value relationships
            var m_relationships = _this.calcCategoryMrealtionships(category, 0);
            if (_this.debug || _this.debugCalc === 2) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (risk_result - 3 * m_relationships)
            category.K[0] = k_result;

            // Calculate weighting relationships for DURATION CATEGORY >>>>>>
            risk_results = []; // capture results from each RISK loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                if (_this.debug || _this.debugCalc === 2) console.log("GRADE LOOP: " + indexGrade);
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexRisk, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniDuration[indexGrade] + risk.Ml + risk.Mdash[1];
                    risk_calcs.push(temp_calc);
                });
                if (_this.debug || _this.debugCalc === 2) console.log("risk_calcs: " + risk_calcs);
                // Multiply all results from risk_calcs and push total to risk_results
                risk_results.push(risk_calcs.reduce(_this.getProduct));
                if (_this.debug || _this.debugCalc === 2) console.log("risk_results: " + risk_results);
            }
            // Sum all subtotals from risk_results for single risk_results
            var risk_result = risk_results.reduce(_this.getSum);
            if (_this.debug || _this.debugCalc === 2) console.log("risk_result: " + risk_result);

            // Calculate M value relationships
            var m_relationships = _this.calcCategoryMrealtionships(category, 1);
            if (_this.debug || _this.debugCalc === 2) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (risk_result - 3 * m_relationships)
            category.K[1] = k_result;

            // Calculate weighting relationships for QUALITY CATEGORY >>>>>>
            risk_results = []; // capture results from each RISK loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                if (_this.debug || _this.debugCalc === 2) console.log("GRADE LOOP: " + indexGrade);
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexRisk, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniQuality[indexGrade] + risk.Ml + risk.Mdash[2];
                    risk_calcs.push(temp_calc);
                });
                if (_this.debug || _this.debugCalc === 2) console.log("risk_calcs: " + risk_calcs);
                // Multiply all results from risk_calcs and push total to risk_results
                risk_results.push(risk_calcs.reduce(_this.getProduct));
                if (_this.debug || _this.debugCalc === 2) console.log("risk_results: " + risk_results);
            }
            // Sum all subtotals from risk_results for single risk_results
            var risk_result = risk_results.reduce(_this.getSum);
            if (_this.debug || _this.debugCalc === 2) console.log("risk_result: " + risk_result);

            // Calculate M value relationships
            var m_relationships = _this.calcCategoryMrealtionships(category, 2);
            if (_this.debug || _this.debugCalc === 2) console.log("m_relationships: " + m_relationships);

            // Final K calculation
            var k_result = 1 / (risk_result - 3 * m_relationships)
            category.K[2] = k_result.toFixedNumber(3);
            if (_this.debug || _this.debugCalc === 2) console.log("k_result: " + category.K);
        });

    }

    // Calculate M values for each ALTERNATIVE in Category (row 75)
    calcMalternatives() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 3) console.log("\nCALC Malt - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate weighting relationships for COST area >>>>>>
            var risk_results = []; // capture results from each RISK loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexRisk, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniCost[indexGrade] + risk.Ml + risk.Mdash[0];
                    risk_calcs.push(temp_calc);
                });
                // Multiply all results from risk_calcs
                var risk_result = (risk_calcs.reduce(_this.getProduct));
                // Calculate Malt for this AREA and push to data.Malt
                category.Malt[0][indexGrade] = category.K[0] * (risk_result - _this.calcCategoryMrealtionships(category, 0));
            }


            // Calculate weighting relationships for DURATION area >>>>>>
            var risk_results = []; // capture results from each RISK loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexRisk, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniDuration[indexGrade] + risk.Ml + risk.Mdash[1];
                    risk_calcs.push(temp_calc);
                });
                // Multiply all results from risk_calcs
                var risk_result = (risk_calcs.reduce(_this.getProduct));
                // Calculate Malt for this AREA and push to data.Malt
                category.Malt[1][indexGrade] = category.K[1] * (risk_result - _this.calcCategoryMrealtionships(category, 1));
            }


            // Calculate weighting relationships for QUALITY area >>>>>>
            var risk_results = []; // capture results from each RISK loop - to be summed for final risk_result
            // Loop for each GRADE to capture risk data
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                var risk_calcs = []; // Capture calc (Mni+Ml+Mdash)
                // For each RISK, capture data, perform calculation and push to risk_calcs
                $.each(category.risks, function(indexRisk, risk) {
                    var temp_calc; // Capture calc (Mni+Ml+Mdash)
                    temp_calc = risk.MniQuality[indexGrade] + risk.Ml + risk.Mdash[2];
                    risk_calcs.push(temp_calc);
                });
                // Multiply all results from risk_calcs
                var risk_result = (risk_calcs.reduce(_this.getProduct));
                // Calculate Malt for this AREA and push to data.Malt
                category.Malt[2][indexGrade] = category.K[2] * (risk_result - _this.calcCategoryMrealtionships(category, 2));
            }

            if (_this.debug || _this.debugCalc === 3) console.log("category.Malt: " + category.Malt);
        });
    }

    // Calculate M dash H value for each AREA in CATEGORY (row 63)
    calcMdashH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 4) console.log("\nCALC MdashH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for COST area and set data.MdashH
            category.MdashH[0] = (category.K[0] * (_this.calcCategoryMrealtionships(category, 0) - _this.calcMlProduct(category)));
            // Calculate MdashH for DURATION area and set data.MdashH
            category.MdashH[1] = (category.K[1] * (_this.calcCategoryMrealtionships(category, 1) - _this.calcMlProduct(category)));
            // Calculate MdashH for QUALITY area and set data.MdashH
            category.MdashH[2] = (category.K[2] * (_this.calcCategoryMrealtionships(category, 2) - _this.calcMlProduct(category)));

            if (_this.debug || _this.debugCalc === 4) console.log("category.MdashH: " + category.MdashH);
        });
    }

    // Calculate Ml H value for CATEGORY (row 66)
    calcMlH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 5) console.log("\nCALC calcMlH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for COST area and set data.MdashH
            category.MlH[0] = (category.K[0] * _this.calcMlProduct(category));
            // Calculate MdashH for DURATION area and set data.MdashH
            category.MlH[1] = (category.K[1] * _this.calcMlProduct(category));
            // Calculate MdashH for QUALITY area and set data.MdashH
            category.MlH[2] = (category.K[2] * _this.calcMlProduct(category));

            if (_this.debug || _this.debugCalc === 5) console.log("category.MlH: " + category.MlH);
        });
    }

    // Calculate array of Beliefs relating to each ALTERNATIVE (row 71)
    calcBeliefs() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 6) console.log("\nCALC Beliefs - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate beliefs for each area >>>>>>
            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                // Loop for each GRADE to capture risk data
                for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                    category.Beliefs[indexArea][indexGrade] = category.Malt[indexArea][indexGrade] / (1 - category.MlH[indexArea]);
                }
            }

            if (_this.debug || _this.debugCalc === 6) console.log("\ncategory.Beliefs: " + category.Beliefs);

            // Calc IGNORANCE for each area
            for (var i = 0; i < 3; i++) {
                category.Ignorance[i] = _this.roundTo3(category.MdashH[i] / (1 - category.MlH[i]))
            }
            if (_this.debug || _this.debugCalc === 6) console.log("\ncategory.Ignorance: " + category.Ignorance);

            // verify COST beliefs sum to 1
            var total = 0;
            for (var i = 0; i < 4; i++) {
                total += category.Beliefs[0][i];
            }
            total += category.Ignorance[0];
            if (_this.debug || _this.debugCalc === 6) console.log("check COST total: " + total);
            // verify DURATION beliefs sum to 1
            total = 0;
            for (var i = 0; i < 4; i++) {
                total += category.Beliefs[1][i];
            }
            total += category.Ignorance[1];
            if (_this.debug || _this.debugCalc === 6) console.log("check DURATION total: " + total);
            // verify QUALITY beliefs sum to 1
            total = 0;
            for (var i = 0; i < 4; i++) {
                total += category.Beliefs[2][i];
            }
            total += category.Ignorance[2];
            if (_this.debug || _this.debugCalc === 6) console.log("check QUALITY total: " + total);

        });
    }

    // Calculate Aggregated M values (rows 135,142, 149, 156)
    calcAggregatedMvalues() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 7) console.log("\nCALC AggregatedMvalues - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate aggregated M n,i for each area >>>>>>
            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                // Loop for each GRADE
                for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                    // Calculate Mni_Cat
                    category.Mni_Cat[indexArea][indexGrade] = category.Beliefs[indexArea][indexGrade] * _this.fromPercent(category.AreaWeights[indexArea]);

                    // Calculate M_Cat values
                    category.M_Cat[indexArea] = 1 - (category.Mni_Cat[indexArea].reduce(_this.getSum));

                    // Calculate Ml_Cat values
                    category.Ml_Cat[indexArea] = 1 - _this.fromPercent(category.AreaWeights[indexArea]);

                    // Calculate Mdash_Cat values
                    category.Mdash_Cat[indexArea] = _this.fromPercent(category.AreaWeights[indexArea]) * (1 - (category.Beliefs[indexArea].reduce(_this.getSum)));
                }
            }
            if (_this.debug || _this.debugCalc === 7) console.log("\ncategory.Mni_Cat: " + category.Mni_Cat);
            if (_this.debug || _this.debugCalc === 7) console.log("\ncategory.M_Cat: " + category.M_Cat);
            if (_this.debug || _this.debugCalc === 7) console.log("\ncategory.Ml_Cat: " + category.Ml_Cat);
            if (_this.debug || _this.debugCalc === 7) console.log("\ncategory.Mdash_Cat: " + category.Mdash_Cat);
        });
    }

    // Calculate K value for each CATEGORY (row 163)
    calcAggregatedK() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 8) console.log("\nCALC AggregatedK - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result
            var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result

            // Calculate agg_risk_results
            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {

                var sub_calcs = []; // 3 sub calc results to be multliplied then pushed to risk_results (for final summing)
                // Loop for each AREA
                for (var indexArea = 0; indexArea < 3; indexArea++) {
                    sub_calcs.push(category.Mni_Cat[indexArea][indexGrade] + category.Ml_Cat[indexArea] + category.Mdash_Cat[indexArea]);
                }
                risk_results.push(sub_calcs.reduce(_this.getProduct));
            }
            if (_this.debug || _this.debugCalc === 8) console.log("\nrisk_results: " + risk_results);
            var risk_result = risk_results.reduce(_this.getSum);
            if (_this.debug || _this.debugCalc === 8) console.log("risk_result: " + risk_result);

            // Calculate category_result
            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                category_results.push(category.Ml_Cat[indexArea] + category.Mdash_Cat[indexArea])
            }
            if (_this.debug || _this.debugCalc === 8) console.log("\ncategory_results: " + category_results);
            var category_result = category_results.reduce(_this.getProduct);
            if (_this.debug || _this.debugCalc === 8) console.log("category_result: " + category_result);

            // Calculate K
            category.K_cat = 1 / (risk_result - 3 * category_result);
            if (_this.debug || _this.debugCalc === 8) console.log("category K_cat: " + category.K_cat);

        });

    }

    // Calculate aggregated M values for each CATEGORY (row 165)
    calcAggregatedMalternatives() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 9) console.log("\nCALC AggregatedMalternatives - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate agg_risk_results
            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result
                var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result

                // Loop for each AREA
                for (var indexArea = 0; indexArea < 3; indexArea++) {
                    risk_results.push(category.Mni_Cat[indexArea][indexGrade] + category.Ml_Cat[indexArea] + category.Mdash_Cat[indexArea]);
                    category_results.push(category.Ml_Cat[indexArea] + category.Mdash_Cat[indexArea]);
                }
                // if (_this.debug || _this.debugCalc === 9) console.log("\nrisk_results: " + risk_results);
                var risk_result = risk_results.reduce(_this.getProduct);
                // if (_this.debug || _this.debugCalc === 9) console.log("risk_result: " + risk_result);
                // if (_this.debug || _this.debugCalc === 9) console.log("\category_results: " + category_results);
                var category_result = category_results.reduce(_this.getProduct);
                // if (_this.debug || _this.debugCalc === 9) console.log("category_result: " + category_result);

                // Calculate AggregatedMalternative and add to array
                category.Malt_cat[indexGrade] = category.K_cat * (risk_result - category_result);
            }
            if (_this.debug || _this.debugCalc === 9) console.log("category.Malt_cat: " + category.Malt_cat);
        });
    }

    // Calculate aggregated M dash H value for each CATEGORY (row 174)
    calcAggregatedMdashH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 10) console.log("\nCALC Aggregated MdashH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MdashH for CATEGORY and set data.MdashH
            category.MdashH_cat = (category.K_cat * (_this.calcAreaMrealtionships(category, 0) - category.Ml_Cat.reduce(_this.getProduct)));
            // if (_this.debug || _this.debugCalc === 10) console.log("data.MdashH: " + data.MdashH);

            if (_this.debug || _this.debugCalc === 10) console.log("category.MdashH_cat: " + category.MdashH_cat);
        });
    }

    // Calculate aggregated Ml H value for each CATEGORY (row 177)
    calcAggregatedMlH() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 11) console.log("\nCALC Aggregated MdashH - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            category.Ml_cat = (category.K_cat * category.Ml_Cat.reduce(_this.getProduct));
            if (_this.debug || _this.debugCalc === 11) console.log("category.Ml_cat: " + category.Ml_cat);
        });
    }

    // Calculate array of aggregated Beliefs for each GRADE in CATEGORY (row 182)
    calcAggregatedBeliefs() {
        var _this = this;
        var data = this.data;
        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 12) console.log("\nCALC Aggregated Beliefs - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                category.Beliefs_cat[indexGrade] = category.Malt_cat[indexGrade] / (1 - category.Ml_cat);
            }
            if (_this.debug || _this.debugCalc === 12) console.log("category.Beliefs_cat: " + category.Beliefs_cat);
        });
    }

    // Calculate aggregated level of ignorance CATEGORY (row 190)
    calcAggregatedIgnorance() {
        var _this = this;
        var data = this.data;
        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 13) console.log("\nCALC Aggregated Ignorance - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                category.Ignorance_cat = category.MdashH_cat / (1 - category.Ml_cat);
            }
            if (_this.debug || _this.debugCalc === 13) console.log("category.Ignorance_cat: " + category.Ignorance_cat);
        });
    }

    // Calculate risk levels for CATEGORY (row 205)
    calcRiskLevels() {
        var _this = this;
        var data = this.data;
        // var grades = data.grades;
        var cost = data
        // Loop through all CATEGORIES
        $.each(data.categories, function(indexCategory, category) {
            if (_this.debug || _this.debugCalc === 14) console.log("\nCALC Risk Levels - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate MINIMUM risk level
            category.RiskLevels_cat[0] = (category.Beliefs_cat[1] + category.Ignorance_cat) *
                data.grades[0] + category.Beliefs_cat[2] *
                data.grades[1] + category.Beliefs_cat[3] *
                data.grades[2];

            // Calculate MAXIMUM risk level
            category.RiskLevels_cat[1] = category.Beliefs_cat[1] *
                data.grades[0] + category.Beliefs_cat[2] *
                data.grades[1] + (category.Beliefs_cat[3] + category.Ignorance_cat) *
                data.grades[2];

            // Calculate AVERAGE risk level
            category.RiskLevels_cat[2] = (category.RiskLevels_cat[0] + category.RiskLevels_cat[1]) / 2;

            if (_this.debug || _this.debugCalc === 14) console.log("category.RiskLevels_cat: " + category.RiskLevels_cat);

            // Calc potential cost impact on project
            // category.costImpact_cat = category.RiskLevels_cat[2] * data.cost / 100;
            category.costImpact_cat[0] = category.RiskLevels_cat[0] * data.cost / 100;
            category.costImpact_cat[1] = category.RiskLevels_cat[1] * data.cost / 100;
            category.costImpact_cat[2] = category.RiskLevels_cat[2] * data.cost / 100;
            if (_this.debug || _this.debugCalc === 14) console.log("category.costImpact_cat: " + category.costImpact_cat);
        });
    }



    // Calculate M for each area @ objective level  (Summary page row 53)
    calcObjectiveMvalues() {
        var _this = this;
        var data = this.data;

        // Loop through all CATEGORIES
        $.each(data.categories, function(index, category) {
            if (_this.debug || _this.debugCalc === 15) console.log("\nCALC ObjectiveMvalues - Category: " + category.name + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            // Calculate aggregated M n,i for each area >>>>>>
            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                // Loop for each GRADE
                for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                    // Calculate Mni_obj
                    category.Mni_obj[indexArea][indexGrade] = category.Beliefs[indexArea][indexGrade] * _this.fromPercent(category.CategoryWeight);
                }
                // if (_this.debug || _this.debugCalc === 15) console.log("\ncategory.Mni_obj: " + category.Mni_obj);

                // Calculate M_obj values
                category.M_obj[indexArea] = 1 - (category.Mni_obj[indexArea].reduce(_this.getSum));

                // Calculate Ml_Cat values
                category.Ml_obj[indexArea] = 1 - _this.fromPercent(category.CategoryWeight);

                // Calculate Mdash_Cat values
                category.Mdash_obj[indexArea] = _this.fromPercent(category.CategoryWeight) * (1 - (category.Beliefs[indexArea].reduce(_this.getSum)));

            }
            if (_this.debug || _this.debugCalc === 15) console.log("\ncategory.M_obj: " + category.M_obj);
            if (_this.debug || _this.debugCalc === 15) console.log("category.Ml_obj: " + category.Ml_obj);
            if (_this.debug || _this.debugCalc === 15) console.log("category.Mdash_obj: " + category.Mdash_obj);
        });
    }

    // Calculate K value for each AREA (summary sheet row 86)
    calcObjectiveK() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 16) console.log("\nCALC ObjectiveK - Project level  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {

            var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result
            var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result

            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {

                var risk_sub_calcs = []; // 3 sub calc results to be multliplied then pushed to risk_results (for final summing)

                // Loop through all CATEGORIES
                $.each(data.categories, function(indexCategory, category) {
                    risk_sub_calcs.push(category.Mni_obj[indexArea][indexGrade] + category.Ml_obj[indexArea] + category.Mdash_obj[indexArea]);
                });
                risk_results.push(risk_sub_calcs.reduce(_this.getProduct));
            }
            var risk_result = risk_results.reduce(_this.getSum);
            // if (_this.debug || _this.debugCalc === 16) console.log("\nrisk_result: " + risk_result);

            // Loop through all CATEGORIES
            $.each(data.categories, function(indexCategory, category) {
                category_results.push(category.Ml_obj[indexArea] + category.Mdash_obj[indexArea])

            });
            var category_result = category_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 16) console.log("category_result: " + category_result);

            // Calc K
            data.K_obj[indexArea] = 1 / (risk_result - (3 * category_result));

        }
        if (_this.debug || _this.debugCalc === 16) console.log("data.K_obj: " + data.K_obj);
    }

    // Calculate M alt values for each grade in each area (0% - 3%) (summary sheet row 89)
    calcObjectiveMalternatives() {
        var _this = this;
        var data = this.data;
        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            if (_this.debug || _this.debugCalc === 17) console.log("\nCALC ObjectiveMalternatives - Area: " + indexArea + " >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            var category_results = []; // 5 sub calc results to be multliplied then pushed to risk_results (for final multiplication)
            var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result

            $.each(data.categories, function(indexCategory, category) {
                category_results.push(category.Ml_obj[indexArea] + category.Mdash_obj[indexArea]);
            });
            var category_result = category_results.reduce(_this.getProduct);
            if (_this.debug || _this.debugCalc === 17) console.log("\category_result: " + category_result);

            var risk_result = 0;

            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {

                var risk_sub_calcs = []; // 5 sub calc results to be multliplied then pushed to risk_results (for final multiplication)

                // Loop through all CATEGORIES
                $.each(data.categories, function(indexCategory, category) {
                    risk_sub_calcs.push(category.Mni_obj[indexArea][indexGrade] + category.Ml_obj[indexArea] + category.Mdash_obj[indexArea]);
                });
                risk_result = (risk_sub_calcs.reduce(_this.getProduct));
                if (_this.debug || _this.debugCalc === 17) console.log("\nrisk_result: " + risk_result);

                // Calc Malt and push to array
                data.Malt_obj[indexArea][indexGrade] = data.K_obj[indexArea] * (risk_result - category_result);
            }
            if (_this.debug || _this.debugCalc === 17) console.log("\n data.Malt_obj[indexArea]: " + data.Malt_obj[indexArea]);
        }
    }

    // Calculate MdashH for each area @ project level (summary sheet row 98)
    calcObjectiveMdashH() {
        var _this = this;
        var data = this.data;

        if (_this.debug || _this.debugCalc === 18) console.log("\nCALC Objective MdashH for each area >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            var category_results = []; // 5 sub calc results to be multliplied then pushed to risk_result
            var ml_results = []; // 5 sub calc results to be multliplied then pushed to ml_result

            // Loop through all CATEGORIES
            $.each(data.categories, function(indexCategory, category) {
                category_results.push(category.Ml_obj[indexArea] + category.Mdash_obj[indexArea]);
                ml_results.push(category.Ml_obj[indexArea]);
            });

            var category_result = category_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 18) console.log("\category_result: " + category_result);
            var ml_result = ml_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 18) console.log("\category_result: " + category_result);

            // calc MdashH for this area and push to array
            data.MdashH_obj[indexArea] = data.K_obj[indexArea] * (category_result - ml_result);
        }
        if (_this.debug || _this.debugCalc === 18) console.log("data.MdashH_obj: " + data.MdashH_obj);
    }

    // MlH for each area @ project level (summary sheet row 101)
    calcObjectiveMlH() {
        var _this = this;
        var data = this.data;

        if (_this.debug || _this.debugCalc === 19) console.log("\nCALC Objective MlH for each area >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            var ml_results = []; // 5 sub calc results to be multliplied then pushed to ml_result

            // Loop through all CATEGORIES
            $.each(data.categories, function(indexCategory, category) {
                ml_results.push(category.Ml_obj[indexArea]);
            });

            var ml_result = ml_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 19) console.log("\category_result: " + category_result);

            // calc MdashH for this area and push to array
            data.MlH_obj[indexArea] = data.K_obj[indexArea] * ml_result;
        }
        if (_this.debug || _this.debugCalc === 19) console.log("data.MlH_obj: " + data.MlH_obj);
    }

    // Calculate array of  Beliefs for each GRADE in each AREA (Summary page row 104)
    calcObjectiveBeliefs() {
        var _this = this;
        var data = this.data;

        if (_this.debug || _this.debugCalc === 20) console.log("\nCALC Objective Beliefs for each area >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {

            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                data.Beliefs_obj[indexArea][indexGrade] = data.Malt_obj[indexArea][indexGrade] / (1 - data.MlH_obj[indexArea]);
            }
            if (_this.debug || _this.debugCalc === 20) console.log("data.Beliefs_obj[indexArea]: " + data.Beliefs_obj[indexArea]);

            // Calculate ignorance
            data.Ignorance_obj[indexArea] = data.MdashH_obj[indexArea] / (1 - data.MlH_obj[indexArea]);
        }
        if (_this.debug || _this.debugCalc === 20) console.log("data.Ignorance_obj: " + data.Ignorance_obj);
    }

    // Calculate Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 133)
    calcObjectiveRiskLevels() {
        var _this = this;
        var data = this.data;

        if (_this.debug || _this.debugCalc === 21) console.log("\nCALC Risk Levels for each area >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            // Calculate MINIMUM risk level
            data.RiskLevels_obj[indexArea][0] = (data.Beliefs_obj[indexArea][1] + data.Ignorance_obj[indexArea]) *
                data.grades[0] + data.Beliefs_obj[indexArea][2] *
                data.grades[1] + data.Beliefs_obj[indexArea][3] *
                data.grades[2];

            // Calculate MAXIMUM risk level
            data.RiskLevels_obj[indexArea][1] = data.Beliefs_obj[indexArea][1] *
                data.grades[0] + data.Beliefs_obj[indexArea][2] *
                data.grades[1] + (data.Beliefs_obj[indexArea][3] + data.Ignorance_obj[indexArea]) *
                data.grades[2];

            // Calculate AVERAGE risk level
            data.RiskLevels_obj[indexArea][2] = (data.RiskLevels_obj[indexArea][0] + data.RiskLevels_obj[indexArea][1]) / 2;

            // Calculate cost impacts for each of above - added by request of Abdul for change in Summary page presentation
            data.CostImpact_obj[indexArea][0] = data.RiskLevels_obj[indexArea][0] * data.cost / 100;
            data.CostImpact_obj[indexArea][1] = data.RiskLevels_obj[indexArea][1] * data.cost / 100;
            data.CostImpact_obj[indexArea][2] = data.RiskLevels_obj[indexArea][2] * data.cost / 100;
        }

        if (_this.debug || _this.debugCalc === 21) console.log("data.RiskLevels_obj: " + data.RiskLevels_obj);
    }



    // RESULTS PAGE calculations
    // Calculate arrays of M values relating to each category at project level (Summary page rows 167, 174 + 181)
    calcProjectMvalues() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 22) console.log("\nCALC M values - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Calculate aggregated M n,i for each area >>>>>>
        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            // Loop for each GRADE
            for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
                // Calculate Mni_proj
                data.Mni_proj[indexArea][indexGrade] = data.Beliefs_obj[indexArea][indexGrade] * _this.fromPercent(data.ProjectWeights[indexArea]);
            }

            // Calculate M_obj values
            data.M_proj[indexArea] = 1 - (data.Mni_proj[indexArea].reduce(_this.getSum));

            // Calculate Ml_Cat values
            data.Ml_proj[indexArea] = 1 - _this.fromPercent(data.ProjectWeights[indexArea]);

            // Calculate Mdash_Cat values
            data.Mdash_proj[indexArea] = _this.fromPercent(data.ProjectWeights[indexArea]) * (1 - (data.Beliefs_obj[indexArea].reduce(_this.getSum)));

        }
        if (_this.debug || _this.debugCalc === 22) console.log("\ndata.Mni_proj: " + data.Mni_proj);
        if (_this.debug || _this.debugCalc === 22) console.log("category.Ml_obj: " + data.Ml_proj);
        if (_this.debug || _this.debugCalc === 22) console.log("category.Mdash_obj: " + data.Mdash_proj);

    }

    // Calculate K value for each AREA @ Project level(Summary page row 195)
    calcProjectK() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 23) console.log("\nCALC K - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");



        var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result
        var category_results = []; // capture results from each ALTERNATIVE loop - to be summed for final category_result

        // Loop for each GRADE
        for (var indexGrade = 0; indexGrade < 4; indexGrade++) {

            var risk_sub_calcs = []; // 3 sub calc results to be multliplied then pushed to risk_results (for final summing)

            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                risk_sub_calcs.push(data.Mni_proj[indexArea][indexGrade] + data.Ml_proj[indexArea] + data.Mdash_proj[indexArea]);
            }
            risk_results.push(risk_sub_calcs.reduce(_this.getProduct));
        }
        var risk_result = risk_results.reduce(_this.getSum);
        // if (_this.debug || _this.debugCalc === 23) console.log("\nrisk_result: " + risk_result);

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            category_results.push(data.Ml_proj[indexArea] + data.Mdash_proj[indexArea])
        }
        var category_result = category_results.reduce(_this.getProduct);
        // if (_this.debug || _this.debugCalc === 23) console.log("category_result: " + category_result);

        // Calc K
        data.K_proj = 1 / (risk_result - (3 * category_result));


        if (_this.debug || _this.debugCalc === 23) console.log("data.K_proj: " + data.K_proj);

    }

    // Calculate Malt values for each GRADE in each AREA (Summary page row 197)
    calcProjectMalternatives() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 24) console.log("\nCALC M alternatives - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each GRADE
        for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
            var category_results = []; // 5 sub calc results to be multliplied then pushed to risk_results (for final multiplication)
            var risk_results = []; // capture results from each AREA loop - to be summed for final risk_result

            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                category_results.push(data.Ml_proj[indexArea] + data.Mdash_proj[indexArea])
            }
            var category_result = category_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 24) console.log("category_result: " + category_result);

            var risk_sub_calcs = []; // 3 sub calc results to be multliplied then pushed to risk_results (for final summing)
            var risk_result = 0;

            // Loop for each AREA
            for (var indexArea = 0; indexArea < 3; indexArea++) {
                risk_results.push(data.Mni_proj[indexArea][indexGrade] + data.Ml_proj[indexArea] + data.Mdash_proj[indexArea]);
            }
            var risk_result = risk_results.reduce(_this.getProduct);
            // if (_this.debug || _this.debugCalc === 24) console.log("\nrisk_result: " + risk_result);

            // Calc Malt and add to array
            data.Malt_proj[indexGrade] = data.K_proj * (risk_result - category_result);
        }
        if (_this.debug || _this.debugCalc === 24) console.log("\n data.Malt_proj: " + data.Malt_proj);
    }

    // Calculate Mdash values for each each AREA (Summary page row 206)
    calcProjectMdashH() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 25) console.log("\nCALC M dash H - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        var category_results = []; // 5 sub calc results to be multliplied then pushed to risk_result
        var ml_results = []; // 5 sub calc results to be multliplied then pushed to ml_result

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            category_results.push(data.Ml_proj[indexArea] + data.Mdash_proj[indexArea]);
            ml_results.push(data.Ml_proj[indexArea]);
        }

        var category_result = category_results.reduce(_this.getProduct);
        // if (_this.debug || _this.debugCalc === 18) console.log("\category_result: " + category_result);
        var ml_result = ml_results.reduce(_this.getProduct);
        // if (_this.debug || _this.debugCalc === 18) console.log("\category_result: " + category_result);

        // calc MdashH for this area and push to array
        data.MdashH_proj = data.K_proj * (category_result - ml_result);

        if (_this.debug || _this.debugCalc === 25) console.log("data.MdashH_proj: " + data.MdashH_proj);

    }

    // Calculate MlH values for each each AREA (Summary page row 209)
    calcProjectMlH() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 26) console.log("\nCALC MlH - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        data.MlH_proj = data.K_proj * data.Ml_proj.reduce(_this.getProduct);

        if (_this.debug || _this.debugCalc === 26) console.log("data.MlH_proj: " + data.MlH_proj);
    }

    // Calculate array of  Beliefs for each GRADE in each AREA (Summary page row 214)
    calcProjectBeliefs() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 27) console.log("\nCALC Beliefs - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Loop for each GRADE
        for (var indexGrade = 0; indexGrade < 4; indexGrade++) {
            data.Beliefs_proj[indexGrade] = data.Malt_proj[indexGrade] / (1 - data.MlH_proj);
        }
        if (_this.debug || _this.debugCalc === 27) console.log("data.Beliefs_proj: " + data.Beliefs_proj);

        // Calculate ignorance
        data.Ignorance_proj= data.MdashH_proj/ (1 - data.MlH_proj);

        if (_this.debug || _this.debugCalc === 27) console.log("data.Ignorance_proj: " + data.Ignorance_proj);
    }

    // Calculate Risk levels for each area - [MINIMUM, MAXIMUM, AVERAGE] (Summary page row 238)
    calcProjectRiskLevels() {
        var _this = this;
        var data = this.data;
        if (_this.debug || _this.debugCalc === 28) console.log("\nCALC Risk Levels - Overall Project  >>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        // Calculate MINIMUM risk level
            data.RiskLevels_proj[0] = (data.Beliefs_proj[1] + data.Ignorance_proj) *
                data.grades[0] + data.Beliefs_proj[2] *
                data.grades[1] + data.Beliefs_proj[3] *
                data.grades[2];

            // Calculate MAXIMUM risk level
            data.RiskLevels_proj[1] = data.Beliefs_proj[1] *
                data.grades[0] + data.Beliefs_proj[2] *
                data.grades[1] + (data.Beliefs_proj[3] + data.Ignorance_proj) *
                data.grades[2];

            // Calculate AVERAGE risk level
            data.RiskLevels_proj[2] = (data.RiskLevels_proj[0] + data.RiskLevels_proj[1]) / 2;

            if (_this.debug || _this.debugCalc === 28) console.log("data.RiskLevels_proj: " + data.RiskLevels_proj);

            // Calculate cost impact
            // data.costImpact_proj = data.RiskLevels_proj[2] * data.cost / 100;
            data.costImpact_proj[0] = data.RiskLevels_proj[0] * data.cost / 100;
            data.costImpact_proj[1] = data.RiskLevels_proj[1] * data.cost / 100;
            data.costImpact_proj[2] = data.RiskLevels_proj[2] * data.cost / 100;

            if (_this.debug || _this.debugCalc === 28) console.log("data.costImpact_proj: " + data.costImpact_proj);

    }




    // MINI FUNCTIONS
    // Repeat operations used in multiple calculations

    // Calculate relationships between Ml and Mdash values for each RISK in a CATEGORY and return the product
    // Used in calcK() and calcMalternatives()
    calcCategoryMrealtionships(category, areaIndex) {
        var _this = this;
        var m_results = []; // capture results from each RISK loop - to be multiplied for final m_result
        $.each(category.risks, function(indexRisk, risk) {
            m_results.push(risk.Ml + risk.Mdash[areaIndex]);
        });
        return m_results.reduce(_this.getProduct);
    }

    // Calculate relationships between Ml and Mdash values for each AREA in a CATEGORY and return the product
    // Used in calcK() and calcMalternatives()
    calcAreaMrealtionships(category, areaIndex) {
        var _this = this;
        var m_results = []; // capture results from each RISK loop - to be multiplied for final m_result

        // Loop for each AREA
        for (var indexArea = 0; indexArea < 3; indexArea++) {
            m_results.push(category.Ml_Cat[indexArea] + category.Mdash_Cat[indexArea]);
        }
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

    // Calculate and return the product of all Ml values (one for each AREA) in a CATEGORY
    calcAreaMlProduct(project) {
        var _this = this;
        var Ml_values = []; // capture Ml values from each RISK - calc product for final calc
        // Loop through each RISK of each CATEGORY - calculate sum of Ml values from each RISK
        $.each(project.categories, function(index, category) {
            Ml_values.push(category.Ml);
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

    // Round to 2 decimal places to remove JS floating point variations
    roundTo2(num) {
        return +num.toFixedNumber(2);
    }

    // Round to 3 decimal places to remove JS floating point variations
    roundTo3(num) {
        return +num.toFixedNumber(3);
    }

    // convert from percentage - return number rounded to 2 dp
    fromPercent(num) {
        return +(num * 0.01).toFixedNumber(2);
    }


}

// // Call using .toFixedNumber(3) for 3 decimal places
// Number.prototype.toFixedNumber = function(x, base) {
//     var pow = Math.pow(base || 10, x);
//     return +(Math.round(this * pow) / pow);
// }
