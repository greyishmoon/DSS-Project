/*jshint esversion: 6 */

class ProblemManager {

    constructor() {

        // Create Model object for calculations
        this.model = new DSS_model();

        // IF localStorage present, load storage, otherwise intialise problem
        if (localStorage.getItem('problemData') != null) {
            this.loadLocal();
        } else {
            // Create and initialise new data objects
            this.initialiseProblem();
        }
    }

    // Create new data object and initialise
    initialiseProblem() {
        // Create empty copy of Problem data object
        this.problem = jQuery.extend(true, {}, Problem);

        this.addAlternative('');
        this.addFactor('');

        // TODO - REMOVE TEST PROBLEM
        // Load test problem with data from DSS OUTSOURCING stylesheet
        this.loadTestProblem();
    }

    // Update problem - perform calculations to generate results
    update() {
        // Pass current problem data object to DSS model for results calculations
        this.model.resultsCalc(this.problem);
    }

    // Force avergaing of Factor weights for summary page
    // ONLY to be run ONCE on initial project load
    forceFactorWeightsCalc() {
        // Only calculate if all weights are zero
        var weightsEmpty = true;
        $.each(this.problem.factors, function(index, factor) {
            if (factor.Weight > 0) {
                weightsEmpty = false;
            }
        });

        if (weightsEmpty) {
            var aveWeight = (100 / this.problem.factors.length).toFixedNumber(0);
            var extra = 100 - (aveWeight * this.problem.factors.length);
            console.log("AVERAGE WEIGHT: " + aveWeight);
            console.log("AVERAGE extra: " + extra);
            var weights = [];
            // push first weight plus extra
            weights.push(aveWeight + extra);
            // fill rest of weights with aveWeight
            for (var i = 1; i < this.problem.factors.length; i++) {
                weights.push(aveWeight);
            }
            // set factor.weight
            // Loop through all FACTORS
            $.each(this.problem.factors, function(index, factor) {
                factor.Weight = weights[index];
            });
        }
    }

    // Add alternative
    addAlternative(name) {
        this.problem.alternatives.push(name);
        // ADD A WEIGHT TO EACH CRITERION OF EACH FACTOR
        this.problem.factors.forEach((factor) => {
            factor.criteria.forEach((criterion) => {
                criterion.alternativeWeights.push(0);
            });
        });
    }
    // Remove last alternative
    removeAlternative() {
        this.problem.alternatives.pop();
        // REMOVE LAST WEIGHT FROM EACH CRITERION OF EACH FACTOR
        this.problem.factors.forEach((factor) => {
            factor.criteria.forEach((criterion) => {
                criterion.alternativeWeights.pop();
            });
        });
    }
    // Return length of Alternatives array
    getAltLength() {
        return this.problem.alternatives.length;
    }

    // Add factor
    addFactor(name) {
        // DEEP COPY Factor to avoid referencing issues
        var newFactor = jQuery.extend(true, {}, Factor);
        newFactor.name = name;
        // Add single criterion
        this.addCriterionTo(newFactor, '');
        this.problem.factors.push(newFactor);
    }
    // Remove last factor
    removeFactor() {
        this.problem.factors.pop();
    }
    // Return length of Factors array
    getFactorLength() {
        return this.problem.factors.length;
    }
    // Return factor of ID
    getFactor(id) {
        return this.problem.factors[id];
    }

    // Add Criterion to factor
    addCriterionTo(factor, name) {
        // Create new criterion
        // DEEP COPY Criterion to avoid referencing issues
        var newCriterion = jQuery.extend(true, {}, Criterion);
        newCriterion.name = name;
        // init criterion weight to 0
        newCriterion.weight = 0;
        // init alternativeWeights count to number of Alternatives + set to 0
        newCriterion.alternativeWeights.length = this.getAltLength();
        // (NOTE cannot use forEach as setting length does not initialise array elements)
        for (var i = 0; i < newCriterion.alternativeWeights.length; i++) {
            newCriterion.alternativeWeights[i] = 0;
        }
        factor.criteria.push(newCriterion);
    }
    // Remove last criteria from factor
    removeCriterionFrom(factor) {
        factor.criteria.pop();
    }

    // SAVE FUNCTIONS

    // Save problem data object to local storage (as JSON)
    saveLocal() {
        localStorage.setObject('problemData', this.problem);
    }

    // IF data stored - Load problem data object from local storage (convert from JSON)
    loadLocal() {
        this.problem = localStorage.getObject('problemData');
    }

    // Clear local Storage
    clearLocal() {
        localStorage.clear();
        sessionStorage.clear();
    }

    // Reset project and clear all current data from memory and local Storage
    resetProject() {
        this.initialiseProblem();
        this.clearLocal();
    }

    // HELPER FUNCTIONS

    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum); OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }

    ////////////////// TESTING //////////////////////
    // load test problem
    loadTestProblem() {
        // DEEP COPY Problem to avoid referencing issues
        this.problem = jQuery.extend(true, {}, Problem);
        this.problem.title = "Test Problem"

        this.addAlternative('Supplier A');
        this.addAlternative('Supplier B');
        this.addAlternative('Supplier C');

        this.addFactor('Financial');
        var factor = this.problem.factors[0];
        var tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [80, 0, 0];
        this.addCriterionTo(factor, "Criteria 1B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [60, 20, 20];
        this.addCriterionTo(factor, "Criteria 1C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 1D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [40, 20, 30];
        factor.Weight = 15;


        this.addFactor('Operational');
        factor = this.problem.factors[1];
        tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 2A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [0, 0, 100];
        this.addCriterionTo(factor, "Criteria 2B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 2C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 2D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [60, 40, 0];
        factor.Weight = 30;

        this.addFactor('Strategic Benefit');
        var factor = this.problem.factors[2];
        var tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 50;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 1B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 1C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 1D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        factor.Weight = 20;

        this.addFactor('Technical');
        var factor = this.problem.factors[3];
        var tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [50, 30, 0];
        this.addCriterionTo(factor, "Criteria 1B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(factor, "Criteria 1C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(factor, "Criteria 1D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        factor.Weight = 10;

        this.addFactor('Risk');
        var factor = this.problem.factors[4];
        var tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [60, 20, 0];
        this.addCriterionTo(factor, "Criteria 1B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [60, 0, 40];
        this.addCriterionTo(factor, "Criteria 1C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [50, 50, 0];
        this.addCriterionTo(factor, "Criteria 1D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [40, 30, 30];
        factor.Weight = 25;

        // Force update for TESTING
        this.update();
    }

}

// Round number to x decimal places (and return a number not a string)
// Call using .toFixedNumber(3) for 3 decimal places
// Number.prototype.toFixedNumber = function(x, base) {
//     var pow = Math.pow(base || 10, x);
//     return +(Math.round(this * pow) / pow);
// }
